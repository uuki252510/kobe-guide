'use client';

import ChatInterface from '@/components/ChatInterface';
import BottomNav from '@/components/BottomNav';
import Link from 'next/link';
import { useCourse } from '@/hooks/useCourse';

export default function Home() {
  const { count: courseCount } = useCourse();

  return (
    <main
      className="flex flex-col overflow-hidden"
      style={{ height: '100dvh', background: '#000', paddingBottom: 56 }}
    >

      {/* ── Apple Glass Nav ─────────────────────────────────── */}
      <header
        className="ap-glass font-ap-body flex-shrink-0 flex items-center justify-between px-5"
        style={{
          height: 48,
          position: 'sticky', top: 0, zIndex: 50,
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        {/* App name */}
        <span
          className="font-ap-display"
          style={{
            fontSize: 17, fontWeight: 600, color: '#fff',
            letterSpacing: '-0.28px', lineHeight: 1,
          }}
        >
          神戸立ち飲みMAP
        </span>

        {/* Nav links */}
        <div className="flex items-center gap-3">
          {courseCount > 0 && (
            <Link
              href="/map"
              className="font-ap-body"
              style={{
                fontSize: 12, color: '#2997ff',
                letterSpacing: '-0.12px',
              }}
            >
              🍺 {courseCount}店
            </Link>
          )}
          <Link
            href="/stores"
            className="font-ap-body"
            style={{
              fontSize: 12, color: '#fff',
              padding: '5px 14px',
              background: 'rgba(255,255,255,0.10)',
              borderRadius: 980,
              border: '1px solid rgba(255,255,255,0.16)',
              letterSpacing: '-0.12px',
              lineHeight: 1,
            }}
          >
            店一覧
          </Link>
        </div>
      </header>

      {/* ── Hero Section (black) ────────────────────────────── */}
      <section
        style={{
          flexShrink: 0,
          background: '#000',
          padding: '44px 24px 36px',
          textAlign: 'center',
        }}
      >
        {/* Eyebrow */}
        <p
          className="font-ap-body"
          style={{
            fontSize: 12, fontWeight: 400, color: 'rgba(255,255,255,0.5)',
            letterSpacing: '0.08em', textTransform: 'uppercase',
            marginBottom: 14,
          }}
        >
          Kobe Tachinomi Guide
        </p>

        {/* Hero headline — SF Pro Display 56px */}
        <h1
          className="font-ap-display"
          style={{
            fontSize: 'clamp(40px, 11vw, 56px)',
            fontWeight: 600,
            lineHeight: 1.07,
            letterSpacing: '-0.5px',
            color: '#fff',
            marginBottom: 16,
          }}
        >
          神戸立ち飲み<br />ガイド
        </h1>

        {/* Sub-heading — SF Pro Display 21px */}
        <p
          className="font-ap-display"
          style={{
            fontSize: 21, fontWeight: 400,
            lineHeight: 1.19, letterSpacing: '0.231px',
            color: 'rgba(255,255,255,0.70)',
            marginBottom: 28,
          }}
        >
          三宮・元町エリア · 86店舗
        </p>

        {/* Apple-style CTA pair */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
          {/* Primary — Apple Blue filled */}
          <Link
            href="/stores"
            className="font-ap-body"
            style={{
              fontSize: 17, fontWeight: 400,
              letterSpacing: '-0.374px',
              color: '#fff',
              background: '#0071e3',
              padding: '8px 20px',
              borderRadius: 980,
              textDecoration: 'none',
              display: 'inline-block',
            }}
          >
            店を探す
          </Link>

          {/* Secondary — outline pill */}
          <Link
            href="/map"
            className="font-ap-body"
            style={{
              fontSize: 17, fontWeight: 400,
              letterSpacing: '-0.374px',
              color: '#2997ff',
              background: 'transparent',
              padding: '7px 20px',
              borderRadius: 980,
              border: '1px solid rgba(41,151,255,0.45)',
              textDecoration: 'none',
              display: 'inline-block',
            }}
          >
            地図を見る
          </Link>
        </div>
      </section>

      {/* ── Divider ─────────────────────────────────────────── */}
      <div style={{ flexShrink: 0, height: 1, background: 'rgba(255,255,255,0.06)' }} />

      {/* ── Chat Section (near-black) ────────────────────────── */}
      <section
        style={{
          flex: 1, overflow: 'hidden',
          background: '#1d1d1f',
          display: 'flex', flexDirection: 'column',
        }}
      >
        {/* Section label */}
        <div
          style={{
            flexShrink: 0,
            padding: '18px 20px 14px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <p
            className="font-ap-display"
            style={{
              fontSize: 21, fontWeight: 600,
              color: '#fff',
              lineHeight: 1.19, letterSpacing: '0.231px',
            }}
          >
            AIに質問する
          </p>
          <p
            className="font-ap-body"
            style={{
              fontSize: 14, fontWeight: 400,
              color: 'rgba(255,255,255,0.45)',
              lineHeight: 1.43, letterSpacing: '-0.224px',
              marginTop: 3,
            }}
          >
            気分・予算・エリアを教えてください
          </p>
        </div>

        {/* Chat interface */}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <ChatInterface />
        </div>
      </section>

      <BottomNav courseCount={courseCount} />
    </main>
  );
}
