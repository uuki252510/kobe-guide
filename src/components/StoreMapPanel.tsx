'use client';

import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { Restaurant } from '@/types/restaurant';
import type { UserLocation } from '@/hooks/useLocation';
import 'leaflet/dist/leaflet.css';

// Leaflet icon fix
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const TYPE_EMOJI: Record<string, string> = {
  tachinomi: '🍺', kakuuchi: '🍶', yakitori: '🍢',
  seafood: '🐟', wine: '🍷', italian: '🍕', hormones: '🥩', bar: '🥂',
};

function createPin(emoji: string, selected: boolean, isNew: boolean) {
  const bg     = selected ? '#5e6ad2' : isNew ? '#1a4a2a' : '#191a1b';
  const border = selected ? '#7170ff' : isNew ? '#27a644'  : 'rgba(255,255,255,0.25)';
  const scale  = selected ? 'scale(1.2)' : 'scale(1)';
  return L.divIcon({
    className: '',
    html: `<div style="
      width:32px;height:32px;border-radius:50% 50% 50% 0;
      background:${bg};border:2px solid ${border};
      display:flex;align-items:center;justify-content:center;
      font-size:13px;transform:rotate(-45deg) ${scale};
      box-shadow:0 2px 8px rgba(0,0,0,0.5);
      transition:transform 0.15s;
    "><span style="transform:rotate(45deg);display:block">${emoji}</span></div>`,
    iconSize:    [32, 32],
    iconAnchor:  [16, 32],
    popupAnchor: [0, -34],
  });
}

// Map controller — flies to selected store
function MapController({
  selectedId,
  stores,
}: {
  selectedId: string | null;
  stores: Restaurant[];
}) {
  const map = useMap();
  useEffect(() => {
    if (!selectedId) return;
    const s = stores.find(r => r.id === selectedId);
    if (s?.lat && s?.lng) {
      map.flyTo([s.lat, s.lng], 16, { animate: true, duration: 0.6 });
    }
  }, [selectedId, stores, map]);
  return null;
}

// User location marker
function UserMarker({ location }: { location: UserLocation }) {
  const icon = L.divIcon({
    className: '',
    html: `<div style="
      width:16px;height:16px;border-radius:50%;
      background:#7170ff;border:3px solid rgba(113,112,255,0.3);
      box-shadow:0 0 0 6px rgba(113,112,255,0.15);
    "></div>`,
    iconSize:   [16, 16],
    iconAnchor: [8, 8],
  });
  return <Marker position={[location.lat, location.lng]} icon={icon} />;
}

interface Props {
  stores: Restaurant[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  userLocation: UserLocation | null;
}

const CENTER: [number, number] = [34.6938, 135.1962];

export default function StoreMapPanel({ stores, selectedId, onSelect, userLocation }: Props) {
  const markerRefs = useRef<Map<string, L.Marker>>(new Map());

  return (
    <MapContainer
      center={CENTER}
      zoom={15}
      style={{ height: '100%', width: '100%' }}
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapController selectedId={selectedId} stores={stores} />

      {userLocation && <UserMarker location={userLocation} />}

      {stores.filter(r => r.lat && r.lng).map(r => {
        const emoji    = r.tachinomi_type ? (TYPE_EMOJI[r.tachinomi_type] ?? '🏮') : '🏮';
        const selected = r.id === selectedId;
        return (
          <Marker
            key={r.id}
            position={[r.lat!, r.lng!]}
            icon={createPin(emoji, selected, r.is_new_open)}
            ref={m => { if (m) markerRefs.current.set(r.id, m); }}
            eventHandlers={{ click: () => onSelect(r.id) }}
          />
        );
      })}
    </MapContainer>
  );
}
