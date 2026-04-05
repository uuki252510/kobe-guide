'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import StoreList from '@/components/StoreList';
import BottomNav from '@/components/BottomNav';
import { useCourse } from '@/hooks/useCourse';
import type { Restaurant } from '@/types/restaurant';
import { Search, X, SlidersHorizontal, Map } from 'lucide-react';

// ── エリア ──────────────────────────────────────────────────
const AREAS = [
  { value: '',              label: 'すべて' },
  { value: 'sannomiya',    label: '三宮' },
  { value: 'motomachi',    label: '元町' },
  { value: 'surroundings', label: '周辺' },
];

// ── カテゴリ ─────────────────────────────────────────────────
type FilterId =
  | 'all' | 'kakuuchi' | 'wine' | 'seafood' | 'yakitori'
  | 'bar' | 'hormones' | 'italian' | 'tachinomi'
  | 'solo' | 'budget' | 'local' | 'new';

interface FilterDef {
  id: FilterId;
  label: string;
  emoji: string;
  params: Record<string, string>;
}

const FILTERS: FilterDef[] = [
  { id: 'all',      label: 'すべて',     emoji: '🏮', params: {} },
  { id: 'kakuuchi', label: '角打ち',     emoji: '🍶', params: { tachinomi_type: 'kakuuchi' } },
  { id: 'wine',     label: 'ワイン',     emoji: '🍷', params: { tachinomi_type: 'wine' } },
  { id: 'seafood',  label: '海鮮',       emoji: '🐟', params: { tachinomi_type: 'seafood' } },
  { id: 'yakitori', label: '焼鳥',       emoji: '🍢', params: { tachinomi_type: 'yakitori' } },
  { id: 'bar',      label: 'バー',       emoji: '🥂', params: { tachinomi_type: 'bar' } },
  { id: 'hormones', label: 'ホルモン',   emoji: '🥩', params: { tachinomi_type: 'hormones' } },
  { id: 'italian',  label: 'イタリアン', emoji: '🍕', params: { tachinomi_type: 'italian' } },
  { id: 'solo',     label: '一人OK',     emoji: '🧍', params: { vibe_tags: 'solo-friendly' } },
  { id: 'budget',   label: '1000円以内', emoji: '💴', params: { budget_max: '1000' } },
  { id: 'local',    label: '地元の名店', emoji: '🏅', params: { vibe_tags: 'local' } },
  { id: 'new',      label: '新規',       emoji: '✨', params: { is_new_open: 'true' } },
];

const BUDGET_OPTIONS = [
  { label: 'すべて',    max: '' },
  { label: '〜¥1,000', max: '1000' },
  { label: '〜¥1,500', max: '1500' },
  { label: '〜¥2,000', max: '2000' },
];

// ── ページコンポーネント ─────────────────────────────────────
export default function StoresPage() {
  const [area,          setArea]          = useState('');
  const [activeFilter,  setActiveFilter]  = useState<FilterId>('all');
  const [budgetMax,     setBudgetMax]     = useState('');
  const [showBudget,    setShowBudget]    = useState(false);
  const [keyword,       setKeyword]       = useState('');
  const [debKeyword,    setDebKeyword]    = useState('');
  const [stores,        setStores]        = useState<Restaurant[]>([]);
  const [total,         setTotal]         = useState(0);
  const [isLoading,     setIsLoading]     = useState(true);
  const { count: courseCount } = useCourse();
  const searchRef = useRef<HTMLInputElement>(null);

  // キーワード debounce
  useEffect(() => {
    const t = setTimeout(() => setDebKeyword(keyword), 380);
    return () => clearTimeout(t);
  }, [keyword]);

  const fetchStores = useCallback(async () => {
    setIsLoading(true);
    const params = new URLSearchParams({ limit: '90' });
    if (area)       params.set('area',       area);
    if (budgetMax)  params.set('budget_max', budgetMax);
    if (debKeyword) params.set('keyword',    debKeyword);
    const f = FILTERS.find(f => f.id === activeFilter);
    if (f) Object.entries(f.params).forEach(([k, v]) => params.set(k, v));

    try {
      const res  = await fetch(`/api/restaurants?${params}`);
      const data = await res.json();
      setStores(data.restaurants ?? []);
      setTotal(data.pagination?.total ?? 0);
    } catch {
      setStores([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [area, activeFilter, budgetMax, debKeyword]);

  useEffect(() => { fetchStores(); }, [fetchStores]);

  const hasFilters = area !== '' || activeFilter !== 'all' || budgetMax !== '' || debKeyword !== '';

  const resetAll = () => {
    setArea(''); setActiveFilter('all');
    setBudgetMax(''); setKeyword(''); setDebKeyword('');
    setShowBudget(false);
  };

  return (
    <main
      className="ln-page flex flex-col overflow-hidden"
      style={{ height: '100dvh', paddingBottom: 56 }}
    >

      {/* ── ヘッダー ─────────────────────────────────────────── */}
      <header
        className="flex-shrink-0 flex items-center justify-between px-4"
        style={{
          height: 52, flexShrink: 0,
          background: '#0f1011',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <span
          style={{
            fontSize: 15, fontWeight: 590, color: '#f7f8f8',
            letterSpacing: '-0.165px',
          }}
        >
          神戸立ち飲みマップ
        </span>
        <div className="flex items-center gap-2">
          {courseCount > 0 && (
            <Link
              href="/map"
              style={{
                fontSize: 12, fontWeight: 510, color: '#7170ff',
                background: 'rgba(94,106,210,0.12)',
                border: '1px solid rgba(113,112,255,0.25)',
                borderRadius: 6, padding: '4px 10px',
              }}
            >
              🍺 {courseCount}店
            </Link>
          )}
          <Link
            href="/map"
            className="flex items-center gap-1 ln-btn-ghost"
            style={{ padding: '5px 11px', fontSize: 12 }}
          >
            <Map style={{ width: 13, height: 13 }} />
            地図
          </Link>
        </div>
      </header>

      {/* ── 検索バー ─────────────────────────────────────────── */}
      <div
        className="flex-shrink-0 px-3 py-2.5"
        style={{ background: '#0f1011', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      >
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ width: 14, height: 14, color: '#62666d' }}
          />
          <input
            ref={searchRef}
            type="text"
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            placeholder="店名・エリア・ジャンルで検索..."
            style={{
              width: '100%',
              paddingLeft: 36, paddingRight: keyword ? 32 : 12,
              paddingTop: 8, paddingBottom: 8,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 8,
              color: '#f7f8f8',
              fontSize: 14,
              fontWeight: 400,
              outline: 'none',
            }}
          />
          {keyword && (
            <button
              onClick={() => { setKeyword(''); setDebKeyword(''); searchRef.current?.focus(); }}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: '#62666d' }}
            >
              <X style={{ width: 14, height: 14 }} />
            </button>
          )}
        </div>
      </div>

      {/* ── フィルターバー ──────────────────────────────────── */}
      <div
        className="flex-shrink-0"
        style={{ background: '#0f1011', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      >
        {/* エリア + 予算 */}
        <div className="flex items-center gap-2 px-3 pt-2.5 pb-2">
          {AREAS.map(a => (
            <button
              key={a.value}
              onClick={() => setArea(a.value)}
              className="ln-pill"
              style={area === a.value ? {
                background: 'rgba(94,106,210,0.15)',
                borderColor: '#5e6ad2',
                color: '#828fff',
              } : undefined}
            >
              {a.label}
            </button>
          ))}
          <div style={{ flex: 1 }} />
          <button
            onClick={() => setShowBudget(v => !v)}
            className="flex items-center gap-1 ln-pill"
            style={showBudget || budgetMax ? {
              background: 'rgba(94,106,210,0.15)',
              borderColor: '#5e6ad2',
              color: '#828fff',
            } : undefined}
          >
            <SlidersHorizontal style={{ width: 11, height: 11 }} />
            予算
          </button>
        </div>

        {/* 予算展開パネル */}
        {showBudget && (
          <div
            className="flex items-center gap-2 px-3 pb-2.5"
            style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 10 }}
          >
            <span style={{ fontSize: 11, color: '#62666d', fontWeight: 510, flexShrink: 0 }}>
              上限
            </span>
            {BUDGET_OPTIONS.map(b => (
              <button
                key={b.max}
                onClick={() => setBudgetMax(b.max)}
                className="ln-pill"
                style={budgetMax === b.max ? {
                  background: 'rgba(94,106,210,0.15)',
                  borderColor: '#5e6ad2',
                  color: '#828fff',
                } : undefined}
              >
                {b.label}
              </button>
            ))}
          </div>
        )}

        {/* カテゴリチップ */}
        <div
          className="flex gap-1.5 overflow-x-auto scrollbar-hide px-3 pb-2.5"
          style={showBudget ? undefined : { paddingTop: 0 }}
        >
          {FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id === activeFilter ? 'all' : f.id)}
              className="ln-pill flex items-center gap-1.5 flex-shrink-0"
              style={activeFilter === f.id ? {
                background: 'rgba(94,106,210,0.15)',
                borderColor: '#5e6ad2',
                color: '#828fff',
              } : undefined}
            >
              <span style={{ fontSize: 13, lineHeight: 1 }}>{f.emoji}</span>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── 件数 + リセット ─────────────────────────────────── */}
      <div
        className="flex-shrink-0 flex items-center justify-between px-4 py-2"
        style={{ background: '#0f1011', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      >
        <span style={{ fontSize: 12, color: '#62666d', fontWeight: 400 }}>
          {isLoading ? '...' : (
            <>
              <span style={{ color: '#d0d6e0', fontWeight: 510 }}>{total}</span>
              {' 店舗'}
            </>
          )}
        </span>
        {hasFilters && (
          <button
            onClick={resetAll}
            className="flex items-center gap-1"
            style={{ fontSize: 12, color: '#62666d', fontWeight: 510 }}
          >
            <X style={{ width: 11, height: 11 }} />
            リセット
          </button>
        )}
      </div>

      {/* ── 店舗リスト ───────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto" style={{ background: '#0f1011' }}>
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <div
              className="w-6 h-6 rounded-full animate-spin"
              style={{
                border: '2px solid rgba(255,255,255,0.08)',
                borderTopColor: '#7170ff',
              }}
            />
          </div>
        ) : (
          <StoreList stores={stores} />
        )}
      </div>

      <BottomNav courseCount={courseCount} />
    </main>
  );
}
