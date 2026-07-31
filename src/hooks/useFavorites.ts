'use client';

import { useLocalIdSet } from '@/hooks/useLocalIdSet';

const STORAGE_KEY = 'kobe-favorites-v1';
const UPDATE_EVENT = 'kobe-favorites-updated';

export function useFavorites() {
  return useLocalIdSet(STORAGE_KEY, UPDATE_EVENT);
}
