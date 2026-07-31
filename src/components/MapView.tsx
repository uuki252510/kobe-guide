'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { CircleMarker, MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import {
  Check,
  Crosshair,
  MapTrifold,
  NavigationArrow,
  ShareNetwork,
  SpinnerGap,
  Trash,
  X,
} from '@phosphor-icons/react';
import { useCourse } from '@/hooks/useCourse';
import StoreBottomSheet from '@/components/StoreBottomSheet';
import type { CourseStore } from '@/hooks/useCourse';
import type { Restaurant } from '@/types/restaurant';
import 'leaflet/dist/leaflet.css';

type PinVariant = 'default' | 'course' | 'selected' | 'selected-course';

// 状態ごとの divIcon は不変なのでモジュールレベルでキャッシュし、再レンダー時の再生成を避ける
const pinCache = new Map<string, L.DivIcon>();
function pinIcon(variant: PinVariant, label = '') {
  const key = `${variant}:${label}`;
  const cached = pinCache.get(key);
  if (cached) return cached;
  const size = variant.startsWith('selected') ? 34 : variant === 'course' ? 28 : 22;
  const icon = L.divIcon({
    className: 'kg-pin-wrap',
    html: `<span class="kg-pin kg-pin--${variant}">${label}</span>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
  pinCache.set(key, icon);
  return icon;
}

function MapClickHandler({ onClick }: { onClick: () => void }) {
  useMapEvents({ click: onClick });
  return null;
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const radius = 6371;
  const latitude = (lat2 - lat1) * Math.PI / 180;
  const longitude = (lng2 - lng1) * Math.PI / 180;
  const value = Math.sin(latitude / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(longitude / 2) ** 2;
  return radius * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

function nearestNeighborRoute(startLat: number, startLng: number, stores: CourseStore[]) {
  const remaining = [...stores];
  const result: CourseStore[] = [];
  let latitude = startLat;
  let longitude = startLng;
  while (remaining.length) {
    let nearestIndex = 0;
    let nearestDistance = Infinity;
    remaining.forEach((store, index) => {
      if (!store.lat || !store.lng) return;
      const distance = haversineKm(latitude, longitude, store.lat, store.lng);
      if (distance < nearestDistance) { nearestDistance = distance; nearestIndex = index; }
    });
    const nearest = remaining.splice(nearestIndex, 1)[0];
    result.push(nearest);
    latitude = nearest.lat ?? latitude;
    longitude = nearest.lng ?? longitude;
  }
  return result;
}

export default function MapView() {
  const [stores, setStores] = useState<Restaurant[]>([]);
  const [area, setArea] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showCourse, setShowCourse] = useState(false);
  const [currentPos, setCurrentPos] = useState<{ lat: number; lng: number } | null>(null);
  const [optimizing, setOptimizing] = useState(false);
  const [optimized, setOptimized] = useState(false);
  const [shared, setShared] = useState(false);
  const { course, count, isInCourse, addStore, removeStore, clearCourse, reorderCourse, googleMapsRouteUrl } = useCourse();

  useEffect(() => {
    setLoading(true);
    setLoadError(false);
    fetch('/api/restaurants?limit=200')
      .then(response => {
        if (!response.ok) throw new Error('failed to load restaurants');
        return response.json();
      })
      .then(data => setStores((data.restaurants ?? []).filter((store: Restaurant) => store.lat && store.lng)))
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false));
  }, [attempt]);

  const displayed = useMemo(() => area ? stores.filter(store => store.area === area) : stores, [area, stores]);
  const courseIndex = useMemo(() => new Map(course.map((store, index) => [store.id, index])), [course]);
  const selected = selectedId ? stores.find(store => store.id === selectedId) ?? null : null;
  const selectedDistance = selected && currentPos && selected.lat && selected.lng ? haversineKm(currentPos.lat, currentPos.lng, selected.lat, selected.lng) : null;
  const routeUrl = googleMapsRouteUrl(currentPos ?? undefined) ?? googleMapsRouteUrl();

  const areas = [
    { value: '', label: 'すべて' },
    { value: 'sannomiya', label: '三宮' },
    { value: 'motomachi', label: '元町' },
    { value: 'surroundings', label: '周辺' },
  ];

  const locate = useCallback(() => {
    navigator.geolocation?.getCurrentPosition(position => setCurrentPos({ lat: position.coords.latitude, lng: position.coords.longitude }), () => setCurrentPos({ lat: 34.6951, lng: 135.1956 }), { timeout: 6000, maximumAge: 60000 });
  }, []);

  const shareCourse = useCallback(async () => {
    const url = `${window.location.origin}/course?s=${course.map(store => store.id).join(',')}`;
    const title = `神戸の立ち飲み ${course.length}軒のはしごコース`;
    try {
      // 共有シートがあればそちらを優先。無ければURLをコピーする
      if (navigator.share) await navigator.share({ title, url });
      else await navigator.clipboard.writeText(url);
      setShared(true);
      window.setTimeout(() => setShared(false), 2200);
    } catch {
      // 共有シートを閉じただけの場合も来るので、何も知らせない
    }
  }, [course]);

  const optimize = useCallback(() => {
    if (count < 2) return;
    setOptimizing(true);
    if (!navigator.geolocation) {
      const origin = { lat: 34.6951, lng: 135.1956 };
      setCurrentPos(origin);
      reorderCourse(nearestNeighborRoute(origin.lat, origin.lng, course).map(store => store.id));
      setOptimized(true); setOptimizing(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(position => {
      const origin = { lat: position.coords.latitude, lng: position.coords.longitude };
      setCurrentPos(origin);
      const ordered = nearestNeighborRoute(origin.lat, origin.lng, course);
      reorderCourse(ordered.map(store => store.id));
      setOptimized(true); setOptimizing(false);
    }, () => {
      const origin = { lat: 34.6951, lng: 135.1956 };
      setCurrentPos(origin);
      const ordered = nearestNeighborRoute(origin.lat, origin.lng, course);
      reorderCourse(ordered.map(store => store.id));
      setOptimized(true); setOptimizing(false);
    }, { timeout: 6000, maximumAge: 60000 });
  }, [count, course, reorderCourse]);

  return (
    <div className="map-page">
      <header className="map-toolbar">
        <div className="map-toolbar__top"><div><p className="ui-kicker">STEP 03</p><h1>地図とコース</h1></div></div>
        <div className="map-toolbar__areas" aria-label="エリア">
          {areas.map(item => <button key={item.value || 'all'} type="button" className={`filter-chip ${area === item.value ? 'is-active' : ''}`} onClick={() => { setArea(item.value); setSelectedId(null); }} aria-pressed={area === item.value}>{item.label}</button>)}
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button className={`icon-button ${currentPos ? 'is-active' : ''}`} type="button" onClick={locate} aria-label="現在地を取得"><Crosshair size={19} aria-hidden="true" /></button>
          <button className={`secondary-button ${showCourse ? 'is-active' : ''}`} type="button" onClick={() => setShowCourse(value => !value)} aria-expanded={showCourse}><MapTrifold size={19} aria-hidden="true" />コース {count}店</button>
        </div>
      </header>

      <div className="map-canvas">
        {loading ? <div className="store-loading"><span className="loading-inline"><SpinnerGap size={21} className="spin" aria-hidden="true" />地図を読み込んでいます…</span></div> : loadError ? (
          <div className="store-empty"><div><h2>店舗情報を読み込めませんでした</h2><p>通信状態を確認して、もう一度お試しください。</p><button className="primary-button" style={{ marginTop: 16 }} type="button" onClick={() => setAttempt(value => value + 1)}>再読み込み</button></div></div>
        ) : (
          <MapContainer center={[34.6938, 135.1962]} zoom={15} zoomControl={false}>
            <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <MapClickHandler onClick={() => setSelectedId(null)} />
            {displayed.map(store => {
              const orderIndex = courseIndex.get(store.id);
              const inCourse = orderIndex != null;
              const isSelected = selectedId === store.id;
              const variant: PinVariant = isSelected ? (inCourse ? 'selected-course' : 'selected') : inCourse ? 'course' : 'default';
              const label = inCourse ? String(orderIndex + 1) : '';
              return <Marker key={store.id} position={[store.lat!, store.lng!]} icon={pinIcon(variant, label)} zIndexOffset={isSelected ? 1000 : inCourse ? 500 : 0} eventHandlers={{ click: () => { setSelectedId(store.id); setShowCourse(false); } }} />;
            })}
            {currentPos ? <CircleMarker center={[currentPos.lat, currentPos.lng]} radius={7} pathOptions={{ color: '#fff', weight: 3, fillColor: '#5265ff', fillOpacity: 1 }} /> : null}
          </MapContainer>
        )}
        {!loading && !loadError ? <div className="map-count">{displayed.length} STORES</div> : null}

        {showCourse ? (
          <section className="course-panel" aria-labelledby="course-title">
            <div className="course-panel__head"><div><p className="ui-kicker">YOUR COURSE</p><h2 id="course-title">今夜のはしご {count}店</h2></div><button className="icon-button" type="button" onClick={() => setShowCourse(false)} aria-label="コースを閉じる"><X size={19} aria-hidden="true" /></button></div>
            {count ? <div className="course-list">{course.map((store, index) => <div className="course-item" key={store.id}><span className="course-item__number">{String(index + 1).padStart(2, '0')}</span><div><strong>{store.name}</strong><small>{store.budget_max ? `〜¥${store.budget_max.toLocaleString()}` : '予算は要確認'}</small></div><button className="icon-button is-danger" type="button" onClick={() => removeStore(store.id)} aria-label={`${store.name}をコースから削除`}><X size={17} aria-hidden="true" /></button></div>)}</div> : <div className="store-empty" style={{ minHeight: 180 }}><div><h2>まだ店がありません</h2><p>地図のピンか店舗一覧から追加できます。</p></div></div>}
            {count ? <div className="course-panel__actions">{count >= 2 ? <button className={`secondary-button ${optimized ? 'is-active' : ''}`} type="button" onClick={optimize} disabled={optimizing}>{optimizing ? <><SpinnerGap size={18} className="spin" aria-hidden="true" />並べ替え中…</> : optimized ? <><Check size={18} aria-hidden="true" />近い順に並べました</> : <><Crosshair size={18} aria-hidden="true" />現在地から近い順へ</>}</button> : null}<div className="course-panel__actions-row">{routeUrl ? <a className="primary-button" href={routeUrl} target="_blank" rel="noopener noreferrer"><NavigationArrow size={18} aria-hidden="true" />Googleマップで開始</a> : null}<button className={`icon-button ${shared ? 'is-active' : ''}`} type="button" onClick={shareCourse} aria-label={shared ? 'コースのリンクを共有しました' : 'コースを共有'}>{shared ? <Check size={19} aria-hidden="true" /> : <ShareNetwork size={19} aria-hidden="true" />}</button><button className="icon-button is-danger" type="button" onClick={() => { clearCourse(); setOptimized(false); }} aria-label="コースをすべて削除"><Trash size={19} aria-hidden="true" /></button></div></div> : null}
          </section>
        ) : (
          <StoreBottomSheet restaurant={selected} distanceKm={selectedDistance} inCourse={selected ? isInCourse(selected.id) : false} nearby={[]} onClose={() => setSelectedId(null)} onAddToCourse={() => { if (selected) addStore(selected); }} onRemoveFromCourse={() => { if (selected) removeStore(selected.id); }} onSelectNearby={setSelectedId} />
        )}
      </div>
    </div>
  );
}
