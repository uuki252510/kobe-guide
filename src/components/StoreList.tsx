'use client';

import type { MutableRefObject } from 'react';
import Link from 'next/link';
import { Instagram, Star, MapPin, Heart, ExternalLink } from 'lucide-react';
import type { Restaurant } from '@/types/restaurant';
import { useFavorites } from '@/hooks/useFavorites';
import { formatDistance } from '@/hooks/useLocation';

const TYPE_LABEL: Record<string, string> = {
  tachinomi: '立ち飲み', kakuuchi: '角打ち', yakitori: '焼鳥',
  seafood: '海鮮', wine: 'ワイン', italian: 'イタリアン',
  hormones: 'ホルモン', bar: 'バー',
};

// ライト版：淡い背景色 + 濃いめの文字色で可読性確保
const TYPE_TINT: Record<string, { bg: string; text: string; border: string }> = {
  kakuuchi:  { bg: '#F3EEFB', text: '#6D4AAF', border: '#DDD0F4' },
  wine:      { bg: '#FBECF3', text: '#AD3D77', border: '#F4D0E1' },
  seafood:   { bg: '#E9F1FB', text: '#2A63AE', border: '#CCDFF2' },
  yakitori:  { bg: '#FBF2E0', text: '#9A6A18', border: '#F1DDB0' },
  bar:       { bg: '#EFF2F5', text: '#4B5762', border: '#DDE2E8' },
  italian:   { bg: '#E6F4EB', text: '#1F7A45', border: '#C6E5D2' },
  hormones:  { bg: '#FBE9E9', text: '#B23333', border: '#F2C8C8' },
  tachinomi: { bg: '#FFF4DA', text: '#8F6F1E', border: '#F3DFAA' },
};

const TYPE_EMOJI: Record<string, string> = {
  tachinomi: '🍺', kakuuchi: '🍶', yakitori: '🍢',
  seafood: '🐟', wine: '🍷', italian: '🍕',
  hormones: '🥩', bar: '🥂',
};

const AREA_LABEL: Record<string, string> = {
  sannomiya: '三宮', motomachi: '元町', surroundings: '周辺',
};

// ── 生成り×墨パレット ────────────────────────────────────
const C = {
  surface:   '#FAF4E6',  // paper-light
  paper:     '#F3ECDD',  // paper
  border:    '#262220',  // ink（主罫線）
  borderSub: '#D5CBBE',  // 細罫
  textMain:  '#262220',
  textSub:   '#3D3832',
  textMute:  '#857E78',
  inkFill:   '#262220',
  inkOnPaper:'#FAF4E6',
  ratingStar:'#3D3832', // star fill — inkに寄せる
  green:     '#2E7D5B',
  pink:      '#B94A3B', // 朱色寄り
};

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

  const navUrl = store.lat && store.lng
    ? `https://www.google.com/maps/dir/?api=1&destination=${store.lat},${store.lng}&travelmode=walking`
    : store.google_maps_url ?? null;

  return (
    <div
      className="group overflow-hidden transition-colors duration-150"
      style={{
        borderRadius: 0,
        background: selected ? C.paper : C.surface,
        border: `1px solid ${C.border}`,
        borderLeftWidth: selected ? 4 : 1,
      }}
    >
      {/* メイン行 */}
      <div className="flex gap-3 px-4 py-3.5">

        {/* サムネイル */}
        <Link
          href={`/stores/${store.id}`}
          className="relative flex-shrink-0 overflow-hidden"
          style={{ width: 72, height: 72, background: C.borderSub, borderRadius: 0 }}
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
              style={{ fontSize: 28, opacity: 0.5 }}
            >
              {emoji}
            </div>
          )}
          {store.is_new_open && (
            <span
              className="absolute top-1 left-1 font-bold"
              style={{
                fontSize: 9, background: C.inkFill, color: C.inkOnPaper,
                borderRadius: 0, padding: '2px 5px',
                lineHeight: 1.4, letterSpacing: '0.1em',
              }}
            >
              NEW
            </span>
          )}
        </Link>

        {/* 店舗情報 */}
        <div className="flex-1 min-w-0 flex flex-col justify-center gap-1.5">

          <div className="flex items-start gap-2">
            <Link href={`/stores/${store.id}`} className="flex-1 min-w-0">
              <p
                className="truncate"
                style={{
                  fontSize: 15, fontWeight: 700, color: C.textMain,
                  letterSpacing: '-0.165px', lineHeight: 1.4,
                }}
              >
                {store.name}
              </p>
            </Link>
            <span
              className="flex-shrink-0"
              style={{
                fontSize: 11, fontWeight: 700,
                padding: '2px 8px', borderRadius: 0,
                background: 'transparent', color: tint.text,
                border: `1px solid ${tint.text}`,
                lineHeight: 1.5, letterSpacing: '0.04em',
              }}
            >
              {label}
            </span>
          </div>

          <div
            className="flex items-center gap-2.5 flex-wrap"
            style={{ fontSize: 12, color: C.textMute, lineHeight: 1 }}
          >
            <span className="flex items-center gap-1">
              <MapPin style={{ width: 11, height: 11 }} />
              {areaStr}
            </span>
            {budgetStr && (
              <span style={{ color: C.textMain, fontWeight: 700 }}>{budgetStr}</span>
            )}
            {store.rating && (
              <span className="flex items-center gap-0.5">
                <Star style={{ width: 11, height: 11, fill: C.ratingStar, color: C.ratingStar }} />
                <span style={{ color: C.textSub, fontWeight: 600 }}>{store.rating.toFixed(1)}</span>
              </span>
            )}
            {distance != null && (
              <span
                className="flex items-center gap-0.5"
                style={{ color: C.green, fontWeight: 600 }}
              >
                📍 {formatDistance(distance)}
              </span>
            )}
          </div>
        </div>

        {/* お気に入り */}
        <button
          onClick={e => { e.stopPropagation(); toggle(store.id); }}
          aria-label={isFav ? `${store.name}をお気に入りから外す` : `${store.name}をお気に入りに追加`}
          aria-pressed={isFav}
          className="flex items-center justify-center flex-shrink-0 self-start mt-1"
          style={{ width: 28, height: 28 }}
        >
          <Heart
            style={{
              width: 17, height: 17,
              fill: isFav ? C.pink : 'none',
              color: isFav ? C.pink : C.textMute,
              transition: 'fill 0.15s, color 0.15s',
            }}
            aria-hidden="true"
          />
        </button>
      </div>

      {/* アクション行 */}
      <div
        className="flex items-center gap-2 px-4 pb-3"
        style={{ borderTop: `1px solid ${C.borderSub}`, paddingTop: 10 }}
      >
        {store.instagram_handle && (
          <a
            href={`https://www.instagram.com/${store.instagram_handle.replace(/^@/, '')}/`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="flex items-center gap-1.5"
            style={{
              padding: '5px 11px', fontSize: 12, fontWeight: 600,
              color: C.textSub,
              background: 'transparent',
              border: `1px solid ${C.border}`,
              borderRadius: 0,
              letterSpacing: '0.02em',
            }}
          >
            <Instagram style={{ width: 12, height: 12 }} />
            Instagram
          </a>
        )}
        {onSelect && (
          <button
            type="button"
            onClick={onSelect}
            aria-pressed={!!selected}
            className="flex items-center gap-1.5"
            style={{
              padding: '5px 11px', fontSize: 12, fontWeight: 600,
              color: selected ? C.inkOnPaper : C.textSub,
              background: selected ? C.inkFill : 'transparent',
              border: `1px solid ${C.border}`,
              borderRadius: 0,
              letterSpacing: '0.02em',
            }}
          >
            <MapPin style={{ width: 12, height: 12 }} aria-hidden="true" />
            地図で表示
          </button>
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
              padding: '7px 16px', fontSize: 12, fontWeight: 700,
              background: C.inkFill, color: C.inkOnPaper,
              borderRadius: 0, letterSpacing: '0.06em',
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
        <span style={{ fontSize: 40, opacity: 0.3 }}>🏮</span>
        <p style={{ fontSize: 14, color: C.textMute }}>条件に合う店が見つかりません</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 px-3 py-3">
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
