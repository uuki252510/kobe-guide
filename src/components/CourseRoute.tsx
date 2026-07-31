'use client';

import { useEffect, useMemo } from 'react';
import { Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Check, Clock, CurrencyJpy, Footprints, X } from '@phosphor-icons/react';
import type { Restaurant } from '@/types/restaurant';
import { haversineKm } from '@/hooks/useLocation';
import { storePhotoUrl } from '@/components/StoreImage';

const AREA_LABEL: Record<string, string> = { sannomiya: '三宮', motomachi: '元町', surroundings: '周辺', kitano: '北野', nankinmachi: '南京町' };
/** 徒歩の速さ(km/分)と、1軒あたりの滞在目安(分) */
const WALK_KM_PER_MIN = 0.08;
const STAY_MINUTES = 40;

export interface RouteStats {
  walkMinutes: number;
  totalMinutes: number;
  budget: number;
}

export function useRouteStats(stores: Restaurant[]): RouteStats {
  return useMemo(() => {
    let km = 0;
    for (let i = 1; i < stores.length; i++) {
      const from = stores[i - 1];
      const to = stores[i];
      if (from.lat && from.lng && to.lat && to.lng) km += haversineKm(from.lat, from.lng, to.lat, to.lng);
    }
    const walkMinutes = Math.round(km / WALK_KM_PER_MIN);
    return {
      walkMinutes,
      totalMinutes: walkMinutes + stores.length * STAY_MINUTES,
      budget: stores.reduce((sum, store) => sum + (store.budget_max ?? store.budget_min ?? 0), 0),
    };
  }, [stores]);
}

function durationLabel(minutes: number) {
  if (minutes < 60) return `約${minutes}分`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (rest < 15) return `約${hours}時間`;
  if (rest < 45) return `約${hours}時間半`;
  return `約${hours + 1}時間`;
}

function pinIcon(store: Restaurant, index: number, active: boolean) {
  const photo = storePhotoUrl(store.name, store.photo_reference);
  const number = String(index + 1).padStart(2, '0');
  return L.divIcon({
    className: 'route-pin-wrap',
    html: `<span class="route-pin ${active ? 'is-active' : ''}">
      <span class="route-pin__card">
        <img src="${photo}" alt="" loading="lazy" />
        <span class="route-pin__no">${number}</span>
        <span class="route-pin__name">${store.name.replace(/[<>&"]/g, '')}</span>
      </span>
      <span class="route-pin__dot"></span>
    </span>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}

/** MapContainer の内側に置くレイヤー(経路線・番号付きピン・自動フィット) */
export function CourseRouteLayers({ stores, activeId, onSelect }: { stores: Restaurant[]; activeId: string | null; onSelect: (id: string) => void }) {
  const map = useMap();
  const points = useMemo(
    () => stores.filter(store => store.lat && store.lng).map(store => [store.lat!, store.lng!] as [number, number]),
    [stores],
  );
  const fitKey = points.map(point => point.join(',')).join('|');

  useEffect(() => {
    if (!points.length) return;
    // 上の統計バーと下のカードに隠れないよう、その分を余白として確保して合わせる
    const narrow = map.getSize().x < 680;
    const padTop: [number, number] = narrow ? [24, 190] : [40, 130];
    const padBottom: [number, number] = narrow ? [24, 260] : [40, 190];
    if (points.length === 1) {
      map.fitBounds(L.latLngBounds([points[0], points[0]]), { paddingTopLeft: padTop, paddingBottomRight: padBottom, animate: false, maxZoom: 16 });
      return;
    }
    map.fitBounds(L.latLngBounds(points), { paddingTopLeft: padTop, paddingBottomRight: padBottom, animate: false, maxZoom: 16 });
  }, [fitKey, map, points]);

  return (
    <>
      {points.length > 1 ? (
        <>
          <Polyline positions={points} pathOptions={{ color: '#ffffff', weight: 9, opacity: .9, lineCap: 'round', lineJoin: 'round' }} />
          <Polyline positions={points} pathOptions={{ color: '#2437d8', weight: 5, dashArray: '2 9', lineCap: 'round' }} />
        </>
      ) : null}
      {stores.map((store, index) => store.lat && store.lng ? (
        <Marker
          key={store.id}
          position={[store.lat, store.lng]}
          icon={pinIcon(store, index, store.id === activeId)}
          zIndexOffset={store.id === activeId ? 1000 : index}
          eventHandlers={{ click: () => onSelect(store.id) }}
        />
      ) : null)}
    </>
  );
}

interface OverlayProps {
  stores: Restaurant[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onClose: () => void;
  isVisited: (id: string) => boolean;
  onToggleVisited: (id: string) => void;
}

/** 地図の上に重ねる操作系 */
export function CourseRouteOverlay({ stores, activeId, onSelect, onClose, isVisited, onToggleVisited }: OverlayProps) {
  const stats = useRouteStats(stores);
  const active = stores.find(store => store.id === activeId) ?? stores[0];
  const activeIndex = stores.findIndex(store => store.id === active?.id);
  const areas = [...new Set(stores.map(store => AREA_LABEL[store.area] ?? store.area))];

  if (!active) return null;
  const visited = isVisited(active.id);

  return (
    <div className="route-ui">
      <div className="route-ui__top">
        <p className="route-badge"><span className="route-badge__dot" aria-hidden="true" />LIVE MAP</p>
        <div className="route-ui__top-right">
          <p className="route-areas">{areas.join(' — ')}</p>
          <button className="icon-button route-close" type="button" onClick={onClose} aria-label="コース表示を閉じる"><X size={18} aria-hidden="true" /></button>
        </div>
      </div>

      <dl className="route-stats">
        <div><dt><Footprints size={17} aria-hidden="true" /></dt><dd><strong>{stats.walkMinutes}分</strong> 徒歩</dd></div>
        <div><dt><Clock size={17} aria-hidden="true" /></dt><dd><strong>{durationLabel(stats.totalMinutes)}</strong> で{stores.length}軒</dd></div>
        {stats.budget ? <div><dt><CurrencyJpy size={17} aria-hidden="true" /></dt><dd><strong>{stats.budget.toLocaleString()}円</strong> 目安</dd></div> : null}
      </dl>

      <ol className="route-stops" aria-label="コースの順番">
        {stores.map((store, index) => (
          <li key={store.id}>
            <button type="button" className={`route-stop ${store.id === active.id ? 'is-active' : ''} ${isVisited(store.id) ? 'is-visited' : ''}`} onClick={() => onSelect(store.id)} aria-current={store.id === active.id ? 'true' : undefined}>
              <span className="route-stop__no">{isVisited(store.id) ? <Check size={13} weight="bold" aria-hidden="true" /> : String(index + 1).padStart(2, '0')}</span>
              <span className="route-stop__name">{store.name}</span>
            </button>
          </li>
        ))}
      </ol>

      <div className="route-card">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={storePhotoUrl(active.name, active.photo_reference)} alt="" className="route-card__image" />
        <div className="route-card__body">
          <p className="ui-kicker">STOP {String(activeIndex + 1).padStart(2, '0')}</p>
          <h2>{active.name}</h2>
          <p className="route-card__meta">{AREA_LABEL[active.area] ?? active.area}{active.budget_max ? ` ・ ¥${(active.budget_min ?? 0).toLocaleString()}–${active.budget_max.toLocaleString()}` : ''}</p>
        </div>
        <button
          className={`route-check ${visited ? 'is-visited' : ''}`}
          type="button"
          onClick={() => onToggleVisited(active.id)}
          aria-pressed={visited}
          aria-label={visited ? `${active.name}を「行った」から外す` : `${active.name}に行ったことにする`}
        >
          <Check size={26} weight="bold" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
