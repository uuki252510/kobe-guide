import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

/**
 * Admin API 認証チェック
 *
 * リクエストヘッダー: Authorization: Bearer <ADMIN_PASSWORD>
 *
 * @returns null なら認証OK、NextResponse なら 401/429 を返す
 */
export function requireAdminAuth(req: NextRequest): NextResponse | null {
  // ブルートフォース対策: 1IPあたり1分間に10回まで
  const ip = getClientIp(req);
  const { allowed } = checkRateLimit(`admin:${ip}`, 10, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const authHeader = req.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token || token !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return null;
}
