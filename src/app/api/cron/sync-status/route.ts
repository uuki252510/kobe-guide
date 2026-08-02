import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/** 前回の同期からこれだけ空いていなければ何もしない */
const MIN_INTERVAL_HOURS = 12;
const CONCURRENCY = 6;

async function currentStatus(placeId: string, apiKey: string) {
  const response = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}?languageCode=ja`, {
    headers: { 'X-Goog-Api-Key': apiKey, 'X-Goog-FieldMask': 'businessStatus' },
    cache: 'no-store',
  });
  if (!response.ok) return null;
  const data = await response.json() as { businessStatus?: string };
  return data.businessStatus ?? 'OPERATIONAL';
}

/**
 * 営業状態を Google Places から取り直す日次ジョブ。
 *
 * business_status は登録時に一度書いたきり古くなり、実際に閉店した店が
 * 「今夜の一軒」として出てしまう。CRON_SECRET が設定されていればそれで守り、
 * 未設定でも 12 時間の間隔ガードがあるので叩かれても上流を消費しない。
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'API key not configured' }, { status: 500 });

  const { data: latest } = await supabaseAdmin
    .from('restaurants')
    .select('last_synced_at')
    .not('last_synced_at', 'is', null)
    .order('last_synced_at', { ascending: false })
    .limit(1);

  const lastSynced = latest?.[0]?.last_synced_at ? new Date(latest[0].last_synced_at).getTime() : 0;
  const hoursSince = (Date.now() - lastSynced) / 3_600_000;
  if (hoursSince < MIN_INTERVAL_HOURS) {
    return NextResponse.json({ skipped: true, hoursSinceLastSync: Number(hoursSince.toFixed(1)) });
  }

  const { data } = await supabaseAdmin
    .from('restaurants')
    .select('id, name, place_id, business_status')
    .not('place_id', 'is', null);

  const rows = data ?? [];
  const changed: string[] = [];
  let failed = 0;

  for (let index = 0; index < rows.length; index += CONCURRENCY) {
    await Promise.all(rows.slice(index, index + CONCURRENCY).map(async store => {
      const status = await currentStatus(store.place_id!, apiKey);
      if (!status) { failed++; return; }
      if (status === store.business_status) return;
      changed.push(`${store.name}: ${store.business_status} → ${status}`);
      await supabaseAdmin
        .from('restaurants')
        .update({ business_status: status, last_synced_at: new Date().toISOString() })
        .eq('id', store.id);
    }));
  }

  // 変更が無くても「見た」ことを残さないと、次回もガードを抜けて毎回全件叩いてしまう
  if (!changed.length && rows[0]) {
    await supabaseAdmin.from('restaurants').update({ last_synced_at: new Date().toISOString() }).eq('id', rows[0].id);
  }

  console.log(`[cron/sync-status] checked=${rows.length} changed=${changed.length} failed=${failed}`);
  return NextResponse.json({ checked: rows.length, changed, failed });
}
