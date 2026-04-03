import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, supabaseAdmin } from '@/lib/supabase-server';

// POST /api/block  { blockedId }
export async function POST(req: NextRequest) {
  const { user, error } = await requireAuth(req);
  if (error) return error;

  const { blockedId } = await req.json();
  if (!blockedId) return NextResponse.json({ error: 'blockedId required' }, { status: 400 });
  if (blockedId === user.id) {
    return NextResponse.json({ error: '自分自身をブロックできません' }, { status: 400 });
  }

  const { error: insertErr } = await supabaseAdmin
    .from('blocks')
    .insert({ blocker_id: user.id, blocked_id: blockedId });

  if (insertErr) {
    if (insertErr.code === '23505') {
      return NextResponse.json({ message: 'already blocked' }, { status: 200 });
    }
    return NextResponse.json({ error: insertErr.message }, { status: 500 });
  }

  // DB trigger handle_block_cleanup removes mutual follows automatically
  return NextResponse.json({ success: true }, { status: 201 });
}

// DELETE /api/block  { blockedId }  — unblock
export async function DELETE(req: NextRequest) {
  const { user, error } = await requireAuth(req);
  if (error) return error;

  const { blockedId } = await req.json();
  if (!blockedId) return NextResponse.json({ error: 'blockedId required' }, { status: 400 });

  await supabaseAdmin
    .from('blocks')
    .delete()
    .eq('blocker_id', user.id)
    .eq('blocked_id', blockedId);

  return NextResponse.json({ success: true });
}

// GET /api/block — list of users I've blocked
export async function GET(req: NextRequest) {
  const { user, error } = await requireAuth(req);
  if (error) return error;

  const { data } = await supabaseAdmin
    .from('blocks')
    .select(
      `
      id, created_at,
      profile:user_profiles!blocks_blocked_id_fkey(
        id, username, display_name, avatar_url
      )
    `,
    )
    .eq('blocker_id', user.id)
    .order('created_at', { ascending: false });

  return NextResponse.json({ blocks: data ?? [] });
}
