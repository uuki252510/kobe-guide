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
      <span className="text-harbor-500 text-xs w-20 flex-shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-harbor-100 rounded-full overflow-hidden">
        <div className="h-full bg-kobe-gold rounded-full" style={{ width: `${(score / 5) * 100}%` }} />
      </div>
      <span className="text-harbor-600 text-xs font-medium w-6 text-right">{score}/5</span>
    </div>
  );
}

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
      // ピットアウト
      const res = await fetch('/api/visits', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ visitId }),
      });
      if (res.ok) setVisitId(null);
    } else {
      // ピットイン
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
      <div className="flex items-center justify-center h-dvh bg-harbor-50">
        <Loader2 className="w-6 h-6 text-harbor-400 animate-spin" />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="flex flex-col items-center justify-center h-dvh gap-4 bg-harbor-50">
        <p className="text-harbor-500">店舗が見つかりませんでした</p>
        <Link href="/stores" className="text-kobe-red text-sm underline">一覧に戻る</Link>
      </div>
    );
  }

  const emoji = restaurant.tachinomi_type ? (TYPE_EMOJI[restaurant.tachinomi_type] ?? '🏮') : '🏮';
  const hours = restaurant.opening_hours_json?.weekdayDescriptions ?? [];
  const budget = restaurant.budget_min && restaurant.budget_max
    ? `¥${restaurant.budget_min.toLocaleString()} ~ ¥${restaurant.budget_max.toLocaleString()}`
    : restaurant.budget_min
    ? `¥${restaurant.budget_min.toLocaleString()}~`
    : null;

  return (
    <div className="flex flex-col min-h-dvh bg-harbor-50">
      <header className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-white/90 backdrop-blur-sm border-b border-harbor-200 shadow-nav-bottom">
        <button onClick={() => router.back()} className="flex items-center gap-1 text-harbor-600 text-sm font-medium">
          <ChevronLeft className="w-4 h-4" />
          戻る
        </button>
        <div className="flex items-center gap-1.5">
          <a
            href={`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-9 h-9 bg-[#06C755] rounded-lg hover:opacity-80 transition-opacity"
            aria-label="LINEでシェア"
          >
            <span className="text-white text-xs font-bold">LINE</span>
          </a>
          <a
            href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${shareText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-9 h-9 bg-black rounded-lg hover:opacity-80 transition-opacity"
            aria-label="Xでシェア"
          >
            <span className="text-white text-xs font-bold">𝕏</span>
          </a>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-harbor-600 text-sm px-3 py-1.5 rounded-lg hover:bg-harbor-100 transition-colors"
          >
            {shared ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            {shared ? 'コピー完了' : 'URLコピー'}
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto pb-32">
        <div className="bg-white px-5 pt-6 pb-5 border-b border-harbor-100">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 bg-harbor-100">
            {restaurant.photo_reference ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`/api/photo?ref=${encodeURIComponent(restaurant.photo_reference)}`}
                alt={restaurant.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl">{emoji}</div>
            )}
          </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                {restaurant.is_new_open && (
                  <span className="bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">NEW</span>
                )}
                {restaurant.tachinomi_type && (
                  <span className="text-xs text-harbor-500 bg-harbor-100 px-2 py-0.5 rounded-full">{TYPE_LABEL[restaurant.tachinomi_type]}</span>
                )}
                <span className="text-xs text-harbor-400">{AREA_LABEL[restaurant.area] ?? restaurant.area}</span>
              </div>
              <h1 className="text-harbor-900 font-bold text-xl leading-tight">{restaurant.name}</h1>
              {restaurant.internal_notes && (
                <p className="text-harbor-500 text-xs mt-1 leading-relaxed italic">"{restaurant.internal_notes}"</p>
              )}
              {restaurant.rating && (
                <div className="flex items-center gap-1 mt-1">
                  <Star className="w-3.5 h-3.5 text-kobe-gold fill-kobe-gold" />
                  <span className="text-harbor-700 text-sm font-medium">{restaurant.rating}</span>
                  {restaurant.user_ratings_total && (
                    <span className="text-harbor-400 text-xs">({restaurant.user_ratings_total.toLocaleString()}件)</span>
                  )}
                </div>
              )}
            </div>
          </div>
          {budget && (
            <div className="mt-4 px-4 py-3 bg-harbor-50 rounded-xl border border-harbor-200 flex items-center justify-between">
              <span className="text-harbor-500 text-sm">目安予算</span>
              <span className="text-harbor-800 font-semibold">{budget} / 人</span>
            </div>
          )}
        </div>

        <div className="px-4 py-4 bg-white border-b border-harbor-100 space-y-3">
          {/* 1段目：Maps + コース追加 */}
          <div className="flex gap-3">
            {restaurant.google_maps_url && (
              <a
                href={restaurant.google_maps_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-kobe-gold text-harbor-950 rounded-xl text-sm font-semibold hover:bg-kobe-amber transition-colors"
              >
                <MapPin className="w-4 h-4" /> Google Maps
              </a>
            )}
            <button
              onClick={toggleCourse}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-colors border ${
                inCourse ? 'bg-kobe-red/10 text-kobe-red border-kobe-red/30' : 'bg-harbor-100 text-harbor-700 border-harbor-200 hover:bg-harbor-200'
              }`}
            >
              {inCourse ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {inCourse ? 'コース済み' : 'コース追加'}
            </button>
          </div>

          {/* 2段目：ピットイン + お気に入り + Instagram */}
          <div className="flex gap-3">
            <button
              onClick={handleCheckIn}
              disabled={checkingIn}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold transition-all active:scale-95 ${
                visitId
                  ? 'bg-green-500/10 text-green-600 border border-green-500/40 hover:bg-kobe-red/10 hover:text-kobe-red hover:border-kobe-red/40'
                  : 'bg-harbor-950 text-kobe-gold border border-kobe-gold/40 hover:bg-harbor-800'
              }`}
            >
              {checkingIn ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : visitId ? (
                <Check className="w-4 h-4" />
              ) : (
                <span className="text-base leading-none">🍺</span>
              )}
              {visitId ? 'イン中 → アウト' : user ? 'ピットイン' : <><LogIn className="w-3.5 h-3.5" />ピットイン</>}
            </button>

            <button
              onClick={handleFavorite}
              disabled={favoriting}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold transition-all active:scale-95 border ${
                favorited
                  ? 'bg-kobe-red/10 text-kobe-red border-kobe-red/30'
                  : 'bg-harbor-50 text-harbor-600 border-harbor-200 hover:bg-harbor-100'
              }`}
            >
              {favoriting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Heart className={`w-4 h-4 ${favorited ? 'fill-kobe-red' : ''}`} />
              )}
              {favorited ? 'お気に入り済み' : 'お気に入り'}
            </button>

            {restaurant.instagram_handle && (
              <a
                href={`https://www.instagram.com/${restaurant.instagram_handle.replace(/^@/, '')}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-14 py-3.5 rounded-xl border border-pink-200 bg-gradient-to-br from-purple-50 to-pink-50 text-pink-600 hover:from-purple-100 hover:to-pink-100 transition-all active:scale-95"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
            )}
          </div>
        </div>

        {hours.length > 0 && (
          <div className="mx-4 mt-4 bg-white rounded-xl border border-harbor-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-harbor-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-harbor-400" />
              <span className="text-harbor-700 font-medium text-sm">営業時間</span>
            </div>
            <div className="px-4 py-3 space-y-1">
              {hours.map((h, i) => <p key={i} className="text-harbor-600 text-xs leading-relaxed">{h}</p>)}
            </div>
          </div>
        )}

        {restaurant.must_try_menu && (
          <div className="mx-4 mt-4 bg-white rounded-xl border border-harbor-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-harbor-100">
              <span className="text-harbor-700 font-medium text-sm">🍽️ おすすめ</span>
            </div>
            <div className="px-4 py-3">
              <p className="text-harbor-700 text-sm leading-relaxed">{restaurant.must_try_menu}</p>
            </div>
          </div>
        )}

        {(restaurant.solo_friendly_score || restaurant.foreigner_friendly_score || restaurant.local_experience_score) && (
          <div className="mx-4 mt-4 bg-white rounded-xl border border-harbor-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-harbor-100">
              <span className="text-harbor-700 font-medium text-sm">評価</span>
            </div>
            <div className="px-4 py-4 space-y-3">
              <ScoreBar label="おひとり様" score={restaurant.solo_friendly_score} />
              <ScoreBar label="外国人OK" score={restaurant.foreigner_friendly_score} />
              <ScoreBar label="ローカル感" score={restaurant.local_experience_score} />
            </div>
          </div>
        )}

        <div className="mx-4 mt-4 bg-white rounded-xl border border-harbor-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-harbor-100">
            <span className="text-harbor-700 font-medium text-sm">特徴</span>
          </div>
          <div className="px-4 py-3 flex flex-wrap gap-2">
            {restaurant.english_support && (
              <span className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-600 text-xs rounded-full border border-blue-200">
                <Globe className="w-3 h-3" /> 英語OK
              </span>
            )}
            {restaurant.vibe_tags.map(tag => (
              <span key={tag} className="px-2.5 py-1 bg-harbor-100 text-harbor-600 text-xs rounded-full border border-harbor-200">
                {tag.replace(/-/g, ' ')}
              </span>
            ))}
          </div>
        </div>

        {(restaurant.phone_number || restaurant.website || restaurant.instagram_handle) && (
          <div className="mx-4 mt-4 bg-white rounded-xl border border-harbor-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-harbor-100">
              <span className="text-harbor-700 font-medium text-sm">連絡先</span>
            </div>
            <div className="divide-y divide-harbor-100">
              {restaurant.phone_number && (
                <a href={`tel:${restaurant.phone_number}`} className="flex items-center gap-3 px-4 py-3 hover:bg-harbor-50 transition-colors">
                  <Phone className="w-4 h-4 text-harbor-400" />
                  <span className="text-harbor-700 text-sm">{restaurant.phone_number}</span>
                </a>
              )}
              {restaurant.website && (
                <a href={restaurant.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-3 hover:bg-harbor-50 transition-colors">
                  <Globe className="w-4 h-4 text-harbor-400" />
                  <span className="text-harbor-700 text-sm truncate">ウェブサイト</span>
                  <ExternalLink className="w-3 h-3 text-harbor-400 ml-auto" />
                </a>
              )}
              {restaurant.instagram_handle && (
                <a
                  href={`https://instagram.com/${restaurant.instagram_handle.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-3 hover:bg-harbor-50 transition-colors"
                >
                  <Instagram className="w-4 h-4 text-harbor-400" />
                  <span className="text-harbor-700 text-sm">{restaurant.instagram_handle}</span>
                  <ExternalLink className="w-3 h-3 text-harbor-400 ml-auto" />
                </a>
              )}
            </div>
          </div>
        )}

        {restaurant.formatted_address && (
          <div className="mx-4 mt-4 mb-6 bg-white rounded-xl border border-harbor-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-harbor-100">
              <span className="text-harbor-700 font-medium text-sm">住所</span>
            </div>
            <div className="px-4 py-3">
              <p className="text-harbor-600 text-sm leading-relaxed">{restaurant.formatted_address}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
