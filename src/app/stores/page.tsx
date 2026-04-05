'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import StoreList from '@/components/StoreList';
import BottomNav from '@/components/BottomNav';
import { useCourse } from '@/hooks/useCourse';
import type { Restaurant } from '@/types/restaurant';
import { Search, X, SlidersHorizontal } from 'lucide-react';

const AREAS = [
  { value: '',              label: 'すべて' },
  { value: 'sannomiya',    label: '三宮' },
  { value: 'motomachi',    label: '元町' },
  { value: 'surroundings', label: '周辺' },
];

type FilterId =
  | 'all' | 'solo' | 'budget' | 'local' | 'retro'
  | 'kakuuchi' | 'tachinomi' | 'wine' | 'seafood'
  | 'yakitori' | 'bar' | 'hormones' | 'italian'
  | 'new' | 'late';

interface FilterDef {
  id: FilterId;
  label: string;
  emoji: string;
  params: Record<string, string>;
}

const FILTERS: FilterDef[] = [
  { id: 'all',      label: 'すべて',       emoji: '🏮', params: {} },
  { id: 'kakuuchi', label: '角打ち',       emoji: '🍶', params: { tachinomi_type: 'kakuuchi' } },
  { id: 'wine',     label: 'ワイン',       emoji: '🍷', params: { tachinomi_type: 'wine' } },
  { id: 'seafood',  label: '海鮮',         emoji: '🐟', params: { tachinomi_type: 'seafood' } },
  { id: 'yakitori', label: '焼鳥',         emoji: '🍢', params: { tachinomi_type: 'yakitori' } },
  { id: 'bar',      label: 'バー',         emoji: '🥂', params: { tachinomi_type: 'bar' } },
  { id: 'hormones', label: 'ホルモン',     emoji: '🥩', params: { tachinomi_type: 'hormones' } },
  { id: 'italian',  label: 'イタリアン',   emoji: '🍕', params: { tachinomi_type: 'italian' } },
  { id: 'tachinomi', label: '立ち飲み',   emoji: '🍺', params: { tachinomi_type: 'tachinomi' } },
  { id: 'solo',     label: '一人OK',       emoji: '🧍', params: { vibe_tags: 'solo-friendly' } },
  { id: 'budget',   label: '1000円以内',   emoji: '💴', params: { budget_max: '1000' } },
  { id: 'local',    label: '地元の名店',   emoji: '🏅', params: { vibe_tags: 'local' } },
  { id: 'retro',    label: 'レトロ',       emoji: '🕯', params: { vibe_tags: 'retro' } },
  { id: 'new',      label: '新規オープン', emoji: '✨', params: { is_new_open: 'true' } },
];

const BUDGET_OPTIONS = [
  { label: 'すべて',    max: '' },
  { label: '〜¥1,000', max: '1000' },
  { label: '〜¥1,500', max: '1500' },
  { label: '〜¥2,000', max: '2000' },
];

export default function StoresPage() {
  const [area, setArea] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterId>('all');
  const [budgetMax, setBudgetMax] = useState('');
  const [showBudget, setShowBudget] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const [stores, setStores] = useState<Restaurant[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { count: courseCount } = useCourse();
  const searchRef = useRef<HTMLInputElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedKeyword(keyword), 400);
    return () => clearTimeout(t);
  }, [keyword]);

  const fetchStores = useCallback(async () => {
    setIsLoading(true);
    const params = new URLSearchParams({ limit: '90' });
    if (area) params.set('area', area);
    if (budgetMax) params.set('budget_max', budgetMax);
    if (debouncedKeyword) params.set('keyword', debouncedKeyword);

    const filter = FILTERS.find(f => f.id === activeFilter);
    if (filter) {
      Object.entries(filter.params).forEach(([k, v]) => params.set(k, v));
    }

    try {
      const res = await fetch(`/api/restaurants?${params}`);
      const data = await res.json();
      setStores(data.restaurants ?? []);
      setTotal(data.pagination?.total ?? 0);
    } catch {
      setStores([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [area, activeFilter, budgetMax, debouncedKeyword]);

  useEffect(() => { fetchStores(); }, [fetchStores]);

  const hasActiveFilters = area !== '' || activeFilter !== 'all' || budgetMax !== '' || debouncedKeyword !== '';

  const resetAll = () => {
    setArea('');
    setActiveFilter('all');
    setBudgetMax('');
    setKeyword('');
    setDebouncedKeyword('');
    setShowBudget(false);
  };

  return (
    <main className="h-dvh flex flex-col overflow-hidden" style={{ background: '#111109' }}>

      {/* ── ヘッダー（ダーク） ── */}
      <header className="flex-shrink-0 px-4 pt-4 pb-3" style={{ background: '#111109' }}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-white/40 text-[10px] font-medium tracking-widest uppercase">Kobe Tachinomi</p>
            <h1 className="text-white font-bold text-lg leading-tight tracking-tight">神戸立ち飲みマップ</h1>
          </div>
          <div className="flex items-center gap-2">
            {courseCount > 0 && (
              <Link href="/map" className="flex items-center gap-1 text-xs px-3 py-1.5 bg-kobe-gold/20 border border-kobe-gold/40 text-kobe-amber rounded-full font-bold">
                🍺 {courseCount}店
              </Link>
            )}
            <Link href="/" className="text-xs px-3 py-1.5 bg-white/10 border border-white/20 text-white/70 rounded-full hover:bg-white/15 transition-colors">
              案内を聞く
            </Link>
          </div>
        </div>

        {/* 検索バー */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40 pointer-events-none" />
          <input
            ref={searchRef}
            type="text"
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            placeholder="店名・エリアで検索..."
            className="w-full pl-9 pr-9 py-2.5 bg-white/10 border border-white/20 rounded-xl text-sm text-white placeholder-white/30 outline-none focus:border-white/40 focus:bg-white/15 transition-all"
          />
          {keyword && (
            <button
              onClick={() => { setKeyword(''); setDebouncedKeyword(''); searchRef.current?.focus(); }}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </header>

      {/* ── フィルターバー（スティッキー） ── */}
      <div className="flex-shrink-0 z-20" style={{ background: '#111109' }}>

        {/* エリアタブ */}
        <div className="flex items-center gap-1.5 px-4 pb-2">
          {AREAS.map(a => (
            <button
              key={a.value}
              onClick={() => setArea(a.value)}
              className={`px-3.5 py-1 rounded-full text-xs font-semibold border transition-all duration-150 ${
                area === a.value
                  ? 'bg-white text-harbor-900 border-white'
                  : 'bg-transparent text-white/50 border-white/20 hover:border-white/40 hover:text-white/70'
              }`}
            >
              {a.label}
            </button>
          ))}

          {/* 予算ボタン（右端） */}
          <div className="ml-auto">
            <button
              onClick={() => setShowBudget(v => !v)}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border transition-all duration-150 ${
                showBudget || budgetMax
                  ? 'bg-kobe-gold text-harbor-950 border-kobe-gold'
                  : 'bg-transparent text-white/50 border-white/20 hover:border-white/40 hover:text-white/70'
              }`}
            >
              <SlidersHorizontal className="w-3 h-3" />
              予算
            </button>
          </div>
        </div>

        {/* 予算パネル */}
        {showBudget && (
          <div className="px-4 pb-2.5 flex items-center gap-2">
            <span className="text-white/40 text-[10px] font-medium tracking-wide mr-1">上限</span>
            {BUDGET_OPTIONS.map(b => (
              <button
                key={b.max}
                onClick={() => setBudgetMax(b.max)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                  budgetMax === b.max
                    ? 'bg-kobe-gold text-harbor-950 border-kobe-gold'
                    : 'bg-transparent text-white/50 border-white/20 hover:border-white/40'
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>
        )}

        {/* カテゴリフィルター */}
        <div ref={filterRef} className="flex gap-1.5 overflow-x-auto scrollbar-hide px-4 pb-3">
          {FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id === activeFilter ? 'all' : f.id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium border transition-all duration-150 ${
                activeFilter === f.id
                  ? 'bg-white text-harbor-900 border-white'
                  : 'bg-white/8 text-white/55 border-white/15 hover:border-white/35 hover:text-white/75'
              }`}
            >
              <span className="text-[12px] leading-none">{f.emoji}</span>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── 件数 + リセット ── */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-2 bg-harbor-50 border-b border-harbor-100">
        <p className="text-harbor-500 text-xs">
          {isLoading ? '検索中...' : (
            <><span className="text-harbor-800 font-semibold">{total}</span> 店舗</>
          )}
        </p>
        {hasActiveFilters && (
          <button onClick={resetAll} className="flex items-center gap-1 text-xs text-harbor-400 hover:text-kobe-red transition-colors">
            <X className="w-3 h-3" />
            リセット
          </button>
        )}
      </div>

      {/* ── リスト（明るい背景） ── */}
      <div className="flex-1 overflow-y-auto bg-harbor-50">
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <div className="flex flex-col items-center gap-3">
              <div className="w-7 h-7 rounded-full border-2 border-harbor-200 border-t-harbor-600 animate-spin" />
              <p className="text-harbor-400 text-xs">読み込み中...</p>
            </div>
          </div>
        ) : (
          <StoreList stores={stores} />
        )}
      </div>

      <BottomNav courseCount={courseCount} />
    </main>
  );
}
