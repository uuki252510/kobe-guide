#!/usr/bin/env node
/**
 * 各店舗の Google Places 写真リファレンスを取得してDBに保存
 *
 * 使い方:
 *   npx tsx scripts/fetch-photos.ts            # photo_reference が空の店のみ
 *   npx tsx scripts/fetch-photos.ts --all      # 全件強制再取得
 *   npx tsx scripts/fetch-photos.ts --dry-run  # DBに書かない確認モード
 *
 * コスト: Places API (New) — Basic Data = $0.002/件
 *         90店 × $0.002 = $0.18 程度
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const API_KEY = process.env.GOOGLE_MAPS_API_KEY!;
const PLACES_BASE = 'https://places.googleapis.com/v1';

async function fetchPhotoReference(placeId: string): Promise<string | null> {
  const res = await fetch(`${PLACES_BASE}/places/${placeId}`, {
    headers: {
      'X-Goog-Api-Key': API_KEY,
      'X-Goog-FieldMask': 'photos',
    },
  });
  if (!res.ok) return null;
  const data = await res.json();
  // photos[0].name = "places/{placeId}/photos/{photoId}"
  return data.photos?.[0]?.name ?? null;
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function run() {
  const args = process.argv.slice(2);
  const dryRun  = args.includes('--dry-run');
  const forceAll = args.includes('--all');

  console.log('\n' + '═'.repeat(52));
  console.log('  📸 Kobe Photo Fetcher (Google Places)');
  console.log('═'.repeat(52));
  console.log(`  モード: ${dryRun ? '🔵 DRY RUN' : '🔴 LIVE'} ${forceAll ? '（全件）' : '（未取得のみ）'}`);

  let query = supabase
    .from('restaurants')
    .select('id, name, place_id, photo_reference')
    .not('place_id', 'is', null)
    .order('priority_score', { ascending: false });

  if (!forceAll) {
    query = query.is('photo_reference', null);
  }

  const { data: stores, error } = await query;
  if (error) { console.error('❌ DB取得エラー:', error.message); process.exit(1); }
  if (!stores || stores.length === 0) {
    console.log('\n✅ 取得対象なし（全店舗取得済み）\n   強制再取得: --all\n');
    return;
  }

  console.log(`\n  対象: ${stores.length} 店\n` + '─'.repeat(52));

  let ok = 0, skip = 0, err = 0;

  for (const store of stores) {
    process.stdout.write(`  ${store.name} ... `);

    let ref: string | null = null;
    try {
      ref = await fetchPhotoReference(store.place_id);
    } catch (e) {
      console.log(`❌ ${e instanceof Error ? e.message : e}`);
      err++;
      await sleep(500);
      continue;
    }

    if (!ref) {
      console.log('⚠️  写真なし');
      skip++;
      await sleep(200);
      continue;
    }

    console.log(`✅  ${ref.slice(0, 60)}...`);
    ok++;

    if (!dryRun) {
      const { error: upErr } = await supabase
        .from('restaurants')
        .update({ photo_reference: ref })
        .eq('id', store.id);
      if (upErr) console.log(`     ⚠️ 更新エラー: ${upErr.message}`);
    }

    await sleep(250);
  }

  console.log('─'.repeat(52));
  console.log(`  ✅ 取得: ${ok}  ⚠️ 写真なし: ${skip}  ❌ エラー: ${err}`);
  if (dryRun) console.log('  ℹ️  DRY RUN のためDBは変更されていません');
  console.log('═'.repeat(52) + '\n');
}

run().catch(e => { console.error('❌', e); process.exit(1); });
