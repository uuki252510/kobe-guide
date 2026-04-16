'use client';

import { Users } from 'lucide-react';

interface Props {
  className?: string;
}

export default function MutualBadge({ className = '' }: Props) {
  return (
    <span
      className={`inline-flex items-center gap-0.5 ${className}`}
      style={{
        padding: '1px 6px',
        fontSize: 9,
        fontWeight: 700,
        color: '#262220',
        background: 'transparent',
        border: '1px solid #262220',
        borderRadius: 0,
        letterSpacing: '0.16em',
        lineHeight: 1.5,
      }}
    >
      <Users className="w-2.5 h-2.5" />
      相互
    </span>
  );
}
