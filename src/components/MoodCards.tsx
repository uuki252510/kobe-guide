'use client';

import { User, Banknote, Store, Fish, Wine, Sparkles, Moon, ArrowRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { MOODS, type MoodId } from '@/data/spots';

interface MoodCardsProps {
  selected?: string;
  onSelect: (moodId: string, chatPrompt: string) => void;
  layout?: 'grid' | 'scroll';
  limit?: number;
  showAll?: boolean;
}

const INK   = '#262220';
const MUTE  = '#857E78';
const PAPER_LIGHT = '#FAF4E6';
const INK_ON_PAPER = '#FAF4E6';

const MOOD_META: Record<MoodId, { icon: LucideIcon }> = {
  solo:     { icon: User },
  budget:   { icon: Banknote },
  kakuuchi: { icon: Store },
  seafood:  { icon: Fish },
  wine:     { icon: Wine },
  new:      { icon: Sparkles },
  late:     { icon: Moon },
  second:   { icon: ArrowRight },
};

export default function MoodCards({ selected, onSelect, layout = 'grid', limit, showAll = true }: MoodCardsProps) {
  const visibleMoods = (limit && !showAll) ? MOODS.slice(0, limit) : MOODS;

  if (layout === 'scroll') {
    return (
      <div className="flex gap-2 overflow-x-auto scrollbar-hide px-4">
        {visibleMoods.map(mood => {
          const meta = MOOD_META[mood.id];
          const Icon = meta.icon;
          const isSelected = selected === mood.id;
          return (
            <button
              key={mood.id}
              onClick={() => onSelect(mood.id, mood.chatPrompt)}
              className="flex-shrink-0 flex items-center gap-2"
              style={{
                padding: '7px 13px',
                background: isSelected ? INK : 'transparent',
                border: `1px solid ${INK}`,
                color: isSelected ? INK_ON_PAPER : INK,
                fontSize: 12,
                fontWeight: 700,
                borderRadius: 0,
                letterSpacing: '0.04em',
                lineHeight: 1.2,
              }}
            >
              <Icon className="w-3.5 h-3.5 flex-shrink-0" />
              {mood.label}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="w-full">
      <p
        className="text-center mb-4"
        style={{
          fontSize: 10,
          color: MUTE,
          letterSpacing: '0.28em',
          textTransform: 'uppercase',
        }}
      >
        今夜の気分
      </p>
      <div className="grid grid-cols-2 gap-2">
        {visibleMoods.map(mood => {
          const meta = MOOD_META[mood.id];
          const Icon = meta.icon;
          const isSelected = selected === mood.id;
          return (
            <button
              key={mood.id}
              onClick={() => onSelect(mood.id, mood.chatPrompt)}
              className="relative flex flex-col gap-2 p-4 text-left"
              style={{
                background: isSelected ? INK : PAPER_LIGHT,
                border: `1px solid ${INK}`,
                color: isSelected ? INK_ON_PAPER : INK,
                borderRadius: 0,
              }}
            >
              <Icon
                style={{
                  width: 18, height: 18,
                  color: isSelected ? INK_ON_PAPER : INK,
                }}
              />
              <div>
                <p
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    lineHeight: 1.4,
                    color: isSelected ? INK_ON_PAPER : INK,
                    letterSpacing: '-0.005em',
                  }}
                >
                  {mood.label}
                </p>
                <p
                  style={{
                    fontSize: 11,
                    marginTop: 2,
                    color: isSelected ? 'rgba(250,244,230,0.7)' : MUTE,
                    lineHeight: 1.5,
                  }}
                >
                  {mood.sublabel}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
