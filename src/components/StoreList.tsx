'use client';

import type { MutableRefObject } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  BookmarkSimple,
  Check,
  MapPin,
  NavigationArrow,
  Plus,
  Star,
} from '@phosphor-icons/react';
import type { Restaurant } from '@/types/restaurant';
import { useFavorites } from '@/hooks/useFavorites';
import { useVisited } from '@/hooks/useVisited';
import { useCourse } from '@/hooks/useCourse';
import { formatDistance } from '@/hooks/useLocation';
import StoreImage from '@/components/StoreImage';
import { CLOSING_SOON_MINUTES, getOpenState } from '@/lib/opening-hours';

const TYPE_LABEL: Record<string, string> = {
  tachinomi: '立ち飲み', kakuuchi: '角打ち', yakitori: '焼鳥', seafood: '海鮮', wine: 'ワイン', italian: 'イタリアン', hormones: 'ホルモン', bar: 'バー',
};
const AREA_LABEL: Record<string, string> = { sannomiya: '三宮', motomachi: '元町', surroundings: '周辺', kitano: '北野', nankinmachi: '南京町' };

/** 営業状況は保存済みの openNow ではなく、periods から表示のたびに計算する */
function OpenBadge({ store }: { store: Restaurant }) {
  // 一時休業中の店は営業時間どおりでも開いていない
  if (store.business_status === 'CLOSED_TEMPORARILY') return <span className="store-badge store-badge--closed">休業中</span>;
  const { open, closesInMinutes } = getOpenState(store.opening_hours_json);
  if (open === null) return null;
  if (!open) return <span className="store-badge store-badge--closed">営業時間外</span>;
  if (closesInMinutes != null && closesInMinutes <= CLOSING_SOON_MINUTES) {
    return <span className="store-badge store-badge--soon">あと{closesInMinutes}分で閉店</span>;
  }
  return <span className="store-badge store-badge--open">営業中</span>;
}

interface CardProps {
  store: Restaurant;
  distance?: number;
  selected?: boolean;
  onSelect?: () => void;
}

function StoreCard({ store, distance, selected, onSelect }: CardProps) {
  const { toggle, has } = useFavorites();
  const { toggle: toggleVisited, has: hasVisited } = useVisited();
  const { toggleStore, isInCourse } = useCourse();
  const favorite = has(store.id);
  const visited = hasVisited(store.id);
  const inCourse = isInCourse(store.id);
  const area = AREA_LABEL[store.area] ?? store.area;
  const type = store.tachinomi_type ? TYPE_LABEL[store.tachinomi_type] ?? '立ち飲み' : '立ち飲み';
  const budget = store.budget_max ? `〜¥${store.budget_max.toLocaleString()}` : '予算は要確認';
  const navUrl = store.lat && store.lng ? `https://www.google.com/maps/dir/?api=1&destination=${store.lat},${store.lng}&travelmode=walking` : store.google_maps_url;
  const reason = store.must_try_menu ? `名物「${store.must_try_menu}」を目当てに立ち寄りたい一軒。` : store.vibe_tags?.length ? `${store.vibe_tags.slice(0, 2).map(tag => tag.replace(/-/g, ' ')).join('・')}な雰囲気。` : '気軽に立ち寄れて、神戸らしい夜を楽しめる一軒。';

  return (
    <article className={`store-card ${selected ? 'is-selected' : ''} ${visited ? 'is-visited' : ''}`}>
      <div className="store-card__media">
        <Link href={`/stores/${store.id}`} aria-label={`${store.name}の詳細を見る`}>
          <StoreImage name={store.name} photoReference={store.photo_reference} />
        </Link>
        <div className="store-card__badges"><OpenBadge store={store} /><span className="store-badge">{type}</span>{store.is_new_open ? <span className="store-badge store-badge--new">NEW</span> : null}</div>
        <div className="store-card__marks">
          <button className={`icon-button ${visited ? 'is-visited' : ''}`} type="button" onClick={() => toggleVisited(store.id)} title={visited ? '行った店' : '行ったことにする'} aria-label={visited ? `${store.name}を「行った」から外す` : `${store.name}を「行った」に記録`} aria-pressed={visited}><Check size={19} weight="bold" aria-hidden="true" /></button>
          <button className={`icon-button ${favorite ? 'is-active' : ''}`} type="button" onClick={() => toggle(store.id)} aria-label={favorite ? `${store.name}の保存を解除` : `${store.name}を保存`} aria-pressed={favorite}><BookmarkSimple size={20} weight={favorite ? 'fill' : 'regular'} aria-hidden="true" /></button>
        </div>
      </div>

      <div className="store-card__content">
        <div className="store-card__title-row">
          <h2><Link href={`/stores/${store.id}`}>{store.name}</Link></h2>
          {store.rating ? <span className="store-card__rating"><Star size={15} weight="fill" aria-hidden="true" />{store.rating.toFixed(1)}{store.user_ratings_total ? <small>({store.user_ratings_total.toLocaleString()})</small> : null}</span> : null}
        </div>
        <div className="store-card__meta"><span><MapPin size={15} aria-hidden="true" />{area}</span><span>{budget}</span>{distance != null ? <span><NavigationArrow size={14} aria-hidden="true" />{formatDistance(distance)}</span> : null}</div>
        <p className="store-card__reason">{reason}</p>
        <div className="store-card__actions">
          <button className={`primary-button ${inCourse ? 'is-success' : ''}`} type="button" onClick={() => toggleStore(store)}>{inCourse ? <><Check size={18} aria-hidden="true" />コース追加済み</> : <><Plus size={18} aria-hidden="true" />コースへ</>}</button>
          {onSelect ? <button className="icon-button" type="button" onClick={onSelect} title="地図で表示" aria-label={`${store.name}を地図で表示`}><MapPin size={19} aria-hidden="true" /></button> : null}
          {navUrl ? <a className="icon-button" href={navUrl} target="_blank" rel="noopener noreferrer" title="経路を開く" aria-label={`${store.name}への経路を開く`}><NavigationArrow size={19} aria-hidden="true" /></a> : null}
          <Link className="secondary-button store-card__detail" href={`/stores/${store.id}`}>詳細<ArrowRight size={15} aria-hidden="true" /></Link>
        </div>
      </div>
    </article>
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
  if (!stores.length) return <div className="store-empty"><div><h2>条件に合う店がありません</h2><p>エリアか条件をひとつ外すと、候補が見つかりやすくなります。</p></div></div>;
  return (
    <div className="store-list">
      {stores.map(store => <div key={store.id} ref={element => { if (element && cardRefs) cardRefs.current[store.id] = element; }}><StoreCard store={store} distance={distances?.[store.id]} selected={store.id === selectedId} onSelect={onSelect ? () => onSelect(store.id) : undefined} /></div>)}
    </div>
  );
}
