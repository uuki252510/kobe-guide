'use client';

import { useEffect } from 'react';
import {
  CircleMarker,
  MapContainer,
  TileLayer,
  Tooltip,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export interface HomeMapCandidate {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

interface Props {
  candidates: HomeMapCandidate[];
  selectedId?: string;
  onSelect?: (id: string) => void;
}

const KOBE_CENTER: [number, number] = [34.6938, 135.1956];

function MapViewport({ candidates }: { candidates: HomeMapCandidate[] }) {
  const map = useMap();

  useEffect(() => {
    if (candidates.length === 0) {
      map.setView(KOBE_CENTER, 14);
      return;
    }

    if (candidates.length === 1) {
      map.setView([candidates[0].lat, candidates[0].lng], 15);
      return;
    }

    const bounds = L.latLngBounds(candidates.map(candidate => [candidate.lat, candidate.lng]));
    map.fitBounds(bounds.pad(0.42), { animate: false, maxZoom: 15 });
  }, [candidates, map]);

  return null;
}

export default function HomeRecommendationMap({ candidates, selectedId, onSelect }: Props) {
  return (
    <MapContainer
      center={KOBE_CENTER}
      zoom={14}
      scrollWheelZoom={false}
      zoomControl={false}
      className="kg-leaflet-map"
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors &copy; CARTO'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
      <MapViewport candidates={candidates} />
      {candidates.map((candidate, index) => {
        const selected = candidate.id === selectedId;
        return (
          <CircleMarker
            key={candidate.id}
            center={[candidate.lat, candidate.lng]}
            radius={selected ? 10 : 8}
            pathOptions={{
              color: '#2637D4',
              fillColor: selected ? '#2637D4' : '#F7F8FA',
              fillOpacity: 1,
              weight: selected ? 4 : 3,
            }}
            eventHandlers={{ click: () => onSelect?.(candidate.id) }}
          >
            <Tooltip
              permanent
              direction="top"
              offset={[0, -10]}
              className={`kg-map-label ${selected ? 'is-active' : ''}`}
            >
              {String(index + 1).padStart(2, '0')}
            </Tooltip>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
