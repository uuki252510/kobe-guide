'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import AppShell from '@/components/AppShell';
import StoreList from '@/components/StoreList';
import { useLocation, haversineKm } from '@/hooks/useLocation';
import type { Restaurant } from '@/types/restaurant';
import { getOpenState, isOpenAtHour } from '@/lib/opening-hours';
import {
  Clock,
  MoonStars,
  Crosshair,
  GridFour,
  ListMagnifyingGlass,
  MapTrifold,
  MagnifyingGlass,
  SpinnerGap,
  X,
} from '@phosphor-icons/react';

const StoreMapPanel = dynamic(() => import('@/components/StoreMapPanel'), {
  ssr: false,
  loading: () => <div className="store-loading"><span className="loading-inline"><SpinnerGap size={20} className="spin" aria-hidden="true" />地図を読み込んでいます…</span></div>,
});

/** 「深夜まで」の基準時刻(日本時間) */
const LATE_NIGHT_HOUR = 23;

const AREAS = [
  { value: '', label: 'すべて' },
  { value: 'sannomiya', label: '三宮' },
  { value: 'motomachi', label: '元町' },
  { value: 'surroundings', label: '周辺' },
];

const FILTERS = [
  { id: 'all', label: '条件なし', params: {} },
  { id: 'kakuuchi', label: '角打ち', params: { tachinomi_type: 'kakuuchi' } },
  { id: 'seafood', label: '海鮮', params: { tachinomi_type: 'seafood' } },
  { id: 'yakitori', label: '焼鳥', params: { tachinomi_type: 'yakitori' } },
  { id: 'wine', label: 'ワイン', params: { tachinomi_type: 'wine' } },
  { id: 'solo', label: 'ひとり向き', params: { solo_friendly: 'true' } },
  { id: 'budget', label: '2,000円以内', params: { budget_max: '2000' } },
  { id: 'new', label: '新しい店', params: { is_new_open: 'true' } },
] as const;

type FilterId = typeof FILTERS[number]['id'];
type ViewMode = 'grid' | 'map';

export default function StoresPage() {
  const [area, setArea] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterId>('all');
  const [openNowOnly, setOpenNowOnly] = useState(false);
  const [lateNightOnly, setLateNightOnly] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const [stores, setStores] = useState<Restaurant[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isQueryReady, setIsQueryReady] = useState(false);
  const { location, loading: locationLoading, request: requestLocation } = useLocation();
  const cardRefs = useRef<Record<string, HTMLDivElement>>({});

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedArea = params.get('area') ?? '';
    const requestedFilter = params.get('filter');
    const requestedKeyword = params.get('q') ?? '';
    if (AREAS.some(item => item.value === requestedArea)) setArea(requestedArea);
    const matchedFilter = FILTERS.find(item => item.id === requestedFilter);
    if (matchedFilter) setActiveFilter(matchedFilter.id);
    if (requestedKeyword) {
      setKeyword(requestedKeyword);
      setDebouncedKeyword(requestedKeyword);
    }
    setIsQueryReady(true);
  }, []);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedKeyword(keyword.trim()), 320);
    return () => clearTimeout(timer);
  }, [keyword]);

  const fetchStores = useCallback(async () => {
    if (!isQueryReady) return;
    setIsLoading(true);
    setError('');
    const params = new URLSearchParams({ limit: '90' });
    if (area) params.set('area', area);
    if (debouncedKeyword) params.set('keyword', debouncedKeyword);
    const filter = FILTERS.find(item => item.id === activeFilter);
    if (filter) Object.entries(filter.params).forEach(([key, value]) => params.set(key, value));

    try {
      const response = await fetch(`/api/restaurants?${params}`);
      if (!response.ok) throw new Error('店舗を読み込めませんでした');
      const data = await response.json();
      setStores(data.restaurants ?? []);
      setTotal(data.pagination?.total ?? 0);
    } catch {
      setStores([]);
      setTotal(0);
      setError('店舗情報を読み込めませんでした。通信状況を確認して、もう一度お試しください。');
    } finally {
      setIsLoading(false);
    }
  }, [activeFilter, area, debouncedKeyword, isQueryReady]);

  useEffect(() => { fetchStores(); }, [fetchStores]);

  useEffect(() => {
    if (!isQueryReady) return;
    const params = new URLSearchParams();
    if (area) params.set('area', area);
    if (activeFilter !== 'all') params.set('filter', activeFilter);
    if (debouncedKeyword) params.set('q', debouncedKeyword);
    const query = params.toString();
    window.history.replaceState(null, '', query ? `/stores?${query}` : '/stores');
  }, [activeFilter, area, debouncedKeyword, isQueryReady]);

  const distances = useMemo<Record<string, number>>(() => {
    if (!location) return {};
    return Object.fromEntries(stores.filter(store => store.lat && store.lng).map(store => [store.id, haversineKm(location.lat, location.lng, store.lat!, store.lng!)]));
  }, [location, stores]);

  const sortedStores = useMemo(() => {
    // 営業時間は時刻依存なのでサーバーに投げられない。取得後にここで絞る
    let base = stores;
    if (openNowOnly) base = base.filter(store => getOpenState(store.opening_hours_json).open);
    if (lateNightOnly) base = base.filter(store => isOpenAtHour(store.opening_hours_json, LATE_NIGHT_HOUR));
    if (!location) return base;
    return [...base].sort((a, b) => (distances[a.id] ?? Infinity) - (distances[b.id] ?? Infinity));
  }, [distances, lateNightOnly, location, openNowOnly, stores]);

  const handleSelect = useCallback((id: string) => {
    setSelectedId(id);
    cardRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, []);

  const resetFilters = () => { setArea(''); setActiveFilter('all'); setKeyword(''); setDebouncedKeyword(''); setOpenNowOnly(false); setLateNightOnly(false); };
  const hasFilters = area || activeFilter !== 'all' || debouncedKeyword || openNowOnly || lateNightOnly;
  const timeFiltered = openNowOnly || lateNightOnly;

  return (
    <AppShell title="お店を探す" eyebrow="90 LOCAL STANDING BARS">
      <div className="store-page">
        <section className="store-controls" aria-label="店舗の検索条件">
          <div className="store-controls__row">
            <div className="store-search">
              <MagnifyingGlass size={20} aria-hidden="true" />
              <label className="sr-only" htmlFor="store-search">店名や名物で検索</label>
              <input id="store-search" name="store-search" type="search" value={keyword} onChange={event => setKeyword(event.target.value)} placeholder="店名や名物で検索…" autoComplete="off" />
              {keyword ? <button className="icon-button store-search__clear" type="button" onClick={() => { setKeyword(''); setDebouncedKeyword(''); }} aria-label="検索語を消去"><X size={17} aria-hidden="true" /></button> : null}
            </div>
            <div className="area-tabs" aria-label="エリア">
              {AREAS.map(item => <button key={item.value || 'all'} type="button" className={`filter-chip ${area === item.value ? 'is-active' : ''}`} onClick={() => setArea(item.value)} aria-pressed={area === item.value}>{item.label}</button>)}
            </div>
          </div>

          <div className="filter-row" aria-label="店の特徴">
            <button type="button" className={`filter-chip filter-chip--open ${openNowOnly ? 'is-active' : ''}`} onClick={() => setOpenNowOnly(value => !value)} aria-pressed={openNowOnly}><Clock size={16} weight={openNowOnly ? 'fill' : 'regular'} aria-hidden="true" />今行ける店</button>
            <button type="button" className={`filter-chip filter-chip--late ${lateNightOnly ? 'is-active' : ''}`} onClick={() => setLateNightOnly(value => !value)} aria-pressed={lateNightOnly}><MoonStars size={16} weight={lateNightOnly ? 'fill' : 'regular'} aria-hidden="true" />{LATE_NIGHT_HOUR}時以降も</button>
            <span className="filter-row__divider" aria-hidden="true" />
            {FILTERS.map(item => <button key={item.id} type="button" className={`filter-chip ${activeFilter === item.id ? 'is-active' : ''}`} onClick={() => setActiveFilter(item.id)} aria-pressed={activeFilter === item.id}>{item.label}</button>)}
          </div>

          <div className="store-control-row">
            <p className="result-count" aria-live="polite">{isLoading ? '検索中…' : <><strong>{timeFiltered ? sortedStores.length : total}</strong> 店{openNowOnly && lateNightOnly ? 'が該当' : openNowOnly ? 'が営業中' : lateNightOnly ? `が${LATE_NIGHT_HOUR}時以降も` : ''}</>}</p>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {hasFilters ? <button className="text-button" type="button" onClick={resetFilters}><X size={16} aria-hidden="true" />条件をリセット</button> : null}
              <button className={`icon-button ${location ? 'is-active' : ''}`} type="button" onClick={requestLocation} aria-label="現在地から近い順に並べる" aria-pressed={Boolean(location)} disabled={locationLoading}>{locationLoading ? <SpinnerGap size={19} className="spin" aria-hidden="true" /> : <Crosshair size={19} aria-hidden="true" />}</button>
              <div className="view-toggle" role="group" aria-label="表示方法">
                <button type="button" className={viewMode === 'grid' ? 'is-active' : ''} onClick={() => setViewMode('grid')} aria-label="カード表示" aria-pressed={viewMode === 'grid'}><GridFour size={19} aria-hidden="true" /></button>
                <button type="button" className={viewMode === 'map' ? 'is-active' : ''} onClick={() => setViewMode('map')} aria-label="地図と一覧を表示" aria-pressed={viewMode === 'map'}><MapTrifold size={19} aria-hidden="true" /></button>
              </div>
            </div>
          </div>
        </section>

        {isLoading ? (
          <div className="store-loading"><span className="loading-inline"><SpinnerGap size={21} className="spin" aria-hidden="true" />店舗を読み込んでいます…</span></div>
        ) : error ? (
          <div className="store-empty"><div><ListMagnifyingGlass size={34} color="var(--muted)" aria-hidden="true" /><h2>読み込みに失敗しました</h2><p>{error}</p><button className="primary-button" style={{ marginTop: 16 }} type="button" onClick={fetchStores}>もう一度試す</button></div></div>
        ) : (
          <div className={`store-layout ${viewMode === 'map' ? 'has-map' : ''}`}>
            <StoreList stores={sortedStores} distances={distances} selectedId={selectedId} onSelect={viewMode === 'map' ? handleSelect : undefined} cardRefs={cardRefs} />
            {viewMode === 'map' ? <div className="store-layout__map"><StoreMapPanel stores={sortedStores} selectedId={selectedId} onSelect={handleSelect} userLocation={location} /></div> : null}
          </div>
        )}
      </div>
    </AppShell>
  );
}
