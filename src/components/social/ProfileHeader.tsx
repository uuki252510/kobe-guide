'use client';

import { UserProfile, FollowStatus } from '@/types/social';
import { useAuth } from '@/hooks/useAuth';
import FollowButton from './FollowButton';
import MutualBadge from './MutualBadge';
import BlockButton from './BlockButton';
import { MapPin, Calendar } from 'lucide-react';
import Link from 'next/link';

const C = {
  ink:        '#262220',
  inkSoft:    '#3D3832',
  mute:       '#857E78',
  rule:       '#D5CBBE',
  inkOnPaper: '#FAF4E6',
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
  followStatus: FollowStatus | null;
}

export default function ProfileHeader({ profile, followStatus }: Props) {
  const { user } = useAuth();
  const isOwn = user?.id === profile.id;
  const avatarFallback = (profile.display_name ?? profile.username).charAt(0).toUpperCase();
  const joinedYear = new Date(profile.created_at).getFullYear();

  return (
    <div className="px-4 pt-6 pb-5">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="relative">
          {profile.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatar_url}
              alt={profile.username}
              className="w-20 h-20 object-cover"
              style={{ borderRadius: 0, border: `2px solid ${C.ink}` }}
            />
          ) : (
            <div
              className="w-20 h-20 flex items-center justify-center"
              style={{
                background: 'transparent',
                border: `2px solid ${C.ink}`,
                color: C.ink,
                fontWeight: 700,
                fontSize: 30,
                borderRadius: 0,
              }}
            >
              {avatarFallback}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 mt-2">
          {isOwn ? (
            <Link
              href="/profile/edit"
              style={{
                padding: '6px 14px',
                fontSize: 12,
                background: 'transparent',
                border: `1px solid ${C.ink}`,
                color: C.ink,
                fontWeight: 700,
                borderRadius: 0,
                letterSpacing: '0.08em',
                lineHeight: 1.4,
              }}
            >
              編集
            </Link>
          ) : (
            <>
              <FollowButton targetUserId={profile.id} initialStatus={followStatus ?? undefined} />
              <BlockButton targetUserId={profile.id} />
            </>
          )}
        </div>
      </div>

      <div className="mb-1">
        <div className="flex items-center gap-2 flex-wrap">
          <h1
            style={{
              fontSize: 20, fontWeight: 700, color: C.ink,
              letterSpacing: '-0.02em', lineHeight: 1.3,
            }}
          >
            {profile.display_name ?? profile.username}
          </h1>
          {followStatus?.isMutual && <MutualBadge />}
          {followStatus?.isFollowedBy && !followStatus.isMutual && (
            <span
              style={{
                fontSize: 9, padding: '1px 6px',
                color: C.mute,
                border: `1px solid ${C.rule}`,
                borderRadius: 0,
                letterSpacing: '0.12em',
              }}
            >
              フォローされています
            </span>
          )}
        </div>
        <p style={{ color: C.mute, fontSize: 13, marginTop: 2 }}>@{profile.username}</p>
      </div>

      {profile.bio && (
        <p
          style={{
            color: C.inkSoft, fontSize: 13, marginTop: 10,
            lineHeight: 1.7,
          }}
        >
          {profile.bio}
        </p>
      )}

      <div className="flex items-center gap-3 mt-3 flex-wrap">
        {profile.area_preference && (
          <span
            className="flex items-center gap-1"
            style={{ color: C.mute, fontSize: 11, letterSpacing: '0.04em' }}
          >
            <MapPin className="w-3 h-3" />
            {AREA_LABELS[profile.area_preference] ?? profile.area_preference}
          </span>
        )}
        <span
          className="flex items-center gap-1"
          style={{ color: C.mute, fontSize: 11, letterSpacing: '0.04em' }}
        >
          <Calendar className="w-3 h-3" />
          {joinedYear}年から
        </span>
      </div>

      <div
        className="flex items-center gap-5 mt-4 pt-4"
        style={{ borderTop: `1px solid ${C.rule}` }}
      >
        <Link href={`/users/${profile.id}/following`} className="group">
          <span style={{ color: C.ink, fontWeight: 700, fontSize: 14 }}>
            {profile.following_count ?? 0}
          </span>
          <span
            style={{
              color: C.mute, fontSize: 10, marginLeft: 4,
              letterSpacing: '0.12em',
            }}
          >
            フォロー中
          </span>
        </Link>
        <Link href={`/users/${profile.id}/followers`} className="group">
          <span style={{ color: C.ink, fontWeight: 700, fontSize: 14 }}>
            {profile.follower_count ?? 0}
          </span>
          <span
            style={{
              color: C.mute, fontSize: 10, marginLeft: 4,
              letterSpacing: '0.12em',
            }}
          >
            フォロワー
          </span>
        </Link>
      </div>
    </div>
  );
}
