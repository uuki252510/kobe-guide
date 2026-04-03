import { createClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Admin client — bypasses RLS. Use only for trusted server logic.
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey);

/**
 * Extract authenticated user from request.
 * Expects: Authorization: Bearer <access_token>
 * Returns null if unauthenticated or invalid token.
 */
export async function getAuthUser(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;

  const token = authHeader.slice(7);
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user;
}

/**
 * Require auth — returns 401 response if not authenticated.
 * Usage: const { user, error } = await requireAuth(req)
 */
export async function requireAuth(req: NextRequest): Promise<
  | { user: Awaited<ReturnType<typeof getAuthUser>> & object; error: null }
  | { user: null; error: Response }
> {
  const user = await getAuthUser(req);
  if (!user) {
    return {
      user: null,
      error: new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }),
    };
  }
  return { user, error: null };
}

/**
 * Check if viewerUserId is blocked by targetUserId (or vice versa).
 */
export async function isBlockedBetween(
  userA: string,
  userB: string,
): Promise<boolean> {
  const { data } = await supabaseAdmin
    .from('blocks')
    .select('id')
    .or(
      `and(blocker_id.eq.${userA},blocked_id.eq.${userB}),and(blocker_id.eq.${userB},blocked_id.eq.${userA})`,
    )
    .limit(1);
  return (data?.length ?? 0) > 0;
}
