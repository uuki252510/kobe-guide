import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, getAuthUser } from '@/lib/supabase-server';

// GET /api/followers/:userId?limit=20&offset=0
export async function GET(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const limit = parseInt(req.nextUrl.searchParams.get('limit') ?? '20', 10);
  const offset = parseInt(req.nextUrl.searchParams.get('offset') ?? '0', 10);

  // If viewer is logged in, hide users who blocked them
  const viewer = await getAuthUser(req);

  const { data, error, count } = await supabaseAdmin
    .from('follows')
    .select(
      `
      id, created_at,
      profile:user_profiles!follows_follower_id_fkey(
        id, username, display_name, avatar_url, bio, area_preference
      )
    `,
      { count: 'exact' },
    )
    .eq('following_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Filter out blockers when viewer is logged in
  let followers = data ?? [];
  if (viewer) {
    const { data: blockedIds } = await supabaseAdmin
      .from('blocks')
      .select('blocked_id')
      .eq('blocker_id', viewer.id);
    const blocked = new Set((blockedIds ?? []).map((b) => b.blocked_id));

    followers = followers.filter((f) => {
      const profile = Array.isArray(f.profile) ? f.profile[0] : f.profile;
      return profile && !blocked.has(profile.id);
    });
  }

  return NextResponse.json({ followers, total: count ?? 0 });
}
