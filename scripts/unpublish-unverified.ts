/**
 * Google Places に痕跡が無い店を非公開にする。
 *
 * 元リスト(tachinomi-complete.md)由来の一部の行は、Google で裏を取らずに
 * 座標と検索URL(実在しない query_place パラメータ付き)を組み立てて作られていた。
 * 実在確認が取れるまで表に出さない。行は消さず、理由を internal_notes に残す。
 *
 *   npx tsx --env-file=.env.local scripts/unpublish-unverified.ts [--dry-run]
 */
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const dryRun = process.argv.includes('--dry-run');

/** Places のテキスト検索で名前が一致する候補が返らなかった店 */
const UNVERIFIED = ['立ち呑み 稲田酒店', '角打ち 花巻', '立ち飲み とっくり', '立ち飲み ふうり', '立ち飲み 呑', '角打ち しんちゃん', '立呑処 ふう'];
/** 実在する「立ち飲み わらかど」の重複行 */
const DUPLICATE = '立ち飲み わらかど 元町';

async function hide(name: string, reason: string) {
  const { data } = await supabase.from('restaurants').select('id, name, internal_notes, is_published').eq('name', name);
  if (!data || data.length !== 1) { console.log(`⚠️  ${name}: ${data?.length ?? 0}件ヒット。手動確認が必要`); return; }
  const row = data[0];
  if (!row.is_published) { console.log(`—  ${name}: すでに非公開`); return; }
  const note = [row.internal_notes, `[2026-08-02 非公開] ${reason}`].filter(Boolean).join('\n');
  console.log(`${dryRun ? '(dry) ' : ''}非公開: ${name}  — ${reason}`);
  if (!dryRun) await supabase.from('restaurants').update({ is_published: false, review_needed: true, internal_notes: note }).eq('id', row.id);
}

(async () => {
  for (const name of UNVERIFIED) {
    await hide(name, 'Google Places に名前が一致する候補が無く、登録時の地図URLも組み立てられたもので実在確認が取れない。現地で確認できたら再公開する。');
  }
  await hide(DUPLICATE, '実在する「立ち飲み わらかど」(place_id: ChIJp3zkiuSOAGARa5CAcC7EWIM)の重複行。');

  const { count } = await supabase.from('restaurants').select('id', { count: 'exact', head: true })
    .eq('is_published', true).neq('business_status', 'CLOSED_PERMANENTLY');
  console.log(`\n公開中: ${count}軒`);
})();
