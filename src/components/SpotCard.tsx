'use client';

import { Spot } from '@/types';
import { MapPin, Clock, CreditCard, Users, Globe, ExternalLink, CalendarCheck } from 'lucide-react';

interface SpotCardProps {
  spot: Spot;
  conversationId?: string;
  language?: string;
}

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

  return (
    <div className="animate-slide-up bg-white border border-harbor-200 rounded-2xl overflow-hidden shadow-card-md hover:shadow-card hover:border-harbor-300 transition-all duration-200">
      {/* Header */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">{emoji}</span>
              <h3 className="font-semibold text-harbor-800 text-base leading-tight truncate">
                {spot.name}
              </h3>
            </div>
            <div className="flex items-center gap-1 text-harbor-500 text-xs">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <span>{areaLabel[spot.area] || spot.area}</span>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-kobe-gold font-semibold text-sm">{budgetStr}</div>
            <div className="text-harbor-400 text-xs">/ 人</div>
          </div>
        </div>
      </div>

      {/* Highlight */}
      {spot.highlight && (
        <div className="px-4 pb-2">
          <p className="text-harbor-600 text-sm italic leading-relaxed border-l-2 border-kobe-gold/40 pl-3">
            "{spot.highlight}"
          </p>
        </div>
      )}

      {/* Description */}
      {spot.description && (
        <div className="px-4 pb-3">
          <p className="text-harbor-600 text-sm leading-relaxed line-clamp-3">
            {spot.description}
          </p>
        </div>
      )}

      {/* Tags */}
      <div className="px-4 pb-3 flex flex-wrap gap-1.5">
        {spot.vibe_tags.slice(0, 4).map(tag => (
          <span
            key={tag}
            className="px-2 py-0.5 bg-harbor-100 text-harbor-600 text-xs rounded-full border border-harbor-200 capitalize"
          >
            {tag.replace(/-/g, ' ')}
          </span>
        ))}
        {spot.solo_friendly && (
          <span className="px-2 py-0.5 bg-green-50 text-green-600 text-xs rounded-full border border-green-200 flex items-center gap-1">
            <Users className="w-3 h-3" /> Solo OK
          </span>
        )}
        {spot.english_menu && (
          <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-full border border-blue-200 flex items-center gap-1">
            <Globe className="w-3 h-3" /> EN menu
          </span>
        )}
        {spot.cashless && (
          <span className="px-2 py-0.5 bg-purple-50 text-purple-600 text-xs rounded-full border border-purple-200 flex items-center gap-1">
            <CreditCard className="w-3 h-3" /> Card OK
          </span>
        )}
      </div>

      {/* Opening hours */}
      {Object.keys(spot.opening_hours || {}).length > 0 && (
        <div className="px-4 pb-2 flex items-start gap-1.5">
          <Clock className="w-3.5 h-3.5 text-harbor-400 mt-0.5 flex-shrink-0" />
          <div className="text-harbor-500 text-xs">
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

      {/* Caution note */}
      {spot.caution && (
        <div className="mx-4 mb-3 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-amber-700 text-xs leading-relaxed">
            ⚠️ {spot.caution}
          </p>
        </div>
      )}

      {/* Action buttons */}
      <div className="px-4 pb-4 flex gap-2">
        <a
          href={spot.google_maps_url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackClick(spot.id, conversationId, 'maps')}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-kobe-gold text-harbor-950 rounded-xl text-sm font-semibold hover:bg-kobe-amber transition-colors shadow-card"
        >
          <MapPin className="w-4 h-4" />
          Maps
        </a>
        {spot.reservation_url && (
          <a
            href={spot.reservation_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackClick(spot.id, conversationId, 'reservation')}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-harbor-100 text-harbor-700 rounded-xl text-sm font-medium hover:bg-harbor-200 transition-colors border border-harbor-200"
          >
            <CalendarCheck className="w-4 h-4" />
            Reserve
          </a>
        )}
        {!spot.reservation_url && (
          <button
            onClick={() => trackClick(spot.id, conversationId, 'card_view')}
            className="px-3 py-2.5 bg-harbor-100 text-harbor-500 rounded-xl text-sm hover:bg-harbor-200 transition-colors border border-harbor-200"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
