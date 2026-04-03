'use client';

import { useFollow } from '@/hooks/useFollow';
import { useAuth } from '@/hooks/useAuth';
import { FollowStatus } from '@/types/social';
import { UserPlus, UserCheck, UserMinus, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Props {
  targetUserId: string;
  initialStatus?: FollowStatus;
  size?: 'sm' | 'md';
  className?: string;
}

export default function FollowButton({ targetUserId, initialStatus, size = 'md', className = '' }: Props) {
  const { user } = useAuth();
  const router = useRouter();
  const { status, loading, toggle } = useFollow({ targetUserId, initialStatus });

  // Don't render for own profile
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

  const sizeClass = size === 'sm'
    ? 'px-3 py-1 text-xs gap-1'
    : 'px-4 py-1.5 text-sm gap-1.5';

  const baseClass = `inline-flex items-center font-medium rounded-full transition-all duration-150 ${sizeClass} ${className}`;

  if (loading) {
    return (
      <button disabled className={`${baseClass} bg-harbor-800 text-harbor-500 cursor-not-allowed`}>
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        <span>{isFollowing ? 'フォロー中' : 'フォロー'}</span>
      </button>
    );
  }

  if (isFollowing) {
    return (
      <button
        onClick={handleClick}
        className={`${baseClass} bg-harbor-800 text-harbor-300 border border-harbor-700 hover:bg-kobe-red/20 hover:text-kobe-red hover:border-kobe-red/50 group`}
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
      className={`${baseClass} bg-kobe-gold text-harbor-950 hover:bg-kobe-amber active:scale-95`}
    >
      <UserPlus className="w-3.5 h-3.5" />
      <span>フォロー</span>
    </button>
  );
}
