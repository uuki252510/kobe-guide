import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, supabaseAdmin, isBlockedBetween } from '@/lib/supabase-server';

// POST /api/follow  { followingId }
export async function POST(req: NextRequest) {
  const { user, error } = await requireAuth(req);
  if (error) return error;

  const { followingId } = await req.json();
  if (!followingId) {
    return NextResponse.json({ error: 'followingId required' }, { status: 400 });
  }
  if (followingId === user.id) {
    return NextResponse.json({ error: '自分自身をフォローできません' }, { status: 400 });
  }

  // Block check
  if (await isBlockedBetween(user.id, followingId)) {
    return NextResponse.json({ error: 'ブロック関係のためフォローできません' }, { status: 403 });
  }

  // Target user must exist
  const { data: target } = await supabaseAdmin
    .from('user_profiles')
    .select('id')
    .eq('id', followingId)
    .single();
  if (!target) {
    return NextResponse.json({ error: 'ユーザーが見つかりません' }, { status: 404 });
  }

  const { error: insertErr } = await supabaseAdmin
    .from('follows')
    .insert({ follower_id: user.id, following_id: followingId });

  if (insertErr) {
    // unique violation = already following
    if (insertErr.code === '23505') {
      return NextResponse.json({ message: 'already following' }, { status: 200 });
    }
    return NextResponse.json({ error: insertErr.message }, { status: 500 });
  }

  // Feed activity
  await supabaseAdmin.from('feed_activities').insert({
    user_id: user.id,
    activity_type: 'follow',
    target_user_id: followingId,
  });

  return NextResponse.json({ success: true }, { status: 201 });
}

// DELETE /api/follow  { followingId }
export async function DELETE(req: NextRequest) {
  const { user, error } = await requireAuth(req);
  if (error) return error;

  const { followingId } = await req.json();
  if (!followingId) {
    return NextResponse.json({ error: 'followingId required' }, { status: 400 });
  }

  await supabaseAdmin
    .from('follows')
    .delete()
    .eq('follower_id', user.id)
    .eq('following_id', followingId);

  // Remove follow feed activity
  await supabaseAdmin
    .from('feed_activities')
    .delete()
    .eq('user_id', user.id)
    .eq('activity_type', 'follow')
    .eq('target_user_id', followingId);

  return NextResponse.json({ success: true });
}

// GET /api/follow?followingId=xxx  — check follow status between current user and target
export async function GET(req: NextRequest) {
  const { user, error } = await requireAuth(req);
  if (error) return error;

  const followingId = req.nextUrl.searchParams.get('followingId');
  if (!followingId) {
    return NextResponse.json({ error: 'followingId required' }, { status: 400 });
  }

  const [{ data: isFollowing }, { data: isFollowedBy }, blocked] = await Promise.all([
    supabaseAdmin
      .from('follows')
      .select('id')
      .eq('follower_id', user.id)
      .eq('following_id', followingId)
      .maybeSingle(),
    supabaseAdmin
      .from('follows')
      .select('id')
      .eq('follower_id', followingId)
      .eq('following_id', user.id)
      .maybeSingle(),
    isBlockedBetween(user.id, followingId),
  ]);

  return NextResponse.json({
    isFollowing: !!isFollowing,
    isFollowedBy: !!isFollowedBy,
    isMutual: !!isFollowing && !!isFollowedBy,
    isBlocked: blocked,
  });
}
