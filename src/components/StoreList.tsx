'use client';

import Link from 'next/link';
import { Navigation, Instagram, MapPin } from 'lucide-react';
import type { Restaurant } from '@/types/restaurant';

const TYPE_LABEL: Record<string, string> = {
  tachinomi: '立ち飲み', kakuuchi: '角打ち', yakitori: '焼鳥',
  seafood: '海鮮', wine: 'ワイン', italian: 'イタリアン',
  hormones: 'ホルモン', bar: 'バー',
};

const TYPE_COLOR: Record<string, string> = {
  kakuuchi:  'bg-purple-50 text-purple-700 border-purple-200',
  wine:      'bg-pink-50 text-pink-700 border-pink-200',
  seafood:   'bg-blue-50 text-blue-700 border-blue-200',
  yakitori:  'bg-orange-50 text-orange-700 border-orange-200',
  bar:       'bg-slate-50 text-slate-700 border-slate-200',
  italian:   'bg-green-50 text-green-700 border-green-200',
  hormones:  'bg-red-50 text-red-700 border-red-200',
  tachinomi: 'bg-amber-50 text-amber-700 border-amber-200',
};

const AREA_LABEL: Record<string, string> = {
  sannomiya: '三宮', motomachi: '元町', surroundings: '周辺',
};

function StoreCard({ store }: { store: Restaurant }) {
  const typeLabel = store.tachinomi_type ? (TYPE_LABEL[store.tachinomi_type] ?? '立ち飲み') : '立ち飲み';
  const typeColor = store.tachinomi_type ? (TYPE_COLOR[store.tachinomi_type] ?? TYPE_COLOR.tachinomi) : TYPE_COLOR.tachinomi;
  const photoUrl = store.photo_reference ? `/api/photo?ref=${encodeURIComponent(store.photo_reference)}` : null;
  const budgetStr = store.budget_max ? `〜¥${store.budget_max.toLocaleString()}` : '';

  return (
    <div className="bg-white border border-harbor-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex">
        {/* 写真 */}
        <div className="w-24 h-24 flex-shrink-0 bg-harbor-100 relative">
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photoUrl}
              alt={store.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-harbor-900">
              <span className="text-3xl opacity-20 select-none">
                {store.tachinomi_type === 'wine' ? '🍷'
                  : store.tachinomi_type === 'seafood' ? '🐟'
                  : store.tachinomi_type === 'yakitori' ? '🍢'
                  : store.tachinomi_type === 'kakuuchi' ? '🍶'
                  : store.tachinomi_type === 'bar' ? '🥂'
                  : '🏮'}
              </span>
            </div>
          )}
          {store.is_new_open && (
            <span className="absolute top-1.5 left-1.5 text-[9px] bg-green-500 text-white font-bold px-1.5 py-0.5 rounded-full">
              NEW
            </span>
          )}
        </div>

        {/* 情報 */}
        <div className="flex-1 min-w-0 px-3 py-2.5">
          {/* 店名 + タイプバッジ */}
          <div className="flex items-start gap-2 mb-1">
            <p className="text-harbor-900 font-bold text-sm leading-tight flex-1 min-w-0 truncate">
              {store.name}
            </p>
            <span className={`flex-shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${typeColor}`}>
              {typeLabel}
            </span>
          </div>

          {/* エリア + 予算 */}
          <div className="flex items-center gap-2 mb-1.5">
            <span className="flex items-center gap-0.5 text-harbor-400 text-xs">
              <MapPin className="w-3 h-3" />
              {AREA_LABEL[store.area] ?? store.area}
            </span>
            {budgetStr && (
              <span className="text-kobe-gold font-bold text-xs">{budgetStr}</span>
            )}
            {store.rating && (
              <span className="text-harbor-400 text-xs">★ {store.rating.toFixed(1)}</span>
            )}
          </div>


          {/* アクションボタン */}
          <div className="flex items-center gap-1.5 mt-2">
            <Link
              href={`/stores/${store.id}`}
              className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 bg-harbor-100 text-harbor-700 rounded-full hover:bg-harbor-200 transition-colors"
            >
              詳細
            </Link>
            {store.instagram_handle && (
              <a
                href={`https://www.instagram.com/${store.instagram_handle.replace(/^@/, '')}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 bg-pink-50 text-pink-600 border border-pink-200 rounded-full hover:bg-pink-100 transition-colors"
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
                className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 bg-kobe-gold/10 text-kobe-gold border border-kobe-gold/30 rounded-full hover:bg-kobe-gold/20 transition-colors"
              >
                <Navigation className="w-3 h-3" />
                マップ
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface StoreListProps {
  stores: Restaurant[];
}

export default function StoreList({ stores }: StoreListProps) {
  if (stores.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <span className="text-5xl opacity-30">🏮</span>
        <p className="text-harbor-400 text-sm">条件に合う店が見つかりません</p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5 px-4 py-3">
      {stores.map(store => (
        <StoreCard key={store.id} store={store} />
      ))}
    </div>
  );
}
