'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookmarkSimple,
  ChatCircleDots,
  MapTrifold,
  MagnifyingGlass,
} from '@phosphor-icons/react';
import { useCourse } from '@/hooks/useCourse';
import BottomNav from '@/components/BottomNav';

interface Props {
  children: React.ReactNode;
  title?: string;
  eyebrow?: string;
  fullBleed?: boolean;
  actions?: React.ReactNode;
}

const NAV_ITEMS = [
  { href: '/', icon: ChatCircleDots, label: '相談する', description: '気分から3軒を提案' },
  { href: '/stores', icon: MagnifyingGlass, label: 'お店を探す', description: '写真と条件で比較' },
  { href: '/map', icon: MapTrifold, label: '地図とコース', description: '近い順にはしご' },
  { href: '/saved', icon: BookmarkSimple, label: '保存', description: '気になる店を確認' },
];

export default function AppShell({ children, title, eyebrow, fullBleed = false, actions }: Props) {
  const pathname = usePathname();
  const { count } = useCourse();

  const isActive = (href: string) => href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">本文へ移動</a>

      <aside className="app-rail" aria-label="メインナビゲーション">
        <Link href="/" className="brand-lockup" aria-label="神戸立ち飲みマップ ホーム">
          <span className="brand-mark" aria-hidden="true">K</span>
          <span>
            <strong>神戸立ち飲みマップ</strong>
            <small>KOBE STANDING BAR GUIDE</small>
          </span>
        </Link>

        <nav className="rail-nav">
          {NAV_ITEMS.map(({ href, icon: Icon, label, description }) => {
            const active = isActive(href);
            return (
              <Link key={href} href={href} className={`rail-nav__item ${active ? 'is-active' : ''}`} aria-current={active ? 'page' : undefined}>
                <span className="rail-nav__icon">
                  <Icon size={22} weight={active ? 'fill' : 'regular'} aria-hidden="true" />
                  {href === '/map' && count > 0 ? <span className="nav-badge">{count > 9 ? '9+' : count}</span> : null}
                </span>
                <span>
                  <strong>{label}</strong>
                  <small>{description}</small>
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="rail-atmosphere" aria-hidden="true">
          <div className="rail-atmosphere__route">
            <p className="ui-kicker">KOBE NIGHT ROUTE</p>
            <div className="rail-route">
              <div className="rail-route__stop">
                <span>01</span>
                <strong>三宮</strong>
              </div>
              <div className="rail-route__stop">
                <span>02</span>
                <strong>元町</strong>
              </div>
            </div>
            <p className="rail-atmosphere__copy">いい夜は、歩いて見つかる。</p>
          </div>
        </div>
        <section className="rail-guide" aria-labelledby="rail-guide-title">
          <p className="ui-kicker" id="rail-guide-title">HOW TO USE</p>
          <ol>
            <li><span>01</span> 気分や予算を相談</li>
            <li><span>02</span> 3軒を写真で比較</li>
            <li><span>03</span> 地図でコース作成</li>
          </ol>
        </section>

        <p className="rail-area">SANNOMIYA / MOTOMACHI</p>
      </aside>

      <div className="app-frame">
        <header className="mobile-topbar">
          <Link href="/" className="mobile-brand" aria-label="神戸立ち飲みマップ ホーム">
            <span className="brand-mark" aria-hidden="true">K</span>
            <span>神戸立ち飲みマップ</span>
          </Link>
          <Link href="/map" className="mobile-course-link" aria-label={`コース ${count}店`}>
            <MapTrifold size={19} aria-hidden="true" />
            <span>{count}店</span>
          </Link>
        </header>

        {(title || actions) && !fullBleed ? (
          <div className="page-toolbar">
            <div>
              {eyebrow ? <p className="ui-kicker">{eyebrow}</p> : null}
              {title ? <h1>{title}</h1> : null}
            </div>
            {actions ? <div className="page-toolbar__actions">{actions}</div> : null}
          </div>
        ) : null}

        <main id="main-content" className={`app-content ${fullBleed ? 'app-content--bleed' : ''}`}>
          {children}
        </main>
        <BottomNav courseCount={count} />
      </div>
    </div>
  );
}
