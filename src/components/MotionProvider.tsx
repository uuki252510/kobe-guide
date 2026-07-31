'use client';

import { useEffect } from 'react';

/**
 * スクロール連動の登場演出を配線する。
 *
 * 隠れた初期状態は html[data-motion="on"] が付いているときだけ効くので、
 * JS が落ちても reduced-motion でも要素が消えたままにならない。
 */
export default function MotionProvider() {
  useEffect(() => {
    const root = document.documentElement;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    root.dataset.motion = 'on';

    const io = new IntersectionObserver(
      entries => entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }),
      { rootMargin: '0px 0px -8% 0px', threshold: 0.01 },
    );

    let queued = 0;
    const scan = () => {
      queued = 0;
      document.querySelectorAll('[data-reveal]:not(.in)').forEach(el => io.observe(el));
    };
    scan();

    // 相談結果など後から差し込まれる要素も拾う
    const mo = new MutationObserver(() => {
      if (queued) return;
      queued = requestAnimationFrame(scan);
    });
    mo.observe(document.body, { childList: true, subtree: true });

    // 監視が届かなかった要素を取り残さないための保険
    const failsafe = window.setTimeout(() => {
      document.querySelectorAll('[data-reveal]:not(.in)').forEach(el => {
        if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('in');
      });
    }, 1400);

    return () => {
      io.disconnect();
      mo.disconnect();
      if (queued) cancelAnimationFrame(queued);
      window.clearTimeout(failsafe);
      delete root.dataset.motion;
    };
  }, []);

  return null;
}
