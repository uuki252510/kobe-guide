'use client';

import Link from 'next/link';
import { FeedActivity } from '@/types/social';
import { Heart, MapPin, UserPlus } from 'lucide-react';

const C = {
  surface:   '#FAF4E6',
  ink:       '#262220',
  inkSoft:   '#3D3832',
  mute:      '#857E78',
  rule:      '#D5CBBE',
  accent:    '#B94A3B',
  blue:      '#3A6DB0',
  green:     '#2E7D5B',
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'たった今';
  if (mins < 60) return `${mins}分前`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}時間前`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}日前`;
  return new Date(dateStr).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });
}

const ACTIVITY_CONFIG = {
  visit: {
    icon: MapPin,
    iconColor: C.green,
    label: (a: FeedActivity) => (
      <>
        <span style={{ color: C.ink, fontWeight: 700 }}>{a.actor_display_name ?? a.actor_username}</span>
        <span style={{ color: C.mute }}> が </span>
        <span style={{ color: C.ink, fontWeight: 600 }}>{a.restaurant_name}</span>
        <span style={{ color: C.mute }}> に行った</span>
      </>
    ),
  },
  favorite: {
    icon: Heart,
    iconColor: C.accent,
    label: (a: FeedActivity) => (
      <>
        <span style={{ color: C.ink, fontWeight: 700 }}>{a.actor_display_name ?? a.actor_username}</span>
        <span style={{ color: C.mute }}> が </span>
        <span style={{ color: C.ink, fontWeight: 600 }}>{a.restaurant_name}</span>
        <span style={{ color: C.mute }}> を控えた</span>
      </>
    ),
  },
  follow: {
    icon: UserPlus,
    iconColor: C.blue,
    label: (a: FeedActivity) => (
      <>
        <span style={{ color: C.ink, fontWeight: 700 }}>{a.actor_display_name ?? a.actor_username}</span>
        <span style={{ color: C.mute }}> が </span>
        <span style={{ color: C.ink, fontWeight: 600 }}>
          {a.target_display_name ?? a.target_username}
        </span>
        <span style={{ color: C.mute }}> をフォロー</span>
      </>
    ),
  },
} as const;

interface Props {
  activity: FeedActivity;
}

export default function FeedItem({ activity }: Props) {
  const config = ACTIVITY_CONFIG[activity.activity_type];
  const Icon = config.icon;
  const avatarFallback = (activity.actor_display_name ?? activity.actor_username)
    .charAt(0)
    .toUpperCase();

  const restaurantLink = activity.restaurant_id ? `/stores/${activity.restaurant_id}` : null;
  const targetUserLink = activity.target_user_id ? `/users/${activity.target_user_id}` : null;

  return (
    <div
      className="flex gap-3 px-4 py-4"
      style={{ borderBottom: `1px solid ${C.rule}` }}
    >
      <Link href={`/users/${activity.user_id}`} className="flex-shrink-0 mt-0.5">
        {activity.actor_avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={activity.actor_avatar_url}
            alt={activity.actor_username}
            className="w-9 h-9 object-cover"
            style={{ borderRadius: 0, border: `1px solid ${C.ink}` }}
          />
        ) : (
          <div
            className="w-9 h-9 flex items-center justify-center"
            style={{
              background: 'transparent',
              border: `1px solid ${C.ink}`,
              color: C.ink,
              fontWeight: 700,
              fontSize: 14,
              borderRadius: 0,
            }}
          >
            {avatarFallback}
          </div>
        )}
      </Link>

      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2">
          <span
            className="flex-shrink-0 flex items-center justify-center mt-0.5"
            style={{
              width: 20, height: 20,
              color: config.iconColor,
              borderRadius: 0,
            }}
          >
            <Icon className="w-3.5 h-3.5" />
          </span>
          <p style={{ fontSize: 13, lineHeight: 1.6, flex: 1 }}>
            {config.label(activity)}
          </p>
        </div>

        {restaurantLink && activity.restaurant_name && (
          <Link
            href={restaurantLink}
            className="mt-2 flex items-center gap-2"
            style={{
              padding: '8px 12px',
              background: C.surface,
              border: `1px solid ${C.ink}`,
              borderRadius: 0,
              fontSize: 12,
            }}
          >
            <MapPin className="w-3 h-3 flex-shrink-0" style={{ color: C.ink }} />
            <span className="truncate" style={{ color: C.ink, fontWeight: 700 }}>
              {activity.restaurant_name}
            </span>
            {activity.restaurant_area && (
              <span
                className="ml-auto flex-shrink-0"
                style={{ color: C.mute, letterSpacing: '0.04em' }}
              >
                {activity.restaurant_area}
              </span>
            )}
          </Link>
        )}

        {targetUserLink && activity.target_username && (
          <Link
            href={targetUserLink}
            className="mt-2 flex items-center gap-2"
            style={{
              padding: '8px 12px',
              background: 'transparent',
              border: `1px solid ${C.ink}`,
              borderRadius: 0,
              fontSize: 12,
            }}
          >
            <div
              className="flex items-center justify-center flex-shrink-0"
              style={{
                width: 20, height: 20,
                background: 'transparent',
                border: `1px solid ${C.ink}`,
                color: C.ink,
                fontWeight: 700,
                fontSize: 10,
                borderRadius: 0,
              }}
            >
              {(activity.target_display_name ?? activity.target_username).charAt(0).toUpperCase()}
            </div>
            <span className="truncate" style={{ color: C.ink, fontWeight: 700 }}>
              {activity.target_display_name ?? activity.target_username}
            </span>
            <span
              className="ml-auto flex-shrink-0"
              style={{ color: C.mute, fontSize: 11 }}
            >
              @{activity.target_username}
            </span>
          </Link>
        )}

        <p
          style={{
            fontSize: 10,
            color: C.mute,
            marginTop: 8,
            letterSpacing: '0.12em',
          }}
        >
          {timeAgo(activity.created_at)}
        </p>
      </div>
    </div>
  );
}
