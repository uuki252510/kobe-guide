import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, supabaseAdmin } from '@/lib/supabase-server';

// POST /api/favorites  { restaurantId }
export async function POST(req: NextRequest) {
  const { user, error } = await requireAuth(req);
  if (error) return error;

  const { restaurantId } = await req.json();
  if (!restaurantId) return NextResponse.json({ error: 'restaurantId required' }, { status: 400 });

  const { error: insertErr } = await supabaseAdmin
    .from('user_favorites')
    .insert({ user_id: user.id, restaurant_id: restaurantId });

  if (insertErr) {
    if (insertErr.code === '23505') {
      return NextResponse.json({ message: 'already favorited' }, { status: 200 });
    }
    return NextResponse.json({ error: insertErr.message }, { status: 500 });
  }

  // Feed activity
  await supabaseAdmin.from('feed_activities').insert({
    user_id: user.id,
    activity_type: 'favorite',
    restaurant_id: restaurantId,
  });

  return NextResponse.json({ success: true }, { status: 201 });
}

// DELETE /api/favorites  { restaurantId }
export async function DELETE(req: NextRequest) {
  const { user, error } = await requireAuth(req);
  if (error) return error;

  const { restaurantId } = await req.json();
  if (!restaurantId) return NextResponse.json({ error: 'restaurantId required' }, { status: 400 });

  await supabaseAdmin
    .from('user_favorites')
    .delete()
    .eq('user_id', user.id)
    .eq('restaurant_id', restaurantId);

  await supabaseAdmin
    .from('feed_activities')
    .delete()
    .eq('user_id', user.id)
    .eq('activity_type', 'favorite')
    .eq('restaurant_id', restaurantId);

  return NextResponse.json({ success: true });
}
