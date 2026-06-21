'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import StoreList from '@/components/StoreList';
import BottomNav from '@/components/BottomNav';
import { useCourse } from '@/hooks/useCourse';
import { useLocation, haversineKm } from '@/hooks/useLocation';
import type { Restaurant } from '@/types/restaurant';
import { Search, X, SlidersHorizontal, Map, List, LocateFixed, Loader2 } from 'lucide-react';

// SSR無効でStoreMapPanelをロード
const StoreMapPanel = dynamic(() => import('@/components/StoreMapPanel'), { ssr: false });

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

type ViewMode = 'list' | 'split';

// ── 生成り×墨パレット（トップと統一）──────────────────────
const C = {
  bg:        '#F3ECDD',  // 生成り（paper）
  surface:   '#FAF4E6',  // 薄生成り（paper-light）
  border:    '#262220',  // 墨（ink）
  borderSub: '#D5CBBE',  // 内部の細罫
  textMain:  '#262220',
  textBody:  '#3D3832',
  textSub:   '#5C5752',
  textMute:  '#857E78',
  inkFill:   '#262220',
  inkOnPaper:'#FAF4E6',
  green:     '#2E7D5B',
};

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
  const [viewMode,      setViewMode]      = useState<ViewMode>('list');
  const [selectedId,    setSelectedId]    = useState<string | null>(null);
  const { count: courseCount } = useCourse();
  const { location, loading: locLoading, request: requestLocation } = useLocation();
  const searchRef   = useRef<HTMLInputElement>(null);
  const listRef     = useRef<HTMLDivElement>(null);
  const cardRefs    = useRef<Record<string, HTMLDivElement>>({});

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

  const distances = useMemo<Record<string, number>>(() => {
    if (!location) return {};
    return Object.fromEntries(
      stores
        .filter(s => s.lat && s.lng)
        .map(s => [s.id, haversineKm(location.lat, location.lng, s.lat!, s.lng!)])
    );
  }, [location, stores]);

  const sortedStores = useMemo(() => {
    if (!location || Object.keys(distances).length === 0) return stores;
    return [...stores].sort((a, b) => {
      const da = distances[a.id] ?? Infinity;
      const db = distances[b.id] ?? Infinity;
      return da - db;
    });
  }, [stores, distances, location]);

  const handleSelect = useCallback((id: string) => {
    setSelectedId(id);
    const el = cardRefs.current[id];
    if (el && listRef.current) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, []);

  const hasFilters = area !== '' || activeFilter !== 'all' || budgetMax !== '' || debKeyword !== '';

  const resetAll = () => {
    setArea(''); setActiveFilter('all');
    setBudgetMax(''); setKeyword(''); setDebKeyword('');
    setShowBudget(false);
  };

  // ── スタイル helpers ────────────────────────────────────────
  const pillBase: React.CSSProperties = {
    background: 'transparent',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: C.border,
    color: C.textBody,
    fontSize: 12, fontWeight: 600,
    padding: '5px 12px',
    borderRadius: 0,
    whiteSpace: 'nowrap',
    transition: 'background 0.15s, color 0.15s',
    letterSpacing: '0.02em',
  };
  const pillActive: React.CSSProperties = {
    background: C.inkFill,
    borderColor: C.inkFill,
    color: C.inkOnPaper,
  };

  return (
    <main
      className="flex flex-col overflow-hidden"
      style={{ height: '100dvh', paddingBottom: 56, background: C.bg, color: C.textMain }}
    >

      {/* ── ヘッダー ─────────────────────────────────────────── */}
      <header
        className="flex-shrink-0 flex items-center justify-between px-4"
        style={{
          height: 52,
          background: C.surface,
          borderBottom: `1px solid ${C.border}`,
        }}
      >
        <span style={{ fontSize: 15, fontWeight: 700, color: C.textMain, letterSpacing: '-0.165px' }}>
          神戸立ち飲みマップ
        </span>
        <div className="flex items-center gap-2">
          {/* 現在地ボタン */}
          <button
            onClick={requestLocation}
            className="flex items-center justify-center"
            aria-label={location ? '現在地を再取得' : '現在地を取得'}
            aria-pressed={!!location}
            style={{
              width: 32, height: 32, padding: 0,
              borderRadius: 0,
              background: location ? C.inkFill : 'transparent',
              border: `1px solid ${C.border}`,
              color: location ? C.inkOnPaper : C.textSub,
            }}
            title="現在地を取得"
          >
            {locLoading
              ? <Loader2 style={{ width: 15, height: 15 }} className="animate-spin" aria-hidden="true" />
              : <LocateFixed style={{ width: 15, height: 15 }} aria-hidden="true" />
            }
          </button>

          {/* ビュー切替 */}
          <div
            className="flex items-center"
            style={{
              background: 'transparent',
              border: `1px solid ${C.border}`,
              borderRadius: 0,
              overflow: 'hidden',
            }}
          >
            <button
              onClick={() => setViewMode('list')}
              className="flex items-center justify-center"
              aria-label="リスト表示"
              aria-pressed={viewMode === 'list'}
              style={{
                width: 30, height: 26, fontSize: 12,
                color: viewMode === 'list' ? C.inkOnPaper : C.textMute,
                background: viewMode === 'list' ? C.inkFill : 'transparent',
              }}
            >
              <List style={{ width: 13, height: 13 }} aria-hidden="true" />
            </button>
            <button
              onClick={() => setViewMode('split')}
              className="flex items-center justify-center"
              aria-label="地図とリストを表示"
              aria-pressed={viewMode === 'split'}
              style={{
                width: 30, height: 26, fontSize: 12,
                color: viewMode === 'split' ? C.inkOnPaper : C.textMute,
                background: viewMode === 'split' ? C.inkFill : 'transparent',
              }}
            >
              <Map style={{ width: 13, height: 13 }} aria-hidden="true" />
            </button>
          </div>

          {courseCount > 0 && (
            <Link
              href="/map"
              style={{
                fontSize: 12, fontWeight: 700, color: C.textMain,
                background: 'transparent',
                border: `1px solid ${C.border}`,
                borderRadius: 0, padding: '4px 10px',
                letterSpacing: '0.02em',
              }}
            >
              🍺 {courseCount}店
            </Link>
          )}
        </div>
      </header>

      {/* ── 検索バー ─────────────────────────────────────────── */}
      <div
        className="flex-shrink-0 px-3 py-2.5"
        style={{ background: C.surface, borderBottom: `1px solid ${C.border}` }}
      >
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ width: 14, height: 14, color: C.textMute }}
            aria-hidden="true"
          />
          <label htmlFor="store-search" className="sr-only">
            店名で検索
          </label>
          <input
            id="store-search"
            name="store-search"
            ref={searchRef}
            type="text"
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            placeholder="店名で検索..."
            autoComplete="off"
            className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#262220]"
            style={{
              width: '100%',
              paddingLeft: 36, paddingRight: keyword ? 32 : 12,
              paddingTop: 8, paddingBottom: 8,
              background: C.bg,
              border: `1px solid ${C.border}`,
              borderRadius: 0,
              color: C.textMain,
              fontSize: 14,
              fontWeight: 400,
            }}
          />
          {keyword && (
            <button
              onClick={() => { setKeyword(''); setDebKeyword(''); searchRef.current?.focus(); }}
              aria-label="検索語をクリア"
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: C.textMute }}
            >
              <X style={{ width: 14, height: 14 }} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {/* ── フィルターバー ──────────────────────────────────── */}
      <div
        className="flex-shrink-0"
        style={{ background: C.surface, borderBottom: `1px solid ${C.border}` }}
      >
        {/* エリア + 予算 */}
        <div className="flex items-center gap-2 px-3 pt-2.5 pb-2">
          {AREAS.map(a => (
            <button
              key={a.value}
              onClick={() => setArea(a.value)}
              style={area === a.value ? { ...pillBase, ...pillActive } : pillBase}
            >
              {a.label}
            </button>
          ))}
          <div style={{ flex: 1 }} />
          <button
            onClick={() => setShowBudget(v => !v)}
            className="flex items-center gap-1"
            style={showBudget || budgetMax ? { ...pillBase, ...pillActive } : pillBase}
          >
            <SlidersHorizontal style={{ width: 11, height: 11 }} />
            予算
          </button>
        </div>

        {/* 予算展開パネル */}
        {showBudget && (
          <div
            className="flex items-center gap-2 px-3 pb-2.5"
            style={{ borderTop: `1px solid ${C.borderSub}`, paddingTop: 10 }}
          >
            <span style={{ fontSize: 11, color: C.textMute, fontWeight: 510, flexShrink: 0 }}>
              上限
            </span>
            {BUDGET_OPTIONS.map(b => (
              <button
                key={b.max}
                onClick={() => setBudgetMax(b.max)}
                style={budgetMax === b.max ? { ...pillBase, ...pillActive } : pillBase}
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
              className="flex items-center gap-1.5 flex-shrink-0"
              style={activeFilter === f.id ? { ...pillBase, ...pillActive } : pillBase}
            >
              <span style={{ fontSize: 13, lineHeight: 1 }}>{f.emoji}</span>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── 件数 + リセット + ソート表示 ──────────────────────── */}
      <div
        className="flex-shrink-0 flex items-center justify-between px-4 py-2"
        style={{ background: C.bg, borderBottom: `1px solid ${C.borderSub}` }}
      >
        <span style={{ fontSize: 12, color: C.textMute, fontWeight: 400 }}>
          {isLoading ? '...' : (
            <>
              <span style={{ color: C.textMain, fontWeight: 600 }}>{total}</span>
              {' 店舗'}
              {location && (
                <span style={{ color: C.green, marginLeft: 6 }}>· 近い順</span>
              )}
            </>
          )}
        </span>
        {hasFilters && (
          <button
            onClick={resetAll}
            className="flex items-center gap-1"
            style={{ fontSize: 12, color: C.textSub, fontWeight: 510 }}
          >
            <X style={{ width: 11, height: 11 }} />
            リセット
          </button>
        )}
      </div>

      {/* ── コンテンツ エリア ────────────────────────────────── */}
      <div className="flex-1 overflow-hidden flex flex-col" style={{ background: C.bg }}>

        {viewMode === 'split' && (
          <div className="flex-shrink-0" style={{ height: '42%', minHeight: 200 }}>
            <StoreMapPanel
              stores={sortedStores}
              selectedId={selectedId}
              onSelect={handleSelect}
              userLocation={location}
            />
          </div>
        )}

        <div
          ref={listRef}
          className="flex-1 overflow-y-auto"
          style={{ background: C.bg }}
        >
          {isLoading ? (
            <div className="flex items-center justify-center py-24 gap-2">
              <span
                className="inline-block h-px w-10 animate-pulse"
                style={{ background: C.inkFill }}
              />
              <span
                className="text-[11px] tracking-[0.1em]"
                style={{ color: C.textMute }}
              >
                読み込み中
              </span>
            </div>
          ) : (
            <StoreList
              stores={sortedStores}
              distances={distances}
              selectedId={selectedId}
              onSelect={viewMode === 'split' ? handleSelect : undefined}
              cardRefs={cardRefs}
            />
          )}
        </div>
      </div>

      <BottomNav courseCount={courseCount} />
    </main>
  );
}
