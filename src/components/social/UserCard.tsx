'use client';

import Link from 'next/link';
import { UserProfile, FollowStatus } from '@/types/social';
import FollowButton from './FollowButton';
import MutualBadge from './MutualBadge';
import { MapPin } from 'lucide-react';

const AREA_LABELS: Record<string, string> = {
  sannomiya: '三宮',
  motomachi: '元町',
  kitano: '北野',
  nankinmachi: '南京町',
  surroundings: 'その他',
};

interface Props {
  profile: UserProfile;
  followStatus?: FollowStatus;
  showFollowCounts?: boolean;
}

export default function UserCard({ profile, followStatus, showFollowCounts = true }: Props) {
  const avatarFallback = (profile.display_name ?? profile.username).charAt(0).toUpperCase();

  return (
    <Link
      href={`/users/${profile.id}`}
      className="flex items-center gap-3 p-3 rounded-xl bg-harbor-900 hover:bg-harbor-800 transition-colors border border-harbor-800 hover:border-harbor-700"
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        {profile.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={profile.username}
            className="w-11 h-11 rounded-full object-cover"
          />
        ) : (
          <div className="w-11 h-11 rounded-full bg-kobe-gold/20 border border-kobe-gold/30 flex items-center justify-center text-kobe-gold font-bold text-base">
            {avatarFallback}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-semibold text-harbor-100 text-sm truncate">
            {profile.display_name ?? profile.username}
          </span>
          {followStatus?.isMutual && <MutualBadge />}
        </div>
        <p className="text-harbor-500 text-xs mt-0.5">@{profile.username}</p>

        <div className="flex items-center gap-3 mt-1">
          {profile.area_preference && (
            <span className="flex items-center gap-0.5 text-harbor-500 text-[11px]">
              <MapPin className="w-2.5 h-2.5" />
              {AREA_LABELS[profile.area_preference] ?? profile.area_preference}
            </span>
          )}
          {showFollowCounts && (
            <>
              <span className="text-harbor-500 text-[11px]">
                <span className="text-harbor-300 font-medium">{profile.follower_count ?? 0}</span> フォロワー
              </span>
            </>
          )}
        </div>
      </div>

      {/* Follow button */}
      <div onClick={(e) => e.preventDefault()} className="flex-shrink-0">
        <FollowButton targetUserId={profile.id} initialStatus={followStatus} size="sm" />
      </div>
    </Link>
  );
}
