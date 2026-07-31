'use client';

import { useLocalIdSet } from '@/hooks/useLocalIdSet';

const STORAGE_KEY = 'kobe-visited-v1';
const UPDATE_EVENT = 'kobe-visited-updated';

/** 「行った店」の記録。端末内だけに持つのでログイン不要で始められる。 */
export function useVisited() {
  return useLocalIdSet(STORAGE_KEY, UPDATE_EVENT);
}
