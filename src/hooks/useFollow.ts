'use client';

import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import { FollowStatus } from '@/types/social';

interface UseFollowOptions {
  targetUserId: string;
  initialStatus?: FollowStatus;
}

export function useFollow({ targetUserId, initialStatus }: UseFollowOptions) {
  const { accessToken } = useAuth();
  const [status, setStatus] = useState<FollowStatus>(
    initialStatus ?? {
      isFollowing: false,
      isFollowedBy: false,
      isMutual: false,
      isBlocked: false,
    },
  );
  const [loading, setLoading] = useState(false);

  const authHeaders = useCallback(
    () => ({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    }),
    [accessToken],
  );

  const follow = useCallback(async () => {
    if (!accessToken || loading) return;
    // Optimistic update
    setStatus((prev) => ({
      ...prev,
      isFollowing: true,
      isMutual: prev.isFollowedBy,
    }));
    setLoading(true);
    try {
      const res = await fetch('/api/follow', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ followingId: targetUserId }),
      });
      if (!res.ok) {
        // Rollback
        setStatus((prev) => ({
          ...prev,
          isFollowing: false,
          isMutual: false,
        }));
      }
    } finally {
      setLoading(false);
    }
  }, [accessToken, targetUserId, loading, authHeaders]);

  const unfollow = useCallback(async () => {
    if (!accessToken || loading) return;
    // Optimistic update
    setStatus((prev) => ({
      ...prev,
      isFollowing: false,
      isMutual: false,
    }));
    setLoading(true);
    try {
      const res = await fetch('/api/follow', {
        method: 'DELETE',
        headers: authHeaders(),
        body: JSON.stringify({ followingId: targetUserId }),
      });
      if (!res.ok) {
        setStatus((prev) => ({
          ...prev,
          isFollowing: true,
          isMutual: prev.isFollowedBy,
        }));
      }
    } finally {
      setLoading(false);
    }
  }, [accessToken, targetUserId, loading, authHeaders]);

  const toggle = useCallback(() => {
    if (status.isFollowing) return unfollow();
    return follow();
  }, [status.isFollowing, follow, unfollow]);

  return { status, loading, follow, unfollow, toggle };
}
