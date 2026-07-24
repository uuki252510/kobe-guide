'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';

const STORAGE_KEY = 'kobe-favorites-v1';
const UPDATE_EVENT = 'kobe-favorites-updated';

function readIds() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return new Set<string>(raw ? JSON.parse(raw) as string[] : []);
  } catch {
    return new Set<string>();
  }
}

export function useFavorites() {
  const [idSet, setIdSet] = useState<Set<string>>(new Set());

  useEffect(() => {
    const sync = () => setIdSet(readIds());
    sync();
    window.addEventListener(UPDATE_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(UPDATE_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const toggle = useCallback((id: string) => {
    const next = new Set(idSet);
    if (next.has(id)) next.delete(id); else next.add(id);
    setIdSet(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      window.dispatchEvent(new Event(UPDATE_EVENT));
    } catch {}
  }, [idSet]);

  const has = useCallback((id: string) => idSet.has(id), [idSet]);
  const ids = useMemo(() => [...idSet], [idSet]);

  return { toggle, has, count: idSet.size, ids };
}
