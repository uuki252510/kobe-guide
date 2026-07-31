'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import AppShell from '@/components/AppShell';

function Loading() {
  return <div className="store-loading"><span>地図を読み込んでいます…</span></div>;
}

const MapView = dynamic(() => import('@/components/MapView'), { ssr: false, loading: () => <Loading /> });

export default function MapPage() {
  return <AppShell fullBleed><Suspense fallback={<Loading />}><MapView /></Suspense></AppShell>;
}
