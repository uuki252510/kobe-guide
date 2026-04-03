'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

// Leaflet は SSR 非対応なので dynamic import
const MapView = dynamic(() => import('@/components/MapView'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen bg-harbor-950">
      <Loader2 className="w-8 h-8 text-kobe-gold animate-spin" />
    </div>
  ),
});

export default function MapPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen bg-harbor-950">
        <Loader2 className="w-8 h-8 text-kobe-gold animate-spin" />
      </div>
    }>
      <MapView />
    </Suspense>
  );
}
