'use client';

import { useState, useEffect } from 'react';
import { Spot } from '@/types';

// ─── Simple password gate for MVP ───────────────────────────────────────────
function PasswordGate({ onAuth }: { onAuth: () => void }) {
  const [pw, setPw] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pw }),
    });
    if (res.ok) {
      onAuth();
    } else {
      setError('Wrong password');
    }
  };

  return (
    <div className="min-h-screen bg-harbor-950 flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-harbor-800 border border-harbor-700 rounded-2xl p-8 w-80 space-y-4">
        <h1 className="text-white text-xl font-bold">Admin</h1>
        <input
          type="password"
          value={pw}
          onChange={e => setPw(e.target.value)}
          placeholder="Password"
          className="w-full bg-harbor-900 border border-harbor-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-kobe-gold/60"
        />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button
          type="submit"
          className="w-full py-3 bg-kobe-gold text-harbor-950 rounded-xl font-semibold text-sm hover:bg-kobe-amber transition-colors"
        >
          Enter
        </button>
      </form>
    </div>
  );
}

// ─── Spot Edit Modal ─────────────────────────────────────────────────────────
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

  const field = (key: keyof Spot, label: string, type = 'text') => (
    <div>
      <label className="text-harbor-400 text-xs uppercase tracking-wider block mb-1">{label}</label>
      {key === 'internal_notes' || key === 'caution_notes' ? (
        <textarea
          value={(form[key] as string) || ''}
          onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
          rows={3}
          className="w-full bg-harbor-900 border border-harbor-700 text-white text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-kobe-gold/50 resize-none"
        />
      ) : (
        <input
          type={type}
          value={(form[key] as string | number) ?? ''}
          onChange={e => setForm(prev => ({
            ...prev,
            [key]: type === 'number' ? Number(e.target.value) : e.target.value,
          }))}
          className="w-full bg-harbor-900 border border-harbor-700 text-white text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-kobe-gold/50"
        />
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-harbor-800 border border-harbor-700 rounded-2xl w-full max-w-xl my-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-harbor-700">
          <h2 className="text-white font-semibold">{form.id ? 'Edit Spot' : 'Add Spot'}</h2>
          <button onClick={onClose} className="text-harbor-400 hover:text-white text-xl">×</button>
        </div>
        <div className="p-6 space-y-4">
          {field('name', 'Spot Name')}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-harbor-400 text-xs uppercase tracking-wider block mb-1">Area</label>
              <select
                value={form.area || ''}
                onChange={e => setForm(prev => ({ ...prev, area: e.target.value as Spot['area'] }))}
                className="w-full bg-harbor-900 border border-harbor-700 text-white text-sm rounded-xl px-3 py-2 focus:outline-none"
              >
                <option value="">Select area</option>
                <option value="sannomiya">三宮 Sannomiya</option>
                <option value="motomachi">元町 Motomachi</option>
                <option value="kitano">北野 Kitano</option>
                <option value="nankinmachi">南京町 Nankinmachi</option>
              </select>
            </div>
            <div>
              <label className="text-harbor-400 text-xs uppercase tracking-wider block mb-1">Priority (0-100)</label>
              <input
                type="number"
                min={0} max={100}
                value={form.priority_score ?? 50}
                onChange={e => setForm(prev => ({ ...prev, priority_score: Number(e.target.value) }))}
                className="w-full bg-harbor-900 border border-harbor-700 text-white text-sm rounded-xl px-3 py-2 focus:outline-none"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {field('budget_min', 'Budget Min (¥)', 'number')}
            {field('budget_max', 'Budget Max (¥)', 'number')}
          </div>
          {field('google_maps_url', 'Google Maps URL')}
          {field('reservation_url', 'Reservation URL (optional)')}

          {/* Flags */}
          <div className="flex flex-wrap gap-4">
            {(['solo_friendly', 'english_menu', 'cashless', 'foreigner_friendly', 'is_published'] as const).map(flag => (
              <label key={flag} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!form[flag]}
                  onChange={e => setForm(prev => ({ ...prev, [flag]: e.target.checked }))}
                  className="accent-kobe-gold w-4 h-4"
                />
                <span className="text-harbor-300 text-sm capitalize">{flag.replace(/_/g, ' ')}</span>
              </label>
            ))}
          </div>

          <div>
            <label className="text-harbor-400 text-xs uppercase tracking-wider block mb-1">
              🔒 Internal Notes (private — AI uses these)
            </label>
            <textarea
              value={form.internal_notes || ''}
              onChange={e => setForm(prev => ({ ...prev, internal_notes: e.target.value }))}
              rows={4}
              placeholder="Owner tips, busy hours, staff names, best items to recommend..."
              className="w-full bg-amber-900/20 border border-amber-700/50 text-amber-100 text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500/70 resize-none"
            />
          </div>

          {field('caution_notes', 'Caution Notes (shown to users)')}

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => onSave(form)}
              className="flex-1 py-3 bg-kobe-gold text-harbor-950 rounded-xl font-semibold text-sm hover:bg-kobe-amber transition-colors"
            >
              Save Spot
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-harbor-700 text-white rounded-xl text-sm hover:bg-harbor-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Analytics Panel ─────────────────────────────────────────────────────────
function AnalyticsPanel({ analytics }: { analytics: Record<string, unknown>[] }) {
  return (
    <div className="bg-harbor-800 border border-harbor-700 rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-harbor-700">
        <h2 className="text-white font-semibold">Spot Performance</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-harbor-700">
              {['Spot', 'Recommendations', 'Maps Clicks', 'Reservations', 'Total Clicks'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-harbor-400 text-xs uppercase tracking-wider whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {analytics.map((row: Record<string, unknown>) => (
              <tr key={row.id as string} className="border-b border-harbor-700/50 hover:bg-harbor-700/30">
                <td className="px-4 py-3 text-white font-medium">{row.name as string}</td>
                <td className="px-4 py-3 text-harbor-300">{row.recommendation_count as number}</td>
                <td className="px-4 py-3 text-harbor-300">{row.maps_clicks as number}</td>
                <td className="px-4 py-3 text-harbor-300">{row.reservation_clicks as number}</td>
                <td className="px-4 py-3 text-kobe-amber font-semibold">{row.total_clicks as number}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Main Admin Page ──────────────────────────────────────────────────────────
export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [spots, setSpots] = useState<Spot[]>([]);
  const [analytics, setAnalytics] = useState<Record<string, unknown>[]>([]);
  const [modalSpot, setModalSpot] = useState<Partial<Spot> | null>(null);
  const [tab, setTab] = useState<'spots' | 'analytics'>('spots');

  useEffect(() => {
    if (!authed) return;
    fetch('/api/admin/spots').then(r => r.json()).then(d => setSpots(d.spots || []));
    fetch('/api/admin/analytics').then(r => r.json()).then(d => setAnalytics(d.analytics || []));
  }, [authed]);

  if (!authed) return <PasswordGate onAuth={() => setAuthed(true)} />;

  const handleSave = async (data: Partial<Spot>) => {
    const method = data.id ? 'PUT' : 'POST';
    const url = data.id ? `/api/admin/spots/${data.id}` : '/api/admin/spots';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const updated = await fetch('/api/admin/spots').then(r => r.json());
      setSpots(updated.spots || []);
      setModalSpot(null);
    }
  };

  const togglePublished = async (spot: Spot) => {
    await fetch(`/api/admin/spots/${spot.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_published: !spot.is_published }),
    });
    setSpots(prev => prev.map(s => s.id === spot.id ? { ...s, is_published: !s.is_published } : s));
  };

  return (
    <div className="min-h-screen bg-harbor-950 text-white">
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">⚓ Kobe Night Guide — Admin</h1>
            <p className="text-harbor-400 text-sm mt-1">{spots.length} spots total</p>
          </div>
          <button
            onClick={() => setModalSpot({})}
            className="px-4 py-2 bg-kobe-gold text-harbor-950 rounded-xl font-semibold text-sm hover:bg-kobe-amber transition-colors"
          >
            + Add Spot
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-harbor-800 p-1 rounded-xl w-fit">
          {(['spots', 'analytics'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                tab === t ? 'bg-kobe-gold text-harbor-950' : 'text-harbor-400 hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Spots Table */}
        {tab === 'spots' && (
          <div className="bg-harbor-800 border border-harbor-700 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-harbor-700">
                    {['Name', 'Area', 'Budget', 'Priority', 'EN Menu', 'Solo OK', 'Published', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-harbor-400 text-xs uppercase tracking-wider whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {spots.map(spot => (
                    <tr key={spot.id} className="border-b border-harbor-700/50 hover:bg-harbor-700/30">
                      <td className="px-4 py-3">
                        <div className="font-medium text-white">{spot.name}</div>
                        <div className="text-harbor-500 text-xs">{spot.category.join(', ')}</div>
                      </td>
                      <td className="px-4 py-3 text-harbor-300 capitalize">{spot.area}</td>
                      <td className="px-4 py-3 text-kobe-amber text-xs">
                        ¥{spot.budget_min?.toLocaleString()} – {spot.budget_max?.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          spot.priority_score >= 80 ? 'bg-green-900/40 text-green-400' :
                          spot.priority_score >= 60 ? 'bg-amber-900/40 text-amber-400' :
                          'bg-harbor-700 text-harbor-400'
                        }`}>
                          {spot.priority_score}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">{spot.english_menu ? '✓' : '–'}</td>
                      <td className="px-4 py-3 text-center">{spot.solo_friendly ? '✓' : '–'}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => togglePublished(spot)}
                          className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                            spot.is_published
                              ? 'bg-green-900/40 text-green-400 hover:bg-red-900/40 hover:text-red-400'
                              : 'bg-harbor-700 text-harbor-400 hover:bg-green-900/40 hover:text-green-400'
                          }`}
                        >
                          {spot.is_published ? 'Live' : 'Draft'}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setModalSpot(spot)}
                          className="px-3 py-1.5 bg-harbor-700 text-white rounded-lg text-xs hover:bg-harbor-600 transition-colors"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Analytics */}
        {tab === 'analytics' && <AnalyticsPanel analytics={analytics} />}
      </div>

      {/* Edit Modal */}
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
