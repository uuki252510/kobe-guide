import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/hooks/useAuth';

export const metadata: Metadata = {
  title: {
    default: '神戸立ち飲みマップ｜三宮・元町エリア90店舗のおすすめ案内',
    template: '%s｜神戸立ち飲みマップ',
  },
  description: '三宮・元町の立ち飲み90店舗を掲載。角打ち・海鮮・ワインスタンドなど気分で選べる神戸ローカルガイド。広告なし・中立な案内。',
  keywords: '神戸,立ち飲み,三宮,元町,角打ち,はしご酒,おすすめ,マップ,Kobe,standing bar,kakuuchi,tachinomi',
  metadataBase: new URL('https://kobe-tachinomi.taip-ai.com'),
  openGraph: {
    title: '神戸立ち飲みマップ｜三宮・元町エリア90店舗',
    description: '三宮・元町の立ち飲み90店舗を掲載。角打ち・海鮮・ワインスタンドなど気分で選べる神戸ローカルガイド。',
    type: 'website',
    url: 'https://kobe-tachinomi.taip-ai.com',
    siteName: '神戸立ち飲みマップ',
    locale: 'ja_JP',
    images: [{ url: '/logo.jpg', width: 1200, height: 630, alt: '神戸立ち飲みマップ' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '神戸立ち飲みマップ｜三宮・元町エリア90店舗',
    description: '三宮・元町の立ち飲み90店舗を掲載。角打ち・海鮮・ワインスタンドなど気分で選べる神戸ローカルガイド。',
    images: ['/logo.jpg'],
  },
  alternates: {
    canonical: 'https://kobe-tachinomi.taip-ai.com',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#050a14',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: '神戸立ち飲みマップ',
    url: 'https://kobe-tachinomi.taip-ai.com',
    description: '三宮・元町の立ち飲み90店舗を掲載。角打ち・海鮮・ワインスタンドなど気分で選べる神戸ローカルガイド。',
    inLanguage: 'ja',
  };

  return (
    <html lang="ja">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-harbor-50 min-h-screen">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
