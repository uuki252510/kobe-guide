import type { Metadata } from 'next';
import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase-server';
import AppShell from '@/components/AppShell';
import SharedCourse from '@/components/SharedCourse';
import type { Restaurant } from '@/types/restaurant';

export const dynamic = 'force-dynamic';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_STORES = 8;

/** クエリは他人が作ったURLなので、UUIDの形をしたものだけを通す */
function parseIds(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return [];
  return raw.split(',').map(id => id.trim()).filter(id => UUID.test(id)).slice(0, MAX_STORES);
}

async function loadCourse(ids: string[]) {
  if (!ids.length) return [];
  const { data } = await supabaseAdmin
    .from('restaurants')
    .select('id, name, area, tachinomi_type, lat, lng, budget_min, budget_max, photo_reference, google_maps_url, must_try_menu, rating')
    .eq('is_published', true)
    .in('id', ids);
  // 共有された順番を保つ
  const byId = new Map((data ?? []).map(store => [store.id, store]));
  return ids.map(id => byId.get(id)).filter(Boolean) as Restaurant[];
}

type Props = { searchParams: Promise<{ s?: string | string[] }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const stores = await loadCourse(parseIds((await searchParams).s));
  if (!stores.length) return { title: '今夜のはしごコース' };
  const names = stores.map(store => store.name).join(' → ');
  return {
    title: `${stores.length}軒のはしごコース`,
    description: `${names}。神戸・三宮/元町の立ち飲みをめぐる今夜のコースです。`,
    openGraph: {
      title: `今夜のはしごコース｜${stores.length}軒`,
      description: names,
      images: [{ url: '/tachinomi-hero.png', width: 1536, height: 1024, alt: '神戸の立ち飲み風景' }],
    },
  };
}

export default async function CoursePage({ searchParams }: Props) {
  const stores = await loadCourse(parseIds((await searchParams).s));

  if (!stores.length) {
    return (
      <AppShell title="はしごコース" eyebrow="SHARED COURSE">
        <div className="store-empty">
          <div>
            <h2>コースが見つかりません</h2>
            <p>リンクが古いか、掲載を終了した店が含まれている可能性があります。</p>
            <Link className="primary-button" style={{ marginTop: 16 }} href="/">今夜の店を相談する</Link>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title={`${stores.length}軒のはしごコース`} eyebrow="SHARED COURSE">
      <SharedCourse stores={stores} />
    </AppShell>
  );
}
