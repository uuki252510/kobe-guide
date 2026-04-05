'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageSquare, Map, List, Rss, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface Props {
  courseCount?: number;
}

export default function BottomNav({ courseCount = 0 }: Props) {
  const pathname = usePathname();
  const { user } = useAuth();

  const tabs = [
    { href: '/',       icon: MessageSquare, label: '案内' },
    { href: '/map',    icon: Map,           label: '地図' },
    { href: '/stores', icon: List,          label: '一覧' },
    { href: '/feed',   icon: Rss,           label: 'フィード' },
    {
      href: user ? `/users/${user.id}` : '/auth',
      icon: User,
      label: user ? 'マイページ' : 'ログイン',
    },
  ];

  return (
    /* Linear glass nav — near-black + blur */
    <nav
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: 'rgba(15,16,17,0.95)',
        backdropFilter: 'saturate(180%) blur(16px)',
        WebkitBackdropFilter: 'saturate(180%) blur(16px)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div className="max-w-2xl mx-auto flex">
        {tabs.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href));
          const isMap = href === '/map';
          return (
            <Link
              key={href}
              href={href}
              className="flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 relative transition-colors"
              style={{ color: active ? '#7170ff' : '#62666d' }}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {isMap && courseCount > 0 && (
                  <span
                    className="absolute -top-1.5 -right-2 text-white text-[9px] font-medium w-4 h-4 flex items-center justify-center rounded-full leading-none"
                    style={{ background: '#5e6ad2', fontWeight: 510 }}
                  >
                    {courseCount > 9 ? '9+' : courseCount}
                  </span>
                )}
              </div>
              <span
                style={{
                  fontSize: 10, fontWeight: active ? 510 : 400,
                  letterSpacing: '-0.08px', lineHeight: 1,
                  color: active ? '#7170ff' : '#62666d',
                }}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
      <div className="h-safe-bottom" />
    </nav>
  );
}
