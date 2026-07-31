'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowSquareOut,
  BookmarkSimple,
  Check,
  Clock,
  Copy,
  Globe,
  InstagramLogo,
  MapPin,
  MapTrifold,
  Phone,
  Plus,
  Star,
} from '@phosphor-icons/react';
import type { Restaurant } from '@/types/restaurant';
import { useCourse } from '@/hooks/useCourse';
import { useFavorites } from '@/hooks/useFavorites';
import { useVisited } from '@/hooks/useVisited';
import { CLOSING_SOON_MINUTES, getOpenState } from '@/lib/opening-hours';
import AppShell from '@/components/AppShell';
import StoreImage from '@/components/StoreImage';

const AREA_LABEL: Record<string, string> = { sannomiya: '三宮', motomachi: '元町', surroundings: '周辺', kitano: '北野', nankinmachi: '南京町' };
const TYPE_LABEL: Record<string, string> = { tachinomi: '立ち飲み', kakuuchi: '角打ち', yakitori: '焼鳥', seafood: '海鮮', wine: 'ワイン / 酒場', italian: 'イタリアン', hormones: 'ホルモン', bar: 'バー' };

function ScoreBar({ label, score }: { label: string; score: number | null }) {
  if (!score) return null;
  return <div className="score-row"><span>{label}</span><span className="score-row__bar"><span style={{ width: `${score * 20}%` }} /></span><strong>{score}/5</strong></div>;
}

export default function StoreDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { toggleStore, isInCourse } = useCourse();
  const { toggle: toggleFavorite, has } = useFavorites();
  const { toggle: toggleVisited, has: hasVisited } = useVisited();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setLoading(true);
    setLoadError(false);
    fetch(`/api/restaurants/${encodeURIComponent(id)}`)
      .then(response => {
        if (response.status === 404) return { restaurant: null };
        if (!response.ok) throw new Error('failed to load restaurant');
        return response.json();
      })
      .then(data => setRestaurant(data.restaurant ?? null))
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false));
  }, [id, attempt]);

  if (loading) return <AppShell><div className="store-loading"><span>店舗を読み込んでいます…</span></div></AppShell>;
  if (loadError) return <AppShell><div className="store-empty"><div><h1>読み込みに失敗しました</h1><p>通信状態を確認して、もう一度お試しください。</p><button className="primary-button" style={{ marginTop: 16 }} type="button" onClick={() => setAttempt(value => value + 1)}>再読み込み</button></div></div></AppShell>;
  if (!restaurant) return <AppShell><div className="store-empty"><div><h1>店舗が見つかりません</h1><p>掲載を終了したか、URLが変更された可能性があります。</p><button className="primary-button" style={{ marginTop: 16 }} type="button" onClick={() => router.push('/stores')}>店舗一覧へ</button></div></div></AppShell>;

  const inCourse = isInCourse(restaurant.id);
  const favorite = has(restaurant.id);
  const visited = hasVisited(restaurant.id);
  const openState = getOpenState(restaurant.opening_hours_json);
  const budget = restaurant.budget_min && restaurant.budget_max ? `¥${restaurant.budget_min.toLocaleString()}–¥${restaurant.budget_max.toLocaleString()}` : restaurant.budget_max ? `〜¥${restaurant.budget_max.toLocaleString()}` : restaurant.budget_min ? `¥${restaurant.budget_min.toLocaleString()}〜` : '予算は要確認';
  const hours = restaurant.opening_hours_json?.weekdayDescriptions ?? [];

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // 非セキュアコンテキストや権限拒否時は何もしない
    }
  };

  return (
    <AppShell>
      <article className="detail-page">
        <button className="secondary-button detail-back" type="button" onClick={() => router.back()}><ArrowLeft size={18} aria-hidden="true" />戻る</button>

        <section className="detail-hero">
          <StoreImage name={restaurant.name} photoReference={restaurant.photo_reference} className="detail-hero__image" eager width={960} height={720} />
          <div className="detail-hero__body">
            <p className="ui-kicker">{AREA_LABEL[restaurant.area] ?? restaurant.area} / KOBE</p>
            <div className="detail-hero__badges" style={{ marginTop: 12 }}>
              {openState.open === true ? (openState.closesInMinutes != null && openState.closesInMinutes <= CLOSING_SOON_MINUTES
                ? <span className="store-badge store-badge--soon">あと{openState.closesInMinutes}分で閉店</span>
                : <span className="store-badge store-badge--open">営業中</span>) : openState.open === false ? <span className="store-badge store-badge--closed">営業時間外</span> : null}
              <span className="store-badge">{restaurant.tachinomi_type ? TYPE_LABEL[restaurant.tachinomi_type] ?? '立ち飲み' : '立ち飲み'}</span>
              {restaurant.is_new_open ? <span className="store-badge store-badge--new">NEW</span> : null}
            </div>
            <h1>{restaurant.name}</h1>
            <div className="detail-hero__meta"><span><MapPin size={16} aria-hidden="true" />{AREA_LABEL[restaurant.area] ?? restaurant.area}</span>{restaurant.rating ? <span><Star size={16} weight="fill" aria-hidden="true" />{restaurant.rating.toFixed(1)}{restaurant.user_ratings_total ? `（${restaurant.user_ratings_total.toLocaleString()}件）` : ''}</span> : null}</div>
            <div className="detail-budget"><small>一人あたりの目安</small><strong>{budget}</strong></div>
            <div className="detail-actions">
              <button className={`primary-button ${inCourse ? 'is-success' : ''}`} type="button" onClick={() => toggleStore(restaurant)}>{inCourse ? <><Check size={18} aria-hidden="true" />コース追加済み</> : <><Plus size={18} aria-hidden="true" />コースに追加</>}</button>
              <button className={`secondary-button ${favorite ? 'is-active' : ''}`} type="button" onClick={() => toggleFavorite(restaurant.id)}><BookmarkSimple size={18} weight={favorite ? 'fill' : 'regular'} aria-hidden="true" />{favorite ? '保存済み' : '保存する'}</button>
              <button className={`secondary-button ${visited ? 'is-visited-text' : ''}`} type="button" onClick={() => toggleVisited(restaurant.id)} aria-pressed={visited}><Check size={18} weight="bold" aria-hidden="true" />{visited ? '行った' : '行ったことにする'}</button>
              <button className="icon-button" type="button" onClick={copyUrl} aria-label={copied ? 'URLをコピーしました' : 'URLをコピー'}>{copied ? <Check size={18} aria-hidden="true" /> : <Copy size={18} aria-hidden="true" />}</button>
            </div>
          </div>
        </section>

        <div className="detail-grid">
          <section className="detail-card detail-card--wide"><div className="detail-card__head"><MapTrifold size={19} color="var(--primary)" aria-hidden="true" /><h2>この店のポイント</h2></div><div className="detail-card__body"><p>{restaurant.must_try_menu ? `名物は「${restaurant.must_try_menu}」。` : '気軽に立ち寄りやすい神戸の立ち飲みです。'}{restaurant.vibe_tags?.length ? ` ${restaurant.vibe_tags.slice(0, 3).map(tag => tag.replace(/-/g, ' ')).join('・')}な雰囲気。` : ''}</p><div className="tag-list" style={{ marginTop: 14 }}>{restaurant.english_support ? <span className="filter-chip">英語対応</span> : null}{restaurant.vibe_tags?.map(tag => <span className="filter-chip" key={tag}>{tag.replace(/-/g, ' ')}</span>)}</div></div></section>

          <section className="detail-card"><div className="detail-card__head"><Star size={19} color="var(--primary)" aria-hidden="true" /><h2>相性スコア</h2></div><div className="detail-card__body"><ScoreBar label="ひとり向き" score={restaurant.solo_friendly_score} /><ScoreBar label="旅行者向き" score={restaurant.foreigner_friendly_score} /><ScoreBar label="ローカル感" score={restaurant.local_experience_score} /></div></section>

          {hours.length ? <section className="detail-card"><div className="detail-card__head"><Clock size={19} color="var(--primary)" aria-hidden="true" /><h2>営業時間</h2></div><div className="detail-card__body">{hours.map((text, index) => <p key={`${text}-${index}`}>{text}</p>)}</div></section> : null}

          <section className="detail-card"><div className="detail-card__head"><Globe size={19} color="var(--primary)" aria-hidden="true" /><h2>連絡先・外部リンク</h2></div><div className="detail-card__body" style={{ paddingTop: 0, paddingBottom: 0 }}>{restaurant.google_maps_url ? <a className="info-link" href={restaurant.google_maps_url} target="_blank" rel="noopener noreferrer"><MapPin size={18} aria-hidden="true" /><span>Googleマップで開く</span><ArrowSquareOut size={16} aria-hidden="true" /></a> : null}{restaurant.phone_number ? <a className="info-link" href={`tel:${restaurant.phone_number}`}><Phone size={18} aria-hidden="true" /><span>{restaurant.phone_number}</span></a> : null}{restaurant.website ? <a className="info-link" href={restaurant.website} target="_blank" rel="noopener noreferrer"><Globe size={18} aria-hidden="true" /><span>公式サイト</span><ArrowSquareOut size={16} aria-hidden="true" /></a> : null}{restaurant.instagram_handle ? <a className="info-link" href={`https://instagram.com/${restaurant.instagram_handle.replace('@', '')}`} target="_blank" rel="noopener noreferrer"><InstagramLogo size={18} aria-hidden="true" /><span>{restaurant.instagram_handle}</span><ArrowSquareOut size={16} aria-hidden="true" /></a> : null}</div></section>

          {restaurant.formatted_address ? <section className="detail-card detail-card--wide"><div className="detail-card__head"><MapPin size={19} color="var(--primary)" aria-hidden="true" /><h2>住所</h2></div><div className="detail-card__body"><p>{restaurant.formatted_address}</p></div></section> : null}
        </div>

        <div className="detail-mobile-actions"><button className={`primary-button ${inCourse ? 'is-success' : ''}`} type="button" onClick={() => toggleStore(restaurant)}>{inCourse ? <><Check size={18} aria-hidden="true" />コース追加済み</> : <><Plus size={18} aria-hidden="true" />コースに追加</>}</button>{restaurant.google_maps_url ? <a className="secondary-button" href={restaurant.google_maps_url} target="_blank" rel="noopener noreferrer"><MapPin size={18} aria-hidden="true" />地図</a> : null}</div>
      </article>
    </AppShell>
  );
}
