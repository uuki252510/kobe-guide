'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import SpotReel from '@/components/SpotReel';
import BottomNav from '@/components/BottomNav';
import { type SpotData } from '@/data/spots';
import { useCourse } from '@/hooks/useCourse';
import type { Restaurant } from '@/types/restaurant';
import { SlidersHorizontal, X } from 'lucide-react';

// ── ビジュアル変換 ──────────────────────────────────────────────
const TYPE_VISUAL: Record<string, { gradient: string; accentChar: string }> = {
  kakuuchi: { gradient: 'linear-gradient(145deg, #0f0720 0%, #1e1040 55%, #0a0518 100%)', accentChar: '酒' },
  wine:     { gradient: 'linear-gradient(145deg, #1a0010 0%, #2e0025 55%, #100010 100%)', accentChar: '葡' },
  seafood:  { gradient: 'linear-gradient(145deg, #000d20 0%, #001530 55%, #000810 100%)', accentChar: '海' },
  yakitori: { gradient: 'linear-gradient(145deg, #1a0800 0%, #2e1400 55%, #0d0400 100%)', accentChar: '炙' },
  bar:      { gradient: 'linear-gradient(145deg, #050510 0%, #0a0a18 55%, #030308 100%)', accentChar: '杯' },
  italian:  { gradient: 'linear-gradient(145deg, #001015 0%, #002030 55%, #000810 100%)', accentChar: '伊' },
  hormones: { gradient: 'linear-gradient(145deg, #1a0500 0%, #2e0a00 55%, #0d0200 100%)', accentChar: '肉' },
  tachinomi:{ gradient: 'linear-gradient(145deg, #100a00 0%, #201500 55%, #080500 100%)', accentChar: '呑' },
};
const DEFAULT_VISUAL = { gradient: 'linear-gradient(145deg, #0a0a0f 0%, #12121e 55%, #060608 100%)', accentChar: '飲' };

const TYPE_LABEL: Record<string, string> = {
  tachinomi: '立ち飲み', kakuuchi: '角打ち', yakitori: '焼鳥',
  seafood: '海鮮', wine: 'ワイン', italian: 'イタリアン',
  hormones: 'ホルモン', bar: 'バー',
};

function toSpotData(r: Restaurant): SpotData {
  const visual = (r.tachinomi_type && TYPE_VISUAL[r.tachinomi_type]) || DEFAULT_VISUAL;
  const tags: string[] = [];
  if (r.tachinomi_type) tags.push(TYPE_LABEL[r.tachinomi_type] ?? r.tachinomi_type);
  if (r.vibe_tags?.length) tags.push(...r.vibe_tags.slice(0, 3));
  if (r.solo_friendly_score && r.solo_friendly_score >= 3) tags.push('ひとり歓迎');
  if (r.is_new_open) tags.push('NEW OPEN');

  return {
    id: r.id,
    name: r.name,
    area: r.area as SpotData['area'],
    budgetMin: r.budget_min ?? 500,
    budgetMax: r.budget_max ?? 2000,
    tags: [...new Set(tags)].slice(0, 4),
    moodCategories: [],
    gradient: visual.gradient,
    accentChar: visual.accentChar,
    shortComment: r.must_try_menu
      ? `名物: ${r.must_try_menu}`
      : r.tachinomi_type ? `${TYPE_LABEL[r.tachinomi_type] ?? r.tachinomi_type}の名店` : '地元に愛される立ち飲み',
    isOpen: r.business_status === 'OPERATIONAL',
    type: r.tachinomi_type ? (TYPE_LABEL[r.tachinomi_type] ?? '立ち飲み') : '立ち飲み',
    googleMapsUrl: r.google_maps_url ?? undefined,
    photoUrl: r.photo_reference ? `/api/photo?ref=${encodeURIComponent(r.photo_reference)}` : undefined,
  };
}

// ── エリアフィルター ────────────────────────────────────────────
const AREAS = [
  { value: '',              label: 'すべて',  count: 86 },
  { value: 'sannomiya',    label: '三宮',    count: 59 },
  { value: 'motomachi',    label: '元町',    count: 13 },
  { value: 'surroundings', label: '周辺',    count: 14 },
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
  count: number;
  params: Record<string, string>;
}

const FILTERS: FilterDef[] = [
  { id: 'all',       label: 'すべて',       emoji: '🏮', count: 86, params: {} },
  { id: 'solo',      label: '一人でふらっと', emoji: '🧍', count: 27, params: { vibe_tags: 'solo-friendly,local' } },
  { id: 'budget',    label: '1000円以内',   emoji: '💴', count: 21, params: { budget_max: '1000' } },
  { id: 'local',     label: '地元の名店',    emoji: '🍶', count: 27, params: { vibe_tags: 'local' } },
  { id: 'retro',     label: 'レトロ',       emoji: '🕯️', count: 5,  params: { vibe_tags: 'retro' } },
  { id: 'kakuuchi',  label: '角打ち',       emoji: '🏪', count: 12, params: { tachinomi_type: 'kakuuchi' } },
  { id: 'wine',      label: 'ワイン',       emoji: '🍷', count: 5,  params: { tachinomi_type: 'wine' } },
  { id: 'seafood',   label: '海鮮',         emoji: '🐟', count: 3,  params: { tachinomi_type: 'seafood' } },
  { id: 'yakitori',  label: '焼鳥',         emoji: '🍢', count: 4,  params: { tachinomi_type: 'yakitori' } },
  { id: 'bar',       label: 'バー',         emoji: '🥂', count: 5,  params: { tachinomi_type: 'bar' } },
  { id: 'hormones',  label: 'ホルモン',     emoji: '🥩', count: 1,  params: { tachinomi_type: 'hormones' } },
  { id: 'italian',   label: 'イタリアン',   emoji: '🍕', count: 2,  params: { tachinomi_type: 'italian' } },
  { id: 'new',       label: '新規オープン', emoji: '✨', count: 22, params: { is_new_open: 'true' } },
  { id: 'late',      label: '深夜OK',       emoji: '🌙', count: 1,  params: { vibe_tags: 'late-night' } },
];

// ── 予算スライダー用 ────────────────────────────────────────────
const BUDGET_OPTIONS = [
  { label: 'すべて', max: '' },
  { label: '〜¥1,000', max: '1000' },
  { label: '〜¥1,500', max: '1500' },
  { label: '〜¥2,000', max: '2000' },
];

export default function StoresPage() {
  const [area, setArea] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterId>('all');
  const [budgetMax, setBudgetMax] = useState('');
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [spots, setSpots] = useState<SpotData[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { count: courseCount } = useCourse();
  const filterScrollRef = useRef<HTMLDivElement>(null);

  const fetchSpots = useCallback(async () => {
    setIsLoading(true);
    const params = new URLSearchParams({ limit: '90' });
    if (area) params.set('area', area);
    if (budgetMax) params.set('budget_max', budgetMax);

    const filter = FILTERS.find(f => f.id === activeFilter);
    if (filter && filter.params) {
      Object.entries(filter.params).forEach(([k, v]) => params.set(k, v));
    }

    try {
      const res = await fetch(`/api/restaurants?${params}`);
      const data = await res.json();
      setSpots((data.restaurants ?? []).map(toSpotData));
      setTotal(data.pagination?.total ?? 0);
    } catch {
      setSpots([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [area, activeFilter, budgetMax]);

  useEffect(() => {
    fetchSpots();
  }, [fetchSpots]);

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
      <div className="flex-shrink-0 bg-white border-b border-harbor-200 px-3 pt-2.5 pb-2">
        <div className="flex gap-1.5">
          {AREAS.map(a => (
            <button
              key={a.value}
              onClick={() => setArea(a.value)}
              className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 ${
                area === a.value
                  ? 'bg-harbor-900 text-white border-harbor-800'
                  : 'bg-harbor-50 text-harbor-600 border-harbor-200 hover:border-harbor-400'
              }`}
            >
              {a.label}
              <span className={`text-[10px] ${area === a.value ? 'text-white/70' : 'text-harbor-400'}`}>
                {a.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── カテゴリ・絞り込みバー ── */}
      <div className="flex-shrink-0 bg-white/90 border-b border-harbor-200">
        <div className="flex items-center">
          {/* フィルターパネルボタン */}
          <button
            onClick={() => setShowFilterPanel(v => !v)}
            className={`flex-shrink-0 flex items-center gap-1.5 ml-3 mr-2 px-2.5 py-2 rounded-full text-xs font-semibold border transition-all duration-200 ${
              showFilterPanel || budgetMax
                ? 'bg-kobe-gold text-harbor-950 border-kobe-gold'
                : 'bg-white text-harbor-600 border-harbor-200'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            絞り込み
          </button>

          {/* スクロールフィルターチップ */}
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
                {f.id !== 'all' && (
                  <span className={`text-[10px] ${activeFilter === f.id ? 'text-white/60' : 'text-harbor-400'}`}>
                    {f.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 詳細絞り込みパネル */}
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
          {isLoading ? '検索中...' : <><span className="text-harbor-800 font-bold">{total}</span>店舗表示中</>}
        </p>
        {hasActiveFilters && (
          <button
            onClick={resetAll}
            className="flex items-center gap-1 text-xs text-harbor-500 hover:text-kobe-red transition-colors"
          >
            <X className="w-3 h-3" />
            絞り込みを解除
          </button>
        )}
      </div>

      {/* ── SpotReel ── */}
      <div className="flex-1 min-h-0">
        {isLoading ? (
          <div className="h-full bg-harbor-950 flex items-center justify-center">
            <div className="text-center">
              <div className="w-10 h-10 rounded-full border-2 border-kobe-gold/30 border-t-kobe-gold animate-spin mx-auto mb-4" />
              <p className="text-white/40 text-sm">読み込み中...</p>
            </div>
          </div>
        ) : (
          <SpotReel spots={spots} />
        )}
      </div>

      <BottomNav courseCount={courseCount} />
    </main>
  );
}
