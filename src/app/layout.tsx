import type { Metadata, Viewport } from 'next';
import { Barlow_Condensed, Zen_Kaku_Gothic_New } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/hooks/useAuth';
import { Analytics } from '@vercel/analytics/react';

const zenKaku = Zen_Kaku_Gothic_New({
  weight: ['400', '500', '700', '900'],
  display: 'swap',
  preload: false,
  variable: '--font-zen-kaku',
});

const barlowCondensed = Barlow_Condensed({
  weight: ['600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-barlow-condensed',
});

export const metadata: Metadata = {
  title: {
    default: '神戸立ち飲みマップ｜三宮・元町の店選びを相談',
    template: '%s｜神戸立ち飲みマップ',
  },
  description: '気分・予算・エリアを相談すると、三宮・元町の立ち飲みから今夜の3軒を提案。写真・地図・はしごコースまで一つの画面で決められます。',
  keywords: '神戸,立ち飲み,三宮,元町,角打ち,はしご酒,おすすめ,マップ,Kobe,standing bar,kakuuchi,tachinomi',
  metadataBase: new URL('https://kobe-tachinomi.taip-ai.com'),
  openGraph: {
    title: '神戸立ち飲みマップ｜今夜の3軒を相談',
    description: '三宮・元町の立ち飲みを、相談・比較・地図で決めるローカルガイド。',
    type: 'website',
    url: 'https://kobe-tachinomi.taip-ai.com',
    siteName: '神戸立ち飲みマップ',
    locale: 'ja_JP',
    images: [{ url: '/tachinomi-hero.png', width: 1536, height: 1024, alt: '神戸の立ち飲み風景' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '神戸立ち飲みマップ｜今夜の3軒を相談',
    description: '三宮・元町の立ち飲みを、相談・比較・地図で決めるローカルガイド。',
    images: ['/tachinomi-hero.png'],
  },
  alternates: { canonical: 'https://kobe-tachinomi.taip-ai.com' },
  verification: { google: 'tQpqeV4fsdgAS6ihav1ekmppB' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#F4F6F8',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: '神戸立ち飲みマップ',
    url: 'https://kobe-tachinomi.taip-ai.com',
    description: '三宮・元町の立ち飲みを、相談・比較・地図で決めるローカルガイド。',
    inLanguage: 'ja',
  };

  return (
    <html lang="ja" data-scroll-behavior="smooth" className={`${zenKaku.variable} ${barlowCondensed.variable}`}>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-OPPLXYDNBC" />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-OPPLXYDNBC');`,
          }}
        />
      </head>
      <body>
        <AuthProvider>{children}</AuthProvider>
        {process.env.VERCEL ? <Analytics /> : null}
      </body>
    </html>
  );
}
