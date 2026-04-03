'use client';

import { Users } from 'lucide-react';

interface Props {
  className?: string;
}

export default function MutualBadge({ className = '' }: Props) {
  return (
    <span
      className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-kobe-gold/15 text-kobe-gold border border-kobe-gold/30 ${className}`}
    >
      <Users className="w-2.5 h-2.5" />
      相互
    </span>
  );
}
