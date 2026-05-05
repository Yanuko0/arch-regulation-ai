// components/ui/DisclaimerBanner/DisclaimerBanner.tsx
'use client';
import { AlertTriangle } from 'lucide-react';

interface DisclaimerBannerProps {
  title?: string;
  content: string;
  compact?: boolean;
}

export function DisclaimerBanner({ title, content, compact = false }: DisclaimerBannerProps) {
  return (
    <div
      className={`rounded-[8px] border border-[var(--color-border)] bg-[var(--color-bg-secondary)]/50
              text-[var(--color-text-secondary)] animate-fade-in
              ${compact ? 'px-[15px] py-3 text-sm' : 'px-[15px] py-4 text-sm'}`}
      style={{ animationDelay: '0.3s', padding: '0px 8px', margin: '8px 0px' }}
    >
      <div className="leading-loose">
        {title && <span className="font-semibold text-[var(--color-text-primary)]">{title} </span>}
        {content}
      </div>
    </div>
  );
}
