import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, supabaseAdmin } from '@/lib/supabase-server';

// POST /api/visits  { restaurantId, note? }
export async function POST(req: NextRequest) {
  const { user, error } = await requireAuth(req);
  if (error) return error;

  const { restaurantId, note } = await req.json();
  if (!restaurantId) return NextResponse.json({ error: 'restaurantId required' }, { status: 400 });

  const { data, error: insertErr } = await supabaseAdmin
    .from('user_visits')
    .insert({ user_id: user.id, restaurant_id: restaurantId, note: note ?? null })
    .select()
    .single();

  if (insertErr) return NextResponse.json({ error: insertErr.message }, { status: 500 });

  // Feed activity
  await supabaseAdmin.from('feed_activities').insert({
    user_id: user.id,
    activity_type: 'visit',
    restaurant_id: restaurantId,
  });

  return NextResponse.json({ visit: data }, { status: 201 });
}

// DELETE /api/visits  { visitId }
export async function DELETE(req: NextRequest) {
  const { user, error } = await requireAuth(req);
  if (error) return error;

  const { visitId } = await req.json();
  if (!visitId) return NextResponse.json({ error: 'visitId required' }, { status: 400 });

  await supabaseAdmin
    .from('user_visits')
    .delete()
    .eq('id', visitId)
    .eq('user_id', user.id); // ensure ownership

  return NextResponse.json({ success: true });
}
