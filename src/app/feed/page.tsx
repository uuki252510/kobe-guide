'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { FeedActivity } from '@/types/social';
import FeedItem from '@/components/social/FeedItem';
import BottomNav from '@/components/BottomNav';
import Link from 'next/link';
import { RefreshCw, Users, LogIn } from 'lucide-react';

const PAGE_SIZE = 20;

const C = {
  paper:      '#F3ECDD',
  surface:    '#FAF4E6',
  ink:        '#262220',
  inkSoft:    '#3D3832',
  mute:       '#857E78',
  rule:       '#D5CBBE',
  inkOnPaper: '#FAF4E6',
};

function LinePulse({ label = '読み込み中' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span
        className="inline-block animate-pulse"
        style={{ width: 40, height: 1, background: C.ink }}
      />
      <span style={{ fontSize: 10, color: C.mute, letterSpacing: '0.2em' }}>
        {label}
      </span>
    </div>
  );
}

export default function FeedPage() {
  const { user, accessToken, loading: authLoading } = useAuth();
  const [activities, setActivities] = useState<FeedActivity[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadFeed = useCallback(
    async (reset = false) => {
      if (!accessToken) return;
      const currentOffset = reset ? 0 : offset;
      if (reset) setRefreshing(true);
      else setLoading(true);

      const res = await fetch(`/api/feed?limit=${PAGE_SIZE}&offset=${currentOffset}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const json = await res.json();

      if (reset) {
        setActivities(json.activities ?? []);
        setOffset(PAGE_SIZE);
      } else {
        setActivities((prev) => [...prev, ...(json.activities ?? [])]);
        setOffset((prev) => prev + PAGE_SIZE);
      }
      setTotal(json.total ?? 0);
      setLoading(false);
      setRefreshing(false);
    },
    [accessToken, offset],
  );

  useEffect(() => {
    if (accessToken) loadFeed(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  const hasMore = activities.length < total;

  if (authLoading) {
    return (
      <div
        className="min-h-dvh flex items-center justify-center"
        style={{ background: C.paper }}
      >
        <LinePulse />
      </div>
    );
  }

  if (!user) {
    return (
      <main
        className="min-h-dvh flex flex-col items-center justify-center gap-4 px-6 pb-24"
        style={{ background: C.paper }}
      >
        <Users style={{ width: 40, height: 40, color: C.mute, opacity: 0.5 }} />
        <h2
          className="text-center"
          style={{ fontSize: 16, fontWeight: 700, color: C.ink, lineHeight: 1.6, letterSpacing: '-0.01em' }}
        >
          フォローした人の<br />動向を追う
        </h2>
        <p
          className="text-center"
          style={{ fontSize: 12, color: C.mute, lineHeight: 1.8 }}
        >
          お気に入りと訪問記録が流れる
        </p>
        <Link
          href="/auth"
          className="mt-2 flex items-center gap-2"
          style={{
            padding: '11px 22px',
            background: C.ink,
            color: C.inkOnPaper,
            fontWeight: 700,
            fontSize: 13,
            borderRadius: 0,
            letterSpacing: '0.08em',
            lineHeight: 1,
          }}
        >
          <LogIn className="w-4 h-4" />
          ログイン
        </Link>
        <BottomNav />
      </main>
    );
  }

  return (
    <main
      className="min-h-dvh max-w-lg mx-auto pb-24"
      style={{ background: C.paper }}
    >
      <header
        className="sticky top-0 z-10 px-4 py-3 flex items-center justify-between"
        style={{
          background: C.paper,
          borderBottom: `1px solid ${C.ink}`,
        }}
      >
        <h1 style={{ fontSize: 15, fontWeight: 700, color: C.ink, letterSpacing: '-0.01em' }}>
          フィード
        </h1>
        <button
          onClick={() => loadFeed(true)}
          disabled={refreshing}
          className="flex items-center justify-center"
          style={{
            width: 32, height: 32,
            border: `1px solid ${C.ink}`,
            background: 'transparent',
            color: C.ink,
            borderRadius: 0,
          }}
          aria-label="更新"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </header>

      {activities.length === 0 && !refreshing ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 px-6">
          <Users style={{ width: 36, height: 36, color: C.mute, opacity: 0.5 }} />
          <p className="text-center" style={{ fontSize: 12, color: C.mute, lineHeight: 1.8 }}>
            まだフィードはない。<br />
            誰かをフォローしてみる。
          </p>
        </div>
      ) : (
        <div style={{ background: C.surface, borderBottom: `1px solid ${C.rule}` }}>
          {refreshing ? (
            <div className="flex justify-center py-10">
              <LinePulse />
            </div>
          ) : (
            activities.map((a) => <FeedItem key={a.id} activity={a} />)
          )}
        </div>
      )}

      {hasMore && !refreshing && (
        <div className="flex justify-center py-5">
          <button
            onClick={() => loadFeed(false)}
            disabled={loading}
            className="flex items-center gap-2"
            style={{
              padding: '9px 20px',
              background: 'transparent',
              border: `1px solid ${C.ink}`,
              color: C.ink,
              fontSize: 12,
              fontWeight: 700,
              borderRadius: 0,
              letterSpacing: '0.08em',
              lineHeight: 1,
            }}
          >
            {loading ? (
              <span className="inline-block animate-pulse" style={{ width: 20, height: 1, background: C.ink }} />
            ) : null}
            もっと見る
          </button>
        </div>
      )}

      <BottomNav />
    </main>
  );
}
