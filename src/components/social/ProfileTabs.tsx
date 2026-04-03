'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heart, MapPin, Users, UserCheck } from 'lucide-react';
import { UserProfile } from '@/types/social';

interface Restaurant {
  id: string;
  name: string;
  area: string;
  tachinomi_type: string;
}

interface FavoriteRow {
  restaurant_id: string;
  created_at: string;
  restaurant: Restaurant | Restaurant[] | null;
}

interface VisitRow {
  id: string;
  visited_at: string;
  note: string | null;
  restaurant: Restaurant | Restaurant[] | null;
}

interface Props {
  profile: UserProfile;
  favorites: FavoriteRow[] | null;
  visits: VisitRow[] | null;
  isOwn: boolean;
}

type Tab = 'favorites' | 'visits' | 'followers' | 'following';

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'favorites', label: 'お気に入り', icon: Heart },
  { id: 'visits',    label: '訪問履歴',   icon: MapPin },
  { id: 'followers', label: 'フォロワー',  icon: Users },
  { id: 'following', label: 'フォロー中',  icon: UserCheck },
];

const AREA_LABELS: Record<string, string> = {
  sannomiya: '三宮',
  motomachi: '元町',
  kitano: '北野',
  nankinmachi: '南京町',
  surroundings: 'その他',
};

function getRestaurant(r: Restaurant | Restaurant[] | null): Restaurant | null {
  if (!r) return null;
  return Array.isArray(r) ? r[0] : r;
}

export default function ProfileTabs({ profile, favorites, visits, isOwn }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('favorites');

  return (
    <div>
      {/* Tab bar */}
      <div className="flex border-b border-harbor-800 px-2">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex flex-col items-center py-3 gap-0.5 text-[11px] font-medium transition-colors border-b-2 -mb-px ${
              activeTab === id
                ? 'border-kobe-gold text-kobe-gold'
                : 'border-transparent text-harbor-500 hover:text-harbor-300'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="p-4">
        {/* Favorites */}
        {activeTab === 'favorites' && (
          <div>
            {favorites === null ? (
              <p className="text-center text-harbor-500 text-sm py-8">非公開です</p>
            ) : favorites.length === 0 ? (
              <p className="text-center text-harbor-500 text-sm py-8">
                {isOwn ? 'まだお気に入りがありません' : 'お気に入りがありません'}
              </p>
            ) : (
              <div className="space-y-2">
                {favorites.map((fav) => {
                  const r = getRestaurant(fav.restaurant);
                  if (!r) return null;
                  return (
                    <Link
                      key={fav.restaurant_id}
                      href={`/stores/${fav.restaurant_id}`}
                      className="flex items-center gap-3 p-3 rounded-lg bg-harbor-900 hover:bg-harbor-800 border border-harbor-800 transition-colors"
                    >
                      <Heart className="w-4 h-4 text-kobe-red flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-harbor-100 text-sm font-medium truncate">{r.name}</p>
                        <p className="text-harbor-500 text-xs">{AREA_LABELS[r.area] ?? r.area}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Visits */}
        {activeTab === 'visits' && (
          <div>
            {visits === null ? (
              <p className="text-center text-harbor-500 text-sm py-8">非公開です</p>
            ) : visits.length === 0 ? (
              <p className="text-center text-harbor-500 text-sm py-8">
                {isOwn ? 'まだ訪問記録がありません' : '訪問履歴がありません'}
              </p>
            ) : (
              <div className="space-y-2">
                {visits.map((visit) => {
                  const r = getRestaurant(visit.restaurant);
                  if (!r) return null;
                  return (
                    <Link
                      key={visit.id}
                      href={`/stores/${r.id}`}
                      className="flex items-start gap-3 p-3 rounded-lg bg-harbor-900 hover:bg-harbor-800 border border-harbor-800 transition-colors"
                    >
                      <MapPin className="w-4 h-4 text-kobe-gold flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-harbor-100 text-sm font-medium truncate">{r.name}</p>
                        {visit.note && (
                          <p className="text-harbor-400 text-xs mt-0.5 line-clamp-2">{visit.note}</p>
                        )}
                        <p className="text-harbor-600 text-[11px] mt-1">
                          {new Date(visit.visited_at).toLocaleDateString('ja-JP', {
                            year: 'numeric', month: 'short', day: 'numeric',
                          })}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Followers / Following — redirect to dedicated pages */}
        {(activeTab === 'followers' || activeTab === 'following') && (
          <div className="text-center py-8">
            <Link
              href={`/users/${profile.id}/${activeTab}`}
              className="px-6 py-2.5 rounded-full bg-kobe-gold text-harbor-950 font-semibold text-sm"
            >
              {activeTab === 'followers' ? 'フォロワー一覧を見る' : 'フォロー中一覧を見る'}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
