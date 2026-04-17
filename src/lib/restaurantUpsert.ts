import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Restaurant } from '@/types/restaurant';

// サーバーサイド専用クライアント（RLS bypass）
function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase環境変数が設定されていません');
  return createClient(url, key);
}

type UpsertData = Omit<Restaurant, 'id' | 'created_at' | 'updated_at'>;

export type UpsertAction = 'inserted' | 'updated' | 'skipped';

export interface UpsertResult {
  action: UpsertAction;
  reviewNeeded: boolean;
  id?: string;
}

// ============================================================
// メイン upsert 処理
// 優先順位: place_id一致 → 近似名称チェック → 新規挿入
// ============================================================
export async function upsertRestaurant(
  data: UpsertData,
  dryRun = false
): Promise<UpsertResult> {
  const supabase = getAdminClient();

  // --- ① place_id で既存チェック ---
  const { data: existing } = await supabase
    .from('restaurants')
    .select('id, name, formatted_address, internal_notes, is_published')
    .eq('place_id', data.place_id!)
    .maybeSingle();

  if (existing) {
    if (dryRun) {
      return { action: 'updated', reviewNeeded: false, id: existing.id };
    }

    // 更新時は手動設定済みフィールドを保護する
    const updateData: Partial<UpsertData> = {
      name:                      data.name,
      formatted_address:         data.formatted_address,
      lat:                       data.lat,
      lng:                       data.lng,
      rating:                    data.rating,
      user_ratings_total:        data.user_ratings_total,
      opening_hours_json:        data.opening_hours_json,
      business_status:           data.business_status,
      website:                   data.website,
      phone_number:              data.phone_number,
      international_phone_number: data.international_phone_number,
      price_level:               data.price_level,
      google_maps_url:           data.google_maps_url,
      last_synced_at:            data.last_synced_at,
    };

    // internal_notesが既に書かれていれば予算も上書きしない
    if (!existing.internal_notes) {
      updateData.budget_min = data.budget_min;
      updateData.budget_max = data.budget_max;
      updateData.budget_estimated = data.budget_estimated;
    }

    const { error } = await supabase
      .from('restaurants')
      .update(updateData)
      .eq('id', existing.id);

    if (error) throw new Error(`更新エラー (${data.name}): ${error.message}`);
    return { action: 'updated', reviewNeeded: false, id: existing.id };
  }

  // --- ② 近似重複チェック（fuzzy dedup） ---
  const reviewNeeded = await checkFuzzyDuplicate(supabase, data.name, data.formatted_address);

  if (dryRun) {
    return { action: 'inserted', reviewNeeded };
  }

  // --- ③ 新規挿入 ---
  const { data: inserted, error } = await supabase
    .from('restaurants')
    .insert({ ...data, review_needed: reviewNeeded })
    .select('id')
    .single();

  if (error) throw new Error(`挿入エラー (${data.name}): ${error.message}`);
  return { action: 'inserted', reviewNeeded, id: inserted.id };
}

// ============================================================
// 近似重複チェック
// 同じ住所ブロック内に名前が似た店があれば review_needed = true
// ============================================================
async function checkFuzzyDuplicate(
  supabase: SupabaseClient,
  name: string,
  address: string | null
): Promise<boolean> {
  if (!address) return false;

  // 住所の町名レベル（〜丁目の前）で絞り込み
  const addressBlock = address.split(/[0-9０-９]/)[0].trim();
  if (!addressBlock) return false;

  const { data: nearby } = await supabase
    .from('restaurants')
    .select('name')
    .ilike('formatted_address', `%${addressBlock}%`)
    .limit(20);

  if (!nearby || nearby.length === 0) return false;

  const nameLower = name.toLowerCase().replace(/\s/g, '');
  return nearby.some((r: { name: string }) => {
    const existingLower = r.name.toLowerCase().replace(/\s/g, '');
    // 一方が他方を含む、または編集距離が小さい（簡易実装）
    return (
      existingLower.includes(nameLower) ||
      nameLower.includes(existingLower) ||
      levenshteinSimilar(name, r.name, 2)
    );
  });
}

// シンプルなレーベンシュタイン距離（短い店名向け）
function levenshteinSimilar(a: string, b: string, threshold: number): boolean {
  if (Math.abs(a.length - b.length) > threshold) return false;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const curr = [i];
    for (let j = 1; j <= b.length; j++) {
      curr.push(
        a[i - 1] === b[j - 1]
          ? prev[j - 1]
          : 1 + Math.min(prev[j - 1], prev[j], curr[j - 1])
      );
    }
    prev = curr;
  }
  return prev[b.length] <= threshold;
}
