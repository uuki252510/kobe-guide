#!/usr/bin/env node
/**
 * 神戸エリア飲食店 Google Places API 取込スクリプト
 *
 * 使い方:
 *   npx tsx scripts/import-places.ts              # 全エリア取込（本番）
 *   npx tsx scripts/import-places.ts --dry-run    # ドライラン（DBに書かない）
 *   npx tsx scripts/import-places.ts --area=sannomiya  # エリア絞り込み
 *   npx tsx scripts/import-places.ts --cost-check # コスト推定のみ表示
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { searchPlaces, estimateCost } from '../src/lib/googlePlaces';
import { normalizePlace } from '../src/lib/restaurantNormalizer';
import { upsertRestaurant } from '../src/lib/restaurantUpsert';
import { SearchQuery, ImportStats } from '../src/types/restaurant';

// ============================================================
// 検索クエリ定義
// エリア・カテゴリ追加時はここに行を足すだけでOK
// ============================================================
const SEARCH_QUERIES: SearchQuery[] = [
  // ── 三宮（Sannomiya）──────────────────────────────────────
  {
    area: 'sannomiya',
    keyword: '三宮 立ち飲み',
    category: 'standing-bar',
    location: { lat: 34.6941, lng: 135.1958 },
    radius: 800,
  },
  {
    area: 'sannomiya',
    keyword: '三宮 居酒屋',
    category: 'izakaya',
    location: { lat: 34.6941, lng: 135.1958 },
    radius: 800,
  },
  {
    area: 'sannomiya',
    keyword: '三宮 バー 神戸',
    category: 'bar',
    location: { lat: 34.6941, lng: 135.1958 },
    radius: 800,
  },
  {
    area: 'sannomiya',
    keyword: '三宮 神戸牛',
    category: 'kobe-beef',
    location: { lat: 34.6941, lng: 135.1958 },
    radius: 1000,
  },
  {
    area: 'sannomiya',
    keyword: '三宮 日本酒バー',
    category: 'sake-bar',
    location: { lat: 34.6941, lng: 135.1958 },
    radius: 800,
  },
  {
    area: 'sannomiya',
    keyword: '三宮 深夜 ラーメン',
    category: 'late-night',
    location: { lat: 34.6941, lng: 135.1958 },
    radius: 800,
  },

  // ── 元町（Motomachi）─────────────────────────────────────
  {
    area: 'motomachi',
    keyword: '元町 立ち飲み 神戸',
    category: 'standing-bar',
    location: { lat: 34.6906, lng: 135.1874 },
    radius: 600,
  },
  {
    area: 'motomachi',
    keyword: '元町 居酒屋',
    category: 'izakaya',
    location: { lat: 34.6906, lng: 135.1874 },
    radius: 600,
  },
  {
    area: 'motomachi',
    keyword: '元町 バー 神戸',
    category: 'bar',
    location: { lat: 34.6906, lng: 135.1874 },
    radius: 600,
  },
  {
    area: 'motomachi',
    keyword: '元町 神戸牛',
    category: 'kobe-beef',
    location: { lat: 34.6906, lng: 135.1874 },
    radius: 700,
  },

  // ── 北野（Kitano）────────────────────────────────────────
  {
    area: 'kitano',
    keyword: '北野 バー 神戸',
    category: 'bar',
    location: { lat: 34.7012, lng: 135.1929 },
    radius: 600,
  },
  {
    area: 'kitano',
    keyword: '北野 神戸牛 レストラン',
    category: 'kobe-beef',
    location: { lat: 34.7012, lng: 135.1929 },
    radius: 700,
  },
  {
    area: 'kitano',
    keyword: '北野 居酒屋 神戸',
    category: 'izakaya',
    location: { lat: 34.7012, lng: 135.1929 },
    radius: 600,
  },

  // ── 南京町（Nankinmachi）──────────────────────────────────
  {
    area: 'nankinmachi',
    keyword: '南京町 居酒屋',
    category: 'izakaya',
    location: { lat: 34.6895, lng: 135.1863 },
    radius: 400,
  },
  {
    area: 'nankinmachi',
    keyword: '南京町 バー 神戸',
    category: 'bar',
    location: { lat: 34.6895, lng: 135.1863 },
    radius: 400,
  },
  {
    area: 'nankinmachi',
    keyword: '南京町 中華 神戸',
    category: 'chinese',
    location: { lat: 34.6895, lng: 135.1863 },
    radius: 400,
  },
];

// ============================================================
// メイン処理
// ============================================================
async function run() {
  const args = process.argv.slice(2);
  const dryRun     = args.includes('--dry-run');
  const costCheck  = args.includes('--cost-check');
  const areaFilter = args.find(a => a.startsWith('--area='))?.split('=')[1];

  // コスト確認だけして終了
  if (costCheck) {
    console.log('\n💰 コスト試算');
    console.log(estimateCost(SEARCH_QUERIES.length));
    console.log(`クエリ数: ${SEARCH_QUERIES.length}`);
    console.log('（1クエリあたり最大20件 × $0.017/1000リクエスト）\n');
    return;
  }

  const queries = areaFilter
    ? SEARCH_QUERIES.filter(q => q.area === areaFilter)
    : SEARCH_QUERIES;

  const stats: ImportStats = {
    total: 0,
    inserted: 0,
    updated: 0,
    skipped: 0,
    errors: 0,
    reviewNeeded: 0,
  };

  // ヘッダー表示
  console.log('\n' + '═'.repeat(50));
  console.log('  🏮 Kobe Restaurant Import');
  console.log('═'.repeat(50));
  console.log(`  モード    : ${dryRun ? '🔵 DRY RUN（DBへの書き込みなし）' : '🔴 LIVE'}`);
  console.log(`  クエリ数  : ${queries.length}`);
  console.log(`  エリア    : ${areaFilter ?? '全エリア'}`);
  console.log(`  ${estimateCost(queries.length)}`);
  console.log('─'.repeat(50) + '\n');

  // クエリごとに処理
  for (const query of queries) {
    console.log(`📍 ${query.keyword}`);

    let places;
    try {
      places = await searchPlaces(query);
      console.log(`   取得件数: ${places.length}`);
    } catch (err) {
      console.error(`   ❌ API エラー:`, err instanceof Error ? err.message : err);
      stats.errors++;
      continue;
    }

    for (const place of places) {
      stats.total++;
      const name = place.displayName.text;

      try {
        const normalized = normalizePlace(place, query);
        const result = await upsertRestaurant(normalized, dryRun);

        if (result.action === 'inserted') {
          stats.inserted++;
          console.log(`   ✅ 新規: ${name}${result.reviewNeeded ? ' ⚠️ 要確認' : ''}`);
        } else if (result.action === 'updated') {
          stats.updated++;
          console.log(`   🔄 更新: ${name}`);
        } else {
          stats.skipped++;
          console.log(`   ⏭️  スキップ: ${name}`);
        }

        if (result.reviewNeeded) stats.reviewNeeded++;

      } catch (err) {
        stats.errors++;
        console.error(`   ❌ エラー (${name}):`, err instanceof Error ? err.message : err);
      }
    }

    // Rate limit対策（500ms待機）
    await sleep(500);
    console.log('');
  }

  // 結果サマリー
  console.log('═'.repeat(50));
  console.log('  📊 インポート結果');
  console.log('─'.repeat(50));
  console.log(`  処理件数     : ${stats.total}`);
  console.log(`  新規挿入     : ${stats.inserted}`);
  console.log(`  更新         : ${stats.updated}`);
  console.log(`  スキップ     : ${stats.skipped}`);
  console.log(`  要確認       : ${stats.reviewNeeded}`);
  console.log(`  エラー       : ${stats.errors}`);

  if (dryRun) {
    console.log('\n  ℹ️  DRY RUNのため実際のDB変更はありません');
    console.log('  本番実行: npx tsx scripts/import-places.ts');
  }

  if (stats.reviewNeeded > 0) {
    console.log(`\n  ⚠️  ${stats.reviewNeeded}件の要確認レコードがあります`);
    console.log('  管理画面の「レビュー待ち」タブで確認してください');
  }
  console.log('═'.repeat(50) + '\n');
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

run().catch(err => {
  console.error('\n❌ 予期しないエラー:', err);
  process.exit(1);
});
