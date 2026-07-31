'use client';

import { useMemo, useState } from 'react';

interface Props {
  name: string;
  photoReference?: string | null;
  className?: string;
  eager?: boolean;
  width?: number;
  height?: number;
}

const FALLBACKS = ['/tachinomi-hero.png', '/561575%20(1).jpg'];

function hashName(value: string) {
  return [...value].reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

/** 画像を <img> 以外(Leafletのマーカー等)で使うとき用 */
export function storePhotoUrl(name: string, photoReference?: string | null) {
  if (photoReference) return `/api/photo?ref=${encodeURIComponent(photoReference)}`;
  return FALLBACKS[hashName(name) % FALLBACKS.length];
}

export default function StoreImage({ name, photoReference, className = '', eager = false, width = 640, height = 480 }: Props) {
  const fallback = useMemo(() => FALLBACKS[hashName(name) % FALLBACKS.length], [name]);
  const initial = photoReference ? `/api/photo?ref=${encodeURIComponent(photoReference)}` : fallback;
  const [src, setSrc] = useState(initial);
  const [prevInitial, setPrevInitial] = useState(initial);

  // key なしで別店舗に再利用されても前の画像が残らないよう、props 由来のURLに追従する
  if (initial !== prevInitial) {
    setPrevInitial(initial);
    setSrc(initial);
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={`${name}の店舗写真`}
      className={className}
      width={width}
      height={height}
      loading={eager ? 'eager' : 'lazy'}
      fetchPriority={eager ? 'high' : 'auto'}
      onError={() => {
        if (src !== fallback) setSrc(fallback);
      }}
    />
  );
}
