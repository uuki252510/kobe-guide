'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  MapPin, Phone, Globe, Instagram, Clock,
  Star, ChevronLeft, Copy, Check, Plus,
  ExternalLink, Loader2, Heart, LogIn
} from 'lucide-react';
import type { Restaurant } from '@/types/restaurant';
import { useCourse } from '@/hooks/useCourse';
import { useAuth } from '@/hooks/useAuth';

const C = {
  paper:     '#F3ECDD',
  surface:   '#FAF4E6',
  ink:       '#262220',
  inkSoft:   '#3D3832',
  mute:      '#857E78',
  rule:      '#D5CBBE',
  accent:    '#B94A3B', // 朱（お気に入り・ピットアウト）
  green:     '#2E7D5B', // 訪問中マーク
  ratingStar:'#3D3832',
};

const AREA_LABEL: Record<string, string> = {
  sannomiya:    '三宮',
  motomachi:    '元町',
  surroundings: '周辺',
};

const TYPE_LABEL: Record<string, string> = {
  tachinomi: '立ち飲み',
  kakuuchi:  '角打ち',
  yakitori:  '焼鳥',
  seafood:   '海鮮',
  wine:      'ワイン/酒場',
  italian:   'イタリアン',
  hormones:  'ホルモン',
  bar:       'バー',
};

const TYPE_EMOJI: Record<string, string> = {
  tachinomi: '🍺',
  kakuuchi:  '🍶',
  yakitori:  '🍢',
  seafood:   '🐟',
  wine:      '🍷',
  italian:   '🍕',
  hormones:  '🥩',
  bar:       '🥂',
};

function ScoreBar({ label, score }: { label: string; score: number | null }) {
  if (!score) return null;
  return (
    <div className="flex items-center gap-3">
      <span style={{ fontSize: 12, color: C.mute, width: 80, flexShrink: 0 }}>{label}</span>
      <div
        className="flex-1 overflow-hidden"
        style={{ height: 4, background: C.rule, borderRadius: 0 }}
      >
        <div
          style={{
            height: '100%',
            background: C.ink,
            width: `${(score / 5) * 100}%`,
          }}
        />
      </div>
      <span style={{ fontSize: 12, color: C.inkSoft, fontWeight: 600, width: 28, textAlign: 'right' }}>
        {score}/5
      </span>
    </div>
  );
}

const SECTION_CARD: React.CSSProperties = {
  background: C.surface,
  border: `1px solid ${C.ink}`,
  borderRadius: 0,
  overflow: 'hidden',
};
const SECTION_HEADER: React.CSSProperties = {
  padding: '10px 16px',
  borderBottom: `1px solid ${C.rule}`,
  fontSize: 10,
  fontWeight: 700,
  color: C.ink,
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
};

export default function StoreDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { addStore, removeStore, isInCourse } = useCourse();
  const { user, accessToken } = useAuth();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [shared, setShared] = useState(false);
  const [visitId, setVisitId] = useState<string | null>(null);
  const [checkingIn, setCheckingIn] = useState(false);
  const [favorited, setFavorited] = useState(false);
  const [favoriting, setFavoriting] = useState(false);

  useEffect(() => {
    fetch(`/api/restaurants/${id}`)
      .then(r => r.json())
      .then(d => setRestaurant(d.restaurant ?? null))
      .finally(() => setLoading(false));
  }, [id]);

  const inCourse = restaurant ? isInCourse(restaurant.id) : false;

  const handleCopy = async () => {
    const url = window.location.href;
    await navigator.clipboard.writeText(url);
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = encodeURIComponent(`${restaurant?.name ?? ''}｜神戸立ち飲みマップ`);

  const toggleCourse = () => {
    if (!restaurant) return;
    if (inCourse) {
      removeStore(restaurant.id);
    } else {
      addStore(restaurant);
    }
  };

  const handleCheckIn = async () => {
    if (!restaurant) return;
    if (!user) { router.push('/auth'); return; }
    if (checkingIn) return;
    setCheckingIn(true);
    if (visitId) {
      const res = await fetch('/api/visits', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ visitId }),
      });
      if (res.ok) setVisitId(null);
    } else {
      const res = await fetch('/api/visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ restaurantId: restaurant.id }),
      });
      if (res.ok) {
        const json = await res.json();
        setVisitId(json.visit?.id ?? 'done');
      }
    }
    setCheckingIn(false);
  };

  const handleFavorite = async () => {
    if (!restaurant) return;
    if (!user) { router.push('/auth'); return; }
    if (favoriting) return;
    setFavoriting(true);
    const method = favorited ? 'DELETE' : 'POST';
    const res = await fetch('/api/favorites', {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ restaurantId: restaurant.id }),
    });
    if (res.ok) setFavorited(!favorited);
    setFavoriting(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-dvh gap-2" style={{ background: C.paper }}>
        <span className="inline-block h-px w-10 animate-pulse" style={{ background: C.ink }} />
        <span style={{ fontSize: 11, color: C.mute, letterSpacing: '0.1em' }}>読み込み中</span>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="flex flex-col items-center justify-center h-dvh gap-4" style={{ background: C.paper }}>
        <p style={{ color: C.mute }}>店舗が見つかりませんでした</p>
        <Link href="/stores" style={{ color: C.ink, fontSize: 13, textDecoration: 'underline' }}>
          一覧に戻る
        </Link>
      </div>
    );
  }

  const emoji = restaurant.tachinomi_type ? (TYPE_EMOJI[restaurant.tachinomi_type] ?? '🏮') : '🏮';
  const hours = restaurant.opening_hours_json?.weekdayDescriptions ?? [];
  const budget = restaurant.budget_min && restaurant.budget_max
    ? `¥${restaurant.budget_min.toLocaleString()} 〜 ¥${restaurant.budget_max.toLocaleString()}`
    : restaurant.budget_min
    ? `¥${restaurant.budget_min.toLocaleString()}〜`
    : null;

  return (
    <div className="flex flex-col min-h-dvh" style={{ background: C.paper }}>
      <header
        className="sticky top-0 z-10 flex items-center justify-between px-4 py-3"
        style={{ background: C.paper, borderBottom: `1px solid ${C.ink}` }}
      >
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1"
          style={{ color: C.ink, fontSize: 13, fontWeight: 700, letterSpacing: '0.04em' }}
        >
          <ChevronLeft style={{ width: 16, height: 16 }} />
          戻る
        </button>
        <div className="flex items-center gap-1.5">
          <a
            href={`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center"
            style={{
              width: 36, height: 32,
              background: '#06C755', color: '#FFF',
              fontSize: 11, fontWeight: 700, letterSpacing: '0.05em',
            }}
            aria-label="LINEでシェア"
          >
            LINE
          </a>
          <a
            href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${shareText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center"
            style={{ width: 32, height: 32, background: C.ink, color: C.surface, fontSize: 14, fontWeight: 700 }}
            aria-label="Xでシェア"
          >
            𝕏
          </a>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-3 py-1.5"
            style={{
              fontSize: 12,
              color: C.inkSoft,
              border: `1px solid ${C.ink}`,
              background: 'transparent',
              letterSpacing: '0.04em',
            }}
          >
            {shared ? (
              <Check style={{ width: 14, height: 14, color: C.green }} />
            ) : (
              <Copy style={{ width: 14, height: 14 }} />
            )}
            {shared ? 'コピー完了' : 'URLコピー'}
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto pb-32">
        {/* ヘッダーカード */}
        <div
          className="px-5 pt-6 pb-5"
          style={{ background: C.surface, borderBottom: `1px solid ${C.ink}` }}
        >
          <div className="flex items-start gap-4">
            <div
              style={{
                width: 64, height: 64,
                background: C.rule,
                flexShrink: 0,
                overflow: 'hidden',
              }}
            >
              {restaurant.photo_reference ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`/api/photo?ref=${encodeURIComponent(restaurant.photo_reference)}`}
                  alt={restaurant.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ fontSize: 30 }}>
                  {emoji}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
                {restaurant.is_new_open && (
                  <span
                    style={{
                      background: C.ink, color: C.surface,
                      fontSize: 9, fontWeight: 700,
                      padding: '2px 6px',
                      letterSpacing: '0.1em',
                    }}
                  >
                    NEW
                  </span>
                )}
                {restaurant.tachinomi_type && (
                  <span
                    style={{
                      fontSize: 10, fontWeight: 700, color: C.ink,
                      border: `1px solid ${C.ink}`,
                      padding: '1px 7px',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {TYPE_LABEL[restaurant.tachinomi_type]}
                  </span>
                )}
                <span style={{ fontSize: 11, color: C.mute }}>
                  {AREA_LABEL[restaurant.area] ?? restaurant.area}
                </span>
              </div>
              <h1 style={{ color: C.ink, fontWeight: 800, fontSize: 20, lineHeight: 1.3, letterSpacing: '-0.01em' }}>
                {restaurant.name}
              </h1>
              {restaurant.rating && (
                <div className="flex items-center gap-1 mt-1.5">
                  <Star style={{ width: 13, height: 13, fill: C.ratingStar, color: C.ratingStar }} />
                  <span style={{ fontSize: 13, color: C.inkSoft, fontWeight: 600 }}>{restaurant.rating}</span>
                  {restaurant.user_ratings_total && (
                    <span style={{ fontSize: 11, color: C.mute }}>
                      ({restaurant.user_ratings_total.toLocaleString()}件)
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {budget && (
            <div
              className="mt-4 flex items-center justify-between"
              style={{
                padding: '10px 14px',
                background: C.paper,
                border: `1px solid ${C.ink}`,
              }}
            >
              <span style={{ fontSize: 11, color: C.mute, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                目安予算
              </span>
              <span style={{ fontSize: 14, color: C.ink, fontWeight: 700 }}>{budget} / 人</span>
            </div>
          )}
        </div>

        {/* アクション */}
        <div className="px-4 py-4 space-y-3" style={{ background: C.surface, borderBottom: `1px solid ${C.ink}` }}>
          <div className="flex gap-3">
            {restaurant.instagram_handle ? (
              <a
                href={`https://www.instagram.com/${restaurant.instagram_handle.replace(/^@/, '')}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-3 text-[13px] font-bold"
                style={{
                  background: 'transparent',
                  color: C.ink,
                  border: `1px solid ${C.ink}`,
                  letterSpacing: '0.06em',
                }}
              >
                <Instagram style={{ width: 15, height: 15 }} /> Instagram
              </a>
            ) : restaurant.google_maps_url ? (
              <a
                href={restaurant.google_maps_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-3 text-[13px] font-bold"
                style={{
                  background: C.ink,
                  color: C.surface,
                  letterSpacing: '0.06em',
                }}
              >
                <MapPin style={{ width: 15, height: 15 }} /> Google Maps
              </a>
            ) : null}
            <button
              onClick={toggleCourse}
              className="flex-1 flex items-center justify-center gap-2 py-3 text-[13px] font-bold"
              style={{
                background: inCourse ? C.ink : 'transparent',
                color: inCourse ? C.surface : C.ink,
                border: `1px solid ${C.ink}`,
                letterSpacing: '0.06em',
              }}
            >
              {inCourse ? <Check style={{ width: 15, height: 15 }} /> : <Plus style={{ width: 15, height: 15 }} />}
              {inCourse ? 'コース済み' : 'コース追加'}
            </button>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleCheckIn}
              disabled={checkingIn}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 text-[13px] font-bold active:scale-[0.98] transition-transform"
              style={{
                background: visitId ? C.green : C.ink,
                color: C.surface,
                letterSpacing: '0.06em',
              }}
            >
              {checkingIn ? (
                <Loader2 style={{ width: 15, height: 15 }} className="animate-spin" />
              ) : visitId ? (
                <Check style={{ width: 15, height: 15 }} />
              ) : (
                <span style={{ fontSize: 15, lineHeight: 1 }}>🍺</span>
              )}
              {visitId ? 'イン中 → アウト' : user ? 'ピットイン' : <><LogIn style={{ width: 13, height: 13 }} />ピットイン</>}
            </button>

            <button
              onClick={handleFavorite}
              disabled={favoriting}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 text-[13px] font-bold active:scale-[0.98] transition-transform"
              style={{
                background: favorited ? C.accent : 'transparent',
                color: favorited ? C.surface : C.ink,
                border: `1px solid ${favorited ? C.accent : C.ink}`,
                letterSpacing: '0.06em',
              }}
            >
              {favoriting ? (
                <Loader2 style={{ width: 15, height: 15 }} className="animate-spin" />
              ) : (
                <Heart
                  style={{
                    width: 15, height: 15,
                    fill: favorited ? C.surface : 'none',
                  }}
                />
              )}
              {favorited ? 'お気に入り済み' : 'お気に入り'}
            </button>

            {restaurant.instagram_handle && restaurant.google_maps_url && (
              <a
                href={restaurant.google_maps_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center py-3.5 active:scale-[0.98] transition-transform"
                style={{
                  width: 56,
                  border: `1px solid ${C.ink}`,
                  background: 'transparent',
                  color: C.ink,
                }}
                aria-label="Google Maps"
              >
                <MapPin style={{ width: 18, height: 18 }} />
              </a>
            )}
          </div>
        </div>

        {hours.length > 0 && (
          <div className="mx-4 mt-4" style={SECTION_CARD}>
            <div className="flex items-center gap-2" style={SECTION_HEADER}>
              <Clock style={{ width: 12, height: 12 }} />
              営業時間
            </div>
            <div className="px-4 py-3 space-y-1">
              {hours.map((h, i) => (
                <p key={i} style={{ fontSize: 12, color: C.inkSoft, lineHeight: 1.7 }}>{h}</p>
              ))}
            </div>
          </div>
        )}

        {(restaurant.solo_friendly_score || restaurant.foreigner_friendly_score || restaurant.local_experience_score) && (
          <div className="mx-4 mt-4" style={SECTION_CARD}>
            <div style={SECTION_HEADER}>評価</div>
            <div className="px-4 py-4 space-y-3">
              <ScoreBar label="おひとり様" score={restaurant.solo_friendly_score} />
              <ScoreBar label="外国人OK" score={restaurant.foreigner_friendly_score} />
              <ScoreBar label="ローカル感" score={restaurant.local_experience_score} />
            </div>
          </div>
        )}

        <div className="mx-4 mt-4" style={SECTION_CARD}>
          <div style={SECTION_HEADER}>特徴</div>
          <div className="px-4 py-3 flex flex-wrap gap-2">
            {restaurant.english_support && (
              <span
                className="flex items-center gap-1"
                style={{
                  padding: '3px 9px', fontSize: 11, fontWeight: 700,
                  color: C.ink, border: `1px solid ${C.ink}`,
                  background: 'transparent', letterSpacing: '0.05em',
                }}
              >
                <Globe style={{ width: 11, height: 11 }} /> 英語OK
              </span>
            )}
            {restaurant.vibe_tags.map(tag => (
              <span
                key={tag}
                style={{
                  padding: '3px 9px', fontSize: 11, fontWeight: 600,
                  color: C.inkSoft, border: `1px solid ${C.rule}`,
                  background: 'transparent', letterSpacing: '0.02em',
                }}
              >
                {tag.replace(/-/g, ' ')}
              </span>
            ))}
          </div>
        </div>

        {(restaurant.phone_number || restaurant.website || restaurant.instagram_handle) && (
          <div className="mx-4 mt-4" style={SECTION_CARD}>
            <div style={SECTION_HEADER}>連絡先</div>
            <div>
              {restaurant.phone_number && (
                <a
                  href={`tel:${restaurant.phone_number}`}
                  className="flex items-center gap-3 px-4 py-3"
                  style={{ borderTop: `1px solid ${C.rule}` }}
                >
                  <Phone style={{ width: 14, height: 14, color: C.mute }} />
                  <span style={{ fontSize: 13, color: C.ink }}>{restaurant.phone_number}</span>
                </a>
              )}
              {restaurant.website && (
                <a
                  href={restaurant.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-3"
                  style={{ borderTop: `1px solid ${C.rule}` }}
                >
                  <Globe style={{ width: 14, height: 14, color: C.mute }} />
                  <span style={{ fontSize: 13, color: C.ink, flex: 1 }}>ウェブサイト</span>
                  <ExternalLink style={{ width: 12, height: 12, color: C.mute }} />
                </a>
              )}
              {restaurant.instagram_handle && (
                <a
                  href={`https://instagram.com/${restaurant.instagram_handle.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-3"
                  style={{ borderTop: `1px solid ${C.rule}` }}
                >
                  <Instagram style={{ width: 14, height: 14, color: C.mute }} />
                  <span style={{ fontSize: 13, color: C.ink, flex: 1 }}>{restaurant.instagram_handle}</span>
                  <ExternalLink style={{ width: 12, height: 12, color: C.mute }} />
                </a>
              )}
            </div>
          </div>
        )}

        {restaurant.formatted_address && (
          <div className="mx-4 mt-4 mb-6" style={SECTION_CARD}>
            <div style={SECTION_HEADER}>住所</div>
            <div className="px-4 py-3">
              <p style={{ fontSize: 13, color: C.inkSoft, lineHeight: 1.7 }}>{restaurant.formatted_address}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
