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
    /* Apple glass nav — rgba(0,0,0,0.8) + saturate(180%) blur(20px) */
    <nav
      className="ap-glass font-ap-body fixed bottom-0 left-0 right-0 z-50"
      style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
    >
      <div className="max-w-2xl mx-auto flex">
        {tabs.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href));
          const isMap = href === '/map';
          return (
            <Link
              key={href}
              href={href}
              className="flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 transition-colors relative"
              style={{ color: active ? '#fff' : 'rgba(255,255,255,0.45)' }}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {isMap && courseCount > 0 && (
                  <span
                    className="absolute -top-1.5 -right-2 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full leading-none"
                    style={{ background: '#0071e3' }}
                  >
                    {courseCount > 9 ? '9+' : courseCount}
                  </span>
                )}
              </div>
              <span
                style={{
                  fontSize: 10, letterSpacing: '-0.08px',
                  lineHeight: 1,
                  color: active ? '#fff' : 'rgba(255,255,255,0.45)',
                }}
              >
                {label}
              </span>
              {/* Active indicator dot — Apple Blue */}
              {active && (
                <span
                  className="absolute bottom-1.5 rounded-full"
                  style={{ width: 4, height: 4, background: '#0071e3' }}
                />
              )}
            </Link>
          );
        })}
      </div>
      {/* iOS safe area */}
      <div className="h-safe-bottom" />
    </nav>
  );
}
