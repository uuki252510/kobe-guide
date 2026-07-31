'use client';

import Link from 'next/link';
import { ArrowRight, Check, MapPin, Plus, Star, X } from '@phosphor-icons/react';
import type { Restaurant } from '@/types/restaurant';
import StoreImage from '@/components/StoreImage';

export interface NearbyEntry { restaurant: Restaurant; distanceKm: number; }
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

const AREA_LABEL: Record<string, string> = { sannomiya: '三宮', motomachi: '元町', surroundings: '周辺', kitano: '北野', nankinmachi: '南京町' };

export default function StoreBottomSheet({ restaurant, distanceKm, inCourse, onClose, onAddToCourse, onRemoveFromCourse }: Props) {
  if (!restaurant) return null;
  const budget = restaurant.budget_max ? `〜¥${restaurant.budget_max.toLocaleString()}` : '予算は要確認';
  const distance = distanceKm == null ? null : distanceKm < 1 ? `${Math.round(distanceKm * 1000)}m` : `${distanceKm.toFixed(1)}km`;

  return (
    <section className="store-sheet" aria-labelledby="map-store-title">
      <StoreImage name={restaurant.name} photoReference={restaurant.photo_reference} className="store-sheet__image" eager />
      <div className="store-sheet__content">
        <div className="store-sheet__head"><div><p className="ui-kicker">SELECTED STORE</p><h2 id="map-store-title">{restaurant.name}</h2></div><button className="icon-button" type="button" onClick={onClose} aria-label="店舗情報を閉じる"><X size={18} aria-hidden="true" /></button></div>
        <div className="store-sheet__meta"><span><MapPin size={14} aria-hidden="true" />{AREA_LABEL[restaurant.area] ?? restaurant.area}</span><span>{budget}</span>{restaurant.rating ? <span><Star size={14} weight="fill" aria-hidden="true" />{restaurant.rating.toFixed(1)}</span> : null}{distance ? <span>{distance}</span> : null}</div>
        <div className="store-sheet__actions"><button className={`primary-button ${inCourse ? 'is-success' : ''}`} type="button" onClick={inCourse ? onRemoveFromCourse : onAddToCourse}>{inCourse ? <><Check size={18} aria-hidden="true" />追加済み</> : <><Plus size={18} aria-hidden="true" />コースへ</>}</button><Link className="secondary-button" href={`/stores/${restaurant.id}`}>詳細<ArrowRight size={17} aria-hidden="true" /></Link></div>
      </div>
    </section>
  );
}
