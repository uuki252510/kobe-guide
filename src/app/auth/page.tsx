'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, Landmark } from 'lucide-react';

type Mode = 'login' | 'signup';

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

  return (
    <div className="min-h-screen bg-harbor-950 flex flex-col items-center justify-center px-4 py-12">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-8">
        <Landmark className="w-6 h-6 text-kobe-gold" />
        <span className="text-harbor-100 font-bold text-lg tracking-tight">神戸立ち飲みマップ</span>
      </div>

      <div className="w-full max-w-sm">
        {/* Tab toggle */}
        <div className="flex rounded-xl bg-harbor-900 p-1 mb-6">
          {(['login', 'signup'] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(''); }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === m
                  ? 'bg-kobe-gold text-harbor-950'
                  : 'text-harbor-500 hover:text-harbor-300'
              }`}
            >
              {m === 'login' ? 'ログイン' : '新規登録'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-harbor-400 text-xs mb-1.5">
                ユーザー名 <span className="text-harbor-600 font-normal">(英小文字・数字・_ / 3〜30文字)</span>
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                placeholder="kobe_tachinomi"
                required
                pattern="^[a-z0-9_]{3,30}$"
                className="w-full px-4 py-3 rounded-xl bg-harbor-900 border border-harbor-700 text-harbor-100 placeholder-harbor-600 focus:outline-none focus:border-kobe-gold text-sm"
              />
            </div>
          )}

          <div>
            <label className="block text-harbor-400 text-xs mb-1.5">メールアドレス</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full px-4 py-3 rounded-xl bg-harbor-900 border border-harbor-700 text-harbor-100 placeholder-harbor-600 focus:outline-none focus:border-kobe-gold text-sm"
            />
          </div>

          <div>
            <label className="block text-harbor-400 text-xs mb-1.5">パスワード</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="8文字以上"
              required
              minLength={8}
              className="w-full px-4 py-3 rounded-xl bg-harbor-900 border border-harbor-700 text-harbor-100 placeholder-harbor-600 focus:outline-none focus:border-kobe-gold text-sm"
            />
          </div>

          {error && (
            <p className="text-kobe-red text-xs px-1">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-kobe-gold text-harbor-950 font-bold text-sm hover:bg-kobe-amber transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {mode === 'login' ? 'ログイン' : 'アカウントを作成'}
          </button>
        </form>

        <p className="text-center text-harbor-600 text-xs mt-6">
          {mode === 'login' ? 'アカウントをお持ちでない方は' : 'すでにアカウントをお持ちの方は'}{' '}
          <button
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
            className="text-kobe-gold hover:underline"
          >
            {mode === 'login' ? '新規登録' : 'ログイン'}
          </button>
        </p>
      </div>
    </div>
  );
}
