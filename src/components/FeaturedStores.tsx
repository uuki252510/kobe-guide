'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MapPin, Star, Sparkles } from 'lucide-react';
import type { Restaurant } from '@/types/restaurant';

const C = {
  surface:   '#FAF4E6',
  paper:     '#F3ECDD',
  border:    '#262220',
  borderSub: '#D5CBBE',
  textMain:  '#262220',
  textSub:   '#3D3832',
  textMute:  '#857E78',
  inkFill:   '#262220',
  inkOnPaper:'#FAF4E6',
  ratingStar:'#3D3832',
  green:     '#2E7D5B',
};

const AREA_LABEL: Record<string, string> = {
  sannomiya: '三宮', motomachi: '元町', surroundings: '周辺',
  kitano: '北野', nankinmachi: '南京町',
};

const TYPE_EMOJI: Record<string, string> = {
  tachinomi: '🍺', kakuuchi: '🍶', yakitori: '🍢',
  seafood: '🐟', wine: '🍷', italian: '🍕',
  hormones: '🥩', bar: '🥂',
};

interface SectionProps {
  title: string;
  subtitle?: string;
  params: string;
  icon?: React.ReactNode;
  weeklyShuffle?: boolean;
}

function isoWeekSeed(d: Date): number {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return date.getUTCFullYear() * 100 + week;
}

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const result = [...arr];
  let s = seed;
  for (let i = result.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function StoreMiniCard({ store }: { store: Restaurant }) {
  const photoUrl = store.photo_reference
    ? `/api/photo?ref=${encodeURIComponent(store.photo_reference)}`
    : null;
  const emoji  = store.tachinomi_type ? (TYPE_EMOJI[store.tachinomi_type] ?? '🏮') : '🏮';
  const area   = AREA_LABEL[store.area] ?? store.area;
  const budget = store.budget_max ? `〜¥${store.budget_max.toLocaleString()}` : null;

  return (
    <Link
      href={`/stores/${store.id}`}
      className="flex-shrink-0 block"
      style={{
        width: 168,
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: 0,
        overflow: 'hidden',
      }}
    >
      <div style={{ width: '100%', aspectRatio: '4 / 3', background: C.borderSub, position: 'relative' }}>
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photoUrl} alt={store.name} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ fontSize: 40, opacity: 0.4 }}>
            {emoji}
          </div>
        )}
        {store.is_new_open && (
          <span
            className="absolute top-2 left-2 font-bold"
            style={{
              fontSize: 9, background: C.inkFill, color: C.inkOnPaper,
              borderRadius: 0, padding: '2px 6px',
              letterSpacing: '0.1em',
            }}
          >
            NEW
          </span>
        )}
      </div>
      <div className="px-3 py-2.5">
        <p
          className="truncate"
          style={{ fontSize: 13, fontWeight: 700, color: C.textMain, letterSpacing: '-0.16px' }}
        >
          {store.name}
        </p>
        <div
          className="flex items-center gap-2 mt-1"
          style={{ fontSize: 11, color: C.textMute }}
        >
          <span className="flex items-center gap-0.5">
            <MapPin style={{ width: 10, height: 10 }} />
            {area}
          </span>
          {store.rating != null && (
            <span className="flex items-center gap-0.5">
              <Star style={{ width: 10, height: 10, fill: C.ratingStar, color: C.ratingStar }} />
              {store.rating.toFixed(1)}
            </span>
          )}
        </div>
        {budget && (
          <p style={{ fontSize: 11, color: C.textMain, fontWeight: 700, marginTop: 2 }}>
            {budget}
          </p>
        )}
      </div>
    </Link>
  );
}

function StoreRow({ title, subtitle, params, icon, weeklyShuffle }: SectionProps) {
  const [stores, setStores] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchLimit = weeklyShuffle ? 24 : 8;
    fetch(`/api/restaurants?${params}&limit=${fetchLimit}`)
      .then(r => r.json())
      .then(d => {
        if (cancelled) return;
        const pool: Restaurant[] = d.restaurants ?? [];
        if (weeklyShuffle && pool.length > 8) {
          setStores(seededShuffle(pool, isoWeekSeed(new Date())).slice(0, 8));
        } else {
          setStores(pool);
        }
      })
      .catch(() => {
        if (!cancelled) setStores([]);
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [params, weeklyShuffle]);

  if (!loading && stores.length === 0) return null;

  return (
    <section className="px-4">
      <div className="flex items-end justify-between mb-2">
        <div>
          <div className="flex items-center gap-1.5">
            {icon}
            <h2 style={{ fontSize: 15, fontWeight: 700, color: C.textMain, letterSpacing: '-0.2px' }}>
              {title}
            </h2>
          </div>
          {subtitle && (
            <p style={{ fontSize: 11, color: C.textMute, marginTop: 2 }}>{subtitle}</p>
          )}
        </div>
        <Link
          href={`/stores?${params}`}
          style={{ fontSize: 11, color: C.textMain, fontWeight: 700, letterSpacing: '0.04em' }}
        >
          すべて見る →
        </Link>
      </div>

      {loading ? (
        <div className="flex gap-2.5 overflow-hidden">
          {[1, 2, 3].map(i => (
            <div
              key={i}
              style={{
                width: 168, height: 180,
                background: C.borderSub,
                borderRadius: 0,
                animation: 'pulse 1.5s ease-in-out infinite',
              }}
            />
          ))}
        </div>
      ) : (
        <div className="flex gap-2.5 overflow-x-auto scrollbar-hide pb-1" style={{ marginRight: -16, paddingRight: 16 }}>
          {stores.map(s => <StoreMiniCard key={s.id} store={s} />)}
        </div>
      )}
    </section>
  );
}

export default function FeaturedStores() {
  return (
    <div className="flex flex-col gap-5 py-4">
      <StoreRow
        title="今週のおすすめ"
        subtitle="優先度上位から毎週ピックアップ"
        params="sort=priority"
        icon={<Sparkles style={{ width: 14, height: 14, color: C.textMain }} />}
        weeklyShuffle
      />
      <StoreRow
        title="新しくオープン"
        subtitle="最近できた注目店"
        params="is_new_open=true"
        icon={<span style={{ fontSize: 14 }}>✨</span>}
      />
      <StoreRow
        title="角打ち"
        subtitle="酒屋の立ち飲み"
        params="tachinomi_type=kakuuchi"
        icon={<span style={{ fontSize: 14 }}>🍶</span>}
      />
      <StoreRow
        title="ワインバー"
        subtitle="ワインを立ち飲みで"
        params="tachinomi_type=wine"
        icon={<span style={{ fontSize: 14 }}>🍷</span>}
      />
    </div>
  );
}
