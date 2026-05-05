import { AnalyticsDashboard } from '@/components/features/Analytics/AnalyticsDashboard';
import { Building2, ChevronLeft } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export default async function AnalyticsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('common');

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: 'var(--color-bg-primary)' }} suppressHydrationWarning={true}>
      {/* 獨立 Header 供儀表板使用 */}
      <header className="flex items-center justify-between px-6 h-16 border-b border-[var(--color-border)] shrink-0 bg-[var(--color-bg-glass)] backdrop-blur-xl z-20"
        style={{ padding: '0px 20px' }}>
        <div className="flex items-center gap-6">
          <Link href={`/${locale}/chat`} className="flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">
            <ChevronLeft size={20} />
            <span className="text-sm font-medium">{t('backToChat')}</span>
          </Link>
          <div className="h-6 w-[1px] bg-[var(--color-border)] hidden sm:block" />
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[var(--color-text-primary)] flex items-center justify-center">
              <Building2 size={16} className="text-[var(--color-bg-primary)]" />
            </div>
            <span className="text-sm font-bold text-[var(--color-text-primary)] tracking-wide">{t('analyticsTitle')}</span>
          </div>
        </div>

        <div className="flex items-center gap-5">
          <ThemeToggle />
          <div className="hidden sm:flex items-center p-1.5 gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-secondary)]/60 backdrop-blur shadow-sm"
            style={{ height: '44px', padding: '0px 10px' }}>
            {(['zh-TW', 'en', 'ja', 'ko'] as const).map((l) => {
              const active = locale === l;
              return (
                <Link
                  key={l}
                  href={`/${l}/analytics`}
                  style={{ padding: '5px 8px' }}
                  className={`
                      text-xs px-6 py-2.5 rounded-full whitespace-nowrap transition-all duration-300 font-bold
                      ${active
                      ? 'bg-[var(--color-text-primary)] text-[var(--color-bg-primary)] shadow-md'
                      : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)]'
                    }
                  `}
                >
                  {l === 'zh-TW' ? '繁中' : l === 'en' ? 'EN' : l === 'ja' ? 'JA' : 'KO'}
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      {/* 儀表板內容 */}
      <AnalyticsDashboard />
    </div>
  );
}
