'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { Heart, Navigation, ChevronDown, MapPin } from 'lucide-react';
import { type SpotData, AREA_LABELS } from '@/data/spots';

interface SpotReelProps {
  spots: SpotData[];
}

function ReelCard({
  spot,
  isSaved,
  onSave,
  isFirst,
}: {
  spot: SpotData;
  isSaved: boolean;
  onSave: (id: string) => void;
  isFirst: boolean;
}) {
  const budgetStr = `¥${spot.budgetMin.toLocaleString()} 〜 ¥${spot.budgetMax.toLocaleString()}`;

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-2xl relative"
      style={{ background: spot.gradient }}
    >
      {/* ── Image / Visual Area ── */}
      <div className="relative flex-[58]">
        {/* 実画像 or グラデーション装飾 */}
        {spot.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={spot.photoUrl}
            alt={spot.name}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center select-none pointer-events-none"
            aria-hidden
          >
            <span
              className="font-bold leading-none"
              style={{
                fontSize: 'clamp(120px, 35vw, 200px)',
                color: 'rgba(255,255,255,0.04)',
                fontFamily: 'serif',
              }}
            >
              {spot.accentChar}
            </span>
          </div>
        )}

        {/* Top badges */}
        <div className="absolute top-4 left-4 right-4 flex items-start justify-between z-10">
          <div className="flex items-center gap-1.5 bg-black/30 backdrop-blur-md rounded-full px-3 py-1.5 border border-white/10">
            <MapPin className="w-3 h-3 text-white/70" />
            <span className="text-white/90 text-xs font-medium">
              {AREA_LABELS[spot.area] ?? spot.area} · {spot.type}
            </span>
          </div>
          <div className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${
            spot.isOpen
              ? 'bg-emerald-500/85 text-white backdrop-blur-sm'
              : 'bg-black/50 text-white/50 backdrop-blur-sm'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${spot.isOpen ? 'bg-white' : 'bg-white/30'}`} />
            {spot.isOpen ? '営業中' : '準備中'}
          </div>
        </div>

        {/* Bottom gradient fade into info area */}
        <div
          className="absolute bottom-0 left-0 right-0 h-28 pointer-events-none"
          style={{ background: 'linear-gradient(to top, rgba(10,8,6,0.95) 0%, transparent 100%)' }}
        />
      </div>

      {/* ── Info Area ── */}
      <div
        className="flex-[42] flex flex-col justify-between px-5 pt-4 pb-6"
        style={{ background: 'rgba(10,8,6,0.97)' }}
      >
        <div>
          {/* Store name + budget */}
          <div className="flex items-start justify-between gap-3 mb-2.5">
            <h2 className="text-white font-bold leading-tight" style={{ fontSize: 22 }}>
              {spot.name}
            </h2>
            <span className="text-kobe-gold font-semibold text-sm flex-shrink-0 mt-1">
              {budgetStr}
            </span>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {spot.tags.map(tag => (
              <span
                key={tag}
                className="text-[11px] px-2.5 py-0.5 rounded-full font-medium"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.14)',
                  color: 'rgba(255,255,255,0.65)',
                }}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Comment */}
          <p
            className="text-sm leading-relaxed"
            style={{ color: 'rgba(255,255,255,0.55)', fontStyle: 'italic' }}
          >
            "{spot.shortComment}"
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2.5 mt-4">
          <button
            onClick={() => onSave(spot.id)}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
              isSaved
                ? 'bg-kobe-red text-white'
                : 'text-white/80 hover:text-white'
            }`}
            style={!isSaved ? {
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
            } : undefined}
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-white' : ''}`} />
            {isSaved ? '保存済み' : '行きたい'}
          </button>

          {spot.googleMapsUrl ? (
            <a
              href={spot.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-3 bg-kobe-gold text-harbor-950 rounded-xl text-sm font-bold hover:bg-kobe-amber transition-colors"
            >
              <Navigation className="w-4 h-4" />
              マップ
            </a>
          ) : (
            <div
              className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold opacity-30"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'white' }}
            >
              <Navigation className="w-4 h-4" />
              マップ
            </div>
          )}
        </div>
      </div>

      {/* Swipe hint (first card only) */}
      {isFirst && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex flex-col items-center gap-0.5 pointer-events-none">
          <ChevronDown
            className="w-5 h-5 text-white/25 animate-bounce"
            style={{ animationDuration: '1.8s' }}
          />
        </div>
      )}
    </div>
  );
}

export default function SpotReel({ spots }: SpotReelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [saved, setSaved] = useState<Set<string>>(new Set());

  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollTop / el.clientHeight);
    setCurrentIndex(Math.min(idx, spots.length - 1));
  }, [spots.length]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Reset scroll when spots change
  useEffect(() => {
    const el = containerRef.current;
    if (el) el.scrollTop = 0;
    setCurrentIndex(0);
  }, [spots]);

  const toggleSave = useCallback((id: string) => {
    setSaved(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  if (spots.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-harbor-950 gap-4">
        <span className="text-5xl opacity-30">🏮</span>
        <p className="text-white/40 text-sm">条件に合う店が見つかりません</p>
      </div>
    );
  }

  return (
    <div className="relative h-full bg-harbor-950">
      {/* Counter */}
      <div className="absolute top-4 right-4 z-20 bg-black/40 backdrop-blur-sm rounded-full px-3 py-1 border border-white/10">
        <span className="text-white/60 text-xs tabular-nums">
          {currentIndex + 1} / {spots.length}
        </span>
      </div>

      {/* Scroll container */}
      <div
        ref={containerRef}
        className="reel-container h-full"
      >
        {spots.map((spot, i) => (
          <div key={spot.id} className="reel-slide h-full p-3">
            <ReelCard
              spot={spot}
              isSaved={saved.has(spot.id)}
              onSave={toggleSave}
              isFirst={i === 0}
            />
          </div>
        ))}
      </div>

      {/* Dot navigation */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-1.5">
        {spots.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              const el = containerRef.current;
              if (el) el.scrollTo({ top: i * el.clientHeight, behavior: 'smooth' });
            }}
            className={`rounded-full transition-all duration-200 ${
              i === currentIndex
                ? 'w-1.5 h-4 bg-kobe-gold'
                : 'w-1.5 h-1.5 bg-white/25 hover:bg-white/40'
            }`}
            aria-label={`${i + 1}番目の店舗`}
          />
        ))}
      </div>
    </div>
  );
}
