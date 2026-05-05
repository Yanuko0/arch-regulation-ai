'use client';

import { Loader2, Building2 } from 'lucide-react';

export default function AnalyticsLoading() {
  return (
    <div className="flex flex-col h-screen w-full items-center justify-center bg-[var(--color-bg-primary)] animate-in fade-in duration-500">
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <div className="w-20 h-20 rounded-3xl bg-[var(--color-bg-secondary)] flex items-center justify-center shadow-xl border border-[var(--color-border)]">
            <Building2 size={40} className="text-[var(--color-accent-blue)] animate-pulse" />
          </div>
          <div className="absolute -bottom-2 -right-2">
            <Loader2 className="w-8 h-8 text-[var(--color-accent-blue)] animate-spin" />
          </div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <h3 className="text-xl font-bold text-[var(--color-text-primary)] tracking-wider">
            正在切換語系數據...
          </h3>
          <p className="text-sm text-[var(--color-text-muted)] font-medium">
            Preparing localized analytics dashboard
          </p>
        </div>
      </div>
      
      {/* 裝飾用的背景發光 */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[var(--color-accent-blue)]/5 rounded-full blur-[120px] pointer-events-none -z-10" />
    </div>
  );
}
