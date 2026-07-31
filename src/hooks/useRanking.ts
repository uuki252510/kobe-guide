'use client';

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'kobe-ranking-v1';
const UPDATE_EVENT = 'kobe-ranking-updated';

/**
 * 「行った店」の自分だけの順位。上が一番。
 *
 * 点数をつけさせるのではなく、二択の比較を積み重ねて挿入位置を決める
 * (二分探索なので n 軒に対して比較は log2(n) 回で済む)。
 */
export function useRanking() {
  const [ranked, setRankedState] = useState<string[]>([]);

  const read = useCallback((): string[] => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed as string[] : [];
    } catch {
      return [];
    }
  }, []);

  useEffect(() => {
    const sync = () => setRankedState(read());
    sync();
    window.addEventListener(UPDATE_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(UPDATE_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, [read]);

  const setRanked = useCallback((next: string[]) => {
    setRankedState(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      window.dispatchEvent(new Event(UPDATE_EVENT));
    } catch {
      // 保存できなくても、この画面の順位は保つ
    }
  }, []);

  return { ranked, setRanked };
}
