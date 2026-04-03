import { PlaceResult, SearchQuery, Restaurant, PriceLevel, BusinessStatus } from '@/types/restaurant';

// ============================================================
// price_level → 予算レンジ（円/人）の推定テーブル
// 飲食店・居酒屋・バーを想定した神戸価格帯
// ============================================================
const PRICE_LEVEL_BUDGET: Record<string, { min: number; max: number }> = {
  PRICE_LEVEL_FREE:           { min: 0,    max: 500   },
  PRICE_LEVEL_INEXPENSIVE:    { min: 500,  max: 2000  }, // 立ち飲み・ラーメン
  PRICE_LEVEL_MODERATE:       { min: 2000, max: 5000  }, // 居酒屋・バー
  PRICE_LEVEL_EXPENSIVE:      { min: 5000, max: 10000 }, // 神戸牛・高級居酒屋
  PRICE_LEVEL_VERY_EXPENSIVE: { min: 10000, max: 25000 },
};

// ============================================================
// Google Places の types → 内部カテゴリマッピング
// ============================================================
function resolveCategory(types: string[], keyword: string): string[] {
  const categories = new Set<string>();

  // キーワードベース（最優先）
  if (keyword.includes('立ち飲み')) categories.add('standing-bar');
  if (keyword.includes('居酒屋'))   categories.add('izakaya');
  if (keyword.includes('神戸牛'))   categories.add('kobe-beef');
  if (keyword.includes('バー'))     categories.add('bar');

  // Google types ベース（補完）
  if (types.includes('bar'))             categories.add('bar');
  if (types.includes('night_club'))      categories.add('bar');
  if (types.includes('japanese_restaurant')) categories.add('izakaya');
  if (types.includes('restaurant') && categories.size === 0) {
    categories.add('restaurant');
  }

  return Array.from(categories);
}

// ============================================================
// ビジネスステータス変換
// ============================================================
function resolveStatus(status?: string): BusinessStatus {
  switch (status) {
    case 'CLOSED_TEMPORARILY':   return 'CLOSED_TEMPORARILY';
    case 'CLOSED_PERMANENTLY':   return 'CLOSED_PERMANENTLY';
    default:                     return 'OPERATIONAL';
  }
}

// ============================================================
// price_level 文字列 → 数値変換
// ============================================================
function resolvePriceLevel(level?: string): PriceLevel | null {
  const map: Record<string, PriceLevel> = {
    PRICE_LEVEL_FREE:           0,
    PRICE_LEVEL_INEXPENSIVE:    1,
    PRICE_LEVEL_MODERATE:       2,
    PRICE_LEVEL_EXPENSIVE:      3,
    PRICE_LEVEL_VERY_EXPENSIVE: 4,
  };
  return level ? (map[level] ?? null) : null;
}

// ============================================================
// priority_score の初期値を rating から推定
// rating 4.5 → 90点, 4.0 → 80点, 未評価 → 50点
// ============================================================
function estimatePriorityScore(rating?: number, userRatingsTotal?: number): number {
  if (!rating) return 50;
  const ratingScore = Math.round(rating * 18); // 5.0 → 90
  // 口コミ数が多い場合はボーナス
  const popularityBonus = userRatingsTotal && userRatingsTotal > 100 ? 5 : 0;
  return Math.min(100, ratingScore + popularityBonus);
}

// ============================================================
// メイン正規化関数
// PlaceResult → Restaurant (DB保存形式) に変換
// ============================================================
export function normalizePlace(
  place: PlaceResult,
  query: SearchQuery
): Omit<Restaurant, 'id' | 'created_at' | 'updated_at'> {
  const budget = place.priceLevel
    ? PRICE_LEVEL_BUDGET[place.priceLevel] ?? null
    : null;

  const googleMapsUrl =
    place.googleMapsUri ||
    `https://www.google.com/maps/place/?q=place_id:${place.id}`;

  return {
    place_id:                  place.id,
    name:                      place.displayName.text,
    area:                      query.area,
    category:                  resolveCategory(place.types ?? [], query.keyword),
    formatted_address:         place.formattedAddress,
    lat:                       place.location.latitude,
    lng:                       place.location.longitude,
    google_maps_url:           googleMapsUrl,
    website:                   place.websiteUri ?? null,
    phone_number:              place.nationalPhoneNumber ?? null,
    international_phone_number: place.internationalPhoneNumber ?? null,
    rating:                    place.rating ?? null,
    user_ratings_total:        place.userRatingCount ?? null,
    business_status:           resolveStatus(place.businessStatus),
    price_level:               resolvePriceLevel(place.priceLevel),
    opening_hours_json:        place.regularOpeningHours ?? null,

    // 予算（price_levelから推定）
    budget_min:       budget?.min ?? null,
    budget_max:       budget?.max ?? null,
    budget_estimated: budget !== null,

    // インバウンド情報（初期null・管理者が後編集）
    english_support:           null,
    reservation_required:      null,
    must_try_menu:             null,
    foreigner_friendly_score:  null,
    solo_friendly_score:       null,
    local_experience_score:    null,
    vibe_tags:                 [],
    internal_notes:            null,

    // スコアリング
    priority_score: estimatePriorityScore(place.rating, place.userRatingCount),

    // 公開制御（取得直後は非公開・管理者確認後に公開）
    is_published:   false,
    review_needed:  false,

    // 立ち飲みマップ専用（Google Placesからは未設定）
    instagram_handle: null,
    is_new_open:      false,
    open_date:        null,
    tachinomi_type:   null,

    // メタ
    source:          'google_places',
    photo_reference: null,
    last_synced_at:  new Date().toISOString(),
  };
}
