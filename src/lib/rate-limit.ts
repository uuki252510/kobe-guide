/**
 * シンプルなインメモリ IP ベースレート制限
 *
 * 注意: サーバーレス環境（Vercel）では各インスタンスがメモリを共有しないため、
 * 厳密な制限は保証されない。APIコスト爆発を防ぐ第一防衛ラインとして使用。
 * 本番で厳格な制限が必要な場合は Upstash Redis + @upstash/ratelimit の導入を検討。
 */

interface RateLimitEntry {
  count: number;
  reset: number; // UNIX ms
}

const store = new Map<string, RateLimitEntry>();

// 古いエントリを定期的に削除（メモリリーク防止）
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (now > entry.reset) store.delete(key);
  }
}, 60_000);

/**
 * @param key       識別キー（IP アドレスなど）
 * @param limit     ウィンドウあたりの最大リクエスト数
 * @param windowMs  ウィンドウ長（ミリ秒）
 * @returns allowed: true なら通過、false なら制限超過
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.reset) {
    store.set(key, { count: 1, reset: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: entry.reset };
  }

  entry.count++;
  return { allowed: true, remaining: limit - entry.count, resetAt: entry.reset };
}

/** リクエストの実 IP を取得（Vercel / Cloudflare 対応） */
export function getClientIp(req: Request): string {
  return (
    (req.headers as Headers).get('x-real-ip') ??
    (req.headers as Headers).get('cf-connecting-ip') ??
    (req.headers as Headers).get('x-forwarded-for')?.split(',')[0].trim() ??
    'unknown'
  );
}
