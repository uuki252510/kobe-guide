'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2, Check, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const AREA_OPTIONS = [
  { value: '',             label: 'こだわりなし' },
  { value: 'sannomiya',   label: '三宮' },
  { value: 'motomachi',   label: '元町' },
  { value: 'surroundings', label: '周辺' },
];

export default function ProfileEditPage() {
  const router = useRouter();
  const { user, profile, accessToken, refreshProfile, loading } = useAuth();

  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [areaPreference, setAreaPreference] = useState('');
  const [favoritesPublic, setFavoritesPublic] = useState(true);
  const [visitsPublic, setVisitsPublic] = useState(true);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  // プロフィール読み込み後にフォームへ反映
  useEffect(() => {
    if (!profile) return;
    setDisplayName(profile.display_name ?? '');
    setBio(profile.bio ?? '');
    setAreaPreference(profile.area_preference ?? '');
    setFavoritesPublic(profile.favorites_public);
    setVisitsPublic(profile.visits_public);
  }, [profile]);

  // 未ログインはリダイレクト
  useEffect(() => {
    if (!loading && !user) router.replace('/auth');
  }, [loading, user, router]);

  const handleSave = async () => {
    if (!user || !accessToken) return;
    setSaving(true);
    setError('');

    const res = await fetch(`/api/profile/${user.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        display_name: displayName.trim() || null,
        bio: bio.trim() || null,
        area_preference: areaPreference || null,
        favorites_public: favoritesPublic,
        visits_public: visitsPublic,
      }),
    });

    if (res.ok) {
      await refreshProfile();
      setSaved(true);
      setTimeout(() => {
        router.push(user ? `/users/${user.id}` : '/');
      }, 800);
    } else {
      const json = await res.json();
      setError(json.error ?? '保存に失敗しました');
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-dvh bg-harbor-950">
        <Loader2 className="w-6 h-6 text-kobe-gold animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-harbor-950 pb-16">
      {/* ヘッダー */}
      <div className="sticky top-0 z-10 bg-harbor-950/95 backdrop-blur-sm border-b border-harbor-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="text-harbor-400 hover:text-harbor-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-harbor-100 font-semibold text-sm">プロフィール編集</span>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || saved}
          className={`flex items-center gap-1.5 text-xs px-4 py-2 rounded-full font-bold transition-all ${
            saved
              ? 'bg-green-500 text-white'
              : 'bg-kobe-gold text-harbor-950 hover:bg-kobe-amber active:scale-95'
          }`}
        >
          {saving ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : saved ? (
            <Check className="w-3.5 h-3.5" />
          ) : (
            <Save className="w-3.5 h-3.5" />
          )}
          {saved ? '保存完了' : '保存'}
        </button>
      </div>

      <div className="px-4 py-6 space-y-5 max-w-lg mx-auto">
        {/* ユーザー名（読み取り専用） */}
        <div>
          <label className="block text-harbor-400 text-xs font-medium mb-1.5">
            ユーザー名 <span className="text-harbor-600">(変更不可)</span>
          </label>
          <div className="w-full px-4 py-3 bg-harbor-900 border border-harbor-700 rounded-xl text-harbor-500 text-sm">
            @{profile?.username ?? '—'}
          </div>
        </div>

        {/* 表示名 */}
        <div>
          <label className="block text-harbor-300 text-xs font-medium mb-1.5">
            表示名
          </label>
          <input
            type="text"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            maxLength={40}
            placeholder="表示名（省略するとユーザー名が使用されます）"
            className="w-full px-4 py-3 bg-harbor-900 border border-harbor-700 rounded-xl text-harbor-100 text-sm placeholder-harbor-600 focus:outline-none focus:border-kobe-gold transition-colors"
          />
          <p className="text-harbor-600 text-xs mt-1 text-right">{displayName.length}/40</p>
        </div>

        {/* 自己紹介 */}
        <div>
          <label className="block text-harbor-300 text-xs font-medium mb-1.5">
            自己紹介
          </label>
          <textarea
            value={bio}
            onChange={e => setBio(e.target.value)}
            maxLength={160}
            rows={3}
            placeholder="神戸の立ち飲みを愛するひとこと..."
            className="w-full px-4 py-3 bg-harbor-900 border border-harbor-700 rounded-xl text-harbor-100 text-sm placeholder-harbor-600 focus:outline-none focus:border-kobe-gold transition-colors resize-none"
          />
          <p className="text-harbor-600 text-xs mt-1 text-right">{bio.length}/160</p>
        </div>

        {/* エリア好み */}
        <div>
          <label className="block text-harbor-300 text-xs font-medium mb-1.5">
            よく行くエリア
          </label>
          <div className="flex gap-2 flex-wrap">
            {AREA_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setAreaPreference(opt.value)}
                className={`text-xs px-3 py-2 rounded-full border transition-colors ${
                  areaPreference === opt.value
                    ? 'bg-kobe-gold text-harbor-950 border-kobe-gold font-bold'
                    : 'bg-harbor-900 border-harbor-700 text-harbor-400 hover:border-harbor-500'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* プライバシー設定 */}
        <div className="bg-harbor-900 border border-harbor-800 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-harbor-800">
            <p className="text-harbor-300 text-sm font-semibold">プライバシー設定</p>
            <p className="text-harbor-600 text-xs mt-0.5">他のユーザーに公開する情報を選択</p>
          </div>

          {/* お気に入り公開 */}
          <button
            onClick={() => setFavoritesPublic(v => !v)}
            className="w-full flex items-center justify-between px-4 py-4 hover:bg-harbor-800/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">❤️</span>
              <div className="text-left">
                <p className="text-harbor-200 text-sm font-medium">お気に入りを公開</p>
                <p className="text-harbor-500 text-xs mt-0.5">
                  {favoritesPublic ? 'プロフィールに表示されます' : '自分だけ見えます'}
                </p>
              </div>
            </div>
            <div className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border ${
              favoritesPublic
                ? 'bg-kobe-gold/10 border-kobe-gold/40 text-kobe-gold'
                : 'bg-harbor-800 border-harbor-700 text-harbor-500'
            }`}>
              {favoritesPublic ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
              {favoritesPublic ? '公開' : '非公開'}
            </div>
          </button>

          {/* 訪問履歴公開 */}
          <button
            onClick={() => setVisitsPublic(v => !v)}
            className="w-full flex items-center justify-between px-4 py-4 border-t border-harbor-800 hover:bg-harbor-800/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">🍺</span>
              <div className="text-left">
                <p className="text-harbor-200 text-sm font-medium">訪問履歴を公開</p>
                <p className="text-harbor-500 text-xs mt-0.5">
                  {visitsPublic ? 'プロフィールに表示されます' : '自分だけ見えます'}
                </p>
              </div>
            </div>
            <div className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border ${
              visitsPublic
                ? 'bg-kobe-gold/10 border-kobe-gold/40 text-kobe-gold'
                : 'bg-harbor-800 border-harbor-700 text-harbor-500'
            }`}>
              {visitsPublic ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
              {visitsPublic ? '公開' : '非公開'}
            </div>
          </button>
        </div>

        {error && (
          <p className="text-kobe-red text-sm text-center px-4 py-3 bg-kobe-red/10 border border-kobe-red/30 rounded-xl">
            {error}
          </p>
        )}

        {/* プロフィールページへ */}
        {user && (
          <Link
            href={`/users/${user.id}`}
            className="block text-center text-harbor-500 text-xs hover:text-harbor-300 transition-colors"
          >
            プロフィールを確認する →
          </Link>
        )}
      </div>
    </div>
  );
}
