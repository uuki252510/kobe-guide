'use client';

import { Spot } from '@/types';
import { MapPin, Clock, CreditCard, Users, Globe, ExternalLink, CalendarCheck } from 'lucide-react';

interface SpotCardProps {
  spot: Spot;
  conversationId?: string;
  language?: string;
}

const C = {
  surface:    '#FAF4E6',
  ink:        '#262220',
  inkSoft:    '#3D3832',
  mute:       '#857E78',
  rule:       '#D5CBBE',
  accent:     '#B94A3B',
  green:      '#2E7D5B',
  inkOnPaper: '#FAF4E6',
  amber:      '#9A6A18',
};

const areaLabel: Record<string, string> = {
  sannomiya:   '三宮 / Sannomiya',
  motomachi:   '元町 / Motomachi',
  kitano:      '北野 / Kitano',
  nankinmachi: '南京町 / Nankinmachi',
};

const categoryEmoji: Record<string, string> = {
  'kobe-beef':    '🥩',
  'standing-bar': '🍺',
  'izakaya':      '🏮',
  'sake-bar':     '🍶',
  'late-night':   '🌙',
  'casual':       '🍽️',
  'ramen':        '🍜',
  'sushi':        '🍣',
};

async function trackClick(spotId: string, conversationId: string | undefined, clickType: string) {
  try {
    await fetch('/api/spots', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ spotId, conversationId, clickType }),
    });
  } catch {
    // Non-critical
  }
}

export default function SpotCard({ spot, conversationId }: SpotCardProps) {
  const budgetStr = spot.budget_min && spot.budget_max
    ? `¥${spot.budget_min.toLocaleString()} – ¥${spot.budget_max.toLocaleString()}`
    : spot.budget_min
    ? `from ¥${spot.budget_min.toLocaleString()}`
    : '要確認';

  const primaryCategory = spot.category[0];
  const emoji = categoryEmoji[primaryCategory] || '📍';

  const chipStyle: React.CSSProperties = {
    padding: '2px 8px',
    background: 'transparent',
    border: `1px solid ${C.ink}`,
    color: C.inkSoft,
    fontSize: 11,
    fontWeight: 600,
    borderRadius: 0,
    letterSpacing: '0.04em',
    lineHeight: 1.5,
  };

  return (
    <div
      className="animate-slide-up overflow-hidden"
      style={{
        background: C.surface,
        border: `1px solid ${C.ink}`,
        borderRadius: 0,
      }}
    >
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span style={{ fontSize: 18 }}>{emoji}</span>
              <h3
                className="truncate"
                style={{
                  fontWeight: 700, color: C.ink,
                  fontSize: 15, lineHeight: 1.4,
                  letterSpacing: '-0.01em',
                }}
              >
                {spot.name}
              </h3>
            </div>
            <div
              className="flex items-center gap-1"
              style={{ color: C.mute, fontSize: 11 }}
            >
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <span>{areaLabel[spot.area] || spot.area}</span>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <div style={{ color: C.ink, fontWeight: 700, fontSize: 13 }}>
              {budgetStr}
            </div>
            <div
              style={{
                color: C.mute, fontSize: 10,
                letterSpacing: '0.12em',
                marginTop: 1,
              }}
            >
              / 人
            </div>
          </div>
        </div>
      </div>

      {spot.highlight && (
        <div className="px-4 pb-3">
          <p
            className="leading-relaxed"
            style={{
              color: C.inkSoft, fontSize: 13,
              borderLeft: `2px solid ${C.ink}`,
              paddingLeft: 10,
              lineHeight: 1.7,
            }}
          >
            {spot.highlight}
          </p>
        </div>
      )}

      {spot.description && (
        <div className="px-4 pb-3">
          <p
            className="line-clamp-3"
            style={{
              color: C.inkSoft, fontSize: 13,
              lineHeight: 1.7,
            }}
          >
            {spot.description}
          </p>
        </div>
      )}

      <div className="px-4 pb-3 flex flex-wrap gap-1.5">
        {spot.vibe_tags.slice(0, 4).map(tag => (
          <span key={tag} className="capitalize" style={chipStyle}>
            {tag.replace(/-/g, ' ')}
          </span>
        ))}
        {spot.solo_friendly && (
          <span className="flex items-center gap-1" style={chipStyle}>
            <Users className="w-3 h-3" /> Solo OK
          </span>
        )}
        {spot.english_menu && (
          <span className="flex items-center gap-1" style={chipStyle}>
            <Globe className="w-3 h-3" /> EN menu
          </span>
        )}
        {spot.cashless && (
          <span className="flex items-center gap-1" style={chipStyle}>
            <CreditCard className="w-3 h-3" /> Card OK
          </span>
        )}
      </div>

      {Object.keys(spot.opening_hours || {}).length > 0 && (
        <div className="px-4 pb-3 flex items-start gap-1.5">
          <Clock
            className="w-3.5 h-3.5 flex-shrink-0"
            style={{ color: C.mute, marginTop: 2 }}
          />
          <div style={{ color: C.mute, fontSize: 11, lineHeight: 1.6 }}>
            {Object.entries(spot.opening_hours)
              .slice(0, 2)
              .map(([days, hours]) => (
                <div key={days}>
                  <span className="capitalize">{days}</span>: {hours}
                </div>
              ))}
          </div>
        </div>
      )}

      {spot.caution && (
        <div
          className="mx-4 mb-3 px-3 py-2"
          style={{
            background: 'transparent',
            border: `1px solid ${C.amber}`,
            borderRadius: 0,
          }}
        >
          <p
            style={{
              color: C.amber, fontSize: 11, lineHeight: 1.7,
            }}
          >
            ⚠ {spot.caution}
          </p>
        </div>
      )}

      <div className="px-4 pb-4 flex gap-2">
        <a
          href={spot.google_maps_url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackClick(spot.id, conversationId, 'maps')}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5"
          style={{
            background: C.ink, color: C.inkOnPaper,
            fontSize: 13, fontWeight: 700,
            borderRadius: 0,
            letterSpacing: '0.08em',
            lineHeight: 1,
          }}
        >
          <MapPin className="w-4 h-4" />
          MAPS
        </a>
        {spot.reservation_url && (
          <a
            href={spot.reservation_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackClick(spot.id, conversationId, 'reservation')}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5"
            style={{
              background: 'transparent',
              border: `1px solid ${C.ink}`,
              color: C.ink,
              fontSize: 13, fontWeight: 700,
              borderRadius: 0,
              letterSpacing: '0.08em',
              lineHeight: 1,
            }}
          >
            <CalendarCheck className="w-4 h-4" />
            RESERVE
          </a>
        )}
        {!spot.reservation_url && (
          <button
            onClick={() => trackClick(spot.id, conversationId, 'card_view')}
            className="flex items-center justify-center py-2.5"
            style={{
              padding: '10px 14px',
              background: 'transparent',
              border: `1px solid ${C.ink}`,
              color: C.ink,
              borderRadius: 0,
            }}
          >
            <ExternalLink className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
