'use client';

import { UserProfile, FollowStatus } from '@/types/social';
import { useAuth } from '@/hooks/useAuth';
import FollowButton from './FollowButton';
import MutualBadge from './MutualBadge';
import BlockButton from './BlockButton';
import { MapPin, Calendar } from 'lucide-react';
import Link from 'next/link';

const AREA_LABELS: Record<string, string> = {
  sannomiya: '三宮',
  motomachi: '元町',
  kitano: '北野',
  nankinmachi: '南京町',
  surroundings: 'その他',
};

interface Props {
  profile: UserProfile;
  followStatus: FollowStatus | null;
}

export default function ProfileHeader({ profile, followStatus }: Props) {
  const { user } = useAuth();
  const isOwn = user?.id === profile.id;
  const avatarFallback = (profile.display_name ?? profile.username).charAt(0).toUpperCase();

  const joinedYear = new Date(profile.created_at).getFullYear();

  return (
    <div className="px-4 pt-6 pb-4">
      {/* Top row: avatar + actions */}
      <div className="flex items-start justify-between gap-3 mb-4">
        {/* Avatar */}
        <div className="relative">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.username}
              className="w-20 h-20 rounded-full object-cover border-2 border-harbor-700"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-kobe-gold/20 border-2 border-kobe-gold/40 flex items-center justify-center text-kobe-gold font-bold text-2xl">
              {avatarFallback}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 mt-2">
          {isOwn ? (
            <Link
              href="/profile/edit"
              className="px-4 py-1.5 text-sm rounded-full border border-harbor-600 text-harbor-300 hover:bg-harbor-800 transition-colors"
            >
              プロフィール編集
            </Link>
          ) : (
            <>
              <FollowButton targetUserId={profile.id} initialStatus={followStatus ?? undefined} />
              <BlockButton targetUserId={profile.id} />
            </>
          )}
        </div>
      </div>

      {/* Name + username */}
      <div className="mb-1">
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-xl font-bold text-harbor-50">
            {profile.display_name ?? profile.username}
          </h1>
          {followStatus?.isMutual && <MutualBadge />}
          {followStatus?.isFollowedBy && !followStatus.isMutual && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-harbor-800 text-harbor-400 border border-harbor-700">
              フォローされています
            </span>
          )}
        </div>
        <p className="text-harbor-500 text-sm">@{profile.username}</p>
      </div>

      {/* Bio */}
      {profile.bio && (
        <p className="text-harbor-300 text-sm mt-2 leading-relaxed">{profile.bio}</p>
      )}

      {/* Meta */}
      <div className="flex items-center gap-3 mt-2 flex-wrap">
        {profile.area_preference && (
          <span className="flex items-center gap-1 text-harbor-500 text-xs">
            <MapPin className="w-3 h-3" />
            {AREA_LABELS[profile.area_preference] ?? profile.area_preference}
          </span>
        )}
        <span className="flex items-center gap-1 text-harbor-500 text-xs">
          <Calendar className="w-3 h-3" />
          {joinedYear}年から
        </span>
      </div>

      {/* Follow counts */}
      <div className="flex items-center gap-4 mt-3">
        <Link href={`/users/${profile.id}/following`} className="group">
          <span className="text-harbor-100 font-bold text-sm group-hover:text-kobe-gold transition-colors">
            {profile.following_count ?? 0}
          </span>
          <span className="text-harbor-500 text-xs ml-1">フォロー中</span>
        </Link>
        <Link href={`/users/${profile.id}/followers`} className="group">
          <span className="text-harbor-100 font-bold text-sm group-hover:text-kobe-gold transition-colors">
            {profile.follower_count ?? 0}
          </span>
          <span className="text-harbor-500 text-xs ml-1">フォロワー</span>
        </Link>
      </div>
    </div>
  );
}
