/**
 * 各店の営業状態を Google Places から取り直す。
 *
 * business_status は登録時に一度書いたきり古くなる。閉店した店を
 * 「今夜の一軒」として出してしまうのがいちばん困るので、定期的に流す。
 * 取得するのは businessStatus と displayName だけ(Essentials 相当)。
 *
 *   npx tsx --env-file=.env.local scripts/sync-status.ts [--dry-run]
 */
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const KEY = process.env.GOOGLE_MAPS_API_KEY!;
const dryRun = process.argv.includes('--dry-run');

async function run() {
  if (!KEY) throw new Error('GOOGLE_MAPS_API_KEY が設定されていません');

  const { data, error } = await supabase
    .from('restaurants')
    .select('id, name, place_id, business_status')
    .not('place_id', 'is', null);
  if (error) throw error;

  const rows = data ?? [];
  console.log(`\n営業状態の同期 ${dryRun ? '(DRY RUN)' : ''} — ${rows.length}件\n`);

  const changed: string[] = [];
  let failed = 0;

  for (const store of rows) {
    const res = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(store.place_id)}?languageCode=ja`, {
      headers: { 'X-Goog-Api-Key': KEY, 'X-Goog-FieldMask': 'businessStatus' },
    });
    if (!res.ok) { failed++; await new Promise(s => setTimeout(s, 60)); continue; }

    const { businessStatus } = await res.json() as { businessStatus?: string };
    const next = businessStatus ?? 'OPERATIONAL';

    if (next !== store.business_status) {
      changed.push(`${store.name}: ${store.business_status} → ${next}`);
      if (!dryRun) {
        await supabase
          .from('restaurants')
          .update({ business_status: next, last_synced_at: new Date().toISOString() })
          .eq('id', store.id);
      }
    }
    await new Promise(s => setTimeout(s, 60));
  }

  console.log(changed.length ? changed.map(line => `  ${line}`).join('\n') : '  変更なし');
  console.log(`\n変更 ${changed.length}件 / 取得失敗 ${failed}件\n`);
}

run().catch(error => { console.error(error); process.exit(1); });
