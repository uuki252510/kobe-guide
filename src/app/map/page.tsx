'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const PAPER = '#F3ECDD';
const INK   = '#262220';
const MUTE  = '#857E78';

function Loading() {
  return (
    <div
      className="flex items-center justify-center h-screen"
      style={{ background: PAPER }}
    >
      <div className="flex flex-col items-center gap-3">
        <span
          className="inline-block animate-pulse"
          style={{ width: 48, height: 1, background: INK }}
        />
        <span
          style={{
            fontSize: 11, color: MUTE, letterSpacing: '0.2em',
          }}
        >
          読み込み中
        </span>
      </div>
    </div>
  );
}

const MapView = dynamic(() => import('@/components/MapView'), {
  ssr: false,
  loading: () => <Loading />,
});

export default function MapPage() {
  return (
    <Suspense fallback={<Loading />}>
      <MapView />
    </Suspense>
  );
}
