'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Check, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const C = {
  paper:      '#F3ECDD',
  surface:    '#FAF4E6',
  ink:        '#262220',
  inkSoft:    '#3D3832',
  mute:       '#857E78',
  rule:       '#D5CBBE',
  green:      '#2E7D5B',
  accent:     '#B94A3B',
  inkOnPaper: '#FAF4E6',
};

const AREA_OPTIONS = [
  { value: '',             label: 'こだわりなし' },
  { value: 'sannomiya',   label: '三宮' },
  { value: 'motomachi',   label: '元町' },
  { value: 'surroundings', label: '周辺' },
];

function LinePulse() {
  return (
    <span
      className="inline-block animate-pulse"
      style={{ width: 16, height: 1, background: 'currentColor' }}
    />
  );
}

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

  useEffect(() => {
    if (!profile) return;
    setDisplayName(profile.display_name ?? '');
    setBio(profile.bio ?? '');
    setAreaPreference(profile.area_preference ?? '');
    setFavoritesPublic(profile.favorites_public);
    setVisitsPublic(profile.visits_public);
  }, [profile]);

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
      setError(json.error ?? '保存に失敗');
    }
    setSaving(false);
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '11px 13px',
    background: C.surface,
    border: `1px solid ${C.ink}`,
    borderRadius: 0,
    color: C.ink,
    fontSize: 14,
    outline: 'none',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    color: C.mute,
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    marginBottom: 8,
  };

  if (loading) {
    return (
      <div
        className="flex items-center justify-center h-dvh"
        style={{ background: C.paper }}
      >
        <div style={{ color: C.ink }}>
          <LinePulse />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16" style={{ background: C.paper }}>
      <div
        className="sticky top-0 z-10 px-4 py-3 flex items-center justify-between"
        style={{
          background: C.paper,
          borderBottom: `1px solid ${C.ink}`,
        }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center"
            style={{
              width: 32, height: 32,
              border: `1px solid ${C.ink}`,
              color: C.ink,
              borderRadius: 0,
            }}
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span
            style={{
              color: C.ink, fontWeight: 700, fontSize: 14,
              letterSpacing: '-0.01em',
            }}
          >
            プロフィール編集
          </span>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || saved}
          className="flex items-center gap-1.5"
          style={{
            fontSize: 11, padding: '7px 14px',
            background: saved ? C.green : C.ink,
            color: C.inkOnPaper,
            fontWeight: 700,
            borderRadius: 0,
            letterSpacing: '0.08em',
            lineHeight: 1,
          }}
        >
          {saving ? (
            <LinePulse />
          ) : saved ? (
            <Check className="w-3.5 h-3.5" />
          ) : (
            <Save className="w-3.5 h-3.5" />
          )}
          {saved ? '保存完了' : '保存'}
        </button>
      </div>

      <div className="px-4 py-6 space-y-5 max-w-lg mx-auto">
        <div>
          <label style={labelStyle}>
            ユーザー名
          </label>
          <div
            className="w-full"
            style={{
              padding: '11px 13px',
              background: 'transparent',
              border: `1px solid ${C.rule}`,
              color: C.mute,
              fontSize: 14,
              borderRadius: 0,
            }}
          >
            @{profile?.username ?? '—'}
          </div>
          <p style={{ fontSize: 10, color: C.mute, marginTop: 4, letterSpacing: '0.04em' }}>
            変更不可
          </p>
        </div>

        <div>
          <label style={labelStyle}>
            表示名
          </label>
          <input
            type="text"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            maxLength={40}
            placeholder="省略するとユーザー名が使われる"
            style={inputStyle}
          />
          <p
            style={{
              fontSize: 10, color: C.mute, marginTop: 4, textAlign: 'right',
              letterSpacing: '0.04em',
            }}
          >
            {displayName.length}/40
          </p>
        </div>

        <div>
          <label style={labelStyle}>
            自己紹介
          </label>
          <textarea
            value={bio}
            onChange={e => setBio(e.target.value)}
            maxLength={160}
            rows={3}
            placeholder="神戸の立ち飲みを愛するひとこと"
            style={{ ...inputStyle, resize: 'none' }}
          />
          <p
            style={{
              fontSize: 10, color: C.mute, marginTop: 4, textAlign: 'right',
              letterSpacing: '0.04em',
            }}
          >
            {bio.length}/160
          </p>
        </div>

        <div>
          <label style={labelStyle}>
            よく行くエリア
          </label>
          <div className="flex gap-2 flex-wrap">
            {AREA_OPTIONS.map(opt => {
              const on = areaPreference === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => setAreaPreference(opt.value)}
                  style={{
                    fontSize: 12, padding: '7px 13px',
                    background: on ? C.ink : 'transparent',
                    color: on ? C.inkOnPaper : C.ink,
                    border: `1px solid ${C.ink}`,
                    fontWeight: 700,
                    borderRadius: 0,
                    letterSpacing: '0.04em',
                    lineHeight: 1.2,
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        <div
          style={{
            background: C.surface,
            border: `1px solid ${C.ink}`,
            borderRadius: 0,
          }}
        >
          <div
            className="px-4 py-3"
            style={{ borderBottom: `1px solid ${C.rule}` }}
          >
            <p
              style={{
                color: C.mute, fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
              }}
            >
              公開設定
            </p>
          </div>

          {([
            { state: favoritesPublic, set: setFavoritesPublic, icon: '❤', label: 'お気に入りを公開' },
            { state: visitsPublic, set: setVisitsPublic, icon: '🍺', label: '訪問履歴を公開' },
          ] as const).map((row, i) => (
            <button
              key={row.label}
              onClick={() => row.set(v => !v)}
              className="w-full flex items-center justify-between px-4 py-4"
              style={{
                borderTop: i === 0 ? 'none' : `1px solid ${C.rule}`,
                background: 'transparent',
              }}
            >
              <div className="flex items-center gap-3">
                <span style={{ fontSize: 16 }}>{row.icon}</span>
                <div className="text-left">
                  <p style={{ color: C.ink, fontSize: 13, fontWeight: 700 }}>{row.label}</p>
                  <p
                    style={{
                      color: C.mute, fontSize: 11, marginTop: 2, lineHeight: 1.5,
                    }}
                  >
                    {row.state ? 'プロフィールに表示' : '自分だけが見られる'}
                  </p>
                </div>
              </div>
              <div
                className="flex items-center gap-1.5"
                style={{
                  fontSize: 10, padding: '5px 10px',
                  background: row.state ? C.ink : 'transparent',
                  color: row.state ? C.inkOnPaper : C.mute,
                  border: `1px solid ${row.state ? C.ink : C.rule}`,
                  fontWeight: 700,
                  borderRadius: 0,
                  letterSpacing: '0.12em',
                  lineHeight: 1,
                }}
              >
                {row.state ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                {row.state ? '公開' : '非公開'}
              </div>
            </button>
          ))}
        </div>

        {error && (
          <p
            className="text-center px-4 py-3"
            style={{
              color: C.accent,
              border: `1px solid ${C.accent}`,
              borderRadius: 0,
              fontSize: 12,
            }}
          >
            {error}
          </p>
        )}

        {user && (
          <Link
            href={`/users/${user.id}`}
            className="block text-center"
            style={{
              color: C.mute, fontSize: 11,
              letterSpacing: '0.08em',
            }}
          >
            プロフィールを確認する →
          </Link>
        )}
      </div>
    </div>
  );
}
