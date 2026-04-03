import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, supabaseAdmin } from '@/lib/supabase-server';

// GET /api/feed?limit=20&offset=0
// Returns activities from users the current user follows
export async function GET(req: NextRequest) {
  const { user, error } = await requireAuth(req);
  if (error) return error;

  const limit = parseInt(req.nextUrl.searchParams.get('limit') ?? '20', 10);
  const offset = parseInt(req.nextUrl.searchParams.get('offset') ?? '0', 10);

  // Get IDs of followed users
  const { data: followingRows } = await supabaseAdmin
    .from('follows')
    .select('following_id')
    .eq('follower_id', user.id);

  const followingIds = (followingRows ?? []).map((r) => r.following_id);

  if (followingIds.length === 0) {
    return NextResponse.json({ activities: [], total: 0 });
  }

  // Get blocked user IDs (both directions) to filter feed
  const { data: blockedRows } = await supabaseAdmin
    .from('blocks')
    .select('blocked_id')
    .eq('blocker_id', user.id);
  const blockedIds = new Set((blockedRows ?? []).map((b) => b.blocked_id));

  const validIds = followingIds.filter((id) => !blockedIds.has(id));
  if (validIds.length === 0) {
    return NextResponse.json({ activities: [], total: 0 });
  }

  const { data, error: fetchErr, count } = await supabaseAdmin
    .from('feed_activities_view')
    .select('*', { count: 'exact' })
    .in('user_id', validIds)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (fetchErr) return NextResponse.json({ error: fetchErr.message }, { status: 500 });

  return NextResponse.json({ activities: data ?? [], total: count ?? 0 });
}
