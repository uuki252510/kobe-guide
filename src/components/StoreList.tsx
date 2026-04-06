'use client';

import type { MutableRefObject } from 'react';
import Link from 'next/link';
import { Navigation, Instagram, Star, MapPin, Heart, ExternalLink } from 'lucide-react';
import type { Restaurant } from '@/types/restaurant';
import { useFavorites } from '@/hooks/useFavorites';
import { formatDistance } from '@/hooks/useLocation';

// ── type labels & colors ─────────────────────────────────────
const TYPE_LABEL: Record<string, string> = {
  tachinomi: '立ち飲み', kakuuchi: '角打ち', yakitori: '焼鳥',
  seafood: '海鮮', wine: 'ワイン', italian: 'イタリアン',
  hormones: 'ホルモン', bar: 'バー',
};

const TYPE_TINT: Record<string, { bg: string; text: string; border: string }> = {
  kakuuchi:  { bg: 'rgba(139,92,246,0.12)', text: '#a78bfa', border: 'rgba(139,92,246,0.25)' },
  wine:      { bg: 'rgba(236,72,153,0.10)', text: '#f472b6', border: 'rgba(236,72,153,0.25)' },
  seafood:   { bg: 'rgba(59,130,246,0.10)', text: '#60a5fa', border: 'rgba(59,130,246,0.25)' },
  yakitori:  { bg: 'rgba(245,158,11,0.10)', text: '#fbbf24', border: 'rgba(245,158,11,0.25)' },
  bar:       { bg: 'rgba(148,163,184,0.08)', text: '#94a3b8', border: 'rgba(148,163,184,0.20)' },
  italian:   { bg: 'rgba(34,197,94,0.10)',  text: '#4ade80', border: 'rgba(34,197,94,0.25)' },
  hormones:  { bg: 'rgba(239,68,68,0.10)',  text: '#f87171', border: 'rgba(239,68,68,0.25)' },
  tachinomi: { bg: 'rgba(251,191,36,0.10)', text: '#fcd34d', border: 'rgba(251,191,36,0.25)' },
};

const TYPE_EMOJI: Record<string, string> = {
  tachinomi: '🍺', kakuuchi: '🍶', yakitori: '🍢',
  seafood: '🐟', wine: '🍷', italian: '🍕',
  hormones: '🥩', bar: '🥂',
};

const AREA_LABEL: Record<string, string> = {
  sannomiya: '三宮', motomachi: '元町', surroundings: '周辺',
};

// ── StoreCard ────────────────────────────────────────────────
interface CardProps {
  store: Restaurant;
  distance?: number;
  selected?: boolean;
  onSelect?: () => void;
}

function StoreCard({ store, distance, selected, onSelect }: CardProps) {
  const { toggle, has } = useFavorites();
  const isFav  = has(store.id);
  const type   = store.tachinomi_type;
  const label  = type ? (TYPE_LABEL[type] ?? '立ち飲み') : '立ち飲み';
  const tint   = type ? (TYPE_TINT[type]  ?? TYPE_TINT.tachinomi) : TYPE_TINT.tachinomi;
  const emoji  = type ? (TYPE_EMOJI[type] ?? '🏮') : '🏮';
  const photoUrl = store.photo_reference
    ? `/api/photo?ref=${encodeURIComponent(store.photo_reference)}`
    : null;

  const areaStr   = AREA_LABEL[store.area] ?? store.area;
  const budgetStr = store.budget_max ? `〜¥${store.budget_max.toLocaleString()}` : null;

  // Google Maps walking directions
  const navUrl = store.lat && store.lng
    ? `https://www.google.com/maps/dir/?api=1&destination=${store.lat},${store.lng}&travelmode=walking`
    : store.google_maps_url ?? null;

  return (
    <div
      className="ln-card group overflow-hidden transition-all duration-150"
      style={{
        borderRadius: 10,
        borderColor: selected ? 'rgba(94,106,210,0.5)' : undefined,
        background: selected ? 'rgba(94,106,210,0.06)' : undefined,
      }}
      onClick={onSelect}
    >
      {/* ── メイン行（タップで詳細） ── */}
      <div className="flex gap-3 px-4 py-3.5">

        {/* サムネイル */}
        <Link
          href={`/stores/${store.id}`}
          className="relative flex-shrink-0 rounded-lg overflow-hidden"
          style={{ width: 68, height: 68, background: '#191a1b' }}
        >
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photoUrl}
              alt={store.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ fontSize: 26, opacity: 0.3 }}
            >
              {emoji}
            </div>
          )}
          {store.is_new_open && (
            <span
              className="absolute top-1 left-1 text-white font-medium"
              style={{
                fontSize: 9, background: '#10b981',
                borderRadius: '50%', padding: '2px 5px',
                lineHeight: 1.4, letterSpacing: '0.02em',
              }}
            >
              NEW
            </span>
          )}
        </Link>

        {/* 店舗情報 */}
        <div className="flex-1 min-w-0 flex flex-col justify-center gap-1.5">

          {/* 店名 + タイプバッジ */}
          <div className="flex items-start gap-2">
            <Link
              href={`/stores/${store.id}`}
              className="flex-1 min-w-0"
            >
              <p
                className="truncate"
                style={{
                  fontSize: 15, fontWeight: 510, color: '#f7f8f8',
                  letterSpacing: '-0.165px', lineHeight: 1.4,
                }}
              >
                {store.name}
              </p>
            </Link>
            <span
              className="flex-shrink-0"
              style={{
                fontSize: 11, fontWeight: 510,
                padding: '2px 8px', borderRadius: 9999,
                background: tint.bg, color: tint.text,
                border: `1px solid ${tint.border}`,
                lineHeight: 1.5, letterSpacing: '-0.13px',
              }}
            >
              {label}
            </span>
          </div>

          {/* メタ情報 */}
          <div
            className="flex items-center gap-2.5 flex-wrap"
            style={{ fontSize: 12, color: '#8a8f98', lineHeight: 1 }}
          >
            <span className="flex items-center gap-1">
              <MapPin style={{ width: 11, height: 11 }} />
              {areaStr}
            </span>
            {budgetStr && (
              <span style={{ color: '#7170ff', fontWeight: 510 }}>{budgetStr}</span>
            )}
            {store.rating && (
              <span className="flex items-center gap-0.5">
                <Star style={{ width: 11, height: 11, fill: '#8a8f98' }} />
                {store.rating.toFixed(1)}
              </span>
            )}
            {distance != null && (
              <span
                className="flex items-center gap-0.5"
                style={{ color: '#27a644', fontWeight: 510 }}
              >
                📍 {formatDistance(distance)}
              </span>
            )}
          </div>
        </div>

        {/* お気に入りボタン */}
        <button
          onClick={e => { e.stopPropagation(); toggle(store.id); }}
          className="flex items-center justify-center flex-shrink-0 self-start mt-1"
          style={{ width: 28, height: 28 }}
        >
          <Heart
            style={{
              width: 16, height: 16,
              fill: isFav ? '#f472b6' : 'none',
              color: isFav ? '#f472b6' : '#3e3e44',
              transition: 'all 0.15s',
            }}
          />
        </button>
      </div>

      {/* ── アクション行 ── */}
      <div
        className="flex items-center gap-2 px-4 pb-3"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 10 }}
      >
        {store.instagram_handle && (
          <a
            href={`https://www.instagram.com/${store.instagram_handle.replace(/^@/, '')}/`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="ln-btn-ghost flex items-center gap-1.5"
            style={{ padding: '5px 11px', fontSize: 12 }}
          >
            <Instagram style={{ width: 12, height: 12 }} />
            Instagram
          </a>
        )}
        <div style={{ flex: 1 }} />
        {navUrl && (
          <a
            href={navUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="flex items-center gap-1.5"
            style={{
              padding: '6px 14px', fontSize: 12, fontWeight: 510,
              background: '#5e6ad2', color: '#fff',
              borderRadius: 7, letterSpacing: '-0.13px',
              lineHeight: 1,
            }}
          >
            <ExternalLink style={{ width: 11, height: 11 }} />
            今行く
          </a>
        )}
      </div>
    </div>
  );
}

// ── StoreList ────────────────────────────────────────────────
interface ListProps {
  stores: Restaurant[];
  distances?: Record<string, number>;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  cardRefs?: MutableRefObject<Record<string, HTMLDivElement>>;
}

export default function StoreList({ stores, distances, selectedId, onSelect, cardRefs }: ListProps) {
  if (stores.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <span style={{ fontSize: 36, opacity: 0.2 }}>🏮</span>
        <p style={{ fontSize: 14, color: '#62666d' }}>条件に合う店が見つかりません</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5 px-3 py-3">
      {stores.map(store => (
        <div
          key={store.id}
          ref={el => { if (el && cardRefs) cardRefs.current[store.id] = el; }}
        >
          <StoreCard
            store={store}
            distance={distances?.[store.id]}
            selected={store.id === selectedId}
            onSelect={onSelect ? () => onSelect(store.id) : undefined}
          />
        </div>
      ))}
    </div>
  );
}
