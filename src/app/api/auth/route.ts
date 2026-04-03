import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

// POST /api/auth  { action: 'signup'|'login'|'logout', email, password, username? }
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action, email, password, username } = body;

  if (action === 'signup') {
    if (!email || !password || !username) {
      return NextResponse.json({ error: 'email, password, username required' }, { status: 400 });
    }

    // Validate username format
    if (!/^[a-z0-9_]{3,30}$/.test(username)) {
      return NextResponse.json(
        { error: 'ユーザー名は3〜30文字の英小文字・数字・アンダースコアのみ使用可能です' },
        { status: 400 },
      );
    }

    // Check username uniqueness
    const { data: existing } = await supabaseAdmin
      .from('user_profiles')
      .select('id')
      .eq('username', username)
      .single();
    if (existing) {
      return NextResponse.json({ error: 'このユーザー名は既に使われています' }, { status: 409 });
    }

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    // Create profile row
    await supabaseAdmin.from('user_profiles').insert({
      id: data.user.id,
      username,
      display_name: username,
    });

    // Sign in immediately to get tokens
    const { data: session, error: signInErr } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });
    if (signInErr) return NextResponse.json({ error: signInErr.message }, { status: 400 });

    return NextResponse.json({
      user: { id: data.user.id, email: data.user.email },
      session: session.session,
    });
  }

  if (action === 'login') {
    if (!email || !password) {
      return NextResponse.json({ error: 'email, password required' }, { status: 400 });
    }
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({ email, password });
    if (error) return NextResponse.json({ error: error.message }, { status: 401 });

    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    return NextResponse.json({ user: data.user, session: data.session, profile });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
