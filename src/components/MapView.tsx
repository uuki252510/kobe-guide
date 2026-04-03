'use client';

import { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import Link from 'next/link';
import { Navigation, Trash2, Plus, Check, X, ChevronUp, Locate, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useCourse } from '@/hooks/useCourse';
import { useAuth } from '@/hooks/useAuth';
import BottomNav from '@/components/BottomNav';
import type { CourseStore } from '@/hooks/useCourse';
import type { Restaurant } from '@/types/restaurant';
import 'leaflet/dist/leaflet.css';

// ============================================================
// Leaflet アイコン修正（Next.js）
// ============================================================
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// ============================================================
// カテゴリ別アイコン
// ============================================================
const TYPE_EMOJI: Record<string, string> = {
  tachinomi: '🍺',
  kakuuchi:  '🍶',
  yakitori:  '🍢',
  seafood:   '🐟',
  wine:      '🍷',
  italian:   '🍕',
  hormones:  '🥩',
  bar:       '🥂',
};

const TYPE_LABEL: Record<string, string> = {
  tachinomi: '立ち飲み',
  kakuuchi:  '角打ち',
  yakitori:  '焼鳥',
  seafood:   '海鮮',
  wine:      'ワイン',
  italian:   'イタリアン',
  hormones:  'ホルモン',
  bar:       'バー',
};

const AREA_LABEL: Record<string, string> = {
  sannomiya:    '三宮',
  motomachi:    '元町',
  surroundings: '周辺',
};

function createPin(emoji: string, inCourse: boolean, isNew: boolean) {
  const bg     = inCourse ? '#c0392b' : isNew ? '#1a4a2a' : '#2C2820';
  const border = inCourse ? '#e74c3c' : isNew ? '#27ae60' : '#C9A44C';
  return L.divIcon({
    className: '',
    html: `<div style="
      width:34px;height:34px;border-radius:50% 50% 50% 0;
      background:${bg};border:2.5px solid ${border};
      display:flex;align-items:center;justify-content:center;
      font-size:15px;transform:rotate(-45deg);
      box-shadow:0 2px 10px rgba(0,0,0,0.25);
    "><span style="transform:rotate(45deg);display:block">${emoji}</span></div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -36],
  });
}

// ============================================================
// ルート最適化（最近傍法）
// ============================================================
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

// ============================================================
// メイン
// ============================================================
export default function MapView() {
  const [all, setAll] = useState<Restaurant[]>([]);
  const [areaFilter, setAreaFilter] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [showPanel, setShowPanel] = useState(false);
  const [currentPos, setCurrentPos] = useState<{ lat: number; lng: number } | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isOptimized, setIsOptimized] = useState(false);
  const [visitMap, setVisitMap] = useState<Map<string, string>>(new Map()); // restaurantId → visitId
  const [checkingInId, setCheckingInId] = useState<string | null>(null);
  const { course, isInCourse, addStore, removeStore, clearCourse, reorderCourse, googleMapsRouteUrl, count } = useCourse();
  const { user, accessToken } = useAuth();

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
        // GPS 取得失敗時は三宮駅を基点に最適化
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

  const handleCheckIn = useCallback(async (restaurantId: string) => {
    if (!user || checkingInId) return;
    setCheckingInId(restaurantId);
    const existing = visitMap.get(restaurantId);
    if (existing) {
      // ピットアウト
      const res = await fetch('/api/visits', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ visitId: existing }),
      });
      if (res.ok) setVisitMap(prev => { const m = new Map(prev); m.delete(restaurantId); return m; });
    } else {
      // ピットイン
      const res = await fetch('/api/visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ restaurantId }),
      });
      if (res.ok) {
        const json = await res.json();
        setVisitMap(prev => new Map(prev).set(restaurantId, json.visit?.id ?? 'done'));
      }
    }
    setCheckingInId(null);
  }, [user, accessToken, checkingInId, visitMap]);

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

  const displayed = areaFilter ? all.filter(r => r.area === areaFilter) : all;
  const routeUrl = googleMapsRouteUrl();

  const areas = [
    { value: '',             label: 'すべて', count: all.length },
    { value: 'sannomiya',   label: '三宮',   count: all.filter(r => r.area === 'sannomiya').length },
    { value: 'motomachi',   label: '元町',   count: all.filter(r => r.area === 'motomachi').length },
    { value: 'surroundings', label: '周辺',   count: all.filter(r => r.area === 'surroundings').length },
  ];

  return (
    <div className="relative h-screen w-full flex flex-col bg-harbor-50 overflow-hidden pb-14">

      {/* ヘッダー */}
      <header className="flex-shrink-0 bg-white/95 backdrop-blur-sm border-b border-harbor-200 px-4 pt-3 pb-2 shadow-nav-bottom">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <Image src="/logo.jpg" alt="神戸立ち飲みマップ" width={64} height={36} className="object-contain mix-blend-multiply" />
            <span className="text-harbor-800 font-bold text-sm">神戸立ち飲みマップ</span>
          </div>
          {count > 0 && (
            <button
              onClick={() => setShowPanel(v => !v)}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-kobe-red/10 border border-kobe-red/50 text-kobe-red rounded-full font-bold"
            >
              🍺 コース {count}店
              <ChevronUp className={`w-3 h-3 transition-transform ${showPanel ? '' : 'rotate-180'}`} />
            </button>
          )}
        </div>

        {/* エリアフィルター */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-0.5">
          {areas.map(a => (
            <button
              key={a.value}
              onClick={() => setAreaFilter(a.value)}
              className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full border transition-colors font-medium ${
                areaFilter === a.value
                  ? 'bg-kobe-gold text-harbor-950 border-kobe-gold'
                  : 'bg-harbor-100 border-harbor-200 text-harbor-600 hover:border-harbor-300'
              }`}
            >
              {a.label}
              {a.count > 0 && (
                <span className={`ml-1 ${areaFilter === a.value ? 'text-harbor-800' : 'text-harbor-400'}`}>
                  {a.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </header>

      {/* 地図 */}
      <div className="flex-1 relative">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-harbor-50">
            <div className="text-center">
              <div className="text-5xl mb-4">🏮</div>
              <p className="text-harbor-500 text-sm">地図を読み込み中...</p>
              <p className="text-harbor-400 text-xs mt-1">{all.length > 0 ? `${all.length}店舗読み込み済み` : ''}</p>
            </div>
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

            {displayed.map(r => {
              const inCourse = isInCourse(r.id);
              const emoji = r.tachinomi_type ? (TYPE_EMOJI[r.tachinomi_type] ?? '🏮') : '🏮';
              return (
                <Marker
                  key={r.id}
                  position={[r.lat!, r.lng!]}
                  icon={createPin(emoji, inCourse, r.is_new_open)}
                >
                  <Popup maxWidth={230} minWidth={200}>
                    <div className="bg-white rounded-2xl overflow-hidden min-w-[200px] shadow-card-md border border-harbor-200">
                      {/* 店名ヘッダー */}
                      <div className="px-3 pt-3 pb-2">
                        <div className="flex items-start gap-2">
                          <span className="text-xl mt-0.5">{emoji}</span>
                          <div className="flex-1 min-w-0">
                            {r.is_new_open && (
                              <span className="inline-block text-[9px] bg-green-500 text-white font-bold px-1.5 py-0.5 rounded-full mr-1 mb-0.5">
                                NEW
                              </span>
                            )}
                            <p className="text-harbor-800 font-bold text-sm leading-tight">{r.name}</p>
                            <p className="text-harbor-500 text-xs mt-0.5">
                              {AREA_LABEL[r.area] ?? r.area}
                              {r.tachinomi_type && ` · ${TYPE_LABEL[r.tachinomi_type]}`}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* 予算 */}
                      <div className="px-3 pb-2 flex items-center justify-between">
                        <span className="text-kobe-gold font-bold text-base">
                          〜¥{(r.budget_max ?? 2000).toLocaleString()}
                        </span>
                        {r.vibe_tags && r.vibe_tags.length > 0 && (
                          <span className="text-[10px] bg-harbor-100 text-harbor-500 px-2 py-0.5 rounded-full border border-harbor-200">
                            {r.vibe_tags[0]}
                          </span>
                        )}
                      </div>

                      {/* アクション */}
                      <div className="border-t border-harbor-200 flex">
                        <button
                          onClick={() => inCourse ? removeStore(r.id) : addStore(r)}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold transition-colors ${
                            inCourse
                              ? 'text-kobe-red bg-kobe-red/8'
                              : 'text-harbor-700 hover:bg-harbor-100'
                          }`}
                        >
                          {inCourse ? (
                            <><Check className="w-3.5 h-3.5" /> コース済</>
                          ) : (
                            <><Plus className="w-3.5 h-3.5" /> コース追加</>
                          )}
                        </button>
                        {user && (
                          <>
                            <div className="w-px bg-harbor-200" />
                            <button
                              onClick={() => handleCheckIn(r.id)}
                              disabled={checkingInId === r.id}
                              className={`px-3 flex items-center justify-center gap-1 text-xs font-bold transition-colors ${
                                visitMap.has(r.id)
                                  ? 'text-green-600 bg-green-50 hover:text-kobe-red hover:bg-red-50'
                                  : 'text-kobe-gold hover:bg-harbor-100'
                              }`}
                            >
                              {checkingInId === r.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : visitMap.has(r.id) ? (
                                <Check className="w-3.5 h-3.5" />
                              ) : (
                                <span className="text-sm leading-none">🍺</span>
                              )}
                              {visitMap.has(r.id) ? 'アウト' : 'ピットイン'}
                            </button>
                          </>
                        )}
                        {r.google_maps_url && (
                          <>
                            <div className="w-px bg-harbor-200" />
                            <a
                              href={r.google_maps_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 flex items-center justify-center text-harbor-500 hover:text-harbor-800 transition-colors"
                            >
                              <Navigation className="w-3.5 h-3.5" />
                            </a>
                          </>
                        )}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        )}

        {/* 表示件数バッジ */}
        {!isLoading && (
          <div className="absolute top-3 right-3 z-[999] bg-white/90 backdrop-blur-sm border border-harbor-200 rounded-full px-3 py-1 text-xs text-harbor-600 shadow-card">
            {displayed.length}店表示中
          </div>
        )}

        {/* コースパネル */}
        {showPanel && count > 0 && (
          <div className="absolute inset-x-0 bottom-0 z-[1001] bg-white border-t border-harbor-200 rounded-t-2xl max-h-[55vh] flex flex-col shadow-card-md">
            <div className="flex items-center justify-between px-4 py-3 border-b border-harbor-200 flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-base">🍺</span>
                <span className="text-harbor-800 font-bold text-sm">今夜のコース</span>
                <span className="bg-kobe-red text-white text-xs font-bold px-2 py-0.5 rounded-full">{count}店</span>
              </div>
              <button onClick={() => setShowPanel(false)} className="text-harbor-400 hover:text-harbor-700 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-harbor-200/60">
              {course.map((s, i) => (
                <div key={s.id} className="flex items-center gap-3 px-4 py-2.5">
                  <span className="text-harbor-400 text-xs font-mono w-5 text-center flex-shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-harbor-800 text-sm font-medium truncate">{s.name}</p>
                    {s.budget_max && (
                      <p className="text-kobe-gold text-xs mt-0.5">〜¥{s.budget_max.toLocaleString()}</p>
                    )}
                  </div>
                  <button
                    onClick={() => removeStore(s.id)}
                    className="text-harbor-300 hover:text-kobe-red transition-colors p-1 flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="px-4 py-3 border-t border-harbor-200 flex flex-col gap-2 flex-shrink-0">
              {/* ルート最適化ボタン */}
              {count >= 2 && (
                <button
                  onClick={optimizeRoute}
                  disabled={isOptimizing}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors border ${
                    isOptimized
                      ? 'bg-green-50 border-green-200 text-green-600'
                      : 'bg-harbor-100 border-harbor-200 text-harbor-700 hover:bg-harbor-200'
                  }`}
                >
                  {isOptimizing ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> 最適化中...</>
                  ) : isOptimized ? (
                    <><Check className="w-4 h-4" /> ルート最適化済み</>
                  ) : (
                    <><Locate className="w-4 h-4" /> 現在地からルートを最適化</>
                  )}
                </button>
              )}
              <div className="flex gap-2">
                {routeUrl ? (
                  <a
                    href={googleMapsRouteUrl(currentPos ?? undefined) ?? routeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-kobe-gold text-harbor-950 font-bold text-sm rounded-xl hover:bg-kobe-amber transition-colors"
                  >
                    <Navigation className="w-4 h-4" />
                    Googleマップで経路案内
                  </a>
                ) : (
                  <div className="flex-1 py-3 text-center text-harbor-500 text-xs">
                    座標のある店舗を追加すると経路案内できます
                  </div>
                )}
                <button
                  onClick={() => { clearCourse(); setShowPanel(false); setIsOptimized(false); setCurrentPos(null); }}
                  className="w-11 h-11 flex items-center justify-center bg-harbor-100 text-harbor-500 rounded-xl hover:text-kobe-red hover:bg-harbor-200 transition-colors border border-harbor-200"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <BottomNav courseCount={count} />
    </div>
  );
}
