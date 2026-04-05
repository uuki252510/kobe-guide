'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import StoreList from '@/components/StoreList';
import BottomNav from '@/components/BottomNav';
import { useCourse } from '@/hooks/useCourse';
import type { Restaurant } from '@/types/restaurant';
import { SlidersHorizontal, X } from 'lucide-react';

// ── エリアフィルター ────────────────────────────────────────────
const AREAS = [
  { value: '',              label: 'すべて' },
  { value: 'sannomiya',    label: '三宮' },
  { value: 'motomachi',    label: '元町' },
  { value: 'surroundings', label: '周辺' },
];

// ── カテゴリ・絞り込みフィルター ────────────────────────────────
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
  { id: 'solo',     label: '一人OK',       emoji: '🧍', params: { vibe_tags: 'solo-friendly' } },
  { id: 'budget',   label: '1000円以内',   emoji: '💴', params: { budget_max: '1000' } },
  { id: 'local',    label: '地元の名店',   emoji: '🍶', params: { vibe_tags: 'local' } },
  { id: 'retro',    label: 'レトロ',       emoji: '🕯', params: { vibe_tags: 'retro' } },
  { id: 'kakuuchi', label: '角打ち',       emoji: '🏪', params: { tachinomi_type: 'kakuuchi' } },
  { id: 'wine',     label: 'ワイン',       emoji: '🍷', params: { tachinomi_type: 'wine' } },
  { id: 'seafood',  label: '海鮮',         emoji: '🐟', params: { tachinomi_type: 'seafood' } },
  { id: 'yakitori', label: '焼鳥',         emoji: '🍢', params: { tachinomi_type: 'yakitori' } },
  { id: 'bar',      label: 'バー',         emoji: '🥂', params: { tachinomi_type: 'bar' } },
  { id: 'hormones', label: 'ホルモン',     emoji: '🥩', params: { tachinomi_type: 'hormones' } },
  { id: 'italian',  label: 'イタリアン',   emoji: '🍕', params: { tachinomi_type: 'italian' } },
  { id: 'new',      label: '新規オープン', emoji: '✨', params: { is_new_open: 'true' } },
  { id: 'late',     label: '深夜OK',       emoji: '🌙', params: { vibe_tags: 'late-night' } },
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
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [stores, setStores] = useState<Restaurant[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { count: courseCount } = useCourse();
  const filterScrollRef = useRef<HTMLDivElement>(null);

  const fetchStores = useCallback(async () => {
    setIsLoading(true);
    const params = new URLSearchParams({ limit: '90' });
    if (area) params.set('area', area);
    if (budgetMax) params.set('budget_max', budgetMax);

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
  }, [area, activeFilter, budgetMax]);

  useEffect(() => { fetchStores(); }, [fetchStores]);

  const hasActiveFilters = area !== '' || activeFilter !== 'all' || budgetMax !== '';

  const resetAll = () => {
    setArea('');
    setActiveFilter('all');
    setBudgetMax('');
    setShowFilterPanel(false);
  };

  return (
    <main className="h-dvh flex flex-col overflow-hidden bg-harbor-50">

      {/* ── ヘッダー ── */}
      <header className="flex-shrink-0 h-12 flex items-center justify-between px-4 bg-white/95 backdrop-blur-sm border-b border-harbor-200 z-30">
        <div className="flex items-center gap-2.5">
          <Image src="/logo.jpg" alt="神戸立ち飲みマップ" width={64} height={36} className="object-contain mix-blend-multiply" />
          <span className="text-harbor-800 font-bold text-sm">神戸立ち飲みマップ</span>
        </div>
        <div className="flex items-center gap-2">
          {courseCount > 0 && (
            <Link href="/map" className="flex items-center gap-1 text-xs px-2.5 py-1.5 bg-kobe-red/10 border border-kobe-red/50 text-kobe-red rounded-full font-bold">
              🍺 {courseCount}店
            </Link>
          )}
          <Link href="/" className="text-xs px-3 py-1.5 bg-harbor-100 border border-harbor-200 text-harbor-600 rounded-full hover:bg-harbor-200 transition-colors">
            案内を聞く
          </Link>
        </div>
      </header>

      {/* ── エリアフィルター ── */}
      <div className="flex-shrink-0 bg-white border-b border-harbor-200 px-3 pt-2 pb-2">
        <div className="flex gap-1.5">
          {AREAS.map(a => (
            <button
              key={a.value}
              onClick={() => setArea(a.value)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 ${
                area === a.value
                  ? 'bg-harbor-900 text-white border-harbor-800'
                  : 'bg-harbor-50 text-harbor-600 border-harbor-200 hover:border-harbor-400'
              }`}
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── カテゴリ・絞り込みバー ── */}
      <div className="flex-shrink-0 bg-white/90 border-b border-harbor-200">
        <div className="flex items-center">
          <button
            onClick={() => setShowFilterPanel(v => !v)}
            className={`flex-shrink-0 flex items-center gap-1.5 ml-3 mr-2 px-2.5 py-2 rounded-full text-xs font-semibold border transition-all duration-200 ${
              showFilterPanel || budgetMax
                ? 'bg-kobe-gold text-harbor-950 border-kobe-gold'
                : 'bg-white text-harbor-600 border-harbor-200'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            予算
          </button>

          <div ref={filterScrollRef} className="flex gap-1.5 overflow-x-auto scrollbar-hide py-2 pr-3">
            {FILTERS.map(f => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id === activeFilter ? 'all' : f.id)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 ${
                  activeFilter === f.id
                    ? 'bg-harbor-900 text-white border-harbor-800 shadow-sm'
                    : 'bg-white text-harbor-600 border-harbor-200 hover:border-harbor-300'
                }`}
              >
                <span>{f.emoji}</span>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {showFilterPanel && (
          <div className="px-4 pb-3 border-t border-harbor-100 pt-2.5">
            <p className="text-harbor-500 text-[11px] font-medium mb-2">予算上限</p>
            <div className="flex gap-2">
              {BUDGET_OPTIONS.map(b => (
                <button
                  key={b.max}
                  onClick={() => setBudgetMax(b.max)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    budgetMax === b.max
                      ? 'bg-kobe-gold text-harbor-950 border-kobe-gold'
                      : 'bg-white text-harbor-600 border-harbor-200 hover:border-harbor-300'
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── 件数バー ── */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-1.5 bg-harbor-50 border-b border-harbor-100">
        <p className="text-harbor-500 text-xs">
          {isLoading
            ? '検索中...'
            : <><span className="text-harbor-800 font-bold">{total}</span>店舗</>
          }
        </p>
        {hasActiveFilters && (
          <button onClick={resetAll} className="flex items-center gap-1 text-xs text-harbor-400 hover:text-kobe-red transition-colors">
            <X className="w-3 h-3" />
            リセット
          </button>
        )}
      </div>

      {/* ── リスト ── */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-8 h-8 rounded-full border-2 border-kobe-gold/30 border-t-kobe-gold animate-spin mx-auto mb-3" />
              <p className="text-harbor-400 text-sm">読み込み中...</p>
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
