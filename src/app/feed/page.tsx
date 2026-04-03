'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { FeedActivity } from '@/types/social';
import FeedItem from '@/components/social/FeedItem';
import BottomNav from '@/components/BottomNav';
import Link from 'next/link';
import { Loader2, RefreshCw, Users, LogIn } from 'lucide-react';

const PAGE_SIZE = 20;

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
      <div className="min-h-screen bg-harbor-950 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-kobe-gold animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-harbor-950 flex flex-col items-center justify-center gap-4 px-6 pb-24">
        <Users className="w-12 h-12 text-harbor-700" />
        <h2 className="text-harbor-200 font-bold text-lg text-center">
          フォローしたユーザーの<br />動向をチェックしよう
        </h2>
        <p className="text-harbor-500 text-sm text-center">
          ログインするとフォロー中のユーザーの<br />お気に入りや訪問情報が流れてきます
        </p>
        <Link
          href="/auth"
          className="mt-2 flex items-center gap-2 px-6 py-3 rounded-full bg-kobe-gold text-harbor-950 font-bold text-sm"
        >
          <LogIn className="w-4 h-4" />
          ログイン / 新規登録
        </Link>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-harbor-950 max-w-lg mx-auto pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-harbor-950/95 backdrop-blur-sm border-b border-harbor-800 px-4 py-3 flex items-center justify-between">
        <h1 className="text-harbor-100 font-bold text-base">フィード</h1>
        <button
          onClick={() => loadFeed(true)}
          disabled={refreshing}
          className="p-1.5 rounded-full text-harbor-500 hover:text-harbor-300 hover:bg-harbor-800 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Feed list */}
      {activities.length === 0 && !refreshing ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 px-6">
          <Users className="w-10 h-10 text-harbor-700" />
          <p className="text-harbor-400 text-sm text-center">
            まだフィードがありません。<br />
            気になるユーザーをフォローしてみましょう！
          </p>
        </div>
      ) : (
        <div className="divide-y divide-harbor-900">
          {refreshing ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-5 h-5 text-kobe-gold animate-spin" />
            </div>
          ) : (
            activities.map((a) => <FeedItem key={a.id} activity={a} />)
          )}
        </div>
      )}

      {/* Load more */}
      {hasMore && !refreshing && (
        <div className="flex justify-center py-4">
          <button
            onClick={() => loadFeed(false)}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2 rounded-full border border-harbor-700 text-harbor-400 text-sm hover:border-harbor-500 hover:text-harbor-200 transition-colors"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            もっと見る
          </button>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
