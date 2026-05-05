'use client';

import { Loader2 } from 'lucide-react';

export default function RootLoading() {
  return (
    <div className="flex flex-col h-screen w-full items-center justify-center bg-[var(--color-bg-primary)] transition-colors duration-300">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-[var(--color-bg-secondary)] flex items-center justify-center shadow-lg border border-[var(--color-border)]">
          <Loader2 className="w-6 h-6 text-[var(--color-accent-blue)] animate-spin" />
        </div>
        <p className="text-xs font-medium text-[var(--color-text-muted)] tracking-widest uppercase animate-pulse">
          Loading
        </p>
      </div>
    </div>
  );
}
