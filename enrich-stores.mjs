/**
 * 店舗情報拡充スクリプト
 * ① Google Places API で website / editorial_summary を取得
 * ② Claude API で must_try_menu / scores / catchcopy を生成
 */
import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';
import { readFileSync } from 'fs';

// ── env 読み込み ──────────────────────────────────────────────
const env = readFileSync('.env.local', 'utf8');
const vars = {};
env.split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v.length) vars[k.trim()] = v.join('=').trim();
});

const supabase = createClient(vars.NEXT_PUBLIC_SUPABASE_URL, vars.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const anthropic = new Anthropic({ apiKey: vars.ANTHROPIC_API_KEY });
const GOOGLE_KEY = vars.GOOGLE_MAPS_API_KEY;

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

const TYPE_LABEL = {
  tachinomi: '立ち飲み', kakuuchi: '角打ち', yakitori: '焼鳥',
  seafood: '海鮮', wine: 'ワインスタンド', italian: 'イタリアン',
  hormones: 'ホルモン', bar: 'バー',
};

const AREA_LABEL = {
  sannomiya: '三宮', motomachi: '元町', surroundings: '周辺',
};

// ── ① Google Places で website / editorial_summary 取得 ──────
async function fetchPlacesDetails(placeId) {
  const url = `https://places.googleapis.com/v1/places/${placeId}?fields=websiteUri,editorialSummary,regularOpeningHours&key=${GOOGLE_KEY}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    return {
      website: data.websiteUri ?? null,
      editorial_summary: data.editorialSummary?.text ?? null,
    };
  } catch { return { website: null, editorial_summary: null }; }
}

// ── ② Claude で店舗コンテンツ生成 ───────────────────────────
async function generateContent(store, editorialSummary) {
  const typeLabel = store.tachinomi_type ? (TYPE_LABEL[store.tachinomi_type] ?? '立ち飲み') : '立ち飲み';
  const areaLabel = AREA_LABEL[store.area] ?? store.area;
  const tags = (store.vibe_tags ?? []).join(', ');
  const budget = `¥${store.budget_min ?? 500}〜¥${store.budget_max ?? 2000}`;

  const prompt = `神戸の立ち飲み店「${store.name}」の情報を日本語で生成してください。

店舗情報:
- ジャンル: ${typeLabel}
- エリア: ${areaLabel}
- 予算: ${budget}/人
- タグ: ${tags || 'なし'}
- Googleの説明: ${editorialSummary || 'なし'}

以下をJSON形式で返してください（他のテキストは不要）:
{
  "must_try_menu": "この店の名物・おすすめメニューを1〜2品、具体的に20文字以内で（例: 「牡蠣の醤油焼き・地ビール」）",
  "catchcopy": "この店の魅力を伝える一言キャッチコピーを30文字以内で（例: 「昭和の空気が残る、神戸最古の角打ち」）",
  "solo_friendly_score": 一人で入りやすいか 1〜5の整数（5が最高）,
  "local_experience_score": 地元感・神戸らしさ 1〜5の整数,
  "foreigner_friendly_score": 外国人が入りやすいか 1〜5の整数
}

ジャンルや雰囲気からリアルに推定してください。角打ちは地元感高め、バーは外国人OK高め、など。`;

  try {
    const msg = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }],
    });
    const text = msg.content[0].text.trim();
    const json = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] ?? '{}');
    return json;
  } catch (e) {
    console.error(`  Claude error for ${store.name}:`, e.message);
    return null;
  }
}

// ── メイン ──────────────────────────────────────────────────
const { data: stores } = await supabase
  .from('restaurants')
  .select('id, name, area, tachinomi_type, vibe_tags, budget_min, budget_max, place_id')
  .eq('is_published', true)
  .order('priority_score', { ascending: false });

console.log(`\n対象: ${stores.length}店舗\n`);

let successCount = 0;
let errorCount = 0;

for (let i = 0; i < stores.length; i++) {
  const store = stores[i];
  console.log(`[${i + 1}/${stores.length}] ${store.name}`);

  // ① Google Places
  let editorialSummary = null;
  let website = null;
  if (store.place_id) {
    const places = await fetchPlacesDetails(store.place_id);
    editorialSummary = places.editorial_summary;
    website = places.website;
    if (website) console.log(`  ✅ website: ${website}`);
    if (editorialSummary) console.log(`  ✅ summary: ${editorialSummary.slice(0, 40)}...`);
    await sleep(80);
  }

  // ② Claude 生成
  const generated = await generateContent(store, editorialSummary);
  if (!generated) { errorCount++; continue; }

  console.log(`  📝 must_try: ${generated.must_try_menu}`);
  console.log(`  💬 catch: ${generated.catchcopy}`);
  console.log(`  📊 solo:${generated.solo_friendly_score} local:${generated.local_experience_score} foreign:${generated.foreigner_friendly_score}`);

  // DB更新
  const update = {
    must_try_menu: generated.must_try_menu ?? null,
    solo_friendly_score: generated.solo_friendly_score ?? null,
    local_experience_score: generated.local_experience_score ?? null,
    foreigner_friendly_score: generated.foreigner_friendly_score ?? null,
    internal_notes: generated.catchcopy ?? null,
  };
  if (website) update.website = website;

  const { error } = await supabase.from('restaurants').update(update).eq('id', store.id);
  if (error) {
    console.error(`  ❌ DB error:`, error.message);
    errorCount++;
  } else {
    successCount++;
  }

  await sleep(300); // rate limit
}

console.log(`\n完了: ${successCount}店成功, ${errorCount}店エラー`);
