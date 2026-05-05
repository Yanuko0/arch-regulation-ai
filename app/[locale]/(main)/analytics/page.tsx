import { AnalyticsDashboard } from '@/components/features/Analytics/AnalyticsDashboard';
import { Building2, ChevronLeft } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

export default async function AnalyticsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('common');

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: 'var(--color-bg-primary)' }}>
      {/* 獨立 Header 供儀表板使用 */}
      <header className="flex items-center justify-between px-6 h-16 border-b border-zinc-800 shrink-0 bg-black/90 z-20"
        style={{ padding: '0px 20px' }}>
        <div className="flex items-center gap-4">
          <Link href={`/${locale}/chat`} className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
            <ChevronLeft size={20} />
            <span className="text-sm font-medium">{t('backToChat')}</span>
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
            <Building2 size={16} className="text-black" />
          </div>
          <span className="text-sm font-bold text-white tracking-wide">{t('analyticsTitle')}</span>
        </div>
      </header>

      {/* 儀表板內容 */}
      <AnalyticsDashboard />
    </div>
  );
}
