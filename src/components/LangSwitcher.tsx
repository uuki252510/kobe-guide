'use client';

import { useState } from 'react';
import { Globe, Check } from 'lucide-react';

const INK  = '#262220';
const PAPER = '#F3ECDD';
const PAPER_LIGHT = '#FAF4E6';
const MUTE = '#857E78';
const INK_ON_PAPER = '#FAF4E6';

const LANGS = [
  { code: 'ja',    label: '日本語',   flag: '🇯🇵' },
  { code: 'en',    label: 'English',  flag: '🇺🇸' },
  { code: 'zh-TW', label: '繁體中文', flag: '🇹🇼' },
  { code: 'zh-CN', label: '简体中文', flag: '🇨🇳' },
  { code: 'ko',    label: '한국어',   flag: '🇰🇷' },
];

export default function LangSwitcher() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState('ja');

  const currentLang = LANGS.find(l => l.code === current) ?? LANGS[0];

  const select = (code: string) => {
    setCurrent(code);
    setOpen(false);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('ui-lang', code);
      window.dispatchEvent(new CustomEvent('ui-lang-change', { detail: code }));
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5"
        style={{
          height: 32, padding: '0 10px',
          background: 'transparent',
          border: `1px solid ${INK}`,
          borderRadius: 0,
          color: INK,
          fontSize: 12, fontWeight: 700,
          letterSpacing: '0.04em',
        }}
        aria-label="言語"
      >
        <Globe style={{ width: 13, height: 13 }} />
        <span>{currentLang.flag}</span>
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div
            className="absolute right-0 mt-1.5 z-50"
            style={{
              minWidth: 160,
              background: PAPER,
              border: `1px solid ${INK}`,
              borderRadius: 0,
            }}
          >
            {LANGS.map((l, i) => (
              <button
                key={l.code}
                onClick={() => select(l.code)}
                className="w-full flex items-center gap-2 text-left"
                style={{
                  padding: '9px 12px',
                  fontSize: 13,
                  fontWeight: 600,
                  color: l.code === current ? INK_ON_PAPER : INK,
                  background: l.code === current ? INK : 'transparent',
                  borderTop: i === 0 ? 'none' : `1px solid ${PAPER_LIGHT}`,
                }}
              >
                <span style={{ fontSize: 15 }}>{l.flag}</span>
                <span style={{ flex: 1 }}>{l.label}</span>
                {l.code === current && (
                  <Check style={{ width: 13, height: 13, color: INK_ON_PAPER }} />
                )}
              </button>
            ))}
          </div>
        </>
      )}
      <span style={{ display: 'none' }}>{MUTE}</span>
    </div>
  );
}
