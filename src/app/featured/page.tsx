'use client';

import FeaturedStores from '@/components/FeaturedStores';
import BottomNav from '@/components/BottomNav';
import LangSwitcher from '@/components/LangSwitcher';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft } from 'lucide-react';
import { useCourse } from '@/hooks/useCourse';

const INK  = '#262220';
const PAPER = '#F3ECDD';
const MUTE = '#857E78';

export default function FeaturedPage() {
  const { count: courseCount } = useCourse();

  return (
    <main className="flex flex-col min-h-dvh pb-14" style={{ background: PAPER }}>
      <header
        className="sticky top-0 z-40 flex-shrink-0 px-4 pt-3 pb-3"
        style={{
          background: PAPER,
          borderBottom: `1px solid ${INK}`,
        }}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Link
              href="/"
              className="flex items-center justify-center flex-shrink-0"
              style={{
                width: 32, height: 32,
                background: 'transparent',
                border: `1px solid ${INK}`,
                color: INK,
              }}
              aria-label="戻る"
            >
              <ChevronLeft style={{ width: 18, height: 18 }} />
            </Link>
            <Image
              src="/logo.jpg"
              alt=""
              width={40} height={24}
              className="object-contain mix-blend-multiply flex-shrink-0"
            />
            <div className="min-w-0">
              <h1
                className="font-bold text-[15px] leading-tight truncate"
                style={{ color: INK }}
              >
                今週のおすすめ
              </h1>
              <p className="text-[10px] mt-0.5 truncate tracking-[0.02em]" style={{ color: MUTE }}>
                編集部が選ぶ話題の90店
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <LangSwitcher />
            {courseCount > 0 && (
              <Link
                href="/map"
                className="flex items-center gap-1 text-[11px] px-2.5 py-1.5 font-bold tracking-[0.04em]"
                style={{
                  background: 'transparent',
                  border: `1px solid ${INK}`,
                  color: INK,
                }}
              >
                🍺 {courseCount}
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="pt-2">
        <FeaturedStores />
      </div>

      <BottomNav courseCount={courseCount} />
    </main>
  );
}
