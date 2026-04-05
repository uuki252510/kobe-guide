'use client';

import ChatInterface from '@/components/ChatInterface';
import BottomNav from '@/components/BottomNav';
import Link from 'next/link';
import Image from 'next/image';
import { useCourse } from '@/hooks/useCourse';

export default function Home() {
  const { count: courseCount } = useCourse();

  return (
    <main className="flex flex-col h-dvh bg-harbor-50 pb-14">
      {/* ヘッダー */}
      <header className="flex-shrink-0 px-4 pt-4 pb-3 border-b border-harbor-200 bg-white/90 backdrop-blur-sm shadow-nav-bottom">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Image src="/logo.jpg" alt="神戸立ち飲みマップ" width={80} height={44} className="object-contain mix-blend-multiply" />
            <div>
              <h1 className="text-harbor-800 font-bold text-base leading-tight">
                神戸立ち飲みマップ
              </h1>
              <p className="text-harbor-500 text-[11px] mt-0.5">
                三宮・元町 · 90店舗
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {courseCount > 0 && (
              <Link
                href="/map"
                className="flex items-center gap-1 text-xs px-2.5 py-1.5 bg-kobe-red/10 border border-kobe-red/50 text-kobe-red rounded-full font-bold"
              >
                🍺 {courseCount}店
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* チャット */}
      <div className="flex-1 overflow-hidden">
        <ChatInterface />
      </div>

      <BottomNav courseCount={courseCount} />
    </main>
  );
}
