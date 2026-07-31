'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Restaurant } from '@/types/restaurant';

const STORAGE_KEY = 'kobe-tachinomi-course';
const UPDATE_EVENT = 'kobe-tachinomi-course-updated';

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

function readStoredCourse(): CourseStore[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeStoredCourse(stores: CourseStore[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stores));
    window.dispatchEvent(new Event(UPDATE_EVENT));
  } catch {
    // Storage is an enhancement; the in-memory state still works.
  }
}

export function useCourse() {
  const [course, setCourse] = useState<CourseStore[]>([]);

  useEffect(() => {
    const sync = () => setCourse(readStoredCourse());
    sync();
    window.addEventListener(UPDATE_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(UPDATE_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const persist = useCallback((stores: CourseStore[]) => {
    setCourse(stores);
    writeStoredCourse(stores);
  }, []);

  const isInCourse = useCallback(
    (id: string) => course.some(store => store.id === id),
    [course],
  );

  // 変更系は localStorage を正として読み書きし、setState の updater 内で副作用を起こさない
  const addCourseStore = useCallback((store: CourseStore) => {
    const current = readStoredCourse();
    if (current.some(item => item.id === store.id)) return;
    persist([...current, store]);
  }, [persist]);

  const addStore = useCallback((restaurant: Restaurant) => {
    addCourseStore(toCourseStore(restaurant));
  }, [addCourseStore]);

  const removeStore = useCallback((id: string) => {
    persist(readStoredCourse().filter(store => store.id !== id));
  }, [persist]);

  const toggleStore = useCallback((restaurant: Restaurant) => {
    const current = readStoredCourse();
    const exists = current.some(store => store.id === restaurant.id);
    persist(exists
      ? current.filter(store => store.id !== restaurant.id)
      : [...current, toCourseStore(restaurant)]);
  }, [persist]);

  const clearCourse = useCallback(() => {
    persist([]);
  }, [persist]);

  const reorderCourse = useCallback((orderedIds: string[]) => {
    const storeMap = new Map(readStoredCourse().map(store => [store.id, store]));
    persist(orderedIds
      .map(id => storeMap.get(id))
      .filter(Boolean) as CourseStore[]);
  }, [persist]);

  const googleMapsRouteUrl = useCallback((originPos?: { lat: number; lng: number }) => {
    const withCoords = course.filter(store => store.lat && store.lng);
    if (withCoords.length === 0) return null;

    if (originPos) {
      const origin = `${originPos.lat},${originPos.lng}`;
      const lastStore = withCoords[withCoords.length - 1];
      const destination = `${lastStore.lat},${lastStore.lng}`;
      const waypoints = withCoords.slice(0, -1).map(store => `${store.lat},${store.lng}`).join('|');
      const params = new URLSearchParams({ api: '1', origin, destination, travelmode: 'walking' });
      if (waypoints) params.set('waypoints', waypoints);
      return `https://www.google.com/maps/dir/?${params}`;
    }

    if (withCoords.length === 1) {
      const store = withCoords[0];
      return `https://www.google.com/maps/search/?api=1&query=${store.lat},${store.lng}`;
    }

    const firstStore = withCoords[0];
    const lastStore = withCoords[withCoords.length - 1];
    const origin = `${firstStore.lat},${firstStore.lng}`;
    const destination = `${lastStore.lat},${lastStore.lng}`;
    const waypoints = withCoords.slice(1, -1).map(store => `${store.lat},${store.lng}`).join('|');
    const params = new URLSearchParams({ api: '1', origin, destination, travelmode: 'walking' });
    if (waypoints) params.set('waypoints', waypoints);
    return `https://www.google.com/maps/dir/?${params}`;
  }, [course]);

  return {
    course,
    isInCourse,
    addStore,
    addCourseStore,
    removeStore,
    toggleStore,
    clearCourse,
    reorderCourse,
    googleMapsRouteUrl,
    count: course.length,
  };
}
