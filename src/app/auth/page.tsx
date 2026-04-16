'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { ChevronLeft } from 'lucide-react';

type Mode = 'login' | 'signup';

const C = {
  paper:      '#F3ECDD',
  surface:    '#FAF4E6',
  ink:        '#262220',
  inkSoft:    '#3D3832',
  mute:       '#857E78',
  rule:       '#D5CBBE',
  accent:     '#B94A3B',
  inkOnPaper: '#FAF4E6',
};

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result =
      mode === 'login'
        ? await signIn(email, password)
        : await signUp(email, password, username);

    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      router.push('/feed');
    }
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

  return (
    <main
      className="min-h-dvh flex flex-col"
      style={{ background: C.paper }}
    >
      <header
        className="flex items-center gap-2 px-4 pt-4 pb-3"
        style={{ borderBottom: `1px solid ${C.ink}`, background: C.paper }}
      >
        <Link
          href="/"
          className="flex items-center justify-center"
          style={{
            width: 32, height: 32,
            background: 'transparent',
            border: `1px solid ${C.ink}`,
            color: C.ink,
            borderRadius: 0,
          }}
          aria-label="戻る"
        >
          <ChevronLeft style={{ width: 18, height: 18 }} />
        </Link>
        <Image
          src="/logo.jpg" alt="" width={40} height={24}
          className="object-contain mix-blend-multiply"
        />
        <h1 style={{ fontSize: 15, fontWeight: 700, color: C.ink, letterSpacing: '-0.01em' }}>
          {mode === 'login' ? 'ログイン' : '新規登録'}
        </h1>
      </header>

      <div className="flex-1 flex items-start justify-center px-4 pt-8 pb-12">
        <div className="w-full max-w-sm">
          <div
            className="flex mb-6"
            style={{
              border: `1px solid ${C.ink}`,
              borderRadius: 0,
            }}
          >
            {(['login', 'signup'] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); }}
                className="flex-1 py-2.5 text-sm"
                style={{
                  borderRadius: 0,
                  fontWeight: 700,
                  background: mode === m ? C.ink : 'transparent',
                  color: mode === m ? C.inkOnPaper : C.ink,
                  letterSpacing: '0.08em',
                }}
              >
                {m === 'login' ? 'ログイン' : '新規登録'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label
                  className="block mb-2"
                  style={{
                    fontSize: 10, color: C.mute, fontWeight: 700,
                    letterSpacing: '0.2em', textTransform: 'uppercase',
                  }}
                >
                  ユーザー名
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase())}
                  placeholder="kobe_tachinomi"
                  required
                  pattern="^[a-z0-9_]{3,30}$"
                  style={inputStyle}
                />
                <p style={{ fontSize: 10, color: C.mute, marginTop: 4, letterSpacing: '0.04em' }}>
                  英小文字・数字・_ / 3〜30文字
                </p>
              </div>
            )}

            <div>
              <label
                className="block mb-2"
                style={{
                  fontSize: 10, color: C.mute, fontWeight: 700,
                  letterSpacing: '0.2em', textTransform: 'uppercase',
                }}
              >
                メール
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                style={inputStyle}
              />
            </div>

            <div>
              <label
                className="block mb-2"
                style={{
                  fontSize: 10, color: C.mute, fontWeight: 700,
                  letterSpacing: '0.2em', textTransform: 'uppercase',
                }}
              >
                パスワード
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="8文字以上"
                required
                minLength={8}
                style={inputStyle}
              />
            </div>

            {error && (
              <p style={{ fontSize: 12, color: C.accent, padding: '0 4px' }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2"
              style={{
                padding: '13px 16px',
                background: C.ink,
                color: C.inkOnPaper,
                fontWeight: 700,
                fontSize: 13,
                borderRadius: 0,
                opacity: loading ? 0.6 : 1,
                cursor: loading ? 'not-allowed' : 'pointer',
                letterSpacing: '0.12em',
                lineHeight: 1,
              }}
            >
              {loading && (
                <span
                  className="inline-block animate-pulse"
                  style={{ width: 20, height: 1, background: C.inkOnPaper }}
                />
              )}
              {mode === 'login' ? 'ログイン' : 'アカウント作成'}
            </button>
          </form>

          <p
            className="text-center mt-6"
            style={{ fontSize: 12, color: C.mute, lineHeight: 1.8 }}
          >
            {mode === 'login' ? 'まだの方は' : 'アカウントがある方は'}{' '}
            <button
              onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
              style={{
                color: C.ink, fontWeight: 700,
                textDecoration: 'underline',
                textUnderlineOffset: 3,
              }}
            >
              {mode === 'login' ? '新規登録' : 'ログイン'}
            </button>
          </p>
        </div>
      </div>
    </main>
  );
}
