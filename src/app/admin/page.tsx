'use client';

import { useState, useEffect, useRef } from 'react';
import { Spot } from '@/types';
import {
  Plus, X, Search, ChevronDown, Pencil, Trash2,
  BarChart3, MapPin, FileText, Lock, Globe, Eye, EyeOff,
  CheckCircle2, AlertCircle, Loader2, Store, ArrowUpDown,
} from 'lucide-react';

interface Article {
  id: string; slug: string; title: string; description: string;
  content: string; cover_image: string | null; tags: string[];
  published: boolean; created_at: string;
}

// ── デザイントークン ────────────────────────────────────────
const T = {
  bg:        '#F7F4EF',
  surface:   '#FFFFFF',
  surfaceAlt:'#F2EDE5',
  border:    '#E4DAD0',
  borderSub: '#EDE8E2',
  ink:       '#1A1510',
  inkSub:    '#5C5044',
  inkMute:   '#9E8E80',
  amber:     '#B8751A',
  amberSoft: '#FFF4E0',
  amberBorder:'#E8C97A',
  navy:      '#1E3A5F',
  navySoft:  '#EDF2F8',
  green:     '#1F7A4D',
  greenSoft: '#E6F5ED',
  red:       '#B5281E',
  redSoft:   '#FBE9E8',
  orange:    '#C4511A',
  orangeSoft:'#FFF0E8',
};

// ── 共通スタイル ────────────────────────────────────────────
const inputCls = `w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition-all
  focus:ring-2 focus:ring-amber-300 focus:border-amber-400
  placeholder:text-[#B0A090]`;

const inputStyle = {
  background: T.bg,
  border: `1px solid ${T.border}`,
  color: T.ink,
  fontSize: 14,
};

// ── StatusBadge ────────────────────────────────────────────
function StatusBadge({ published, onClick }: { published: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-opacity hover:opacity-75"
      style={{
        background: published ? T.greenSoft : T.surfaceAlt,
        color: published ? T.green : T.inkMute,
        border: `1px solid ${published ? '#A3D9BC' : T.border}`,
      }}
    >
      {published
        ? <><CheckCircle2 size={11} />公開中</>
        : <><EyeOff size={11} />下書き</>}
    </button>
  );
}

// ── SectionLabel ───────────────────────────────────────────
function SectionLabel({ children, sub }: { children: React.ReactNode; sub?: string }) {
  return (
    <div className="mb-3">
      <p className="text-xs font-bold tracking-widest uppercase" style={{ color: T.amber }}>{children}</p>
      {sub && <p className="text-xs mt-0.5" style={{ color: T.inkMute }}>{sub}</p>}
    </div>
  );
}

// ── FieldRow ───────────────────────────────────────────────
function FieldRow({ label, required, hint, children }: {
  label: string; required?: boolean; hint?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="flex items-center gap-1.5 mb-1.5">
        <span className="text-sm font-semibold" style={{ color: T.ink }}>{label}</span>
        {required && <span className="text-xs px-1.5 py-0.5 rounded font-bold" style={{ background: T.amberSoft, color: T.amber }}>必須</span>}
        {!required && <span className="text-xs" style={{ color: T.inkMute }}>任意</span>}
      </label>
      {children}
      {hint && <p className="text-xs mt-1" style={{ color: T.inkMute }}>{hint}</p>}
    </div>
  );
}

// ── ToggleTag ──────────────────────────────────────────────
function ToggleTag({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all"
      style={{
        background: checked ? T.navy : T.surface,
        color: checked ? '#fff' : T.inkSub,
        border: `1.5px solid ${checked ? T.navy : T.border}`,
        boxShadow: checked ? '0 1px 4px rgba(30,58,95,0.2)' : 'none',
      }}
    >
      {checked && <CheckCircle2 size={13} />}
      {label}
    </button>
  );
}

// ── Divider ────────────────────────────────────────────────
function ModalDivider() {
  return <div className="border-t" style={{ borderColor: T.borderSub }} />;
}

// ── PasswordGate ───────────────────────────────────────────
function PasswordGate({ onAuth }: { onAuth: (pw: string) => void }) {
  const [pw, setPw] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pw }),
    });
    setLoading(false);
    if (res.ok) onAuth(pw);
    else setError('パスワードが正しくありません');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: T.bg }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-4"
            style={{ background: T.amberSoft, border: `1.5px solid ${T.amberBorder}` }}>
            <Store size={22} style={{ color: T.amber }} />
          </div>
          <h1 className="text-xl font-black" style={{ color: T.ink }}>管理画面</h1>
          <p className="text-sm mt-1" style={{ color: T.inkMute }}>神戸立ち飲みマップ</p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl p-6 space-y-4"
          style={{ background: T.surface, border: `1px solid ${T.border}`, boxShadow: '0 4px 24px rgba(0,0,0,0.07)' }}
        >
          <input
            type="password"
            value={pw}
            onChange={e => setPw(e.target.value)}
            placeholder="管理パスワード"
            className={inputCls}
            style={inputStyle}
          />
          {error && (
            <div className="flex items-center gap-2 text-sm rounded-lg px-3 py-2" style={{ background: T.redSoft, color: T.red }}>
              <AlertCircle size={14} />{error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full font-bold text-sm rounded-xl py-2.5 transition-opacity hover:opacity-90 flex items-center justify-center gap-2"
            style={{ background: T.ink, color: '#fff' }}
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : 'ログイン'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Article Modal ──────────────────────────────────────────
function ArticleModal({ article, onClose, onSave }: {
  article: Partial<Article>; onClose: () => void; onSave: (data: Partial<Article>) => void;
}) {
  const [form, setForm] = useState<Partial<Article>>(article);
  const [tagsInput, setTagsInput] = useState((article.tags ?? []).join(', '));
  const [saving, setSaving] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleSave = async () => {
    setSaving(true);
    await onSave({ ...form, tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean) });
    setSaving(false);
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto"
      style={{ background: 'rgba(20,14,8,0.5)', backdropFilter: 'blur(2px)' }}
      onClick={e => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div
        className="w-full max-w-2xl my-6 rounded-2xl overflow-hidden"
        style={{ background: T.surface, border: `1px solid ${T.border}`, boxShadow: '0 20px 60px rgba(0,0,0,0.18)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: `1px solid ${T.border}` }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: T.navySoft }}>
              <FileText size={16} style={{ color: T.navy }} />
            </div>
            <h2 className="font-bold text-base" style={{ color: T.ink }}>{form.id ? '記事を編集' : '新規記事を作成'}</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-gray-100">
            <X size={16} style={{ color: T.inkMute }} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">

          {/* 基本情報 */}
          <div>
            <SectionLabel sub="公開ページに表示される情報">基本情報</SectionLabel>
            <div className="space-y-4">
              <FieldRow label="タイトル" required>
                <input className={inputCls} style={inputStyle}
                  value={form.title ?? ''} placeholder="例：三宮の角打きおすすめ5選"
                  onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
              </FieldRow>
              <FieldRow label="スラッグ（URL）" required hint="英数字・ハイフンのみ。例: sannomiya-kakuuchi-guide">
                <input className={inputCls} style={inputStyle}
                  value={form.slug ?? ''} placeholder="sannomiya-kakuuchi-guide"
                  onChange={e => setForm(p => ({ ...p, slug: e.target.value }))} />
              </FieldRow>
              <FieldRow label="概要（SEO・記事サマリー）" hint="検索結果に表示される説明文。120文字以内推奨。">
                <textarea rows={2} className={inputCls} style={{ ...inputStyle, resize: 'none' }}
                  value={form.description ?? ''} placeholder="この記事の内容を1〜2文で説明してください"
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
              </FieldRow>
              <FieldRow label="カバー画像URL">
                <input className={inputCls} style={inputStyle}
                  value={form.cover_image ?? ''} placeholder="https://..."
                  onChange={e => setForm(p => ({ ...p, cover_image: e.target.value }))} />
              </FieldRow>
              <FieldRow label="タグ" hint="カンマ区切り。例: 観光, 三宮, 初心者向け">
                <input className={inputCls} style={inputStyle}
                  value={tagsInput} placeholder="観光, 三宮, 初心者向け"
                  onChange={e => setTagsInput(e.target.value)} />
              </FieldRow>
            </div>
          </div>

          <ModalDivider />

          {/* 本文 */}
          <div>
            <SectionLabel sub="HTML形式で記述できます">本文コンテンツ</SectionLabel>
            <FieldRow label="本文" required hint="<h2>見出し</h2> <p>段落</p> <ul><li>箇条書き</li></ul> が使えます">
              <textarea rows={12} className={inputCls}
                style={{ ...inputStyle, resize: 'vertical', fontFamily: 'ui-monospace, monospace', fontSize: 13, lineHeight: 1.6 }}
                value={form.content ?? ''}
                onChange={e => setForm(p => ({ ...p, content: e.target.value }))} />
            </FieldRow>
          </div>

          <ModalDivider />

          {/* 公開設定 */}
          <div>
            <SectionLabel>公開設定</SectionLabel>
            <div className="flex items-center gap-4 p-4 rounded-xl" style={{ background: T.bg, border: `1px solid ${T.border}` }}>
              <div className="flex-1">
                <p className="text-sm font-semibold" style={{ color: T.ink }}>記事を公開する</p>
                <p className="text-xs mt-0.5" style={{ color: T.inkMute }}>ONにすると /articles ページで一般ユーザーに表示されます</p>
              </div>
              <button
                type="button"
                onClick={() => setForm(p => ({ ...p, published: !p.published }))}
                className="relative w-12 h-6 rounded-full transition-colors"
                style={{ background: form.published ? T.navy : T.border }}
              >
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.published ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderTop: `1px solid ${T.border}`, background: T.bg }}>
          <button onClick={onClose} className="text-sm font-medium px-4 py-2 rounded-lg transition-colors hover:bg-white" style={{ color: T.inkSub }}>
            キャンセル
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 font-bold text-sm px-6 py-2.5 rounded-xl transition-opacity hover:opacity-90"
            style={{ background: T.navy, color: '#fff' }}
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
            {form.id ? '変更を保存' : '記事を作成'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Spot Modal ─────────────────────────────────────────────
function SpotModal({ spot, onClose, onSave }: {
  spot: Partial<Spot>; onClose: () => void; onSave: (data: Partial<Spot>) => void;
}) {
  const [form, setForm] = useState<Partial<Spot>>(spot);
  const [saving, setSaving] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const set = <K extends keyof Spot>(key: K, val: Spot[K]) =>
    setForm(p => ({ ...p, [key]: val }));

  const handleSave = async () => { setSaving(true); await onSave(form); setSaving(false); };

  const FLAGS: { key: keyof Spot; label: string }[] = [
    { key: 'solo_friendly',       label: '一人OK' },
    { key: 'english_menu',        label: '英語メニュー' },
    { key: 'cashless',            label: 'キャッシュレス' },
    { key: 'foreigner_friendly',  label: '外国人対応' },
  ];

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto"
      style={{ background: 'rgba(20,14,8,0.5)', backdropFilter: 'blur(2px)' }}
      onClick={e => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div
        className="w-full max-w-2xl my-6 rounded-2xl overflow-hidden"
        style={{ background: T.surface, border: `1px solid ${T.border}`, boxShadow: '0 20px 60px rgba(0,0,0,0.18)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: `1px solid ${T.border}` }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: T.amberSoft }}>
              <MapPin size={16} style={{ color: T.amber }} />
            </div>
            <div>
              <h2 className="font-bold text-base" style={{ color: T.ink }}>{form.id ? 'スポットを編集' : '新規スポットを追加'}</h2>
              {form.name && <p className="text-xs" style={{ color: T.inkMute }}>{form.name}</p>}
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-gray-100">
            <X size={16} style={{ color: T.inkMute }} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-7 max-h-[75vh] overflow-y-auto">

          {/* ① 基本情報 */}
          <div>
            <SectionLabel sub="店舗の基本プロフィール">基本情報</SectionLabel>
            <div className="space-y-4">
              <FieldRow label="店名" required>
                <input className={inputCls} style={inputStyle}
                  value={form.name ?? ''} placeholder="例：角打ち 一福"
                  onChange={e => set('name', e.target.value)} />
              </FieldRow>
              <div className="grid grid-cols-2 gap-4">
                <FieldRow label="エリア" required>
                  <select className={inputCls} style={inputStyle}
                    value={form.area || ''}
                    onChange={e => set('area', e.target.value as Spot['area'])}>
                    <option value="">選択...</option>
                    <option value="sannomiya">三宮 Sannomiya</option>
                    <option value="motomachi">元町 Motomachi</option>
                    <option value="kitano">北野 Kitano</option>
                    <option value="nankinmachi">南京町 Nankinmachi</option>
                    <option value="surroundings">周辺 Surroundings</option>
                  </select>
                </FieldRow>
                <FieldRow label="優先度" hint="0〜100。高いほど上位表示">
                  <input type="number" min={0} max={100} className={inputCls} style={inputStyle}
                    value={form.priority_score ?? 50}
                    onChange={e => set('priority_score', Number(e.target.value))} />
                </FieldRow>
              </div>
            </div>
          </div>

          <ModalDivider />

          {/* ② 予算・導線 */}
          <div>
            <SectionLabel sub="ユーザーの来店判断に使われます">予算・導線</SectionLabel>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FieldRow label="予算下限（円/人）">
                  <input type="number" className={inputCls} style={inputStyle}
                    value={form.budget_min ?? ''} placeholder="500"
                    onChange={e => set('budget_min', Number(e.target.value))} />
                </FieldRow>
                <FieldRow label="予算上限（円/人）">
                  <input type="number" className={inputCls} style={inputStyle}
                    value={form.budget_max ?? ''} placeholder="2000"
                    onChange={e => set('budget_max', Number(e.target.value))} />
                </FieldRow>
              </div>
              <FieldRow label="Google Maps URL">
                <input className={inputCls} style={inputStyle}
                  value={form.google_maps_url ?? ''} placeholder="https://maps.google.com/..."
                  onChange={e => set('google_maps_url', e.target.value)} />
              </FieldRow>
              <FieldRow label="予約URL">
                <input className={inputCls} style={inputStyle}
                  value={(form as Record<string, unknown>).reservation_url as string ?? ''} placeholder="https://..."
                  onChange={e => setForm(p => ({ ...p, reservation_url: e.target.value }))} />
              </FieldRow>
            </div>
          </div>

          <ModalDivider />

          {/* ③ 特徴タグ */}
          <div>
            <SectionLabel sub="ユーザーの絞り込みに使われます">特徴タグ</SectionLabel>
            <div className="flex flex-wrap gap-2">
              {FLAGS.map(({ key, label }) => (
                <ToggleTag key={key} label={label}
                  checked={!!form[key]}
                  onChange={v => set(key, v as Spot[typeof key])} />
              ))}
            </div>
          </div>

          <ModalDivider />

          {/* ④ 公開設定 */}
          <div>
            <SectionLabel>公開設定</SectionLabel>
            <div className="flex items-center gap-4 p-4 rounded-xl" style={{ background: T.bg, border: `1px solid ${T.border}` }}>
              <Globe size={16} style={{ color: T.inkMute }} />
              <div className="flex-1">
                <p className="text-sm font-semibold" style={{ color: T.ink }}>サイトに公開する</p>
                <p className="text-xs mt-0.5" style={{ color: T.inkMute }}>OFFのままだとユーザーには表示されません</p>
              </div>
              <button
                type="button"
                onClick={() => setForm(p => ({ ...p, is_published: !p.is_published }))}
                className="relative w-12 h-6 rounded-full transition-colors"
                style={{ background: form.is_published ? T.navy : T.border }}
              >
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.is_published ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
          </div>

          <ModalDivider />

          {/* ⑤ 運用メモ */}
          <div>
            <SectionLabel>運用メモ</SectionLabel>
            <div className="space-y-4">

              {/* 内部メモ */}
              <div>
                <div className="flex items-center gap-2 mb-2 px-3 py-2 rounded-lg" style={{ background: T.amberSoft, border: `1px solid ${T.amberBorder}` }}>
                  <Lock size={13} style={{ color: T.amber }} />
                  <p className="text-xs font-bold" style={{ color: T.amber }}>管理者・AI専用 — ユーザーには表示されません</p>
                </div>
                <textarea
                  rows={4}
                  className={inputCls}
                  style={{ ...inputStyle, background: T.amberSoft, border: `1px solid ${T.amberBorder}`, resize: 'none' }}
                  value={form.internal_notes || ''}
                  placeholder="店主からのヒント、混雑時間、おすすめメニュー、隠れ情報など..."
                  onChange={e => set('internal_notes', e.target.value)}
                />
              </div>

              {/* 注意事項 */}
              <FieldRow label="注意事項" hint="ユーザーに表示されます（例：現金のみ、禁煙、要予約 等）">
                <textarea rows={3} className={inputCls}
                  style={{ ...inputStyle, resize: 'none' }}
                  value={form.caution_notes || ''}
                  placeholder="例：現金のみ / 混雑時は入店制限あり"
                  onChange={e => set('caution_notes', e.target.value)} />
              </FieldRow>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderTop: `1px solid ${T.border}`, background: T.bg }}>
          <button onClick={onClose} className="text-sm font-medium px-4 py-2 rounded-lg transition-colors hover:bg-white" style={{ color: T.inkSub }}>
            キャンセル
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 font-bold text-sm px-6 py-2.5 rounded-xl transition-opacity hover:opacity-90"
            style={{ background: T.amber, color: '#fff', boxShadow: '0 2px 8px rgba(184,117,26,0.35)' }}
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
            {form.id ? '変更を保存' : 'スポットを登録'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Analytics Panel ────────────────────────────────────────
function AnalyticsPanel({ analytics }: { analytics: Record<string, unknown>[] }) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${T.border}` }}>
      <div className="px-6 py-4 flex items-center gap-3" style={{ borderBottom: `1px solid ${T.border}`, background: T.surface }}>
        <BarChart3 size={16} style={{ color: T.amber }} />
        <h2 className="font-bold text-sm" style={{ color: T.ink }}>スポット別パフォーマンス</h2>
        <span className="ml-auto text-xs" style={{ color: T.inkMute }}>{analytics.length}件</span>
      </div>
      <div className="overflow-x-auto" style={{ background: T.surface }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: `1px solid ${T.border}`, background: T.bg }}>
              {['店舗名', '推薦回数', 'Maps表示', '予約クリック', '合計'].map(h => (
                <th key={h} className="px-5 py-3 text-left text-xs font-bold tracking-wider whitespace-nowrap" style={{ color: T.inkMute }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {analytics.length === 0 && (
              <tr><td colSpan={5} className="px-5 py-12 text-center text-sm" style={{ color: T.inkMute }}>データがありません</td></tr>
            )}
            {analytics.map((row) => (
              <tr key={row.id as string} className="group transition-colors hover:bg-amber-50/40"
                style={{ borderBottom: `1px solid ${T.borderSub}` }}>
                <td className="px-5 py-3 font-semibold" style={{ color: T.ink }}>{row.name as string}</td>
                <td className="px-5 py-3" style={{ color: T.inkSub }}>{row.recommendation_count as number ?? 0}</td>
                <td className="px-5 py-3" style={{ color: T.inkSub }}>{row.maps_clicks as number ?? 0}</td>
                <td className="px-5 py-3" style={{ color: T.inkSub }}>{row.reservation_clicks as number ?? 0}</td>
                <td className="px-5 py-3 font-bold" style={{ color: T.amber }}>{row.total_clicks as number ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Main Admin Page ────────────────────────────────────────
export default function AdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [spots, setSpots] = useState<Spot[]>([]);
  const [analytics, setAnalytics] = useState<Record<string, unknown>[]>([]);
  const [modalSpot, setModalSpot] = useState<Partial<Spot> | null>(null);
  const [tab, setTab] = useState<'spots' | 'analytics' | 'articles'>('spots');
  const [articles, setArticles] = useState<Article[]>([]);
  const [articleModal, setArticleModal] = useState<Partial<Article> | null>(null);
  const [search, setSearch] = useState('');

  const adminFetch = (url: string, options: RequestInit = {}) =>
    fetch(url, { ...options, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...options.headers } });

  useEffect(() => {
    if (!token) return;
    adminFetch('/api/admin/spots').then(r => r.json()).then(d => setSpots(d.spots || []));
    adminFetch('/api/admin/analytics').then(r => r.json()).then(d => setAnalytics(d.analytics || []));
    adminFetch('/api/admin/articles').then(r => r.json()).then(d => setArticles(Array.isArray(d) ? d : []));
  }, [token]);

  if (!token) return <PasswordGate onAuth={setToken} />;

  // ── ハンドラ ──
  const handleSave = async (data: Partial<Spot>) => {
    const method = data.id ? 'PUT' : 'POST';
    const url = data.id ? `/api/admin/spots/${data.id}` : '/api/admin/spots';
    const res = await adminFetch(url, { method, body: JSON.stringify(data) });
    if (res.ok) {
      const updated = await adminFetch('/api/admin/spots').then(r => r.json());
      setSpots(updated.spots || []);
      setModalSpot(null);
    }
  };

  const togglePublished = async (spot: Spot) => {
    await adminFetch(`/api/admin/spots/${spot.id}`, { method: 'PUT', body: JSON.stringify({ is_published: !spot.is_published }) });
    setSpots(prev => prev.map(s => s.id === spot.id ? { ...s, is_published: !s.is_published } : s));
  };

  const handleArticleSave = async (data: Partial<Article>) => {
    const method = data.id ? 'PATCH' : 'POST';
    const res = await adminFetch('/api/admin/articles', { method, body: JSON.stringify(data) });
    if (res.ok) {
      const updated = await adminFetch('/api/admin/articles').then(r => r.json());
      setArticles(Array.isArray(updated) ? updated : []);
      setArticleModal(null);
    }
  };

  const handleArticleDelete = async (id: string) => {
    if (!confirm('この記事を削除しますか？')) return;
    await adminFetch('/api/admin/articles', { method: 'DELETE', body: JSON.stringify({ id }) });
    setArticles(prev => prev.filter(a => a.id !== id));
  };

  const toggleArticlePublished = async (a: Article) => {
    await adminFetch('/api/admin/articles', { method: 'PATCH', body: JSON.stringify({ id: a.id, published: !a.published }) });
    setArticles(prev => prev.map(x => x.id === a.id ? { ...x, published: !x.published } : x));
  };

  // ── フィルタ ──
  const filteredSpots = spots.filter(s => s.name?.toLowerCase().includes(search.toLowerCase()));
  const filteredArticles = articles.filter(a => a.title?.toLowerCase().includes(search.toLowerCase()));

  // ── タブ定義 ──
  const TABS = [
    { id: 'spots' as const,     label: 'スポット',       icon: MapPin,    count: spots.length },
    { id: 'articles' as const,  label: '記事',           icon: FileText,  count: articles.length },
    { id: 'analytics' as const, label: 'アナリティクス', icon: BarChart3, count: null },
  ];

  return (
    <div className="min-h-screen" style={{ background: T.bg }}>

      {/* ── トップバー ── */}
      <header style={{ background: T.surface, borderBottom: `1px solid ${T.border}` }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: T.amberSoft, border: `1px solid ${T.amberBorder}` }}>
              <Store size={18} style={{ color: T.amber }} />
            </div>
            <div>
              <h1 className="font-black text-base leading-tight" style={{ color: T.ink }}>神戸立ち飲みマップ</h1>
              <p className="text-xs" style={{ color: T.inkMute }}>管理画面</p>
            </div>
          </div>

          {/* サマリー */}
          <div className="hidden md:flex items-center gap-6 text-sm">
            <div className="text-center">
              <p className="font-black text-lg leading-none" style={{ color: T.amber }}>{spots.length}</p>
              <p className="text-xs mt-0.5" style={{ color: T.inkMute }}>掲載店舗</p>
            </div>
            <div className="w-px h-8" style={{ background: T.border }} />
            <div className="text-center">
              <p className="font-black text-lg leading-none" style={{ color: T.navy }}>{articles.length}</p>
              <p className="text-xs mt-0.5" style={{ color: T.inkMute }}>記事</p>
            </div>
            <div className="w-px h-8" style={{ background: T.border }} />
            <div className="text-center">
              <p className="font-black text-lg leading-none" style={{ color: T.green }}>{spots.filter(s => s.is_published).length}</p>
              <p className="text-xs mt-0.5" style={{ color: T.inkMute }}>公開中</p>
            </div>
          </div>

          {/* 主CTA */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setTab('articles'); setArticleModal({ published: false, tags: [] }); }}
              className="hidden sm:flex items-center gap-1.5 text-sm font-bold px-3 py-2 rounded-xl transition-opacity hover:opacity-80"
              style={{ background: T.navySoft, color: T.navy, border: `1px solid #C2D4E8` }}
            >
              <Plus size={14} />記事
            </button>
            <button
              onClick={() => { setTab('spots'); setModalSpot({}); }}
              className="flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-xl transition-opacity hover:opacity-90"
              style={{ background: T.amber, color: '#fff', boxShadow: '0 2px 8px rgba(184,117,26,0.3)' }}
            >
              <Plus size={14} />スポット追加
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-6">

        {/* ── タブ ── */}
        <div className="flex items-center gap-1 mb-6 w-fit rounded-xl p-1" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
          {TABS.map(({ id, label, icon: Icon, count }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
              style={{
                background: tab === id ? T.ink : 'transparent',
                color: tab === id ? '#fff' : T.inkMute,
                boxShadow: tab === id ? '0 1px 4px rgba(0,0,0,0.15)' : 'none',
              }}
            >
              <Icon size={14} />
              {label}
              {count !== null && (
                <span className="text-xs px-1.5 py-0.5 rounded-md font-bold"
                  style={{ background: tab === id ? 'rgba(255,255,255,0.2)' : T.bg, color: tab === id ? '#fff' : T.inkMute }}>
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── ツールバー（spots / articles） ── */}
        {tab !== 'analytics' && (
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: T.inkMute }} />
              <input
                className={inputCls}
                style={{ ...inputStyle, paddingLeft: 36 }}
                placeholder={tab === 'spots' ? '店名で検索...' : '記事タイトルで検索...'}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <p className="text-sm" style={{ color: T.inkMute }}>
              {tab === 'spots' ? `${filteredSpots.length}件` : `${filteredArticles.length}件`}
            </p>
          </div>
        )}

        {/* ── スポット一覧 ── */}
        {tab === 'spots' && (
          <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${T.border}` }}>
            <div className="overflow-x-auto" style={{ background: T.surface }}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: T.bg, borderBottom: `1px solid ${T.border}` }}>
                    {[
                      { label: '店舗名', w: 'min-w-[160px]' },
                      { label: 'エリア', w: '' },
                      { label: '予算', w: '' },
                      { label: '優先度', w: '' },
                      { label: '特徴', w: '' },
                      { label: 'ステータス', w: '' },
                      { label: '', w: 'w-20' },
                    ].map(({ label, w }) => (
                      <th key={label} className={`px-4 py-3 text-left text-xs font-bold tracking-wider ${w}`} style={{ color: T.inkMute }}>
                        <span className="flex items-center gap-1">{label}{label && <ArrowUpDown size={10} />}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredSpots.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-16 text-center">
                        <MapPin size={32} className="mx-auto mb-2 opacity-20" style={{ color: T.inkMute }} />
                        <p className="text-sm" style={{ color: T.inkMute }}>スポットがありません</p>
                        <button onClick={() => setModalSpot({})} className="mt-3 text-sm font-bold underline" style={{ color: T.amber }}>
                          + 最初のスポットを追加
                        </button>
                      </td>
                    </tr>
                  )}
                  {filteredSpots.map(spot => (
                    <tr key={spot.id}
                      className="group transition-colors hover:bg-amber-50/30"
                      style={{ borderBottom: `1px solid ${T.borderSub}` }}>
                      <td className="px-4 py-3">
                        <p className="font-semibold" style={{ color: T.ink }}>{spot.name}</p>
                        <p className="text-xs mt-0.5" style={{ color: T.inkMute }}>{spot.category?.join(', ')}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs px-2 py-1 rounded-md font-medium" style={{ background: T.navySoft, color: T.navy }}>
                          {spot.area}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs font-medium whitespace-nowrap" style={{ color: T.inkSub }}>
                        ¥{spot.budget_min?.toLocaleString()} – {spot.budget_max?.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs px-2 py-1 rounded-full font-bold"
                          style={{
                            background: (spot.priority_score ?? 0) >= 80 ? T.greenSoft : (spot.priority_score ?? 0) >= 60 ? T.amberSoft : T.bg,
                            color: (spot.priority_score ?? 0) >= 80 ? T.green : (spot.priority_score ?? 0) >= 60 ? T.amber : T.inkMute,
                          }}>
                          {spot.priority_score ?? 0}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 flex-wrap">
                          {spot.solo_friendly && <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: T.navySoft, color: T.navy }}>一人OK</span>}
                          {spot.english_menu && <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: T.greenSoft, color: T.green }}>英語</span>}
                          {spot.cashless && <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: T.surfaceAlt, color: T.inkSub }}>cashless</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge published={!!spot.is_published} onClick={() => togglePublished(spot)} />
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setModalSpot(spot)}
                          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ background: T.bg, border: `1px solid ${T.border}`, color: T.inkSub }}
                        >
                          <Pencil size={11} />編集
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── 記事一覧 ── */}
        {tab === 'articles' && (
          <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${T.border}` }}>
            <div className="overflow-x-auto" style={{ background: T.surface }}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: T.bg, borderBottom: `1px solid ${T.border}` }}>
                    {['タイトル', 'スラッグ', 'タグ', '投稿日', 'ステータス', ''].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-bold tracking-wider" style={{ color: T.inkMute }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredArticles.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-16 text-center">
                        <FileText size={32} className="mx-auto mb-2 opacity-20" style={{ color: T.inkMute }} />
                        <p className="text-sm" style={{ color: T.inkMute }}>記事がありません</p>
                        <button onClick={() => setArticleModal({ published: false, tags: [] })}
                          className="mt-3 text-sm font-bold underline" style={{ color: T.navy }}>
                          + 最初の記事を作成
                        </button>
                      </td>
                    </tr>
                  )}
                  {filteredArticles.map(a => (
                    <tr key={a.id}
                      className="group transition-colors hover:bg-blue-50/20"
                      style={{ borderBottom: `1px solid ${T.borderSub}` }}>
                      <td className="px-4 py-3 max-w-[220px]">
                        <p className="font-semibold truncate" style={{ color: T.ink }}>{a.title}</p>
                        <p className="text-xs mt-0.5 truncate" style={{ color: T.inkMute }}>{a.description}</p>
                      </td>
                      <td className="px-4 py-3 text-xs font-mono" style={{ color: T.inkMute }}>{a.slug}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 flex-wrap">
                          {(a.tags ?? []).slice(0, 3).map(t => (
                            <span key={t} className="text-xs px-2 py-0.5 rounded-full" style={{ background: T.amberSoft, color: T.amber }}>{t}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: T.inkMute }}>
                        {new Date(a.created_at).toLocaleDateString('ja-JP')}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge published={a.published} onClick={() => toggleArticlePublished(a)} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setArticleModal(a)}
                            className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg"
                            style={{ background: T.bg, border: `1px solid ${T.border}`, color: T.inkSub }}
                          >
                            <Pencil size={11} />編集
                          </button>
                          <button
                            onClick={() => handleArticleDelete(a.id)}
                            className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg"
                            style={{ background: T.redSoft, color: T.red }}
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── アナリティクス ── */}
        {tab === 'analytics' && <AnalyticsPanel analytics={analytics} />}
      </div>

      {/* ── モーダル ── */}
      {articleModal && (
        <ArticleModal article={articleModal} onClose={() => setArticleModal(null)} onSave={handleArticleSave} />
      )}
      {modalSpot && (
        <SpotModal spot={modalSpot} onClose={() => setModalSpot(null)} onSave={handleSave} />
      )}
    </div>
  );
}
