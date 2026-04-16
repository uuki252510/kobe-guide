'use client';

import { useState, useEffect } from 'react';
import { Spot } from '@/types';

// ── Light palette ──────────────────────────────────────────
const C = {
  bg:        '#FAFAF7',
  surface:   '#FFFFFF',
  surfaceAlt:'#F4EDE6',
  border:    '#EBE3D8',
  borderSub: '#F4EDE6',
  textMain:  '#262220',
  textSub:   '#5C5752',
  textMute:  '#857E78',
  gold:      '#C9A44C',
  goldDeep:  '#8F6F1E',
  goldSoft:  '#FFF8EC',
  goldAmber: '#E8C46A',
  green:     '#2E7D5B',
  greenSoft: '#E6F4EB',
  red:       '#C0392B',
  redSoft:   '#FBE9E9',
};

// ─── Password gate ─────────────────────────────────────────
function PasswordGate({ onAuth }: { onAuth: (pw: string) => void }) {
  const [pw, setPw] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pw }),
    });
    if (res.ok) onAuth(pw);
    else setError('パスワードが正しくありません');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: C.bg }}>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4"
        style={{
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: 16,
          padding: 32,
          boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
        }}
      >
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: C.textMain }}>管理画面</h1>
          <p style={{ fontSize: 12, color: C.textMute, marginTop: 4 }}>神戸立ち飲みマップ</p>
        </div>
        <input
          type="password"
          value={pw}
          onChange={e => setPw(e.target.value)}
          placeholder="パスワード"
          style={{
            width: '100%',
            background: C.bg,
            border: `1px solid ${C.border}`,
            color: C.textMain,
            borderRadius: 10,
            padding: '11px 14px',
            fontSize: 14,
            outline: 'none',
          }}
        />
        {error && <p style={{ color: C.red, fontSize: 13 }}>{error}</p>}
        <button
          type="submit"
          className="w-full font-bold"
          style={{
            padding: '11px 14px',
            background: C.gold,
            color: '#FFFFFF',
            borderRadius: 10,
            fontSize: 14,
            boxShadow: '0 1px 3px rgba(201,164,76,0.3)',
          }}
        >
          ログイン
        </button>
      </form>
    </div>
  );
}

// ─── Spot Edit Modal ───────────────────────────────────────
function SpotModal({
  spot,
  onClose,
  onSave,
}: {
  spot: Partial<Spot>;
  onClose: () => void;
  onSave: (data: Partial<Spot>) => void;
}) {
  const [form, setForm] = useState<Partial<Spot>>(spot);

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: C.bg,
    border: `1px solid ${C.border}`,
    color: C.textMain,
    fontSize: 14,
    borderRadius: 10,
    padding: '9px 12px',
    outline: 'none',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 11, fontWeight: 700,
    color: C.textMute, textTransform: 'uppercase',
    letterSpacing: 1, marginBottom: 6,
  };

  const field = (key: keyof Spot, label: string, type = 'text') => (
    <div>
      <label style={labelStyle}>{label}</label>
      {key === 'internal_notes' || key === 'caution_notes' ? (
        <textarea
          value={(form[key] as string) || ''}
          onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
          rows={3}
          style={{ ...inputStyle, resize: 'none' }}
        />
      ) : (
        <input
          type={type}
          value={(form[key] as string | number) ?? ''}
          onChange={e => setForm(prev => ({
            ...prev,
            [key]: type === 'number' ? Number(e.target.value) : e.target.value,
          }))}
          style={inputStyle}
        />
      )}
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto"
      style={{ background: 'rgba(38,34,32,0.55)' }}
    >
      <div
        className="w-full max-w-xl my-4"
        style={{
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: 16,
          boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
        }}
      >
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: `1px solid ${C.border}` }}
        >
          <h2 style={{ fontSize: 16, fontWeight: 700, color: C.textMain }}>
            {form.id ? 'スポット編集' : 'スポット追加'}
          </h2>
          <button onClick={onClose} style={{ color: C.textMute, fontSize: 24, lineHeight: 1 }}>×</button>
        </div>
        <div className="p-6 space-y-4">
          {field('name', '店名')}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label style={labelStyle}>エリア</label>
              <select
                value={form.area || ''}
                onChange={e => setForm(prev => ({ ...prev, area: e.target.value as Spot['area'] }))}
                style={inputStyle}
              >
                <option value="">選択してください</option>
                <option value="sannomiya">三宮 Sannomiya</option>
                <option value="motomachi">元町 Motomachi</option>
                <option value="kitano">北野 Kitano</option>
                <option value="nankinmachi">南京町 Nankinmachi</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>優先度 (0-100)</label>
              <input
                type="number"
                min={0} max={100}
                value={form.priority_score ?? 50}
                onChange={e => setForm(prev => ({ ...prev, priority_score: Number(e.target.value) }))}
                style={inputStyle}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {field('budget_min', '予算下限 (¥)', 'number')}
            {field('budget_max', '予算上限 (¥)', 'number')}
          </div>
          {field('google_maps_url', 'Google Maps URL')}
          {field('reservation_url', '予約URL (任意)')}

          <div className="flex flex-wrap gap-4">
            {(['solo_friendly', 'english_menu', 'cashless', 'foreigner_friendly', 'is_published'] as const).map(flag => (
              <label key={flag} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!form[flag]}
                  onChange={e => setForm(prev => ({ ...prev, [flag]: e.target.checked }))}
                  style={{ accentColor: C.gold, width: 16, height: 16 }}
                />
                <span style={{ fontSize: 13, color: C.textSub }}>{flag.replace(/_/g, ' ')}</span>
              </label>
            ))}
          </div>

          <div>
            <label style={{ ...labelStyle, color: C.goldDeep }}>
              🔒 内部メモ（非公開・AIが参照）
            </label>
            <textarea
              value={form.internal_notes || ''}
              onChange={e => setForm(prev => ({ ...prev, internal_notes: e.target.value }))}
              rows={4}
              placeholder="店主からのヒント、混雑時間、スタッフ名、おすすめメニューなど..."
              style={{
                width: '100%',
                background: C.goldSoft,
                border: `1px solid ${C.goldAmber}`,
                color: C.textMain,
                fontSize: 14,
                borderRadius: 10,
                padding: '9px 12px',
                outline: 'none',
                resize: 'none',
              }}
            />
          </div>

          {field('caution_notes', '注意事項（ユーザーに表示）')}

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => onSave(form)}
              className="flex-1 font-bold"
              style={{
                padding: '11px 14px',
                background: C.gold,
                color: '#FFFFFF',
                borderRadius: 10,
                fontSize: 14,
                boxShadow: '0 1px 3px rgba(201,164,76,0.3)',
              }}
            >
              保存
            </button>
            <button
              onClick={onClose}
              style={{
                padding: '11px 20px',
                background: C.surface,
                border: `1px solid ${C.border}`,
                color: C.textSub,
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              キャンセル
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Analytics Panel ───────────────────────────────────────
function AnalyticsPanel({ analytics }: { analytics: Record<string, unknown>[] }) {
  return (
    <div
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: 16,
        overflow: 'hidden',
      }}
    >
      <div className="px-6 py-4" style={{ borderBottom: `1px solid ${C.border}` }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: C.textMain }}>スポット別パフォーマンス</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full" style={{ fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.border}`, background: C.bg }}>
              {['店舗', '推薦回数', 'Maps表示', '予約クリック', '合計クリック'].map(h => (
                <th key={h}
                    style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: C.textMute, textTransform: 'uppercase', letterSpacing: 1, whiteSpace: 'nowrap' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {analytics.map((row: Record<string, unknown>) => (
              <tr key={row.id as string} style={{ borderBottom: `1px solid ${C.borderSub}` }}>
                <td style={{ padding: '12px 16px', color: C.textMain, fontWeight: 600 }}>{row.name as string}</td>
                <td style={{ padding: '12px 16px', color: C.textSub }}>{row.recommendation_count as number}</td>
                <td style={{ padding: '12px 16px', color: C.textSub }}>{row.maps_clicks as number}</td>
                <td style={{ padding: '12px 16px', color: C.textSub }}>{row.reservation_clicks as number}</td>
                <td style={{ padding: '12px 16px', color: C.goldDeep, fontWeight: 700 }}>{row.total_clicks as number}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Main Admin Page ───────────────────────────────────────
export default function AdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [spots, setSpots] = useState<Spot[]>([]);
  const [analytics, setAnalytics] = useState<Record<string, unknown>[]>([]);
  const [modalSpot, setModalSpot] = useState<Partial<Spot> | null>(null);
  const [tab, setTab] = useState<'spots' | 'analytics'>('spots');

  const adminFetch = (url: string, options: RequestInit = {}) =>
    fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

  useEffect(() => {
    if (!token) return;
    adminFetch('/api/admin/spots').then(r => r.json()).then(d => setSpots(d.spots || []));
    adminFetch('/api/admin/analytics').then(r => r.json()).then(d => setAnalytics(d.analytics || []));
  }, [token]);

  if (!token) return <PasswordGate onAuth={(pw) => setToken(pw)} />;

  const handleSave = async (data: Partial<Spot>) => {
    const method = data.id ? 'PUT' : 'POST';
    const url = data.id ? `/api/admin/spots/${data.id}` : '/api/admin/spots';
    const res = await adminFetch(url, {
      method,
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const updated = await adminFetch('/api/admin/spots').then(r => r.json());
      setSpots(updated.spots || []);
      setModalSpot(null);
    }
  };

  const togglePublished = async (spot: Spot) => {
    await adminFetch(`/api/admin/spots/${spot.id}`, {
      method: 'PUT',
      body: JSON.stringify({ is_published: !spot.is_published }),
    });
    setSpots(prev => prev.map(s => s.id === spot.id ? { ...s, is_published: !s.is_published } : s));
  };

  return (
    <div className="min-h-screen" style={{ background: C.bg, color: C.textMain }}>
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: C.textMain }}>⚓ 神戸立ち飲みマップ — 管理画面</h1>
            <p style={{ fontSize: 13, color: C.textMute, marginTop: 4 }}>掲載店舗: {spots.length}件</p>
          </div>
          <button
            onClick={() => setModalSpot({})}
            style={{
              padding: '9px 16px',
              background: C.gold,
              color: '#FFFFFF',
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 700,
              boxShadow: '0 1px 3px rgba(201,164,76,0.3)',
            }}
          >
            + 新規追加
          </button>
        </div>

        {/* Tabs */}
        <div
          className="flex gap-1 mb-6 w-fit"
          style={{ background: C.surface, border: `1px solid ${C.border}`, padding: 4, borderRadius: 12 }}
        >
          {([
            { id: 'spots',     label: 'スポット' },
            { id: 'analytics', label: 'アナリティクス' },
          ] as const).map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: '7px 14px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                background: tab === t.id ? C.goldSoft : 'transparent',
                color: tab === t.id ? C.goldDeep : C.textMute,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Spots Table */}
        {tab === 'spots' && (
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden' }}>
            <div className="overflow-x-auto">
              <table className="w-full" style={{ fontSize: 14 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${C.border}`, background: C.bg }}>
                    {['名前', 'エリア', '予算', '優先度', '英メニュー', '一人OK', '公開', '操作'].map(h => (
                      <th key={h}
                          style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: C.textMute, textTransform: 'uppercase', letterSpacing: 1, whiteSpace: 'nowrap' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {spots.map(spot => (
                    <tr key={spot.id} style={{ borderBottom: `1px solid ${C.borderSub}` }}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 700, color: C.textMain }}>{spot.name}</div>
                        <div style={{ fontSize: 11, color: C.textMute }}>{spot.category.join(', ')}</div>
                      </td>
                      <td style={{ padding: '12px 16px', color: C.textSub }}>{spot.area}</td>
                      <td style={{ padding: '12px 16px', color: C.goldDeep, fontWeight: 600, fontSize: 12 }}>
                        ¥{spot.budget_min?.toLocaleString()} – {spot.budget_max?.toLocaleString()}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span
                          style={{
                            padding: '2px 10px', borderRadius: 9999, fontSize: 11, fontWeight: 700,
                            background: spot.priority_score >= 80 ? C.greenSoft : spot.priority_score >= 60 ? C.goldSoft : C.borderSub,
                            color:      spot.priority_score >= 80 ? C.green    : spot.priority_score >= 60 ? C.goldDeep : C.textMute,
                          }}
                        >
                          {spot.priority_score}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center', color: spot.english_menu ? C.green : C.textMute }}>
                        {spot.english_menu ? '✓' : '–'}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center', color: spot.solo_friendly ? C.green : C.textMute }}>
                        {spot.solo_friendly ? '✓' : '–'}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <button
                          onClick={() => togglePublished(spot)}
                          style={{
                            padding: '3px 10px', borderRadius: 9999, fontSize: 11, fontWeight: 700,
                            background: spot.is_published ? C.greenSoft : C.borderSub,
                            color:      spot.is_published ? C.green     : C.textMute,
                            border: `1px solid ${spot.is_published ? C.green : C.border}`,
                          }}
                        >
                          {spot.is_published ? '公開中' : '下書き'}
                        </button>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <button
                          onClick={() => setModalSpot(spot)}
                          style={{
                            padding: '5px 12px',
                            background: C.surface,
                            border: `1px solid ${C.border}`,
                            color: C.textSub,
                            borderRadius: 7,
                            fontSize: 12,
                            fontWeight: 600,
                          }}
                        >
                          編集
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'analytics' && <AnalyticsPanel analytics={analytics} />}
      </div>

      {modalSpot && (
        <SpotModal
          spot={modalSpot}
          onClose={() => setModalSpot(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
