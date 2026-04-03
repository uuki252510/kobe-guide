import { PlaceResult, PlacesApiResponse, SearchQuery } from '@/types/restaurant';

const PLACES_API_BASE = 'https://places.googleapis.com/v1';

// ============================================================
// コスト最適化フィールドマスク
// Basic fields ($5/1000) + Advanced fields ($17/1000) の混在
// → Advanced fieldを含む場合は全体が$17/1000課金
// MVPでは1回の取得で全情報を揃える方針（再取得コスト回避）
// ============================================================
const FIELD_MASK = [
  // Basic fields
  'places.id',
  'places.displayName',
  'places.formattedAddress',
  'places.location',
  'places.types',
  'places.businessStatus',
  'places.googleMapsUri',
  // Advanced fields（これで$17/1000になるが1回で完結させる）
  'places.rating',
  'places.userRatingCount',
  'places.priceLevel',
  'places.regularOpeningHours',
  'places.websiteUri',
  'places.internationalPhoneNumber',
  'places.nationalPhoneNumber',
].join(',');

// ============================================================
// Text Search で神戸エリアの店舗を取得
// ============================================================
export async function searchPlaces(query: SearchQuery): Promise<PlaceResult[]> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) throw new Error('GOOGLE_MAPS_API_KEY が設定されていません');

  const body = {
    textQuery: query.keyword,
    languageCode: 'ja',
    maxResultCount: 20,
    locationBias: {
      circle: {
        center: {
          latitude: query.location.lat,
          longitude: query.location.lng,
        },
        radius: query.radius,
      },
    },
  };

  const response = await fetch(`${PLACES_API_BASE}/places:searchText`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': FIELD_MASK,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Places API エラー: ${response.status} ${response.statusText}\n${errorText}`
    );
  }

  const data: PlacesApiResponse = await response.json();
  return data.places ?? [];
}

// ============================================================
// 推定コスト計算（ログ用）
// ============================================================
export function estimateCost(queryCount: number, resultsPerQuery = 20): string {
  const totalRequests = queryCount; // Text Search は1クエリ=1リクエスト
  const costPer1000 = 0.017; // Advanced = $17/1000
  const estimatedCost = (totalRequests / 1000) * costPer1000;
  return `推定コスト: $${estimatedCost.toFixed(4)} (${totalRequests}クエリ × 最大${resultsPerQuery}件)`;
}
