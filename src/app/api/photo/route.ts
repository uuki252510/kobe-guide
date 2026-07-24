import { NextRequest, NextResponse } from 'next/server';

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

/** Google Places写真をサーバー経由で配信。失効参照はPlace Detailsから自動更新する。 */
export async function GET(request: NextRequest) {
  const reference = request.nextUrl.searchParams.get('ref');
  if (!reference) return NextResponse.json({ error: 'ref is required' }, { status: 400 });
  if (!/^places\/[^/]+\/photos\/[^/]+$/.test(reference)) return NextResponse.json({ error: 'invalid ref' }, { status: 400 });

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'API key not configured' }, { status: 500 });

  try {
    let response = await fetchPhoto(reference, apiKey);

    if (!response.ok) {
      const refreshedName = await refreshPhotoName(reference, apiKey);
      if (!refreshedName) return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
      response = await fetchPhoto(refreshedName, apiKey);
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
