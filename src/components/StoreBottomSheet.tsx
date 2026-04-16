'use client';

import Link from 'next/link';
import { X, Star, MapPin, ChevronRight, Plus, Check } from 'lucide-react';
import type { Restaurant } from '@/types/restaurant';

const AREA_LABEL: Record<string, string> = {
  sannomiya: '三宮', motomachi: '元町', surroundings: '周辺',
  kitano: '北野', nankinmachi: '南京町',
};

const TYPE_LABEL: Record<string, string> = {
  tachinomi: '立ち飲み', kakuuchi: '角打ち', yakitori: '焼鳥',
  seafood: '海鮮', wine: 'ワイン', italian: 'イタリアン',
  hormones: 'ホルモン', bar: 'バー',
};

const GOLD = '#D4A842';
const GOLD_SOFT = '#B8903A';
const BG = '#0E0E10';
const BG_CARD = '#16161A';
const RULE = '#2A2A31';
const TEXT = '#F3ECDD';
const TEXT_MUTE = '#8E8A83';

function priceRangeStr(min: number | null, max: number | null): string {
  if (min && max) return `¥${min.toLocaleString()}-${max.toLocaleString()}`;
  if (max) return `〜¥${max.toLocaleString()}`;
  if (min) return `¥${min.toLocaleString()}〜`;
  return '価格未設定';
}

function distanceStr(distanceKm: number | null): string | null {
  if (distanceKm == null) return null;
  if (distanceKm < 1) return `${Math.round(distanceKm * 1000)}m`;
  return `${distanceKm.toFixed(1)}km`;
}

function photoUrlOf(r: Restaurant): string | null {
  return r.photo_reference
    ? `/api/photo?ref=${encodeURIComponent(r.photo_reference)}`
    : null;
}

export interface NearbyEntry {
  restaurant: Restaurant;
  distanceKm: number;
}

interface Props {
  restaurant: Restaurant | null;
  distanceKm: number | null;
  inCourse: boolean;
  nearby: NearbyEntry[];
  onClose: () => void;
  onAddToCourse: () => void;
  onRemoveFromCourse: () => void;
  onSelectNearby: (id: string) => void;
}

export default function StoreBottomSheet({
  restaurant, distanceKm, inCourse, nearby,
  onClose, onAddToCourse, onRemoveFromCourse, onSelectNearby,
}: Props) {
  const isOpen = !!restaurant;

  const photoUrl = restaurant ? photoUrlOf(restaurant) : null;

  const areaText = restaurant
    ? [
        AREA_LABEL[restaurant.area] ?? restaurant.area,
        restaurant.tachinomi_type ? TYPE_LABEL[restaurant.tachinomi_type] : null,
      ].filter(Boolean).join(' · ')
    : '';

  const dStr = distanceStr(distanceKm);

  return (
    <div
      className={`pointer-events-none fixed inset-x-0 bottom-14 z-[1100] transition-transform duration-300 ease-out ${
        isOpen ? 'translate-y-0' : 'translate-y-[110%]'
      }`}
      aria-hidden={!isOpen}
    >
      <div
        className="pointer-events-auto mx-auto w-full max-w-md relative"
        style={{
          background: BG,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          border: `1px solid ${RULE}`,
          boxShadow: '0 -10px 32px rgba(0,0,0,0.55)',
          overflow: 'hidden',
          color: TEXT,
        }}
      >
        <div className="flex justify-center pt-2 pb-0.5">
          <div style={{ width: 36, height: 3.5, borderRadius: 999, background: RULE }} />
        </div>

        <button
          onClick={onClose}
          aria-label="閉じる"
          className="absolute right-2.5 top-2 flex items-center justify-center"
          style={{
            width: 26, height: 26, borderRadius: 999,
            background: 'rgba(255,255,255,0.06)',
            color: TEXT,
            zIndex: 2,
          }}
        >
          <X className="w-3.5 h-3.5" />
        </button>

        {restaurant && (
          <>
            <div className="px-3 pt-2 pb-2.5 flex gap-3">
              <div
                className="relative flex-shrink-0 overflow-hidden"
                style={{ width: 92, height: 92, borderRadius: 12, background: BG_CARD }}
              >
                {photoUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={photoUrl}
                    alt={restaurant.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${BG_CARD} 0%, #1f1f26 100%)`,
                      color: GOLD_SOFT,
                      fontSize: 32,
                    }}
                  >
                    🏮
                  </div>
                )}
                {restaurant.is_new_open && (
                  <span
                    className="absolute top-1 left-1"
                    style={{
                      fontSize: 8.5, fontWeight: 800, letterSpacing: '0.14em',
                      padding: '2px 5px', background: GOLD, color: BG,
                      borderRadius: 999,
                    }}
                  >
                    NEW
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0 pr-6">
                <h2
                  className="truncate"
                  style={{ fontSize: 15, fontWeight: 800, letterSpacing: '-0.01em', lineHeight: 1.3 }}
                >
                  {restaurant.name}
                </h2>
                <div
                  className="flex items-center gap-1 mt-1 truncate"
                  style={{ color: TEXT_MUTE, fontSize: 11 }}
                >
                  <MapPin className="w-3 h-3 flex-shrink-0" style={{ color: GOLD }} />
                  <span className="truncate">{areaText || 'エリア情報なし'}</span>
                </div>

                <div className="flex items-center gap-3 mt-1.5 flex-wrap" style={{ fontSize: 12 }}>
                  <span style={{ color: GOLD, fontWeight: 700 }}>
                    {priceRangeStr(restaurant.budget_min, restaurant.budget_max)}
                  </span>
                  {restaurant.rating != null && (
                    <span className="flex items-center gap-0.5" style={{ color: TEXT }}>
                      <Star className="w-3 h-3" style={{ color: GOLD, fill: GOLD }} />
                      <span style={{ fontWeight: 700 }}>{restaurant.rating.toFixed(1)}</span>
                      {restaurant.user_ratings_total != null && (
                        <span style={{ color: TEXT_MUTE, fontSize: 10, marginLeft: 1 }}>
                          ({restaurant.user_ratings_total})
                        </span>
                      )}
                    </span>
                  )}
                  {dStr && (
                    <span style={{ color: TEXT_MUTE, fontSize: 11 }}>{dStr}</span>
                  )}
                </div>

                {restaurant.vibe_tags && restaurant.vibe_tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {restaurant.vibe_tags.slice(0, 2).map(tag => (
                      <span
                        key={tag}
                        style={{
                          fontSize: 9.5, padding: '1px 7px',
                          border: `1px solid ${RULE}`,
                          color: TEXT_MUTE,
                          borderRadius: 999,
                          letterSpacing: '0.02em',
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="px-3 pb-2 flex gap-2">
              <button
                onClick={inCourse ? onRemoveFromCourse : onAddToCourse}
                className="flex items-center justify-center gap-1 px-3"
                style={{
                  height: 36,
                  borderRadius: 10,
                  background: inCourse ? GOLD : 'transparent',
                  border: `1px solid ${inCourse ? GOLD : RULE}`,
                  color: inCourse ? BG : TEXT,
                  fontSize: 11, fontWeight: 700, letterSpacing: '0.04em',
                  flex: '0 0 auto',
                }}
              >
                {inCourse ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                {inCourse ? '追加済' : 'コース'}
              </button>
              <Link
                href={`/stores/${restaurant.id}`}
                className="flex-1 flex items-center justify-center gap-1"
                style={{
                  height: 36,
                  borderRadius: 10,
                  background: GOLD,
                  color: BG,
                  fontSize: 12, fontWeight: 800, letterSpacing: '0.06em',
                }}
              >
                詳細を見る
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {nearby.length > 0 && (
              <div className="pt-2 pb-3" style={{ borderTop: `1px solid ${RULE}` }}>
                <div
                  className="px-3 flex items-center justify-between mb-1.5"
                  style={{ color: TEXT_MUTE }}
                >
                  <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.2em' }}>
                    NEARBY
                  </span>
                  <span style={{ fontSize: 10 }}>近くの銘店</span>
                </div>
                <div
                  className="flex gap-2 overflow-x-auto scrollbar-hide px-3"
                  style={{ WebkitOverflowScrolling: 'touch' }}
                >
                  {nearby.map(({ restaurant: n, distanceKm: d }) => {
                    const thumb = photoUrlOf(n);
                    const label = distanceStr(d);
                    return (
                      <button
                        key={n.id}
                        onClick={() => onSelectNearby(n.id)}
                        className="flex-shrink-0 text-left"
                        style={{ width: 116 }}
                      >
                        <div
                          className="relative overflow-hidden"
                          style={{ width: '100%', height: 72, borderRadius: 10, background: BG_CARD }}
                        >
                          {thumb ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={thumb}
                              alt={n.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div
                              className="w-full h-full flex items-center justify-center"
                              style={{ color: GOLD_SOFT, fontSize: 22 }}
                            >
                              🏮
                            </div>
                          )}
                          {label && (
                            <span
                              className="absolute bottom-1 right-1"
                              style={{
                                fontSize: 9, fontWeight: 700,
                                padding: '1px 5px',
                                background: 'rgba(14,14,16,0.78)',
                                color: GOLD,
                                borderRadius: 6,
                                letterSpacing: '0.03em',
                              }}
                            >
                              {label}
                            </span>
                          )}
                        </div>
                        <div
                          className="mt-1 truncate"
                          style={{ fontSize: 11, fontWeight: 700, color: TEXT }}
                        >
                          {n.name}
                        </div>
                        <div
                          className="truncate"
                          style={{ fontSize: 10, color: TEXT_MUTE, marginTop: 1 }}
                        >
                          {AREA_LABEL[n.area] ?? n.area}
                          {n.budget_max ? ` · 〜¥${n.budget_max.toLocaleString()}` : ''}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
