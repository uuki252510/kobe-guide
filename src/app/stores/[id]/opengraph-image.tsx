import { ImageResponse } from 'next/og';
import { createClient } from '@supabase/supabase-js';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const TYPE_LABEL: Record<string, string> = {
  tachinomi: '立ち飲み',
  kakuuchi:  '角打ち',
  yakitori:  '焼鳥',
  seafood:   '海鮮',
  wine:      'ワイン',
  italian:   'イタリアン',
  hormones:  'ホルモン',
  bar:       'バー',
};

const AREA_LABEL: Record<string, string> = {
  sannomiya:    '三宮',
  motomachi:    '元町',
  surroundings: '周辺',
};

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

  // Noto Sans JP フォント取得
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
  } catch { /* フォント取得失敗時はデフォルトフォントで続行 */ }

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(145deg, #0a0a0f 0%, #12121e 60%, #060608 100%)',
          padding: '60px',
          position: 'relative',
        }}
      >
        {/* 背景装飾 */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'radial-gradient(ellipse at 20% 50%, rgba(201,164,76,0.08) 0%, transparent 60%)',
        }} />

        {/* 上部：エリア・カテゴリバッジ */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(201,164,76,0.15)',
            border: '1px solid rgba(201,164,76,0.4)',
            borderRadius: '100px',
            padding: '8px 20px',
          }}>
            <span style={{ color: '#C9A44C', fontSize: '18px', fontWeight: 700 }}>{area}</span>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '100px',
            padding: '8px 20px',
          }}>
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '18px' }}>{type}</span>
          </div>
        </div>

        {/* 店名 */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
          <div style={{
            color: 'white',
            fontSize: name.length > 10 ? '64px' : '80px',
            fontWeight: 700,
            lineHeight: 1.15,
            marginBottom: memo ? '24px' : '0',
          }}>
            {name}
          </div>
          {memo && (
            <div style={{
              color: 'rgba(255,255,255,0.5)',
              fontSize: '24px',
              fontStyle: 'italic',
              marginTop: '8px',
            }}>
              &ldquo;{memo.slice(0, 40)}{memo.length > 40 ? '...' : ''}&rdquo;
            </div>
          )}
        </div>

        {/* 下部：サイト名 + 仕切り線 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          paddingTop: '28px',
          marginTop: '40px',
        }}>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '20px' }}>
            kobe-tachinomi.taip-ai.com
          </span>
          <span style={{ color: '#C9A44C', fontSize: '22px', fontWeight: 700 }}>
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
