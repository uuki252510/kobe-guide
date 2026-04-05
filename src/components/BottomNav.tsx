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
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-harbor-950/95 backdrop-blur-sm border-t border-harbor-800">
      <div className="max-w-2xl mx-auto flex">
        {tabs.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href));
          const isMap = href === '/map';
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 transition-colors relative ${
                active
                  ? 'text-kobe-gold'
                  : 'text-harbor-500 hover:text-harbor-300'
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {isMap && courseCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-kobe-red text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full leading-none">
                    {courseCount > 9 ? '9+' : courseCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] leading-none">{label}</span>
            </Link>
          );
        })}
      </div>
      {/* iOS safe area */}
      <div className="h-safe-bottom" />
    </nav>
  );
}
