import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, requireAuth, supabaseAdmin, isBlockedBetween } from '@/lib/supabase-server';

// GET /api/profile/:userId
export async function GET(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const viewer = await getAuthUser(req);

  // Block check (only relevant when viewer ≠ target)
  if (viewer && viewer.id !== userId) {
    if (await isBlockedBetween(viewer.id, userId)) {
      return NextResponse.json({ error: 'このユーザーのプロフィールは表示できません' }, { status: 403 });
    }
  }

  const { data: profile, error } = await supabaseAdmin
    .from('public_user_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !profile) {
    return NextResponse.json({ error: 'ユーザーが見つかりません' }, { status: 404 });
  }

  // Follow status (only when viewer is logged in and not own profile)
  let followStatus = null;
  if (viewer && viewer.id !== userId) {
    const [{ data: isFollowing }, { data: isFollowedBy }] = await Promise.all([
      supabaseAdmin
        .from('follows')
        .select('id')
        .eq('follower_id', viewer.id)
        .eq('following_id', userId)
        .maybeSingle(),
      supabaseAdmin
        .from('follows')
        .select('id')
        .eq('follower_id', userId)
        .eq('following_id', viewer.id)
        .maybeSingle(),
    ]);
    followStatus = {
      isFollowing: !!isFollowing,
      isFollowedBy: !!isFollowedBy,
      isMutual: !!isFollowing && !!isFollowedBy,
      isBlocked: false,
    };
  }

  // Favorites (respect public setting)
  let favorites = null;
  if (profile.favorites_public || (viewer && viewer.id === userId)) {
    const { data } = await supabaseAdmin
      .from('user_favorites')
      .select(`restaurant_id, created_at, restaurant:restaurants(id, name, area, tachinomi_type)`)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);
    favorites = data ?? [];
  }

  // Visits (respect public setting)
  let visits = null;
  if (profile.visits_public || (viewer && viewer.id === userId)) {
    const { data } = await supabaseAdmin
      .from('user_visits')
      .select(
        `id, visited_at, note, restaurant:restaurants(id, name, area, tachinomi_type)`,
      )
      .eq('user_id', userId)
      .order('visited_at', { ascending: false })
      .limit(20);
    visits = data ?? [];
  }

  return NextResponse.json({ profile, followStatus, favorites, visits });
}

// PATCH /api/profile/:userId — update own profile
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const { user, error } = await requireAuth(req);
  if (error) return error;

  if (user.id !== userId) {
    return NextResponse.json({ error: '自分のプロフィールのみ編集できます' }, { status: 403 });
  }

  const body = await req.json();
  const allowed = ['display_name', 'bio', 'area_preference', 'favorites_public', 'visits_public'];
  const updates: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) updates[key] = body[key];
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: '更新するフィールドがありません' }, { status: 400 });
  }

  const { data, error: updateErr } = await supabaseAdmin
    .from('user_profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 });

  return NextResponse.json({ profile: data });
}
