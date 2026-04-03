#!/usr/bin/env node
/**
 * 既存90店舗を Google Places API で情報補完
 *
 * 使い方:
 *   npx tsx scripts/enrich-stores.ts             # 全店（google_maps_urlが空の店のみ）
 *   npx tsx scripts/enrich-stores.ts --dry-run   # DBに書かない（確認用）
 *   npx tsx scripts/enrich-stores.ts --all       # 全店を強制再取得
 *
 * コスト: 90店 × $17/1000 = 約$0.0015（0.2円）
 * ※ 1回だけ実行してDBに保存→以後APIコール不要の設計
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const PLACES_API_BASE = 'https://places.googleapis.com/v1';

// 1回の取得で全フィールドを揃える（再取得コスト回避）
// Advanced fields含むので $17/1000 課金だが、1回で完結
const FIELD_MASK = [
  'places.id',
  'places.displayName',
  'places.formattedAddress',
  'places.location',
  'places.googleMapsUri',
  'places.rating',
  'places.userRatingCount',
  'places.regularOpeningHours',
  'places.internationalPhoneNumber',
  'places.nationalPhoneNumber',
].join(',');

interface PlaceResult {
  id: string;
  displayName: { text: string };
  formattedAddress?: string;
  location?: { latitude: number; longitude: number };
  googleMapsUri?: string;
  rating?: number;
  userRatingCount?: number;
  regularOpeningHours?: unknown;
  internationalPhoneNumber?: string;
  nationalPhoneNumber?: string;
}

async function findPlace(storeName: string): Promise<PlaceResult | null> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) throw new Error('GOOGLE_MAPS_API_KEY が設定されていません');

  // 神戸エリアに絞る locationBias で精度UP
  const body = {
    textQuery: `${storeName} 神戸`,
    languageCode: 'ja',
    maxResultCount: 1,
    locationBias: {
      circle: {
        center: { latitude: 34.6940, longitude: 135.1970 }, // 三宮中心
        radius: 3000, // 3km 以内
      },
    },
  };

  const res = await fetch(`${PLACES_API_BASE}/places:searchText`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': FIELD_MASK,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Places API エラー: ${res.status} ${txt.slice(0, 200)}`);
  }

  const data = await res.json();
  return data.places?.[0] ?? null;
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function run() {
  const args = process.argv.slice(2);
  const dryRun  = args.includes('--dry-run');
  const forceAll = args.includes('--all');

  console.log('\n' + '═'.repeat(52));
  console.log('  🏮 Kobe Store Enricher (Google Places)');
  console.log('═'.repeat(52));
  console.log(`  モード: ${dryRun ? '🔵 DRY RUN' : '🔴 LIVE'} ${forceAll ? '（全件強制再取得）' : '（未補完のみ）'}`);
  console.log(`  推定コスト: 最大90店 × $0.017/1000 ≈ $0.0015\n`);

  // 対象店舗を取得
  let query = supabase
    .from('restaurants')
    .select('id, name, area, lat, lng, google_maps_url')
    .order('priority_score', { ascending: false });

  if (!forceAll) {
    query = query.is('google_maps_url', null);
  }

  const { data: stores, error } = await query;
  if (error) {
    console.error('❌ DB取得エラー:', error.message);
    process.exit(1);
  }
  if (!stores || stores.length === 0) {
    console.log('✅ 補完対象なし（全店舗補完済み）');
    console.log('   強制再取得する場合: --all オプションを使用\n');
    return;
  }

  console.log(`  対象店舗数: ${stores.length} 店\n`);
  console.log('─'.repeat(52));

  let hit = 0, miss = 0, err = 0;

  for (const store of stores) {
    process.stdout.write(`  ${store.name} ... `);

    let place: PlaceResult | null = null;
    try {
      place = await findPlace(store.name);
    } catch (e) {
      console.log(`❌ API エラー: ${e instanceof Error ? e.message : e}`);
      err++;
      await sleep(1000);
      continue;
    }

    if (!place) {
      console.log('⚠️  見つからず（スキップ）');
      miss++;
      await sleep(300);
      continue;
    }

    const update: Record<string, unknown> = {
      place_id:                  place.id,
      google_maps_url:           place.googleMapsUri ?? null,
      rating:                    place.rating ?? null,
      user_ratings_total:        place.userRatingCount ?? null,
      formatted_address:         place.formattedAddress ?? null,
      international_phone_number: place.internationalPhoneNumber ?? null,
      phone_number:              place.nationalPhoneNumber ?? null,
      opening_hours_json:        place.regularOpeningHours ?? null,
      last_synced_at:            new Date().toISOString(),
    };

    // 座標はDBが既に持っていれば上書きしない（手動調整済みの可能性）
    if (!store.lat && place.location) {
      update.lat = place.location.latitude;
      update.lng = place.location.longitude;
    }

    const rating = place.rating ? ` ★${place.rating}` : '';
    console.log(`✅${rating}  ${place.formattedAddress?.slice(0, 30) ?? ''}`);
    hit++;

    if (!dryRun) {
      const { error: upErr } = await supabase
        .from('restaurants')
        .update(update)
        .eq('id', store.id);
      if (upErr) {
        console.log(`     ⚠️ DB更新エラー: ${upErr.message}`);
      }
    }

    await sleep(300); // レートリミット対策
  }

  console.log('─'.repeat(52));
  console.log(`  ✅ 補完完了: ${hit}  ⚠️ 未発見: ${miss}  ❌ エラー: ${err}`);
  if (dryRun) console.log('  ℹ️  DRY RUN のため DB は変更されていません');
  if (miss > 0) {
    console.log(`\n  ⚠️  ${miss}件が見つかりませんでした`);
    console.log('  → 店名を少し変えて再検索するか手動で google_maps_url を設定してください');
  }
  console.log('═'.repeat(52) + '\n');
}

run().catch(e => {
  console.error('\n❌ 予期しないエラー:', e);
  process.exit(1);
});
