'use client';

import { useState, useMemo } from 'react';
import { Activity, Lock, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { REGION_MAP } from '@/constants/regions';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useThemeStore } from '@/stores/themeStore';
import { useAnalyticsData } from '@/hooks/useAnalyticsData';
import { AnalyticsStatCards } from './AnalyticsStatCards';
import { AnalyticsChartsGrid } from './AnalyticsChartsGrid';

export function AnalyticsDashboard() {
  const { user, loading: authLoading } = useAuth();
  const { theme } = useThemeStore();
  const t = useTranslations('analytics');
  const params = useParams();
  const locale = (params.locale as string) || 'zh-TW';

  const [timeRange, setTimeRange] = useState('3m');
  const [selectedRegion, setSelectedRegion] = useState('ALL');

  // 使用自定義 Hook 處理數據邏輯
  const { loading: loadingData, data } = useAnalyticsData(selectedRegion, timeRange, locale);

  // 圖表樣式配置 (根據主題切換)
  const chartStyles = useMemo(() => {
    const isLight = theme === 'light';
    return {
      axis: isLight ? '#4b5563' : '#a1a1aa',
      grid: isLight ? '#e5e7eb' : '#27272a',
      tooltipBg: isLight ? '#ffffff' : '#09090b',
      tooltipBorder: isLight ? '#d1d5db' : '#27272a',
      tooltipText: isLight ? '#1f2937' : '#ffffff',
      legend: isLight ? '#374151' : '#d1d5db'
    };
  }, [theme]);

  if (authLoading) return (
    <div className="flex-1 flex items-center justify-center bg-[var(--color-bg-primary)]">
      <Loader2 className="animate-spin text-[var(--color-accent-blue)]" size={40} />
    </div>
  );

  if (!user) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-10" style={{ background: 'var(--color-bg-primary)' }}>
        <div className="glass-card p-12 flex flex-col items-center text-center border-[var(--color-border)] bg-[var(--color-bg-card)] shadow-2xl">
          <div className="w-20 h-20 bg-[var(--color-bg-secondary)] rounded-full flex items-center justify-center mb-6">
            <Lock size={32} className="text-[var(--color-text-muted)]" />
          </div>
          <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4">{t('needLogin')}</h2>
          <p className="text-[var(--color-text-secondary)] max-w-md">
            {t('needLoginDesc')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-10"
      style={{ background: 'var(--color-bg-primary)', padding: '20px' }}>
      
      {/* 頂部 Header & 篩選器 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-3xl font-extrabold text-[var(--color-text-primary)] tracking-tight flex items-center gap-3" >
            <Activity className="text-[var(--color-accent-blue)]" />
            {t('title')}
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-2 font-medium">{t('desc')}</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="input-field text-sm py-2.5 px-5 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)] text-[var(--color-text-primary)] shadow-sm focus:border-[var(--color-accent-blue)] transition-all"
          >
            <option value="ALL">{t('allRegions')}</option>
            {Object.values(REGION_MAP).map(r => (
              <option key={r.code} value={r.code} className="bg-[var(--color-bg-primary)]">
                {r.nameI18n[locale] ?? r.nameI18n['en']}
              </option>
            ))}
          </select>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="input-field text-sm py-2.5 px-5 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)] text-[var(--color-text-primary)] shadow-sm focus:border-[var(--color-accent-blue)] transition-all"
          >
            <option value="1m">{t('timeRange1m')}</option>
            <option value="3m">{t('timeRange3m')}</option>
            <option value="6m">{t('timeRange6m')}</option>
          </select>
        </div>
      </div>

      {loadingData ? (
        <div className="h-64 flex items-center justify-center">
          <Loader2 className="animate-spin text-[var(--color-accent-blue)]" size={32} />
        </div>
      ) : (
        <>
          {/* 指標卡片 */}
          <AnalyticsStatCards
            timeRange={timeRange}
            anomalyInfo={data.anomalyInfo}
            marketDemandInfo={data.marketDemandInfo}
            hottestRegionInfo={data.hottestRegionInfo}
          />

          {/* 圖表網格 */}
          <AnalyticsChartsGrid
            data={data}
            chartStyles={chartStyles}
          />
        </>
      )}
    </div>
  );
}
