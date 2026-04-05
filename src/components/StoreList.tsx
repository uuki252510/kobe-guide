'use client';

import Link from 'next/link';
import { Navigation, Instagram, MapPin, Star } from 'lucide-react';
import type { Restaurant } from '@/types/restaurant';

const TYPE_LABEL: Record<string, string> = {
  tachinomi: '立ち飲み', kakuuchi: '角打ち', yakitori: '焼鳥',
  seafood: '海鮮', wine: 'ワイン', italian: 'イタリアン',
  hormones: 'ホルモン', bar: 'バー',
};

const TYPE_EMOJI: Record<string, string> = {
  tachinomi: '🍺', kakuuchi: '🍶', yakitori: '🍢',
  seafood: '🐟', wine: '🍷', italian: '🍕',
  hormones: '🥩', bar: '🥂',
};

const AREA_LABEL: Record<string, string> = {
  sannomiya: '三宮', motomachi: '元町', surroundings: '周辺',
};

function StoreCard({ store, index }: { store: Restaurant; index: number }) {
  const type = store.tachinomi_type;
  const typeLabel = type ? (TYPE_LABEL[type] ?? '立ち飲み') : '立ち飲み';
  const emoji = type ? (TYPE_EMOJI[type] ?? '🏮') : '🏮';
  const photoUrl = store.photo_reference
    ? `/api/photo?ref=${encodeURIComponent(store.photo_reference)}`
    : null;
  const area = AREA_LABEL[store.area] ?? store.area;
  const budgetStr = store.budget_max ? `〜¥${store.budget_max.toLocaleString()}` : null;

  // 1枚目は大きく表示
  const isHero = index === 0;

  return (
    <div className="rounded-2xl overflow-hidden shadow-card-md bg-harbor-900 group">

      {/* ── 写真エリア（タップで詳細へ） ── */}
      <Link href={`/stores/${store.id}`} className="block relative" style={{ height: isHero ? '220px' : '168px' }}>

        {/* 写真 or 絵文字フォールバック */}
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoUrl}
            alt={store.name}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
            loading={index < 3 ? 'eager' : 'lazy'}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #161412 0%, #262220 100%)' }}>
            <span className="text-7xl opacity-15 select-none">{emoji}</span>
          </div>
        )}

        {/* グラデーションオーバーレイ */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* 上部バッジ */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
          <div className="flex items-center gap-1.5">
            {store.is_new_open && (
              <span className="text-[10px] bg-green-500 text-white font-bold px-2 py-0.5 rounded-full leading-none tracking-wide">
                NEW
              </span>
            )}
          </div>
          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-black/40 text-white/90 backdrop-blur-sm border border-white/20">
            {typeLabel}
          </span>
        </div>

        {/* 店舗情報（下部） */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-4">
          <h2 className={`text-white font-bold leading-tight drop-shadow-md ${isHero ? 'text-xl' : 'text-[17px]'}`}>
            {store.name}
          </h2>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="flex items-center gap-1 text-white/60 text-xs">
              <MapPin className="w-3 h-3" />
              {area}
            </span>
            {budgetStr && (
              <span className="text-kobe-amber text-xs font-semibold">{budgetStr}</span>
            )}
            {store.rating && (
              <span className="flex items-center gap-0.5 text-white/60 text-xs">
                <Star className="w-2.5 h-2.5 fill-white/60" />
                {store.rating.toFixed(1)}
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* ── アクションボタン（写真の外） ── */}
      {(store.instagram_handle || store.google_maps_url) && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-white border-t border-harbor-100">
          {store.instagram_handle && (
            <a
              href={`https://www.instagram.com/${store.instagram_handle.replace(/^@/, '')}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[11px] font-medium px-3 py-1.5 rounded-lg bg-harbor-50 text-harbor-600 border border-harbor-200 hover:bg-harbor-100 transition-colors"
            >
              <Instagram className="w-3 h-3" />
              Instagram
            </a>
          )}
          {store.google_maps_url && (
            <a
              href={store.google_maps_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[11px] font-medium px-3 py-1.5 rounded-lg bg-harbor-50 text-harbor-600 border border-harbor-200 hover:bg-harbor-100 transition-colors"
            >
              <Navigation className="w-3 h-3" />
              マップ
            </a>
          )}
        </div>
      )}
    </div>
  );
}

interface StoreListProps {
  stores: Restaurant[];
}

export default function StoreList({ stores }: StoreListProps) {
  if (stores.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <span className="text-5xl opacity-20">🏮</span>
        <p className="text-harbor-400 text-sm">条件に合う店が見つかりません</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 px-3 py-3">
      {stores.map((store, i) => (
        <StoreCard key={store.id} store={store} index={i} />
      ))}
    </div>
  );
}
