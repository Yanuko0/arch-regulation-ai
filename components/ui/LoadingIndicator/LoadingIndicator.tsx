// components/ui/LoadingIndicator/LoadingIndicator.tsx
'use client';

interface LoadingIndicatorProps {
  label?: string;
  size?: 'sm' | 'md';
}

export function LoadingIndicator({ label, size = 'md' }: LoadingIndicatorProps) {
  const dotSize = size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2';

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={`${dotSize} rounded-full bg-amber-400`}
            style={{
              animation: 'pulse-dot 1.2s ease infinite',
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>
      {label && (
        <span className="text-xs text-slate-400">{label}</span>
      )}
    </div>
  );
}
