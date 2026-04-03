import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/hooks/useAuth';

export const metadata: Metadata = {
  title: '神戸立ち飲みマップ — 三宮・元町エリア90店舗掲載',
  description: '神戸三宮・元町エリアの立ち飲み・角打ち90店舗掲載。今夜の一杯をご案内。外国語対応。Kobe standing bar guide.',
  keywords: '神戸,立ち飲み,角打ち,三宮,元町,Kobe,standing bar,kakuuchi,tachinomi',
  openGraph: {
    title: '神戸立ち飲みマップ',
    description: '三宮・元町の立ち飲み90店 — 今夜の一杯はここで見つかる',
    type: 'website',
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
  return (
    <html lang="en">
      <body className="bg-harbor-50 min-h-screen">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
