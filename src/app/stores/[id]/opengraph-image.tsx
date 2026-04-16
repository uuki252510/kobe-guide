import { ImageResponse } from 'next/og';
import { createClient } from '@supabase/supabase-js';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const TYPE_LABEL: Record<string, string> = {
  tachinomi: '立ち飲み', kakuuchi: '角打ち', yakitori: '焼鳥',
  seafood: '海鮮', wine: 'ワイン', italian: 'イタリアン',
  hormones: 'ホルモン', bar: 'バー',
};

const AREA_LABEL: Record<string, string> = {
  sannomiya: '三宮', motomachi: '元町', surroundings: '周辺',
};

const PAPER      = '#F3ECDD';
const INK        = '#262220';
const INK_ON_P   = '#FAF4E6';
const MUTE       = '#857E78';
const RULE       = '#D5CBBE';

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const { data } = await supabase
    .from('restaurants')
    .select('name, tachinomi_type, area, must_try_menu')
    .eq('id', id)
    .single();

  const name = data?.name ?? '神戸の立ち飲み';
  const type = data?.tachinomi_type ? (TYPE_LABEL[data.tachinomi_type] ?? '立ち飲み') : '立ち飲み';
  const area = data?.area ? (AREA_LABEL[data.area] ?? data.area) : '三宮・元町';
  const memo = data?.must_try_menu ?? '';

  let fontData: ArrayBuffer | null = null;
  try {
    const css = await fetch(
      'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@700&display=swap',
      { headers: { 'User-Agent': 'Mozilla/5.0 (compatible)' } }
    ).then(r => r.text());
    const fontUrl = css.match(/src: url\((.+?)\)/)?.[1];
    if (fontUrl) {
      fontData = await fetch(fontUrl).then(r => r.arrayBuffer());
    }
  } catch { /* fallback */ }

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: PAPER,
          padding: '60px',
          position: 'relative',
          border: `2px solid ${INK}`,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            marginBottom: '40px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: INK,
              padding: '8px 20px',
            }}
          >
            <span style={{ color: INK_ON_P, fontSize: '18px', fontWeight: 700, letterSpacing: '0.1em' }}>
              {area}
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: 'transparent',
              border: `1px solid ${INK}`,
              padding: '8px 20px',
            }}
          >
            <span style={{ color: INK, fontSize: '18px', fontWeight: 700, letterSpacing: '0.08em' }}>
              {type}
            </span>
          </div>
        </div>

        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              color: INK,
              fontSize: name.length > 10 ? '68px' : '84px',
              fontWeight: 700,
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
              marginBottom: memo ? '24px' : '0',
            }}
          >
            {name}
          </div>
          {memo && (
            <div
              style={{
                color: MUTE,
                fontSize: '24px',
                marginTop: '8px',
                borderLeft: `3px solid ${INK}`,
                paddingLeft: '18px',
              }}
            >
              {memo.slice(0, 40)}{memo.length > 40 ? '…' : ''}
            </div>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: `1px solid ${RULE}`,
            paddingTop: '28px',
            marginTop: '40px',
          }}
        >
          <span style={{ color: MUTE, fontSize: '20px', letterSpacing: '0.04em' }}>
            kobe-tachinomi.taip-ai.com
          </span>
          <span
            style={{
              color: INK,
              fontSize: '22px',
              fontWeight: 700,
              letterSpacing: '0.08em',
            }}
          >
            神戸立ち飲みマップ
          </span>
        </div>
      </div>
    ),
    {
      ...size,
      ...(fontData ? {
        fonts: [{ name: 'Noto Sans JP', data: fontData, style: 'normal', weight: 700 }]
      } : {}),
    }
  );
}
