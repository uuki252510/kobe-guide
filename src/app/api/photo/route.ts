import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { supabaseAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

const PLACES_BASE = 'https://places.googleapis.com/v1';

async function fetchPhoto(photoName: string, apiKey: string) {
  return fetch(`${PLACES_BASE}/${photoName}/media?maxWidthPx=960&maxHeightPx=720&key=${encodeURIComponent(apiKey)}`, {
    redirect: 'follow',
    next: { revalidate: 86_400 },
  });
}

async function refreshPhotoName(reference: string, apiKey: string) {
  const match = reference.match(/^places\/([^/]+)\/photos\//);
  if (!match) return null;

  const response = await fetch(`${PLACES_BASE}/places/${encodeURIComponent(match[1])}`, {
    headers: {
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': 'photos',
    },
    next: { revalidate: 604_800 },
  });

  if (!response.ok) return null;
  const data = await response.json() as { photos?: Array<{ name?: string }> };
  return data.photos?.find(photo => photo.name)?.name ?? null;
}

/** DBに登録済みの photo_reference だけを上流照会の対象にする */
async function isKnownReference(reference: string) {
  const { data } = await supabaseAdmin
    .from('restaurants')
    .select('id')
    .eq('photo_reference', reference)
    .limit(1);
  return (data?.length ?? 0) > 0;
}

/** Google Places写真をサーバー経由で配信。失効参照はPlace Detailsから自動更新する。 */
export async function GET(request: NextRequest) {
  const reference = request.nextUrl.searchParams.get('ref');
  if (!reference) return NextResponse.json({ error: 'ref is required' }, { status: 400 });
  if (!/^places\/[A-Za-z0-9_-]+\/photos\/[A-Za-z0-9_-]+$/.test(reference)) return NextResponse.json({ error: 'invalid ref' }, { status: 400 });

  // 一覧ページは1画面で数十枚読むため上限は緩め。ループ課金攻撃だけを止める。
  const ip = getClientIp(request);
  if (!checkRateLimit(`photo:${ip}`, 300, 60_000).allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'API key not configured' }, { status: 500 });

  try {
    let response = await fetchPhoto(reference, apiKey);

    if (!response.ok) {
      // Place Details は課金が重いので、DB登録済みの参照かつ別枠の制限内でのみ叩く
      if (!(await isKnownReference(reference))) return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
      if (!checkRateLimit(`photo-refresh:${ip}`, 10, 60_000).allowed) {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
      }
      const refreshedName = await refreshPhotoName(reference, apiKey);
      if (!refreshedName) return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
      response = await fetchPhoto(refreshedName, apiKey);
      if (response.ok) {
        await supabaseAdmin
          .from('restaurants')
          .update({ photo_reference: refreshedName })
          .eq('photo_reference', reference);
      }
    }

    if (!response.ok) return NextResponse.json({ error: 'Photo not found' }, { status: 404 });

    return new NextResponse(await response.arrayBuffer(), {
      headers: {
        'Content-Type': response.headers.get('content-type') ?? 'image/jpeg',
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch photo' }, { status: 500 });
  }
}
