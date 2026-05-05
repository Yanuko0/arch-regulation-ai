'use client';

import { AlertTriangle, TrendingUp, MapPin } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface StatCardsProps {
  timeRange: string;
  anomalyInfo: { category: string; growth: number };
  marketDemandInfo: { category: string; growth: number };
  hottestRegionInfo: { name: string; percentage: number; topIssues: string[] };
}

export function AnalyticsStatCards({
  timeRange,
  anomalyInfo,
  marketDemandInfo,
  hottestRegionInfo
}: StatCardsProps) {
  const t = useTranslations('analytics');

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12" style={{ padding: '20px 0px' }}>
      {/* 異常檢測 */}
      <div className="glass-card p-10 border-[var(--color-border)] bg-[var(--color-bg-card)] flex flex-col justify-between shadow-2xl" style={{ padding: '20px' }}>
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-red-500/10 rounded-xl">
            <AlertTriangle size={24} className="text-red-400" />
          </div>
          <h3 className="text-[var(--color-text-secondary)] font-bold text-lg">{t('anomalyDetection')}</h3>
        </div>
        <div className="mt-4">
          <div className="text-3xl font-extrabold text-[var(--color-text-primary)] tracking-tight">
            {anomalyInfo.category} <span className="text-red-400 text-xl ml-2">↑ {anomalyInfo.growth}%</span>
          </div>
          <p className="text-sm text-[var(--color-text-muted)] mt-4 leading-relaxed">
            過去{timeRange === '1m' ? '一個月' : timeRange === '3m' ? '三個月' : '半年'}內，數據顯示關於「{anomalyInfo.category}」的查詢量有明顯增長趨勢。
          </p>
        </div>
      </div>

      {/* 市場需求 */}
      <div className="glass-card p-10 border-[var(--color-border)] bg-[var(--color-bg-card)] flex flex-col justify-between shadow-2xl" style={{ padding: '20px' }}>
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-[var(--color-accent-blue)]/10 rounded-xl">
            <TrendingUp size={24} className="text-[var(--color-accent-blue)]" />
          </div>
          <h3 className="text-[var(--color-text-secondary)] font-bold text-lg">{t('marketDemand')}</h3>
        </div>
        <div className="mt-4">
          <div className="text-3xl font-extrabold text-[var(--color-text-primary)] tracking-tight">
            {marketDemandInfo.category} <span className="text-[var(--color-accent-blue)] text-xl ml-2">↑ {marketDemandInfo.growth}%</span>
          </div>
          <p className="text-sm text-[var(--color-text-muted)] mt-4 leading-relaxed">
            近期數據顯示，針對「{marketDemandInfo.category}」相關法規的查詢穩定上升，具備高度市場開發潛力。
          </p>
        </div>
      </div>

      {/* 熱門地區 */}
      <div className="glass-card p-10 border-[var(--color-border)] bg-[var(--color-bg-card)] flex flex-col justify-between shadow-2xl" style={{ padding: '20px' }}>
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-amber-500/10 rounded-xl">
            <MapPin size={24} className="text-amber-400" />
          </div>
          <h3 className="text-[var(--color-text-secondary)] font-bold text-lg">{t('hottestRegion')}</h3>
        </div>
        <div className="mt-4">
          <div className="text-3xl font-extrabold text-[var(--color-text-primary)] tracking-tight">
            {hottestRegionInfo.name} <span className="text-amber-400 text-xl ml-2">{hottestRegionInfo.percentage}% {t('allRegions').split(' ')[0]}</span>
          </div>
          <p className="text-sm text-[var(--color-text-muted)] mt-4 leading-relaxed">
            該地區為目前查詢總量冠軍
            {hottestRegionInfo.topIssues.length > 0 && `，主要集中於「${hottestRegionInfo.topIssues.join('」與「')}」問題`}
            ，顯示有大量相關需求。
          </p>
        </div>
      </div>
    </div>
  );
}
