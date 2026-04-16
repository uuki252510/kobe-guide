import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

// Track spot click events
export async function POST(req: NextRequest) {
  try {
    const { spotId, conversationId, clickType } = await req.json();
    if (!spotId || !clickType) {
      return NextResponse.json({ error: 'spotId and clickType required' }, { status: 400 });
    }

    await supabaseAdmin.from('clicks').insert({
      spot_id: spotId,
      conversation_id: conversationId || null,
      click_type: clickType,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Failed to track click' }, { status: 500 });
  }
}

// Get all published spots (for admin preview / external use)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const area = searchParams.get('area');
  const category = searchParams.get('category');

  let query = supabaseAdmin
    .from('spots')
    .select(`*, spot_translations(*)`)
    .eq('is_published', true)
    .order('priority_score', { ascending: false });

  if (area) query = query.eq('area', area);
  if (category) query = query.contains('category', [category]);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ spots: data });
}
