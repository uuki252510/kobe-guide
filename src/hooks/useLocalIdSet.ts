'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

/**
 * localStorage に ID の集合を持つフック。保存・訪問記録の共通土台。
 *
 * 書き込みは localStorage を正として行い、同じキーを見ている他のインスタンスへは
 * カスタムイベントで通知する(storage イベントは他タブにしか飛ばないため)。
 */
export function useLocalIdSet(storageKey: string, updateEvent: string) {
  const [idSet, setIdSet] = useState<Set<string>>(new Set());

  const read = useCallback(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      return new Set<string>(raw ? JSON.parse(raw) as string[] : []);
    } catch {
      return new Set<string>();
    }
  }, [storageKey]);

  useEffect(() => {
    const sync = () => setIdSet(read());
    sync();
    window.addEventListener(updateEvent, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(updateEvent, sync);
      window.removeEventListener('storage', sync);
    };
  }, [read, updateEvent]);

  const toggle = useCallback((id: string) => {
    const next = read();
    if (next.has(id)) next.delete(id); else next.add(id);
    setIdSet(next);
    try {
      localStorage.setItem(storageKey, JSON.stringify([...next]));
      window.dispatchEvent(new Event(updateEvent));
    } catch {
      // 保存できなくても、この画面の状態は保つ
    }
  }, [read, storageKey, updateEvent]);

  const has = useCallback((id: string) => idSet.has(id), [idSet]);
  const ids = useMemo(() => [...idSet], [idSet]);

  return { toggle, has, ids, count: idSet.size };
}
