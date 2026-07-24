'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, BookmarkSimple, MapTrifold, SpinnerGap } from '@phosphor-icons/react';
import AppShell from '@/components/AppShell';
import StoreList from '@/components/StoreList';
import { useFavorites } from '@/hooks/useFavorites';
import { useCourse } from '@/hooks/useCourse';
import type { Restaurant } from '@/types/restaurant';

export default function SavedPage() {
  const { ids } = useFavorites();
  const { count } = useCourse();
  const [stores, setStores] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/restaurants?limit=200')
      .then(response => response.json())
      .then(data => setStores(data.restaurants ?? []))
      .finally(() => setLoading(false));
  }, []);

  const savedStores = useMemo(() => {
    const order = new Map(ids.map((id, index) => [id, index]));
    return stores.filter(store => order.has(store.id)).sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
  }, [ids, stores]);

  return (
    <AppShell title="保存した店" eyebrow="YOUR SHORTLIST">
      <div className="saved-page">
        {count > 0 ? (
          <section className="course-summary">
            <div><p className="ui-kicker">TONIGHT&apos;S COURSE</p><h2>コースに {count}店 入っています</h2><p>地図で順番を整えて、そのまま歩き始められます。</p></div>
            <Link className="primary-button" href="/map"><MapTrifold size={18} aria-hidden="true" />地図で確認</Link>
          </section>
        ) : null}

        <div className="saved-section-head"><div><p className="ui-kicker">BOOKMARKS</p><h2>気になる店</h2></div><span className="result-count"><strong>{savedStores.length}</strong> 店</span></div>

        {loading ? <div className="store-loading"><span className="loading-inline"><SpinnerGap size={21} className="spin" aria-hidden="true" />保存した店を読み込んでいます…</span></div> : savedStores.length ? <StoreList stores={savedStores} /> : (
          <div className="store-empty"><div><BookmarkSimple size={38} color="var(--muted)" aria-hidden="true" /><h2>保存した店はまだありません</h2><p>店舗カードの保存ボタンを押すと、ここでいつでも比較できます。</p><Link className="primary-button" style={{ marginTop: 16 }} href="/stores">お店を探す<ArrowRight size={17} aria-hidden="true" /></Link></div></div>
        )}
      </div>
    </AppShell>
  );
}
