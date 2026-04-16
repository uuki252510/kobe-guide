'use client';

import { useFollow } from '@/hooks/useFollow';
import { useAuth } from '@/hooks/useAuth';
import { FollowStatus } from '@/types/social';
import { UserPlus, UserCheck, UserMinus } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Props {
  targetUserId: string;
  initialStatus?: FollowStatus;
  size?: 'sm' | 'md';
  className?: string;
}

const INK = '#262220';
const INK_ON_PAPER = '#FAF4E6';
const MUTE = '#857E78';
const ACCENT = '#B94A3B';

export default function FollowButton({ targetUserId, initialStatus, size = 'md', className = '' }: Props) {
  const { user } = useAuth();
  const router = useRouter();
  const { status, loading, toggle } = useFollow({ targetUserId, initialStatus });

  if (user?.id === targetUserId) return null;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      router.push('/auth');
      return;
    }
    toggle();
  };

  const isFollowing = status.isFollowing;
  const sizeStyle: React.CSSProperties = size === 'sm'
    ? { padding: '4px 10px', fontSize: 11, gap: 4 }
    : { padding: '6px 14px', fontSize: 12, gap: 5 };

  const base: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    fontWeight: 700,
    borderRadius: 0,
    letterSpacing: '0.08em',
    lineHeight: 1,
    ...sizeStyle,
  };

  if (loading) {
    return (
      <button
        disabled
        className={className}
        style={{
          ...base,
          background: 'transparent',
          border: `1px solid ${MUTE}`,
          color: MUTE,
          cursor: 'not-allowed',
        }}
      >
        <span
          className="inline-block animate-pulse"
          style={{ width: 12, height: 1, background: MUTE }}
        />
        <span>{isFollowing ? 'フォロー中' : 'フォロー'}</span>
      </button>
    );
  }

  if (isFollowing) {
    return (
      <button
        onClick={handleClick}
        className={`${className} group`}
        style={{
          ...base,
          background: 'transparent',
          border: `1px solid ${INK}`,
          color: INK,
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = ACCENT;
          (e.currentTarget as HTMLElement).style.color = ACCENT;
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = INK;
          (e.currentTarget as HTMLElement).style.color = INK;
        }}
      >
        <UserCheck className="w-3.5 h-3.5 group-hover:hidden" />
        <UserMinus className="w-3.5 h-3.5 hidden group-hover:block" />
        <span className="group-hover:hidden">フォロー中</span>
        <span className="hidden group-hover:block">解除</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={className}
      style={{
        ...base,
        background: INK,
        color: INK_ON_PAPER,
        border: `1px solid ${INK}`,
      }}
    >
      <UserPlus className="w-3.5 h-3.5" />
      <span>フォロー</span>
    </button>
  );
}
