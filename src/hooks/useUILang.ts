'use client';

import { useState, useEffect } from 'react';

export type UILang = 'ja' | 'en' | 'zh-TW' | 'zh-CN' | 'ko';

function getStoredLang(): UILang {
  if (typeof window === 'undefined') return 'ja';
  return (window.localStorage.getItem('ui-lang') as UILang) ?? 'ja';
}

export function useUILang(): UILang {
  const [lang, setLang] = useState<UILang>('ja');

  useEffect(() => {
    setLang(getStoredLang());
    const handler = (e: Event) => setLang((e as CustomEvent<UILang>).detail);
    window.addEventListener('ui-lang-change', handler);
    return () => window.removeEventListener('ui-lang-change', handler);
  }, []);

  return lang;
}
