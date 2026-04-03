'use client';

import Link from 'next/link';
import { FeedActivity } from '@/types/social';
import { Heart, MapPin, UserPlus } from 'lucide-react';

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
    iconClass: 'text-kobe-gold bg-kobe-gold/15',
    label: (a: FeedActivity) => (
      <>
        <span className="font-semibold text-harbor-100">{a.actor_display_name ?? a.actor_username}</span>
        <span className="text-harbor-400"> が </span>
        <span className="font-semibold text-harbor-200">{a.restaurant_name}</span>
        <span className="text-harbor-400"> に行った</span>
      </>
    ),
  },
  favorite: {
    icon: Heart,
    iconClass: 'text-kobe-red bg-kobe-red/15',
    label: (a: FeedActivity) => (
      <>
        <span className="font-semibold text-harbor-100">{a.actor_display_name ?? a.actor_username}</span>
        <span className="text-harbor-400"> が </span>
        <span className="font-semibold text-harbor-200">{a.restaurant_name}</span>
        <span className="text-harbor-400"> をお気に入りに追加</span>
      </>
    ),
  },
  follow: {
    icon: UserPlus,
    iconClass: 'text-blue-400 bg-blue-400/15',
    label: (a: FeedActivity) => (
      <>
        <span className="font-semibold text-harbor-100">{a.actor_display_name ?? a.actor_username}</span>
        <span className="text-harbor-400"> が </span>
        <span className="font-semibold text-harbor-200">
          {a.target_display_name ?? a.target_username}
        </span>
        <span className="text-harbor-400"> をフォロー</span>
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
    <div className="flex gap-3 p-4 hover:bg-harbor-900/50 transition-colors">
      {/* Actor avatar */}
      <Link href={`/users/${activity.user_id}`} className="flex-shrink-0 mt-0.5">
        {activity.actor_avatar_url ? (
          <img
            src={activity.actor_avatar_url}
            alt={activity.actor_username}
            className="w-9 h-9 rounded-full object-cover"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-kobe-gold/20 border border-kobe-gold/30 flex items-center justify-center text-kobe-gold font-bold text-sm">
            {avatarFallback}
          </div>
        )}
      </Link>

      <div className="flex-1 min-w-0">
        {/* Activity icon + text */}
        <div className="flex items-start gap-2">
          <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5 ${config.iconClass}`}>
            <Icon className="w-3 h-3" />
          </span>
          <p className="text-sm leading-snug flex-1 flex-wrap">
            {config.label(activity)}
          </p>
        </div>

        {/* Restaurant card (for visit/favorite) */}
        {restaurantLink && activity.restaurant_name && (
          <Link
            href={restaurantLink}
            className="mt-2 flex items-center gap-2 px-3 py-2 rounded-lg bg-harbor-800 hover:bg-harbor-700 border border-harbor-700 transition-colors text-xs"
          >
            <MapPin className="w-3 h-3 text-kobe-gold flex-shrink-0" />
            <span className="font-medium text-harbor-200 truncate">{activity.restaurant_name}</span>
            {activity.restaurant_area && (
              <span className="text-harbor-500 ml-auto flex-shrink-0">{activity.restaurant_area}</span>
            )}
          </Link>
        )}

        {/* Target user card (for follow) */}
        {targetUserLink && activity.target_username && (
          <Link
            href={targetUserLink}
            className="mt-2 flex items-center gap-2 px-3 py-2 rounded-lg bg-harbor-800 hover:bg-harbor-700 border border-harbor-700 transition-colors text-xs"
          >
            <div className="w-5 h-5 rounded-full bg-kobe-gold/20 flex items-center justify-center text-kobe-gold font-bold text-[10px] flex-shrink-0">
              {(activity.target_display_name ?? activity.target_username).charAt(0).toUpperCase()}
            </div>
            <span className="font-medium text-harbor-200 truncate">
              {activity.target_display_name ?? activity.target_username}
            </span>
            <span className="text-harbor-500 text-[11px] ml-auto flex-shrink-0">
              @{activity.target_username}
            </span>
          </Link>
        )}

        <p className="text-harbor-600 text-[11px] mt-1.5">{timeAgo(activity.created_at)}</p>
      </div>
    </div>
  );
}
