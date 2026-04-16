'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageSquare, Map, List, Rss, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface Props {
  courseCount?: number;
}

const INK        = '#262220';
const PAPER      = '#F3ECDD';
const INACTIVE   = '#857E78';
const INK_ON_PAPER = '#FAF4E6';

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
    <nav
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: PAPER,
        borderTop: `1px solid ${INK}`,
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
              className="flex-1 flex flex-col items-center justify-center py-2.5 gap-1 relative"
              style={{ color: active ? INK : INACTIVE }}
            >
              <div className="relative">
                <Icon className="w-5 h-5" strokeWidth={active ? 2.25 : 1.75} />
                {isMap && courseCount > 0 && (
                  <span
                    className="absolute -top-1.5 -right-2 flex items-center justify-center font-bold"
                    style={{
                      background: INK,
                      color: INK_ON_PAPER,
                      fontSize: 9,
                      width: 15, height: 15,
                      borderRadius: 0,
                      lineHeight: 1,
                    }}
                  >
                    {courseCount > 9 ? '9+' : courseCount}
                  </span>
                )}
              </div>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: active ? 700 : 500,
                  letterSpacing: active ? '0.08em' : '0.02em',
                  lineHeight: 1,
                  color: active ? INK : INACTIVE,
                }}
              >
                {label}
              </span>
              {active && (
                <span
                  className="absolute top-0 left-1/2 -translate-x-1/2"
                  style={{ width: 20, height: 2, background: INK }}
                />
              )}
            </Link>
          );
        })}
      </div>
      <div className="h-safe-bottom" />
    </nav>
  );
}
