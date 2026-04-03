// ============================================================
// Restaurant 型定義
// ============================================================

export type Area = 'sannomiya' | 'motomachi' | 'kitano' | 'nankinmachi' | 'surroundings';
export type TachinomiType = 'tachinomi' | 'kakuuchi' | 'yakitori' | 'seafood' | 'wine' | 'italian' | 'hormones' | 'bar';
export type BusinessStatus = 'OPERATIONAL' | 'CLOSED_TEMPORARILY' | 'CLOSED_PERMANENTLY';
export type PriceLevel = 0 | 1 | 2 | 3 | 4;

export interface Restaurant {
  id: string;
  place_id: string | null;
  name: string;
  area: Area;
  category: string[];
  formatted_address: string | null;
  lat: number | null;
  lng: number | null;
  google_maps_url: string | null;
  website: string | null;
  phone_number: string | null;
  international_phone_number: string | null;
  rating: number | null;
  user_ratings_total: number | null;
  business_status: BusinessStatus;
  price_level: PriceLevel | null;
  opening_hours_json: OpeningHoursJson | null;
  budget_min: number | null;
  budget_max: number | null;
  budget_estimated: boolean;
  english_support: boolean | null;
  reservation_required: boolean | null;
  must_try_menu: string | null;
  foreigner_friendly_score: number | null; // 1-5
  solo_friendly_score: number | null;      // 1-5
  local_experience_score: number | null;   // 1-5
  vibe_tags: string[];
  instagram_handle: string | null;
  is_new_open: boolean;
  open_date: string | null;
  tachinomi_type: TachinomiType | null;
  internal_notes: string | null; // キャッチコピー（Claude生成）
  photo_reference: string | null;
  priority_score: number;
  is_published: boolean;
  review_needed: boolean;
  source: string;
  created_at: string;
  updated_at: string;
  last_synced_at: string | null;
}

export interface OpeningHoursJson {
  periods?: Array<{
    open: { day: number; hour: number; minute: number };
    close?: { day: number; hour: number; minute: number };
  }>;
  weekdayDescriptions?: string[];
}

// ============================================================
// Google Places API v1 レスポンス型
// ============================================================

export interface PlaceResult {
  id: string;
  displayName: {
    text: string;
    languageCode: string;
  };
  formattedAddress: string;
  location: {
    latitude: number;
    longitude: number;
  };
  rating?: number;
  userRatingCount?: number;
  businessStatus?: string;
  priceLevel?: string;   // "PRICE_LEVEL_INEXPENSIVE" etc.
  types?: string[];
  regularOpeningHours?: {
    periods: Array<{
      open: { day: number; hour: number; minute: number };
      close?: { day: number; hour: number; minute: number };
    }>;
    weekdayDescriptions: string[];
  };
  websiteUri?: string;
  internationalPhoneNumber?: string;
  nationalPhoneNumber?: string;
  googleMapsUri?: string;
}

export interface PlacesApiResponse {
  places?: PlaceResult[];
  nextPageToken?: string;
}

// ============================================================
// 検索クエリ定義
// ============================================================

export interface SearchQuery {
  area: Area;
  keyword: string;       // 検索キーワード（日本語）
  category: string;      // 内部カテゴリ
  location: {
    lat: number;
    lng: number;
  };
  radius: number;        // メートル
}

// ============================================================
// インポート統計
// ============================================================

export interface ImportStats {
  total: number;
  inserted: number;
  updated: number;
  skipped: number;
  errors: number;
  reviewNeeded: number;
}

// ============================================================
// API レスポンス型
// ============================================================

export interface RestaurantListResponse {
  restaurants: Restaurant[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface RestaurantSearchParams {
  area?: Area;
  category?: string;
  budget_min?: number;
  budget_max?: number;
  vibe_tags?: string[];
  english_support?: boolean;
  reservation_required?: boolean;
  keyword?: string;
  page?: number;
  limit?: number;
}
