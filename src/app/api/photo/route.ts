import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/photo?ref={photo_reference}
 * Google Places 写真をサーバー経由でプロキシ（APIキー非公開）
 */
export async function GET(req: NextRequest) {
  const ref = req.nextUrl.searchParams.get('ref');
  if (!ref) {
    return NextResponse.json({ error: 'ref is required' }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  try {
    const url = `https://places.googleapis.com/v1/${ref}/media?maxWidthPx=800&key=${apiKey}`;
    const res = await fetch(url, { redirect: 'follow' });

    if (!res.ok) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
    }

    const contentType = res.headers.get('content-type') ?? 'image/jpeg';
    const buffer = await res.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch photo' }, { status: 500 });
  }
}
