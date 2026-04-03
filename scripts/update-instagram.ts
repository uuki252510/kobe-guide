/**
 * scripts/update-instagram.ts
 * InstagramハンドルをDBに一括登録するスクリプト
 *
 * 使い方:
 *   npx tsx scripts/update-instagram.ts          # 未設定の店のみ更新
 *   npx tsx scripts/update-instagram.ts --all    # 全店強制上書き
 *   npx tsx scripts/update-instagram.ts --dry    # DBに書かない（確認用）
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const DRY = process.argv.includes('--dry');
const ALL = process.argv.includes('--all');

// ============================================================
// 店名 → Instagramハンドル マッピング（DBの正式店名を使用）
// (@ は含めない)
// ============================================================
const INSTAGRAM_MAP: { name: string; handle: string }[] = [
  // ── 三宮エリア ──────────────────────────────────────────
  { name: 'ライトスタンド',                      handle: 'lightstand_kobe' },
  { name: 'すたんど こうめ',                     handle: 'standkoume' },
  { name: '伊藤勝商店',                          handle: 'ito_sakaya_kobe' },
  { name: '立呑 Blend',                          handle: 'blend_tachinomi' },
  { name: '酒家 風鶏',                           handle: 'fukei_shuka' },
  { name: 'にくひろ',                            handle: 'nikuhiro.jibie' },
  { name: '蔵元酒場おやっとさぁ 三宮店',         handle: 'oyattosa_sannomiya_kobe' },
  { name: '宇宙と描いてSAKABAとよむ',            handle: 'uchusakaba' },
  { name: 'THE BAKE',                            handle: 'thebake.boozys' },
  { name: '4坪牡蠣小屋 キヨリト 東門店',         handle: 'kiyorito.shokudo' },
  { name: '立ち呑み 京都商会',                   handle: 'tachinomi_kyotoshokai' },
  { name: 'ハレとケ',                            handle: 'haretoke_beer_cider' },
  { name: 'Uo魚',                                handle: 'uouo.kaisen' },
  { name: 'スタンド クラシック',                 handle: 'stand_classic' },
  { name: 'ことり屋',                            handle: 'kotoriya_229' },
  { name: '肉料理ちぃちゃん はなれ',             handle: 'chiichan_hanare' },
  { name: '立ち呑み かんぱい',                   handle: 'kanpai_1105' },
  { name: 'スタンド GONTa2',                     handle: 'standgonta2' },
  { name: '昭和ロマン おとめの台所 本店',        handle: 'otomenodaidokoro' },
  { name: 'スタンド サンジ',                     handle: 'standsanji3z' },
  { name: '路地裏スタンド アベック',             handle: 'roziurastand_avec' },
  { name: 'スタンド Gonta',                      handle: 'standgonta1' },
  { name: '神戸手羽唐専門店 鶏冠屋 2号店',       handle: 'tosakaya2' },
  { name: 'ワインの名に懸けて',                  handle: 'wine_no_nanikakete' },
  { name: '朝呑み 楽酒',                         handle: 'rakuzake' },
  { name: 'GASTORONOMIA BUCO',                   handle: 'gastronomiabuco' },
  { name: 'きりの台所',                          handle: 'kirino_daidokoro' },
  { name: 'ムーン テイル',                       handle: 'moon_tail1129' },
  { name: '浅野日本酒店 SANNOMIYA',              handle: 'asanonihonshutensannomiya' },
  { name: 'キヨリト サカノバ 酒挟む',            handle: 'kiyorito.sakanoba' },
  { name: '鶴亀八番',                            handle: 'tsurukame.8ban' },
  { name: '一三酒店マルアール',                  handle: '13saketen' },
  { name: '立ち飲み ごっち',                     handle: 'gocchi_kobe' },
  { name: '立ち飲み わらかど',                   handle: 'warakado.r3' },
  { name: '立ち飲み 1',                          handle: 'tachinomi_1' },
  { name: '立呑み よってこ',                     handle: '_yotteko_' },
  { name: '立呑み処 頂',                         handle: 'stand_itadaki' },
  { name: '立ち飲み居酒屋 さんかく 三宮店',      handle: 'stand.sankaku' },
  { name: '立呑処 醅(ふう)',                     handle: 'tachinomi_fu_2023' },
  { name: '立ち呑みニューワールド',              handle: 'newworld_kobe' },
  { name: 'Ready Steady Go!',                    handle: 'readysteadygo_kobe' },
  { name: 'エキマエスタンド',                    handle: 'ekistasince1996' },
  { name: '立ち呑み るぅちゃん',                 handle: 'ruuchan101' },
  { name: '立ち呑み Zen',                        handle: 'standingbar_zen' },
  { name: 'スタンドサンジ2nd（セカンド）',       handle: 'standsanji32z' },
  { name: 'ホルモン 福寅（ふくとら）',           handle: 'horumon_fukutora' },
  { name: 'STAND COBE（スタンドコービー）',       handle: 'stand_cobe' },
  { name: 'ニュージョージ',                      handle: 'jooji0725' },
  // ── 元町エリア ──────────────────────────────────────────
  { name: '立ち飲み わらかど 元町',              handle: 'warakado.r3' },
  { name: 'お酒の美術館 神戸元町店',             handle: 'lm.kobe_motomachi.bar' },
  { name: 'Moridini（モリディーニ）',             handle: 'moridini1414' },
  { name: '昭和レトロBAR ニューロマン',           handle: 'bar_new_roman' },
  { name: '家ごはん ひろよ',                     handle: 'iegohanhiroyo' },
  { name: 'chotto（ちょっと）',                  handle: 'chotto_sannomiya' },
  { name: 'イロハニリベロ',                      handle: 'irohani_libero' },
  // ── 周辺エリア ──────────────────────────────────────────
  { name: '八喜為 新開地店',                     handle: 'izakaya_hakidame' },
  { name: 'まさ 湊川店',                         handle: 'masaminatogawa' },
  { name: 'スタンドねこしゃん',                  handle: 'shiyanneko' },
  { name: 'チヤップリン',                        handle: 'shinkaichichappurin' },
  { name: '串とメシにはサケキタル。三宮駅前店',  handle: 'sakekitaru_sannomiya' },
  { name: '蔬菜(sosai)',                          handle: 'sosai_ninomiya' },
];

// ============================================================
// メイン
// ============================================================
async function main() {
  console.log(`\n🍺 Instagram ハンドル更新スクリプト`);
  console.log(`   モード: ${DRY ? 'DRY RUN（書き込みなし）' : ALL ? '全店強制上書き' : '未設定のみ更新'}`);
  console.log(`   対象マッピング数: ${INSTAGRAM_MAP.length}\n`);

  // DB の全店舗を取得
  const { data: allStores, error } = await supabase
    .from('restaurants')
    .select('id, name, instagram_handle');

  if (error || !allStores) {
    console.error('DB取得エラー:', error);
    process.exit(1);
  }

  const nameMap = new Map(allStores.map(s => [s.name, s]));

  let updated = 0;
  let skipped = 0;
  let notFound = 0;

  for (const { name, handle } of INSTAGRAM_MAP) {
    // 完全一致
    let store = nameMap.get(name);

    // 完全一致しない場合は部分一致で探す
    if (!store) {
      const candidates = allStores.filter(s =>
        s.name.includes(name) || name.includes(s.name)
      );
      if (candidates.length === 1) {
        store = candidates[0];
      } else if (candidates.length > 1) {
        // 最短名前の候補（最も具体的）を選ぶ
        store = candidates.reduce((a, b) =>
          Math.abs(a.name.length - name.length) < Math.abs(b.name.length - name.length) ? a : b
        );
      }
    }

    if (!store) {
      console.log(`⚠️  見つからない: "${name}"`);
      notFound++;
      continue;
    }

    // 既設定をスキップ（--all なし時）
    if (!ALL && store.instagram_handle) {
      skipped++;
      continue;
    }

    console.log(`${DRY ? '[DRY]' : '✅'} "${store.name}" → @${handle}`);

    if (!DRY) {
      const { error: updateError } = await supabase
        .from('restaurants')
        .update({ instagram_handle: handle })
        .eq('id', store.id);

      if (updateError) {
        console.error(`  エラー: ${updateError.message}`);
      } else {
        updated++;
      }
    } else {
      updated++;
    }
  }

  console.log(`\n📊 結果`);
  console.log(`   更新: ${updated}`);
  console.log(`   スキップ（既設定）: ${skipped}`);
  console.log(`   見つからない: ${notFound}`);
  if (DRY) console.log(`\n   ※ DRYモードのため実際の変更なし`);
}

main().catch(console.error);
