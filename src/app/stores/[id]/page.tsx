import type { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';
import StoreDetail from './StoreDetail';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

const TYPE_LABEL: Record<string, string> = {
  tachinomi: '立ち飲み',
  kakuuchi:  '角打ち',
  yakitori:  '焼鳥',
  seafood:   '海鮮',
  wine:      'ワイン/酒場',
  italian:   'イタリアン',
  hormones:  'ホルモン',
  bar:       'バー',
};

const AREA_LABEL: Record<string, string> = {
  sannomiya:    '三宮',
  motomachi:    '元町',
  surroundings: '周辺',
};

export async function generateStaticParams() {
  const { data } = await supabase
    .from('restaurants')
    .select('id');
  return (data ?? []).map(r => ({ id: String(r.id) }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params;
  const { data } = await supabase
    .from('restaurants')
    .select('name, area, tachinomi_type, must_try_menu, photo_reference')
    .eq('id', id)
    .single();

  if (!data) return { title: '店舗詳細' };

  const area = AREA_LABEL[data.area] ?? data.area ?? '神戸';
  const type = TYPE_LABEL[data.tachinomi_type] ?? '立ち飲み';
  const description = data.must_try_menu
    ? `${data.name}は${area}の${type}。${data.must_try_menu}`
    : `${data.name}は${area}エリアの${type}。神戸立ち飲みマップで詳細を確認。`;

  const ogImage = data.photo_reference
    ? `/api/photo?ref=${encodeURIComponent(data.photo_reference)}`
    : '/logo.jpg';

  return {
    title: data.name,
    description,
    openGraph: {
      title: `${data.name}｜神戸立ち飲みマップ`,
      description,
      images: [{ url: ogImage }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${data.name}｜神戸立ち飲みマップ`,
      description,
      images: [ogImage],
    },
  };
}

export default function StoreDetailPage() {
  return <StoreDetail />;
}
