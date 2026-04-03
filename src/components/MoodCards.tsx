'use client';

import { User, Banknote, Store, Fish, Wine, Sparkles, Moon, ArrowRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { MOODS, type MoodId } from '@/data/spots';

interface MoodCardsProps {
  selected?: string;
  onSelect: (moodId: string, chatPrompt: string) => void;
  layout?: 'grid' | 'scroll';
}

const MOOD_META: Record<MoodId, { icon: LucideIcon; iconBg: string; iconColor: string }> = {
  solo:     { icon: User,      iconBg: '#fef9f0', iconColor: '#9a7b3a' },
  budget:   { icon: Banknote,  iconBg: '#f0faf4', iconColor: '#2e7d52' },
  kakuuchi: { icon: Store,     iconBg: '#f4f0fa', iconColor: '#6b4fad' },
  seafood:  { icon: Fish,      iconBg: '#eff7fd', iconColor: '#2a6f9e' },
  wine:     { icon: Wine,      iconBg: '#fdf0f5', iconColor: '#a04060' },
  new:      { icon: Sparkles,  iconBg: '#eef9f5', iconColor: '#2a7a65' },
  late:     { icon: Moon,      iconBg: '#eeeff8', iconColor: '#4a5899' },
  second:   { icon: ArrowRight,iconBg: '#fdf5ee', iconColor: '#9a5a30' },
};

export default function MoodCards({ selected, onSelect, layout = 'grid' }: MoodCardsProps) {
  if (layout === 'scroll') {
    return (
      <div className="flex gap-2 overflow-x-auto scrollbar-hide px-4">
        {MOODS.map(mood => {
          const meta = MOOD_META[mood.id];
          const Icon = meta.icon;
          const isSelected = selected === mood.id;
          return (
            <button
              key={mood.id}
              onClick={() => onSelect(mood.id, mood.chatPrompt)}
              className={`flex-shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
                isSelected
                  ? 'bg-harbor-900 text-white border-harbor-800 shadow-md'
                  : 'bg-white text-harbor-700 border-harbor-200 hover:border-harbor-400'
              }`}
            >
              <Icon className="w-3.5 h-3.5 flex-shrink-0" />
              {mood.label}
            </button>
          );
        })}
      </div>
    );
  }

  // Grid layout (home page)
  return (
    <div className="w-full">
      <p className="text-harbor-400 text-[11px] text-center tracking-widest uppercase mb-4">
        今夜の気分から選ぶ
      </p>
      <div className="grid grid-cols-2 gap-3">
        {MOODS.map(mood => {
          const meta = MOOD_META[mood.id];
          const Icon = meta.icon;
          const isSelected = selected === mood.id;
          return (
            <button
              key={mood.id}
              onClick={() => onSelect(mood.id, mood.chatPrompt)}
              className={`group relative flex flex-col gap-3 p-4 rounded-2xl text-left transition-all duration-200 border ${
                isSelected
                  ? 'bg-kobe-cream border-kobe-gold shadow-[0_4px_20px_rgba(201,164,76,0.18)]'
                  : 'bg-white border-harbor-200 shadow-[0_1px_6px_rgba(0,0,0,0.06)] hover:border-harbor-300 hover:shadow-[0_4px_16px_rgba(0,0,0,0.1)] hover:-translate-y-0.5'
              }`}
            >
              {/* Icon */}
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200"
                style={{
                  backgroundColor: isSelected ? 'rgba(201,164,76,0.12)' : meta.iconBg,
                }}
              >
                <Icon
                  className="w-4.5 h-4.5"
                  style={{ color: isSelected ? '#C9A44C' : meta.iconColor, width: 18, height: 18 }}
                />
              </div>

              {/* Text */}
              <div>
                <p className={`text-[13px] font-semibold leading-snug mb-0.5 ${
                  isSelected ? 'text-harbor-900' : 'text-harbor-800'
                }`}>
                  {mood.label}
                </p>
                <p className="text-harbor-400 text-[11px] leading-snug">
                  {mood.sublabel}
                </p>
              </div>

              {/* Selected indicator */}
              {isSelected && (
                <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-kobe-gold" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
