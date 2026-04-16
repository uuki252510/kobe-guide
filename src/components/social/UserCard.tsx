'use client';

import Link from 'next/link';
import { UserProfile, FollowStatus } from '@/types/social';
import FollowButton from './FollowButton';
import MutualBadge from './MutualBadge';
import { MapPin } from 'lucide-react';

const C = {
  surface: '#FAF4E6',
  ink:     '#262220',
  inkSoft: '#3D3832',
  mute:    '#857E78',
  rule:    '#D5CBBE',
};

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
      className="flex items-center gap-3 p-3"
      style={{
        background: C.surface,
        border: `1px solid ${C.ink}`,
        borderRadius: 0,
      }}
    >
      <div className="relative flex-shrink-0">
        {profile.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.avatar_url}
            alt={profile.username}
            className="w-11 h-11 object-cover"
            style={{ borderRadius: 0, border: `1px solid ${C.ink}` }}
          />
        ) : (
          <div
            className="w-11 h-11 flex items-center justify-center"
            style={{
              background: 'transparent',
              border: `1px solid ${C.ink}`,
              color: C.ink,
              fontWeight: 700,
              fontSize: 16,
              borderRadius: 0,
            }}
          >
            {avatarFallback}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className="truncate"
            style={{
              fontWeight: 700, color: C.ink,
              fontSize: 14, letterSpacing: '-0.01em',
            }}
          >
            {profile.display_name ?? profile.username}
          </span>
          {followStatus?.isMutual && <MutualBadge />}
        </div>
        <p style={{ color: C.mute, fontSize: 11, marginTop: 2 }}>@{profile.username}</p>

        <div className="flex items-center gap-3 mt-1.5">
          {profile.area_preference && (
            <span
              className="flex items-center gap-0.5"
              style={{ color: C.mute, fontSize: 10, letterSpacing: '0.04em' }}
            >
              <MapPin className="w-2.5 h-2.5" />
              {AREA_LABELS[profile.area_preference] ?? profile.area_preference}
            </span>
          )}
          {showFollowCounts && (
            <span style={{ color: C.mute, fontSize: 10, letterSpacing: '0.04em' }}>
              <span style={{ color: C.ink, fontWeight: 700 }}>{profile.follower_count ?? 0}</span>
              {' '}フォロワー
            </span>
          )}
        </div>
      </div>

      <div onClick={(e) => e.preventDefault()} className="flex-shrink-0">
        <FollowButton targetUserId={profile.id} initialStatus={followStatus} size="sm" />
      </div>
    </Link>
  );
}
