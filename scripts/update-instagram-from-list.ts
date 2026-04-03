#!/usr/bin/env node
/**
 * Instagram アカウント一覧から instagram_handle を一括更新
 *
 * 使い方:
 *   npx tsx scripts/update-instagram-from-list.ts --dry-run   # 確認
 *   npx tsx scripts/update-instagram-from-list.ts              # 本番実行
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// 店名 → Instagram handle マッピング
// （調査リスト 2026-03-23 より）
const IG_MAP: { name: string; handle: string }[] = [
  // ── 三宮エリア ──────────────────────────────────────────────
  { name: 'ライトスタンド',             handle: 'lightstand_kobe' },
  { name: 'すたんど こうめ',            handle: 'standkoume' },
  { name: '伊藤勝商店',                handle: 'ito_sakaya_kobe' },
  { name: '立呑 Blend',               handle: 'blend_tachinomi' },
  { name: '酒家 風鶏',                 handle: 'fukei_shuka' },
  { name: 'にくひろ',                  handle: 'nikuhiro.jibie' },
  { name: '蔵元酒場おやっとさぁ 三宮店', handle: 'oyattosa_sannomiya_kobe' },
  { name: '宇宙と描いてSAKABAとよむ',   handle: 'uchusakaba' },
  { name: 'THE BAKE',                 handle: 'thebake.boozys' },
  { name: '4坪牡蠣小屋 キヨリト 東門店', handle: 'kiyorito.shokudo' },
  { name: '立ち呑み 京都商会',          handle: 'tachinomi_kyotoshokai' },
  { name: 'ハレとケ',                  handle: 'haretoke_beer_cider' },
  { name: 'Uo魚',                     handle: 'uouo.kaisen' },
  { name: 'スタンド クラシック',         handle: 'stand_classic' },
  { name: 'ことり屋',                  handle: 'kotoriya_229' },
  { name: '肉料理ちぃちゃん はなれ',    handle: 'chiichan_hanare' },
  { name: '立ち呑み かんぱい',          handle: 'kanpai_1105' },
  { name: 'スタンド GONTa2',           handle: 'standgonta2' },
  { name: '昭和ロマン おとめの台所 本店', handle: 'otomenodaidokoro' },
  { name: 'スタンド サンジ',            handle: 'standsanji3z' },
  { name: '路地裏スタンド アベック',     handle: 'roziurastand_avec' },
  { name: 'スタンド Gonta',            handle: 'standgonta1' },
  { name: '神戸手羽唐専門店 鶏冠屋 2号店', handle: 'tosakaya2' },
  { name: 'ワインの名に懸けて',         handle: 'wine_no_nanikakete' },
  { name: '朝呑み 楽酒',               handle: 'rakuzake' },
  { name: 'GASTORONOMIA BUCO',        handle: 'gastronomiabuco' },
  { name: 'きりの台所',                handle: 'kirino_daidokoro' },
  { name: 'ムーン テイル',             handle: 'moon_tail1129' },
  { name: '浅野日本酒店 SANNOMIYA',    handle: 'asanonihonshutensannomiya' },
  { name: 'キヨリト サカノバ 酒挟む',   handle: 'kiyorito.sakanoba' },
  { name: '鶴亀八番',                  handle: 'tsurukame.8ban' },
  { name: '一三酒店マルアール',         handle: '13saketen' },
  { name: '立ち飲み ごっち',           handle: 'gocchi_kobe' },
  { name: '立ち飲み わらかど',          handle: 'warakado.r3' },
  { name: '立ち飲み 1',               handle: 'tachinomi_1' },
  { name: '立呑み よってこ',           handle: '_yotteko_' },
  { name: '立呑み処 頂',              handle: 'stand_itadaki' },
  { name: '立ち飲み居酒屋 さんかく 三宮店', handle: 'stand.sankaku' },
  { name: '立呑処 醅',                handle: 'tachinomi_fu_2023' },
  { name: '立ち呑みニューワールド',     handle: 'newworld_kobe' },
  { name: 'Ready Steady Go!',         handle: 'readysteadygo_kobe' },
  { name: 'エキマエスタンド',           handle: 'ekistasince1996' },
  { name: '立ち呑み るぅちゃん',       handle: 'ruuchan101' },
  { name: '立ち呑み Zen',             handle: 'standingbar_zen' },
  { name: 'スタンドサンジ2nd',         handle: 'standsanji32z' },
  { name: '炭 ゔぁる原',              handle: 'kobe_valhalla' },
  { name: 'ホルモン 福寅',            handle: 'horumon_fukutora' },
  { name: 'STAND COBE',              handle: 'stand_cobe' },
  { name: 'ニュージョージ',            handle: 'jooji0725' },
  // ── 元町・南京町エリア ─────────────────────────────────────
  { name: 'お酒の美術館 神戸元町店',   handle: 'lm.kobe_motomachi.bar' },
  { name: 'Moridini',                handle: 'moridini1414' },
  { name: '昭和レトロBAR ニューロマン', handle: 'bar_new_roman' },
  { name: '家ごはん ひろよ',          handle: 'iegohanhiroyo' },
  { name: 'chotto',                  handle: 'chotto_sannomiya' },
  { name: 'イロハニリベロ',            handle: 'irohani_libero' },
  // ── 周辺エリア・新店 ────────────────────────────────────────
  { name: '八喜為 新開地店',          handle: 'izakaya_hakidame' },
  { name: 'まさ 湊川店',              handle: 'masaminatogawa' },
  { name: 'スタンドねこしゃん',        handle: 'shiyanneko' },
  { name: 'チヤップリン',             handle: 'shinkaichichappurin' },
  { name: '串とメシにはサケキタル。三宮駅前店', handle: 'sakekitaru_sannomiya' },
  { name: '蔬菜',                    handle: 'sosai_ninomiya' },
];

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function run() {
  const dryRun = process.argv.includes('--dry-run');

  console.log('\n' + '═'.repeat(56));
  console.log('  📸 Instagram Handle Updater');
  console.log('═'.repeat(56));
  console.log(`  モード: ${dryRun ? '🔵 DRY RUN' : '🔴 LIVE'}`);
  console.log(`  対象: ${IG_MAP.length} 件\n` + '─'.repeat(56));

  // 全店舗を名前で取得
  const { data: stores, error } = await supabase
    .from('restaurants')
    .select('id, name, instagram_handle');

  if (error) { console.error('❌ DB取得エラー:', error.message); process.exit(1); }
  if (!stores) { console.log('データなし'); return; }

  let updated = 0, notFound = 0;

  for (const entry of IG_MAP) {
    // 部分一致で検索（表記揺れ対応）
    const match = stores.find(s =>
      s.name.includes(entry.name) ||
      entry.name.includes(s.name) ||
      s.name === entry.name
    );

    if (!match) {
      console.log(`  ⚠️  未マッチ: "${entry.name}"`);
      notFound++;
      continue;
    }

    const current = match.instagram_handle ?? '(なし)';
    const next    = entry.handle;

    if (match.instagram_handle === next) {
      console.log(`  ✓  スキップ: ${match.name} — @${next} (変更なし)`);
      continue;
    }

    console.log(`  →  ${match.name}`);
    console.log(`      ${current} → @${next}`);

    if (!dryRun) {
      const { error: upErr } = await supabase
        .from('restaurants')
        .update({ instagram_handle: next })
        .eq('id', match.id);
      if (upErr) console.log(`     ⚠️ 更新エラー: ${upErr.message}`);
      else updated++;
      await sleep(50);
    } else {
      updated++;
    }
  }

  console.log('─'.repeat(56));
  console.log(`  ✅ 更新: ${updated}  ⚠️ 未マッチ: ${notFound}`);
  if (dryRun) console.log('  ℹ️  DRY RUN のためDBは変更されていません');
  console.log('═'.repeat(56) + '\n');
}

run().catch(e => { console.error('❌', e); process.exit(1); });
