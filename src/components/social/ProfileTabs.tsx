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

  const itemLinkStyle: React.CSSProperties = {
    background: C.surface,
    border: `1px solid ${C.ink}`,
    borderRadius: 0,
  };

  return (
    <div>
      <div
        className="flex px-2"
        style={{ borderBottom: `1px solid ${C.ink}` }}
      >
        {TABS.map(({ id, label, icon: Icon }) => {
          const on = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className="flex-1 flex flex-col items-center py-3 gap-1"
              style={{
                fontSize: 10,
                fontWeight: on ? 700 : 600,
                color: on ? C.ink : C.mute,
                letterSpacing: on ? '0.12em' : '0.04em',
                borderBottom: on ? `2px solid ${C.ink}` : '2px solid transparent',
                marginBottom: -1,
              }}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          );
        })}
      </div>

      <div className="p-4">
        {activeTab === 'favorites' && (
          <div>
            {favorites === null ? (
              <p className="text-center py-8" style={{ color: C.mute, fontSize: 13 }}>非公開</p>
            ) : favorites.length === 0 ? (
              <p className="text-center py-8" style={{ color: C.mute, fontSize: 13 }}>
                {isOwn ? 'まだお気に入りがない' : 'お気に入りがない'}
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {favorites.map((fav) => {
                  const r = getRestaurant(fav.restaurant);
                  if (!r) return null;
                  return (
                    <Link
                      key={fav.restaurant_id}
                      href={`/stores/${fav.restaurant_id}`}
                      className="flex items-center gap-3 p-3"
                      style={itemLinkStyle}
                    >
                      <Heart
                        className="w-4 h-4 flex-shrink-0"
                        style={{ color: C.accent, fill: C.accent }}
                      />
                      <div className="flex-1 min-w-0">
                        <p
                          className="truncate"
                          style={{ color: C.ink, fontSize: 13, fontWeight: 700 }}
                        >
                          {r.name}
                        </p>
                        <p
                          style={{
                            color: C.mute, fontSize: 11, marginTop: 2,
                            letterSpacing: '0.04em',
                          }}
                        >
                          {AREA_LABELS[r.area] ?? r.area}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'visits' && (
          <div>
            {visits === null ? (
              <p className="text-center py-8" style={{ color: C.mute, fontSize: 13 }}>非公開</p>
            ) : visits.length === 0 ? (
              <p className="text-center py-8" style={{ color: C.mute, fontSize: 13 }}>
                {isOwn ? 'まだ訪問記録がない' : '訪問履歴がない'}
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {visits.map((visit) => {
                  const r = getRestaurant(visit.restaurant);
                  if (!r) return null;
                  return (
                    <Link
                      key={visit.id}
                      href={`/stores/${r.id}`}
                      className="flex items-start gap-3 p-3"
                      style={itemLinkStyle}
                    >
                      <MapPin
                        className="w-4 h-4 flex-shrink-0"
                        style={{ color: C.ink, marginTop: 2 }}
                      />
                      <div className="flex-1 min-w-0">
                        <p
                          className="truncate"
                          style={{ color: C.ink, fontSize: 13, fontWeight: 700 }}
                        >
                          {r.name}
                        </p>
                        {visit.note && (
                          <p
                            className="line-clamp-2"
                            style={{ color: C.inkSoft, fontSize: 11, marginTop: 4, lineHeight: 1.6 }}
                          >
                            {visit.note}
                          </p>
                        )}
                        <p
                          style={{
                            color: C.mute, fontSize: 10, marginTop: 6,
                            letterSpacing: '0.12em',
                          }}
                        >
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

        {(activeTab === 'followers' || activeTab === 'following') && (
          <div className="text-center py-8">
            <Link
              href={`/users/${profile.id}/${activeTab}`}
              style={{
                padding: '10px 20px',
                background: C.ink,
                color: C.inkOnPaper,
                fontWeight: 700,
                fontSize: 12,
                borderRadius: 0,
                letterSpacing: '0.08em',
                lineHeight: 1,
              }}
            >
              {activeTab === 'followers' ? 'フォロワー一覧' : 'フォロー中一覧'}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
