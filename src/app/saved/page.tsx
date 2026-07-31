'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, BookmarkSimple, MapTrifold, SpinnerGap } from '@phosphor-icons/react';
import AppShell from '@/components/AppShell';
import StoreList from '@/components/StoreList';
import { useFavorites } from '@/hooks/useFavorites';
import { useVisited } from '@/hooks/useVisited';
import { useCourse } from '@/hooks/useCourse';
import type { Restaurant } from '@/types/restaurant';

export default function SavedPage() {
  const { ids } = useFavorites();
  const { count: visitedCount } = useVisited();
  const { count } = useCourse();
  const [stores, setStores] = useState<Restaurant[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    setLoading(true);
    setLoadError(false);
    fetch('/api/restaurants?limit=200')
      .then(response => {
        if (!response.ok) throw new Error('failed to load restaurants');
        return response.json();
      })
      .then(data => { setStores(data.restaurants ?? []); setTotal(data.pagination?.total ?? 0); })
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false));
  }, [attempt]);

  const savedStores = useMemo(() => {
    const order = new Map(ids.map((id, index) => [id, index]));
    return stores.filter(store => order.has(store.id)).sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
  }, [ids, stores]);

  return (
    <AppShell title="保存した店" eyebrow="YOUR SHORTLIST">
      <div className="saved-page">
        {total > 0 ? (
          <section className="conquest" aria-label="行った店の記録">
            <div>
              <p className="ui-kicker">YOUR PROGRESS</p>
              <p className="conquest__figure"><strong>{visitedCount}</strong><span>/ {total} 軒</span></p>
            </div>
            <div className="conquest__bar" role="img" aria-label={`${total}軒中${visitedCount}軒に行きました`}><span style={{ width: `${Math.min(100, (visitedCount / total) * 100)}%` }} /></div>
            <p className="conquest__note">{visitedCount === 0 ? '店舗カードのチェックで、行った店を記録できます。' : `三宮・元町の立ち飲みを ${Math.round((visitedCount / total) * 100)}% 制覇。`}</p>
          </section>
        ) : null}

        {count > 0 ? (
          <section className="course-summary">
            <div><p className="ui-kicker">TONIGHT&apos;S COURSE</p><h2>コースに {count}店 入っています</h2><p>地図で順番を整えて、そのまま歩き始められます。</p></div>
            <Link className="primary-button" href="/map"><MapTrifold size={18} aria-hidden="true" />地図で確認</Link>
          </section>
        ) : null}

        <div className="saved-section-head"><div><p className="ui-kicker">BOOKMARKS</p><h2>気になる店</h2></div><span className="result-count"><strong>{savedStores.length}</strong> 店</span></div>

        {loading ? <div className="store-loading"><span className="loading-inline"><SpinnerGap size={21} className="spin" aria-hidden="true" />保存した店を読み込んでいます…</span></div> : loadError ? (
          <div className="store-empty"><div><h2>読み込みに失敗しました</h2><p>通信状態を確認して、もう一度お試しください。</p><button className="primary-button" style={{ marginTop: 16 }} type="button" onClick={() => setAttempt(value => value + 1)}>再読み込み</button></div></div>
        ) : savedStores.length ? <StoreList stores={savedStores} /> : (
          <div className="store-empty"><div><BookmarkSimple size={38} color="var(--muted)" aria-hidden="true" /><h2>保存した店はまだありません</h2><p>店舗カードの保存ボタンを押すと、ここでいつでも比較できます。</p><Link className="primary-button" style={{ marginTop: 16 }} href="/stores">お店を探す<ArrowRight size={17} aria-hidden="true" /></Link></div></div>
        )}
      </div>
    </AppShell>
  );
}
