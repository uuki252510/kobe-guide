import { supabaseAdmin } from '@/lib/supabase-server';

/** 別の店の情報が紐付いていた店。Google の displayName 照合で判明(2026-08-01) */
const WRONG_MATCH: Array<[string, string]> = [
  ['立ち飲み いぶき', 'おやじの一本釣り 神戸三宮生田店'],
  ['立ち飲み居酒屋 さんかく 三宮店', 'Amusement Bar さんかく'],
  ['元町ワイン食堂 ル・マリアージュ', 'nomadika 神戸店'],
  ['桜や', '神戸牛ステーキ 桜'],
  ['ムーン テイル', 'Bar Moon-Lite'],
];
/** 支店違いの疑い。掲載は続けるが印を付ける */
const SUSPECT = ['八喜為 新開地店'];

const dryRun = process.argv.includes('--dry-run');

(async () => {
  for (const [name, googleName] of WRONG_MATCH) {
    const { data } = await supabaseAdmin.from('restaurants').select('id, name, is_published, internal_notes').eq('name', name);
    if (!data || data.length !== 1) { console.log(`⚠️  ${name}: ${data?.length ?? 0}件ヒット。手動確認が必要`); continue; }
    const row = data[0];
    const note = [row.internal_notes, `[2026-08-01 非公開] Google Places の照合で「${googleName}」に紐付いていた。実在確認が取れたら再公開する。`].filter(Boolean).join('\n');
    console.log(`${dryRun ? '(dry) ' : ''}非公開: ${row.name}  ← ${googleName}`);
    if (!dryRun) {
      await supabaseAdmin.from('restaurants')
        .update({ is_published: false, review_needed: true, internal_notes: note })
        .eq('id', row.id);
    }
  }
  for (const name of SUSPECT) {
    console.log(`${dryRun ? '(dry) ' : ''}要確認フラグ: ${name}`);
    if (!dryRun) await supabaseAdmin.from('restaurants').update({ review_needed: true }).eq('name', name);
  }
  const { count } = await supabaseAdmin.from('restaurants').select('id', { count: 'exact', head: true })
    .eq('is_published', true).neq('business_status', 'CLOSED_PERMANENTLY');
  console.log(`\n公開中: ${count}軒`);
})();
