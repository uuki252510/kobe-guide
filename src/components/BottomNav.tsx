'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookmarkSimple,
  ChatCircleDots,
  MapTrifold,
  MagnifyingGlass,
} from '@phosphor-icons/react';

interface Props {
  courseCount?: number;
}

const tabs = [
  { href: '/', icon: ChatCircleDots, label: '相談' },
  { href: '/stores', icon: MagnifyingGlass, label: '探す' },
  { href: '/map', icon: MapTrifold, label: '地図' },
  { href: '/saved', icon: BookmarkSimple, label: '保存' },
];

export default function BottomNav({ courseCount = 0 }: Props) {
  const pathname = usePathname();

  return (
    <nav className="bottom-nav" aria-label="下部ナビゲーション">
      <div className="bottom-nav__inner">
        {tabs.map(({ href, icon: Icon, label }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link key={href} href={href} className={`bottom-nav__link ${active ? 'is-active' : ''}`} aria-current={active ? 'page' : undefined}>
              <span className="bottom-nav__icon">
                <Icon size={23} weight={active ? 'fill' : 'regular'} aria-hidden="true" />
                {href === '/map' && courseCount > 0 ? <span className="nav-badge">{courseCount > 9 ? '9+' : courseCount}</span> : null}
              </span>
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
