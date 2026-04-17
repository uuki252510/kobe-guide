'use client';

import { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Navigation, Trash2, Check, X, ChevronUp, Locate } from 'lucide-react';
import Image from 'next/image';
import { useCourse } from '@/hooks/useCourse';
import BottomNav from '@/components/BottomNav';
import StoreBottomSheet from '@/components/StoreBottomSheet';
import type { CourseStore } from '@/hooks/useCourse';
import type { Restaurant } from '@/types/restaurant';
import 'leaflet/dist/leaflet.css';

delete (L.Icon.Default.prototype as L.Icon.Default & { _getIconUrl?: () => void })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const C = {
  paper:      '#F3ECDD',
  surface:    '#FAF4E6',
  ink:        '#262220',
  inkSoft:    '#3D3832',
  mute:       '#857E78',
  rule:       '#D5CBBE',
  accent:     '#B94A3B',
  green:      '#2E7D5B',
  inkOnPaper: '#FAF4E6',
};

const TYPE_EMOJI: Record<string, string> = {
  tachinomi: '🍺', kakuuchi: '🍶', yakitori: '🍢',
  seafood: '🐟', wine: '🍷', italian: '🍕',
  hormones: '🥩', bar: '🥂',
};

const GOLD = '#D4A842';
const DARK = '#0E0E10';
const PAPER = '#F3ECDD';

function createPin(emoji: string, inCourse: boolean, isNew: boolean, selected: boolean) {
  const size = selected ? 38 : 30;
  const bg = selected ? GOLD : DARK;
  const ring = selected ? DARK : GOLD;
  const emojiSize = selected ? 17 : 14;
  const shadow = selected
    ? '0 3px 12px rgba(0,0,0,0.5), 0 0 0 4px rgba(212,168,66,0.22)'
    : '0 2px 6px rgba(0,0,0,0.38)';
  const statusColor = isNew ? '#6BBF73' : inCourse ? '#C76B60' : null;
  const statusDot = statusColor
    ? `<span style="
        position:absolute;top:-2px;right:-2px;
        width:9px;height:9px;border-radius:999px;
        background:${statusColor};border:1.5px solid ${DARK};
      "></span>`
    : '';
  return L.divIcon({
    className: '',
    html: `<div style="
      position:relative;
      width:${size}px;height:${size}px;
      border-radius:999px;
      background:${bg};
      border:2px solid ${ring};
      box-shadow:${shadow};
      display:flex;align-items:center;justify-content:center;
      font-size:${emojiSize}px;
      line-height:1;
      transition:all 160ms ease;
      filter:${selected ? 'saturate(1)' : 'saturate(0.85)'};
    ">${emoji}${statusDot}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2 - 2],
  });
}

function MapClickHandler({ onClick }: { onClick: () => void }) {
  useMapEvents({ click: onClick });
  return null;
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function nearestNeighborRoute(
  startLat: number,
  startLng: number,
  stores: CourseStore[],
): CourseStore[] {
  const remaining = [...stores];
  const result: CourseStore[] = [];
  let curLat = startLat;
  let curLng = startLng;
  while (remaining.length > 0) {
    let nearestIdx = 0;
    let nearestDist = Infinity;
    remaining.forEach((s, i) => {
      if (!s.lat || !s.lng) return;
      const d = haversineKm(curLat, curLng, s.lat, s.lng);
      if (d < nearestDist) { nearestDist = d; nearestIdx = i; }
    });
    const nearest = remaining.splice(nearestIdx, 1)[0];
    result.push(nearest);
    curLat = nearest.lat ?? curLat;
    curLng = nearest.lng ?? curLng;
  }
  return result;
}

function LinePulse({ label = '読み込み中' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span
        className="inline-block animate-pulse"
        style={{ width: 40, height: 1, background: C.ink }}
      />
      <span style={{ fontSize: 10, color: C.mute, letterSpacing: '0.2em' }}>
        {label}
      </span>
    </div>
  );
}

export default function MapView() {
  const [all, setAll] = useState<Restaurant[]>([]);
  const [areaFilter, setAreaFilter] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [showPanel, setShowPanel] = useState(false);
  const [currentPos, setCurrentPos] = useState<{ lat: number; lng: number } | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isOptimized, setIsOptimized] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { course, isInCourse, addStore, removeStore, clearCourse, reorderCourse, googleMapsRouteUrl, count } = useCourse();

  const optimizeRoute = useCallback(() => {
    setIsOptimizing(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCurrentPos({ lat: latitude, lng: longitude });
        const optimized = nearestNeighborRoute(latitude, longitude, course);
        reorderCourse(optimized.map(s => s.id));
        setIsOptimized(true);
        setIsOptimizing(false);
      },
      () => {
        const SANNOMIYA = { lat: 34.6951, lng: 135.1956 };
        setCurrentPos(SANNOMIYA);
        const optimized = nearestNeighborRoute(SANNOMIYA.lat, SANNOMIYA.lng, course);
        reorderCourse(optimized.map(s => s.id));
        setIsOptimized(true);
        setIsOptimizing(false);
      },
      { timeout: 6000, maximumAge: 60000 }
    );
  }, [course, reorderCourse]);

  const CENTER: [number, number] = [34.6938, 135.1962];

  useEffect(() => {
    fetch('/api/restaurants?limit=200')
      .then(r => r.json())
      .then(d => {
        const stores = (d.restaurants ?? []).filter((r: Restaurant) => r.lat && r.lng);
        setAll(stores);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (currentPos || typeof navigator === 'undefined' || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      pos => setCurrentPos({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
      { timeout: 5000, maximumAge: 300000, enableHighAccuracy: false }
    );
  }, [currentPos]);

  useEffect(() => {
    setSelectedId(null);
  }, [areaFilter]);

  const displayed = areaFilter ? all.filter(r => r.area === areaFilter) : all;
  const inCourseIds = new Set(course.map(s => s.id));
  const selectedRestaurant = selectedId ? all.find(r => r.id === selectedId) ?? null : null;
  const selectedDistanceKm = selectedRestaurant && currentPos && selectedRestaurant.lat && selectedRestaurant.lng
    ? haversineKm(currentPos.lat, currentPos.lng, selectedRestaurant.lat, selectedRestaurant.lng)
    : null;
  const nearbyStores = selectedRestaurant && selectedRestaurant.lat && selectedRestaurant.lng
    ? all
        .filter(r => r.id !== selectedRestaurant.id && r.lat != null && r.lng != null)
        .map(r => ({
          restaurant: r,
          distanceKm: haversineKm(
            selectedRestaurant.lat!, selectedRestaurant.lng!,
            r.lat!, r.lng!,
          ),
        }))
        .sort((a, b) => a.distanceKm - b.distanceKm)
        .slice(0, 6)
    : [];
  const routeUrl = googleMapsRouteUrl();

  const areas = [
    { value: '',             label: 'すべて', count: all.length },
    { value: 'sannomiya',    label: '三宮',   count: all.filter(r => r.area === 'sannomiya').length },
    { value: 'motomachi',    label: '元町',   count: all.filter(r => r.area === 'motomachi').length },
    { value: 'surroundings', label: '周辺',   count: all.filter(r => r.area === 'surroundings').length },
  ];

  const pillBase: React.CSSProperties = {
    flexShrink: 0,
    fontSize: 11,
    padding: '6px 12px',
    borderRadius: 0,
    background: 'transparent',
    border: `1px solid ${C.ink}`,
    color: C.ink,
    fontWeight: 600,
    letterSpacing: '0.04em',
    lineHeight: 1.4,
  };
  const pillActive: React.CSSProperties = {
    ...pillBase,
    background: C.ink,
    color: C.inkOnPaper,
  };

  return (
    <div
      className="relative h-screen w-full flex flex-col overflow-hidden pb-14"
      style={{ background: C.paper }}
    >
      <header
        className="flex-shrink-0 px-4 pt-3 pb-2"
        style={{
          background: C.paper,
          borderBottom: `1px solid ${C.ink}`,
        }}
      >
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <Image src="/logo.jpg" alt="" width={40} height={24} className="object-contain mix-blend-multiply" />
            <span style={{ color: C.ink, fontWeight: 700, fontSize: 14, letterSpacing: '-0.01em' }}>
              神戸立ち飲みマップ
            </span>
          </div>
          {count > 0 && (
            <button
              onClick={() => setShowPanel(v => !v)}
              className="flex items-center gap-1.5"
              style={{
                fontSize: 11, padding: '6px 10px',
                background: showPanel ? C.ink : 'transparent',
                color: showPanel ? C.inkOnPaper : C.ink,
                border: `1px solid ${C.ink}`,
                borderRadius: 0,
                fontWeight: 700,
                letterSpacing: '0.04em',
                lineHeight: 1,
              }}
            >
              🍺 {count}
              <ChevronUp
                className={`w-3 h-3 transition-transform ${showPanel ? '' : 'rotate-180'}`}
              />
            </button>
          )}
        </div>

        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-0.5">
          {areas.map(a => {
            const on = areaFilter === a.value;
            return (
              <button
                key={a.value}
                onClick={() => setAreaFilter(a.value)}
                style={on ? pillActive : pillBase}
              >
                {a.label}
                {a.count > 0 && (
                  <span
                    style={{
                      marginLeft: 4,
                      color: on ? C.inkOnPaper : C.mute,
                      opacity: 0.85,
                    }}
                  >
                    {a.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      <div className="flex-1 relative">
        {isLoading ? (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: C.paper }}
          >
            <LinePulse label="地図を読み込み中" />
          </div>
        ) : (
          <MapContainer
            center={CENTER}
            zoom={15}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapClickHandler onClick={() => setSelectedId(null)} />

            {displayed.map(r => {
              const emoji = r.tachinomi_type ? (TYPE_EMOJI[r.tachinomi_type] ?? '🏮') : '🏮';
              return (
                <Marker
                  key={r.id}
                  position={[r.lat!, r.lng!]}
                  icon={createPin(emoji, inCourseIds.has(r.id), r.is_new_open, selectedId === r.id)}
                  eventHandlers={{
                    click: () => setSelectedId(r.id),
                  }}
                />
              );
            })}
          </MapContainer>
        )}

        {!isLoading && (
          <div
            className="absolute top-3 right-3 z-[999]"
            style={{
              background: C.paper,
              border: `1px solid ${C.ink}`,
              borderRadius: 0,
              padding: '4px 10px',
              fontSize: 11,
              color: C.ink,
              fontWeight: 700,
              letterSpacing: '0.04em',
            }}
          >
            {displayed.length}店
          </div>
        )}

        {showPanel && count > 0 && (
          <div
            className="absolute inset-x-0 bottom-0 z-[1001] flex flex-col"
            style={{
              background: C.paper,
              borderTop: `1px solid ${C.ink}`,
              maxHeight: '55vh',
              borderRadius: 0,
            }}
          >
            <div
              className="flex items-center justify-between px-4 py-3 flex-shrink-0"
              style={{ borderBottom: `1px solid ${C.ink}` }}
            >
              <div className="flex items-center gap-2">
                <span style={{ fontSize: 14 }}>🍺</span>
                <span
                  style={{
                    color: C.mute, fontSize: 10, fontWeight: 700,
                    letterSpacing: '0.24em', textTransform: 'uppercase',
                  }}
                >
                  COURSE
                </span>
                <span
                  style={{
                    background: C.ink, color: C.inkOnPaper,
                    fontSize: 10, fontWeight: 700,
                    padding: '2px 7px',
                    borderRadius: 0,
                    letterSpacing: '0.08em',
                  }}
                >
                  {count}
                </span>
              </div>
              <button
                onClick={() => setShowPanel(false)}
                className="flex items-center justify-center"
                style={{
                  width: 28, height: 28,
                  border: `1px solid ${C.ink}`,
                  color: C.ink,
                  borderRadius: 0,
                }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {course.map((s, i) => (
                <div
                  key={s.id}
                  className="flex items-center gap-3 px-4 py-2.5"
                  style={{ borderBottom: `1px solid ${C.rule}` }}
                >
                  <span
                    style={{
                      color: C.mute, fontSize: 11,
                      fontFamily: 'monospace',
                      width: 20, textAlign: 'center',
                    }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p
                      className="truncate"
                      style={{ color: C.ink, fontSize: 13, fontWeight: 700 }}
                    >
                      {s.name}
                    </p>
                    {s.budget_max && (
                      <p style={{ color: C.inkSoft, fontSize: 11, marginTop: 2 }}>
                        〜¥{s.budget_max.toLocaleString()}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => removeStore(s.id)}
                    className="flex items-center justify-center flex-shrink-0"
                    style={{ width: 26, height: 26, color: C.mute }}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div
              className="px-4 py-3 flex flex-col gap-2 flex-shrink-0"
              style={{ borderTop: `1px solid ${C.ink}` }}
            >
              {count >= 2 && (
                <button
                  onClick={optimizeRoute}
                  disabled={isOptimizing}
                  className="w-full flex items-center justify-center gap-2 py-2.5"
                  style={{
                    fontSize: 12, fontWeight: 700,
                    borderRadius: 0,
                    background: isOptimized ? C.green : 'transparent',
                    border: `1px solid ${isOptimized ? C.green : C.ink}`,
                    color: isOptimized ? C.inkOnPaper : C.ink,
                    letterSpacing: '0.06em',
                  }}
                >
                  {isOptimizing ? (
                    <>
                      <span className="inline-block animate-pulse" style={{ width: 20, height: 1, background: 'currentColor' }} />
                      最適化中
                    </>
                  ) : isOptimized ? (
                    <><Check className="w-4 h-4" /> 最適化済み</>
                  ) : (
                    <><Locate className="w-4 h-4" /> 現在地から最適化</>
                  )}
                </button>
              )}
              <div className="flex gap-2">
                {routeUrl ? (
                  <a
                    href={googleMapsRouteUrl(currentPos ?? undefined) ?? routeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 py-3"
                    style={{
                      background: C.ink, color: C.inkOnPaper,
                      fontSize: 12, fontWeight: 700,
                      borderRadius: 0,
                      letterSpacing: '0.08em',
                      lineHeight: 1,
                    }}
                  >
                    <Navigation className="w-4 h-4" />
                    Googleマップで経路
                  </a>
                ) : (
                  <div
                    className="flex-1 py-3 text-center"
                    style={{ color: C.mute, fontSize: 11 }}
                  >
                    座標のある店を追加
                  </div>
                )}
                <button
                  onClick={() => { clearCourse(); setShowPanel(false); setIsOptimized(false); setCurrentPos(null); }}
                  className="flex items-center justify-center"
                  style={{
                    width: 44, height: 44,
                    background: 'transparent',
                    border: `1px solid ${C.ink}`,
                    color: C.ink,
                    borderRadius: 0,
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <BottomNav courseCount={count} />

      <StoreBottomSheet
        restaurant={selectedRestaurant}
        distanceKm={selectedDistanceKm}
        inCourse={selectedRestaurant ? isInCourse(selectedRestaurant.id) : false}
        nearby={nearbyStores}
        onClose={() => setSelectedId(null)}
        onAddToCourse={() => { if (selectedRestaurant) addStore(selectedRestaurant); }}
        onRemoveFromCourse={() => { if (selectedRestaurant) removeStore(selectedRestaurant.id); }}
        onSelectNearby={(id) => setSelectedId(id)}
      />
    </div>
  );
}
