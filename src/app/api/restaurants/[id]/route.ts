import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { data, error } = await supabaseAdmin
    .from('restaurants')
    .select(
      `id, name, area, category, budget_min, budget_max, budget_estimated,
       lat, lng, google_maps_url, vibe_tags, rating, user_ratings_total,
       opening_hours_json, english_support, reservation_required,
       foreigner_friendly_score, solo_friendly_score, local_experience_score,
       tachinomi_type, instagram_handle, is_new_open, open_date, must_try_menu,
       priority_score, website, phone_number, photo_reference`
    )
    .eq('id', id)
    .eq('is_published', true)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ restaurant: data });
}
