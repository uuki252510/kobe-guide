'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Restaurant } from '@/types/restaurant';

const STORAGE_KEY = 'kobe-tachinomi-course';

export interface CourseStore {
  id: string;
  name: string;
  tachinomi_type: string | null;
  lat: number | null;
  lng: number | null;
  budget_max: number | null;
}

function toCourseStore(r: Restaurant): CourseStore {
  return {
    id: r.id,
    name: r.name,
    tachinomi_type: r.tachinomi_type,
    lat: r.lat,
    lng: r.lng,
    budget_max: r.budget_max,
  };
}

export function useCourse() {
  const [course, setCourse] = useState<CourseStore[]>([]);

  // localStorage から読み込み
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setCourse(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, []);

  // localStorage に保存
  const persist = useCallback((stores: CourseStore[]) => {
    setCourse(stores);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stores));
    } catch {
      // ignore
    }
  }, []);

  const isInCourse = useCallback(
    (id: string) => course.some(s => s.id === id),
    [course]
  );

  const addStore = useCallback(
    (r: Restaurant) => {
      setCourse(prev => {
        if (prev.some(s => s.id === r.id)) return prev;
        const next = [...prev, toCourseStore(r)];
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
        return next;
      });
    },
    []
  );

  const removeStore = useCallback(
    (id: string) => {
      setCourse(prev => {
        const next = prev.filter(s => s.id !== id);
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
        return next;
      });
    },
    []
  );

  const toggleStore = useCallback(
    (r: Restaurant) => {
      setCourse(prev => {
        const exists = prev.some(s => s.id === r.id);
        const next = exists
          ? prev.filter(s => s.id !== r.id)
          : [...prev, toCourseStore(r)];
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
        return next;
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const clearCourse = useCallback(() => {
    persist([]);
  }, [persist]);

  const reorderCourse = useCallback((orderedIds: string[]) => {
    setCourse(prev => {
      const map = new Map(prev.map(s => [s.id, s]));
      const next = orderedIds.map(id => map.get(id)).filter(Boolean) as CourseStore[];
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);

  // Google Maps 経路 URL（マルチストップ）
  // originPos を渡すと現在地をスタート地点にする
  const googleMapsRouteUrl = useCallback((originPos?: { lat: number; lng: number }) => {
    const withCoords = course.filter(s => s.lat && s.lng);
    if (withCoords.length === 0) return null;

    if (originPos) {
      const origin = `${originPos.lat},${originPos.lng}`;
      const destination = `${withCoords[withCoords.length - 1].lat},${withCoords[withCoords.length - 1].lng}`;
      const waypoints = withCoords.slice(0, -1).map(s => `${s.lat},${s.lng}`).join('|');
      const params = new URLSearchParams({ api: '1', origin, destination, travelmode: 'walking' });
      if (waypoints) params.set('waypoints', waypoints);
      return `https://www.google.com/maps/dir/?${params}`;
    }

    if (withCoords.length === 1) {
      const s = withCoords[0];
      return `https://www.google.com/maps/search/?api=1&query=${s.lat},${s.lng}`;
    }
    const origin = `${withCoords[0].lat},${withCoords[0].lng}`;
    const destination = `${withCoords[withCoords.length - 1].lat},${withCoords[withCoords.length - 1].lng}`;
    const waypoints = withCoords.slice(1, -1).map(s => `${s.lat},${s.lng}`).join('|');
    const base = 'https://www.google.com/maps/dir/';
    const params = new URLSearchParams({ api: '1', origin, destination, travelmode: 'walking' });
    if (waypoints) params.set('waypoints', waypoints);
    return `${base}?${params}`;
  }, [course]);

  return {
    course,
    isInCourse,
    addStore,
    removeStore,
    toggleStore,
    clearCourse,
    reorderCourse,
    googleMapsRouteUrl,
    count: course.length,
  };
}
