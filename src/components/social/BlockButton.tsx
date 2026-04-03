'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Shield, ShieldOff, MoreVertical } from 'lucide-react';

interface Props {
  targetUserId: string;
  isBlocked?: boolean;
  onBlock?: () => void;
}

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
        className="p-1.5 rounded-full text-harbor-500 hover:text-harbor-300 hover:bg-harbor-800 transition-colors"
        aria-label="その他の操作"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-8 z-50 w-44 rounded-xl bg-harbor-900 border border-harbor-700 shadow-xl overflow-hidden">
            <button
              onClick={handleBlock}
              disabled={loading}
              className={`w-full flex items-center gap-2 px-4 py-3 text-sm transition-colors ${
                blocked
                  ? 'text-kobe-gold hover:bg-harbor-800'
                  : 'text-kobe-red hover:bg-kobe-red/10'
              }`}
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
