import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * GET /api/restaurants
 * 公開済み店舗の一覧・条件検索
 *
 * クエリパラメータ:
 *   area           - sannomiya | motomachi | kitano | nankinmachi
 *   category       - standing-bar | izakaya | kobe-beef | bar 等
 *   budget_min     - 最小予算（円）
 *   budget_max     - 最大予算（円）
 *   english_support - true | false
 *   keyword        - 店名・メモの部分一致
 *   vibe_tags      - カンマ区切り（例: local,casual）
 *   page           - ページ番号（デフォルト1）
 *   limit          - 1ページあたり件数（デフォルト20、最大50）
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const area            = searchParams.get('area');
  const tachinomiType   = searchParams.get('tachinomi_type');
  const budgetMin       = searchParams.get('budget_min');
  const budgetMax       = searchParams.get('budget_max');
  const englishSupport  = searchParams.get('english_support');
  const keyword         = searchParams.get('keyword');
  const vibeTagsParam   = searchParams.get('vibe_tags');
  const isNewOpen       = searchParams.get('is_new_open');
  const soloFriendly    = searchParams.get('solo_friendly');
  const page            = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
  const limit           = Math.min(200, Math.max(1, parseInt(searchParams.get('limit') ?? '20')));
  const offset          = (page - 1) * limit;

  let query = supabaseAdmin
    .from('restaurants')
    .select(
      `id, name, area, category, budget_min, budget_max, budget_estimated,
       lat, lng, google_maps_url, vibe_tags, rating, user_ratings_total,
       opening_hours_json, english_support, reservation_required,
       foreigner_friendly_score, solo_friendly_score, local_experience_score,
       tachinomi_type, instagram_handle, is_new_open, open_date, must_try_menu,
       priority_score, website, phone_number, photo_reference`,
      { count: 'exact' }
    )
    .eq('is_published', true)
    .neq('business_status', 'CLOSED_PERMANENTLY')
    .order('priority_score', { ascending: false })
    .order('rating', { ascending: false, nullsFirst: false })
    .range(offset, offset + limit - 1);

  if (area)                   query = query.eq('area', area);
  if (tachinomiType)          query = query.eq('tachinomi_type', tachinomiType);
  if (budgetMin)              query = query.gte('budget_max', parseInt(budgetMin));
  if (budgetMax)              query = query.lte('budget_min', parseInt(budgetMax));
  if (englishSupport === 'true') query = query.eq('english_support', true);
  if (isNewOpen === 'true')   query = query.eq('is_new_open', true);
  if (soloFriendly === 'true') query = query.gte('solo_friendly_score', 3);
  if (keyword)                query = query.or(`name.ilike.%${keyword}%,must_try_menu.ilike.%${keyword}%`);
  if (vibeTagsParam) {
    const tags = vibeTagsParam.split(',').filter(Boolean);
    if (tags.length > 0) query = query.overlaps('vibe_tags', tags);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error('restaurants API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    restaurants: data ?? [],
    pagination: {
      page,
      limit,
      total: count ?? 0,
      pages: Math.ceil((count ?? 0) / limit),
    },
  });
}
