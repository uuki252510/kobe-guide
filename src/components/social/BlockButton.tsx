'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Shield, ShieldOff, MoreVertical } from 'lucide-react';

interface Props {
  targetUserId: string;
  isBlocked?: boolean;
  onBlock?: () => void;
}

const INK    = '#262220';
const PAPER  = '#F3ECDD';
const ACCENT = '#B94A3B';

export default function BlockButton({ targetUserId, isBlocked: initialBlocked = false, onBlock }: Props) {
  const { user, accessToken } = useAuth();
  const [open, setOpen] = useState(false);
  const [blocked, setBlocked] = useState(initialBlocked);
  const [loading, setLoading] = useState(false);

  if (!user || user.id === targetUserId) return null;

  const handleBlock = async () => {
    if (loading) return;
    setLoading(true);
    setOpen(false);
    const method = blocked ? 'DELETE' : 'POST';
    const body = blocked ? { blockedId: targetUserId } : { blockedId: targetUserId };
    const res = await fetch('/api/block', {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      setBlocked(!blocked);
      if (!blocked) onBlock?.();
    }
    setLoading(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-center"
        style={{
          width: 32, height: 32,
          background: 'transparent',
          border: `1px solid ${INK}`,
          color: INK,
          borderRadius: 0,
        }}
        aria-label="その他"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="absolute right-0 top-10 z-50 overflow-hidden"
            style={{
              width: 176,
              background: PAPER,
              border: `1px solid ${INK}`,
              borderRadius: 0,
            }}
          >
            <button
              onClick={handleBlock}
              disabled={loading}
              className="w-full flex items-center gap-2 px-4 py-3"
              style={{
                fontSize: 13,
                color: blocked ? INK : ACCENT,
                fontWeight: 700,
                letterSpacing: '0.04em',
                background: 'transparent',
              }}
            >
              {blocked ? (
                <>
                  <ShieldOff className="w-4 h-4" />
                  ブロック解除
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  ブロックする
                </>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
