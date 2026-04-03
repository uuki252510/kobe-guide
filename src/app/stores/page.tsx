'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import MoodCards from '@/components/MoodCards';
import SpotReel from '@/components/SpotReel';
import BottomNav from '@/components/BottomNav';
import { type SpotData } from '@/data/spots';
import { useCourse } from '@/hooks/useCourse';
import type { Restaurant } from '@/types/restaurant';

// ── tachinomi_type → ビジュアル変換 ────────────────────────────
const TYPE_VISUAL: Record<string, { gradient: string; accentChar: string }> = {
  kakuuchi: {
    gradient: 'linear-gradient(145deg, #0f0720 0%, #1e1040 55%, #0a0518 100%)',
    accentChar: '酒',
  },
  wine: {
    gradient: 'linear-gradient(145deg, #1a0010 0%, #2e0025 55%, #100010 100%)',
    accentChar: '葡',
  },
  seafood: {
    gradient: 'linear-gradient(145deg, #000d20 0%, #001530 55%, #000810 100%)',
    accentChar: '海',
  },
  yakitori: {
    gradient: 'linear-gradient(145deg, #1a0800 0%, #2e1400 55%, #0d0400 100%)',
    accentChar: '炙',
  },
  bar: {
    gradient: 'linear-gradient(145deg, #050510 0%, #0a0a18 55%, #030308 100%)',
    accentChar: '杯',
  },
  italian: {
    gradient: 'linear-gradient(145deg, #001015 0%, #002030 55%, #000810 100%)',
    accentChar: '伊',
  },
  hormones: {
    gradient: 'linear-gradient(145deg, #1a0500 0%, #2e0a00 55%, #0d0200 100%)',
    accentChar: '肉',
  },
  tachinomi: {
    gradient: 'linear-gradient(145deg, #100a00 0%, #201500 55%, #080500 100%)',
    accentChar: '呑',
  },
};
const DEFAULT_VISUAL = {
  gradient: 'linear-gradient(145deg, #0a0a0f 0%, #12121e 55%, #060608 100%)',
  accentChar: '飲',
};

const TYPE_LABEL: Record<string, string> = {
  tachinomi: '立ち飲み',
  kakuuchi:  '角打ち',
  yakitori:  '焼鳥',
  seafood:   '海鮮',
  wine:      'ワイン',
  italian:   'イタリアン',
  hormones:  'ホルモン',
  bar:       'バー',
};

// ── Restaurant → SpotData 変換 ─────────────────────────────────
function toSpotData(r: Restaurant): SpotData {
  const visual = (r.tachinomi_type && TYPE_VISUAL[r.tachinomi_type]) || DEFAULT_VISUAL;

  const tags: string[] = [];
  if (r.tachinomi_type) tags.push(TYPE_LABEL[r.tachinomi_type] ?? r.tachinomi_type);
  if (r.vibe_tags?.length) tags.push(...r.vibe_tags.slice(0, 3));
  if (r.solo_friendly_score && r.solo_friendly_score >= 3) tags.push('ひとり歓迎');
  if (r.is_new_open) tags.push('NEW OPEN');

  const comment =
    r.must_try_menu
      ? `名物: ${r.must_try_menu}`
      : r.tachinomi_type
      ? `${TYPE_LABEL[r.tachinomi_type] ?? r.tachinomi_type}の名店`
      : '地元に愛される立ち飲み';

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
    shortComment: comment,
    isOpen: r.business_status === 'OPERATIONAL',
    type: r.tachinomi_type ? (TYPE_LABEL[r.tachinomi_type] ?? '立ち飲み') : '立ち飲み',
    googleMapsUrl: r.google_maps_url ?? undefined,
    photoUrl: r.photo_reference
      ? `/api/photo?ref=${encodeURIComponent(r.photo_reference)}`
      : undefined,
  };
}

// ── mood → API クエリパラメータ ────────────────────────────────
const MOOD_PARAMS: Record<string, Record<string, string>> = {
  solo:     { vibe_tags: 'solo-friendly' },
  budget:   { budget_max: '1000' },
  kakuuchi: { category: 'kakuuchi' },
  seafood:  { category: 'seafood' },
  wine:     { category: 'wine' },
  new:      { vibe_tags: 'new-open' },
  late:     { vibe_tags: 'late-night' },
  second:   { vibe_tags: 'second-round' },
};

export default function StoresPage() {
  const [selectedMood, setSelectedMood] = useState<string | undefined>();
  const [spots, setSpots] = useState<SpotData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { count: courseCount } = useCourse();

  const fetchSpots = useCallback(async (mood?: string) => {
    setIsLoading(true);
    const params = new URLSearchParams({ limit: '90' });
    if (mood && MOOD_PARAMS[mood]) {
      Object.entries(MOOD_PARAMS[mood]).forEach(([k, v]) => params.set(k, v));
    }
    try {
      const res = await fetch(`/api/restaurants?${params}`);
      const data = await res.json();
      setSpots((data.restaurants ?? []).map(toSpotData));
    } catch {
      setSpots([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSpots(selectedMood);
  }, [selectedMood, fetchSpots]);

  return (
    <main className="h-dvh flex flex-col overflow-hidden bg-harbor-50">

      {/* ── Header ── */}
      <header className="flex-shrink-0 h-12 flex items-center justify-between px-4 bg-white/95 backdrop-blur-sm border-b border-harbor-200 z-30">
        <div className="flex items-center gap-2.5">
          <Image
            src="/logo.jpg"
            alt="神戸立ち飲みマップ"
            width={64}
            height={36}
            className="object-contain mix-blend-multiply"
          />
          <span className="text-harbor-800 font-bold text-sm">神戸立ち飲みマップ</span>
        </div>
        <div className="flex items-center gap-2">
          {courseCount > 0 && (
            <Link
              href="/map"
              className="flex items-center gap-1 text-xs px-2.5 py-1.5 bg-kobe-red/10 border border-kobe-red/50 text-kobe-red rounded-full font-bold"
            >
              🍺 {courseCount}店
            </Link>
          )}
          <Link
            href="/"
            className="text-xs px-3 py-1.5 bg-harbor-100 border border-harbor-200 text-harbor-600 rounded-full hover:bg-harbor-200 transition-colors"
          >
            案内を聞く
          </Link>
        </div>
      </header>

      {/* ── Mood Chips ── */}
      <div className="flex-shrink-0 h-12 flex items-center bg-white/80 border-b border-harbor-200">
        <button
          onClick={() => setSelectedMood(undefined)}
          className={`flex-shrink-0 ml-3 mr-1 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 ${
            !selectedMood
              ? 'bg-harbor-900 text-white border-harbor-800'
              : 'bg-white text-harbor-600 border-harbor-200 hover:border-harbor-400'
          }`}
        >
          すべて
        </button>
        <MoodCards
          selected={selectedMood}
          onSelect={(moodId) => setSelectedMood(moodId === selectedMood ? undefined : moodId)}
          layout="scroll"
        />
      </div>

      {/* ── SpotReel ── */}
      <div className="flex-1 min-h-0">
        {isLoading ? (
          <div className="h-full bg-harbor-950 flex items-center justify-center">
            <div className="text-center">
              <div
                className="w-10 h-10 rounded-full border-2 border-kobe-gold/30 border-t-kobe-gold animate-spin mx-auto mb-4"
              />
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
