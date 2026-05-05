'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, Legend
} from 'recharts';
import { Activity, AlertTriangle, TrendingUp, Building2, MapPin, Lock, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getAllSessionsForAnalytics } from '@/lib/firebase/firebaseDb';
import { REGION_MAP, getRegionName, getSubRegionName } from '@/constants/regions';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useThemeStore } from '@/stores/themeStore';

const COLORS = ['#3498db', '#e67e22', '#2ecc71', '#9b59b6', '#e74c3c', '#95a5a6'];

export function AnalyticsDashboard() {
  const { user, loading: authLoading } = useAuth();
  const { theme } = useThemeStore();
  const t = useTranslations('analytics');
  const catT = useTranslations('categories');
  const params = useParams();
  const locale = (params.locale as string) || 'zh-TW';
  const [timeRange, setTimeRange] = useState('3m');
  const [selectedRegion, setSelectedRegion] = useState('ALL');

  const [loadingData, setLoadingData] = useState(false);
  const [regionData, setRegionData] = useState<any[]>([]);
  const [issueRanking, setIssueRanking] = useState<any[]>([]);
  const [crossAnalysisData, setCrossAnalysisData] = useState<any[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [activeCategories, setActiveCategories] = useState<string[]>([]);
  const [anomalyInfo, setAnomalyInfo] = useState({ category: '---', growth: 0 });
  const [marketDemandInfo, setMarketDemandInfo] = useState({ category: '---', growth: 0 });
  const [topIssuesForHottestRegion, setTopIssuesForHottestRegion] = useState<string[]>([]);

  // 動態圖表顏色配置
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

  const getMonthName = (timestamp: any) => {
    if (!timestamp) return '';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleString(locale, { month: 'short' });
    } catch {
      return '';
    }
  };

  useEffect(() => {
    if (user) {
      setLoadingData(true);
      getAllSessionsForAnalytics().then(sessions => {
        // 1. 時間篩選
        const now = new Date();
        const filteredByTime = sessions.filter((s: any) => {
          const createdAt = s.createdAt?.toDate ? s.createdAt.toDate() : new Date(s.createdAt);
          const diffMonths = (now.getFullYear() - createdAt.getFullYear()) * 12 + (now.getMonth() - createdAt.getMonth());
          if (timeRange === '1m') return diffMonths <= 1;
          if (timeRange === '3m') return diffMonths <= 3;
          if (timeRange === '6m') return diffMonths <= 6;
          return true;
        });

        // 2. 國家篩選
        const finalSessions = selectedRegion === 'ALL'
          ? filteredByTime
          : filteredByTime.filter((s: any) => s.regionCode === selectedRegion);

        // 數據容器
        const rMap: Record<string, number> = {};
        const catMap: Record<string, number> = {};
        const crossMap: Record<string, Record<string, number>> = {};
        const trendMap: Record<string, Record<string, number>> = {};
        const allCats = new Set<string>();
        let totalCount = 0;

        // 排序以計算趨勢
        const sortedSessions = [...finalSessions].sort((a: any, b: any) => {
          const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
          const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
          return timeA - timeB;
        });

        sortedSessions.forEach((s: any) => {
          let groupKey = '';
          if (selectedRegion === 'ALL') {
            groupKey = getRegionName(s.regionCode, locale);
          } else {
            const srName = getSubRegionName(s.regionCode, s.subRegion, locale);
            groupKey = srName || t('allRegions').split(' ')[0];
          }

          if (groupKey) {
            rMap[groupKey] = (rMap[groupKey] || 0) + 1;
            totalCount++;
          }

          const monthName = getMonthName(s.createdAt);

          if (s.categories) {
            Object.entries(s.categories).forEach(([cat, count]) => {
              const transCat = catT(cat);
              allCats.add(transCat);
              catMap[transCat] = (catMap[transCat] || 0) + (count as number);

              if (groupKey) {
                if (!crossMap[groupKey]) crossMap[groupKey] = {};
                crossMap[groupKey][transCat] = (crossMap[groupKey][transCat] || 0) + (count as number);
              }

              if (monthName) {
                if (!trendMap[monthName]) trendMap[monthName] = {};
                trendMap[monthName][transCat] = (trendMap[monthName][transCat] || 0) + (count as number);
              }
            });
          }
        });

        const newRegionData = Object.entries(rMap)
          .map(([name, val]) => ({
            name,
            value: val,
            percentage: totalCount > 0 ? Math.round((val / totalCount) * 100) : 0
          }))
          .sort((a, b) => b.value - a.value);

        const newIssueRanking = Object.entries(catMap)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 6);

        const newCrossAnalysis = Object.entries(crossMap).map(([region, cats]) => ({
          region,
          ...cats
        })).slice(0, 5);

        const newTrendData = Object.entries(trendMap).map(([month, cats]) => ({
          month,
          ...cats
        }));

        setRegionData(newRegionData);
        setIssueRanking(newIssueRanking);
        setCrossAnalysisData(newCrossAnalysis);
        setTrendData(newTrendData);
        setActiveCategories(Array.from(allCats).slice(0, 4));

        const rangeInDays = timeRange === '1m' ? 30 : timeRange === '3m' ? 90 : 180;
        const currentPeriodStart = new Date(now.getTime() - rangeInDays * 24 * 60 * 60 * 1000);
        const previousPeriodStart = new Date(now.getTime() - 2 * rangeInDays * 24 * 60 * 60 * 1000);

        const currentMap: Record<string, number> = {};
        const previousMap: Record<string, number> = {};

        sessions.forEach((s: any) => {
          const d = s.createdAt?.toDate ? s.createdAt.toDate() : new Date(s.createdAt);
          if (s.categories) {
            Object.entries(s.categories).forEach(([cat, count]) => {
              const transCat = catT(cat);
              if (d >= currentPeriodStart) {
                currentMap[transCat] = (currentMap[transCat] || 0) + (count as number);
              } else if (d >= previousPeriodStart && d < currentPeriodStart) {
                previousMap[transCat] = (previousMap[transCat] || 0) + (count as number);
              }
            });
          }
        });

        const growthStats = Object.keys(currentMap).map(cat => {
          const curr = currentMap[cat];
          const prev = previousMap[cat] || 0;
          const growth = prev === 0 ? (curr > 0 ? 100 : 0) : Math.round(((curr - prev) / prev) * 100);
          return { cat, growth, curr };
        }).sort((a, b) => b.growth - a.growth);

        if (growthStats.length > 0) {
          setAnomalyInfo({ category: growthStats[0].cat, growth: growthStats[0].growth });
          setMarketDemandInfo(growthStats.length > 1
            ? { category: growthStats[1].cat, growth: growthStats[1].growth }
            : { category: growthStats[0].cat, growth: growthStats[0].growth }
          );
        }

        if (newRegionData.length > 0) {
          const topReg = newRegionData[0].name;
          const regIssues = crossMap[topReg]
            ? Object.entries(crossMap[topReg])
              .sort((a, b) => b[1] - a[1])
              .slice(0, 2)
              .map(e => e[0])
            : [];
          setTopIssuesForHottestRegion(regIssues);
        }

        setLoadingData(false);
      }).catch(err => {
        console.error('Failed to load analytics', err);
        setLoadingData(false);
      });
    }
  }, [user, locale, catT, selectedRegion, timeRange, t]);

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
              <option key={r.code} value={r.code} className="bg-[var(--color-bg-primary)]">{r.nameI18n[locale] ?? r.nameI18n['en']}</option>
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

      {/* 異常與重點提示卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12" style={{ padding: '20px 0px' }}>
        <div className="glass-card p-10 border-[var(--color-border)] bg-[var(--color-bg-card)] flex flex-col justify-between shadow-2xl" style={{ padding: '20px' }}>
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-red-500/10 rounded-xl"><AlertTriangle size={24} className="text-red-400" /></div>
            <h3 className="text-[var(--color-text-secondary)] font-bold text-lg">{t('anomalyDetection')}</h3>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-[var(--color-text-primary)] tracking-tight">{anomalyInfo.category} <span className="text-red-400 text-xl ml-2">↑ {anomalyInfo.growth}%</span></div>
            <p className="text-sm text-[var(--color-text-muted)] mt-4 leading-relaxed">
              過去{timeRange === '1m' ? '一個月' : timeRange === '3m' ? '三個月' : '半年'}內，數據顯示關於「{anomalyInfo.category}」的查詢量有明顯增長趨勢。
            </p>
          </div>
        </div>

        <div className="glass-card p-10 border-[var(--color-border)] bg-[var(--color-bg-card)] flex flex-col justify-between shadow-2xl"
          style={{ padding: '20px' }}>
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-[var(--color-accent-blue)]/10 rounded-xl"><TrendingUp size={24} className="text-[var(--color-accent-blue)]" /></div>
            <h3 className="text-[var(--color-text-secondary)] font-bold text-lg">{t('marketDemand')}</h3>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-[var(--color-text-primary)] tracking-tight">{marketDemandInfo.category} <span className="text-[var(--color-accent-blue)] text-xl ml-2">↑ {marketDemandInfo.growth}%</span></div>
            <p className="text-sm text-[var(--color-text-muted)] mt-4 leading-relaxed">
              近期數據顯示，針對「{marketDemandInfo.category}」相關法規的查詢穩定上升，具備高度市場開發潛力。
            </p>
          </div>
        </div>

        <div className="glass-card p-10 border-[var(--color-border)] bg-[var(--color-bg-card)] flex flex-col justify-between shadow-2xl" style={{ padding: '20px' }}>
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-amber-500/10 rounded-xl"><MapPin size={24} className="text-amber-400" /></div>
            <h3 className="text-[var(--color-text-secondary)] font-bold text-lg">{t('hottestRegion')}</h3>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-[var(--color-text-primary)] tracking-tight">{regionData[0]?.name || '---'} <span className="text-amber-400 text-xl ml-2">{regionData[0]?.percentage || 0}% {t('allRegions').split(' ')[0]}</span></div>
            <p className="text-sm text-[var(--color-text-muted)] mt-4 leading-relaxed">
              該地區為目前查詢總量冠軍
              {topIssuesForHottestRegion.length > 0 && `，主要集中於「${topIssuesForHottestRegion.join('」與「')}」問題`}
              ，顯示有大量相關需求。
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-10" style={{ marginBottom: '20px' }}>
        {/* 圖表 1: 各地區查詢量排名 (Pie Chart) */}
        <div className="glass-card p-10 border-[var(--color-border)] bg-[var(--color-bg-card)] shadow-2xl" style={{ padding: '20px' }}>
          <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-10 tracking-widest uppercase opacity-80">{t('distributionTitle')}</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={regionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, payload }) => `${name} ${payload.percentage}%`}
                  labelLine={false}
                >
                  {regionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke={chartStyles.grid} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: chartStyles.tooltipBg, borderColor: chartStyles.tooltipBorder, borderRadius: '12px' }}
                  itemStyle={{ color: chartStyles.tooltipText }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 圖表 2: 問題類型排名 (Bar Chart) */}
        <div className="glass-card p-10 border-[var(--color-border)] bg-[var(--color-bg-card)] shadow-2xl" style={{ padding: '20px' }}>
          <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-10 tracking-widest uppercase opacity-80">{t('rankingTitle')}</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={issueRanking} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartStyles.grid} horizontal={true} vertical={false} />
                <XAxis type="number" stroke={chartStyles.axis} fontSize={12} />
                <YAxis dataKey="name" type="category" stroke={chartStyles.axis} fontSize={12} width={100} />
                <Tooltip
                  cursor={{ fill: chartStyles.grid, opacity: 0.4 }}
                  contentStyle={{ backgroundColor: chartStyles.tooltipBg, borderColor: chartStyles.tooltipBorder, borderRadius: '12px', color: chartStyles.tooltipText }}
                />
                <Bar dataKey="count" fill="#38bdf8" radius={[0, 4, 4, 0]} barSize={24}>
                  {issueRanking.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-10" style={{ marginBottom: '20px' }}>
        {/* 圖表 3: 交叉分析 (Stacked Bar) */}
        <div className="glass-card p-10 border-[var(--color-border)] bg-[var(--color-bg-card)] shadow-2xl" style={{ padding: '20px' }}>
          <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-10 tracking-widest uppercase opacity-80">{t('crossAnalysisTitle')}</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={crossAnalysisData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartStyles.grid} vertical={false} />
                <XAxis dataKey="region" stroke={chartStyles.axis} fontSize={12} />
                <YAxis stroke={chartStyles.axis} fontSize={12} />
                <Tooltip
                  cursor={{ fill: chartStyles.grid, opacity: 0.4 }}
                  contentStyle={{ backgroundColor: chartStyles.tooltipBg, borderColor: chartStyles.tooltipBorder, borderRadius: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px', color: chartStyles.legend }} />
                {activeCategories.map((cat, index) => (
                  <Bar key={cat} dataKey={cat} stackId="a" fill={COLORS[index % COLORS.length]} radius={index === activeCategories.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 圖表 4: 成長趨勢 (Area Chart) */}
        <div className="glass-card p-10 border-[var(--color-border)] bg-[var(--color-bg-card)] shadow-2xl" style={{ padding: '20px' }}>
          <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-10 tracking-widest uppercase opacity-80">{t('trendTitle')}</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  {activeCategories.map((cat, index) => (
                    <linearGradient key={`grad-${cat}`} id={`color-${index}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0.8} />
                      <stop offset="95%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <XAxis dataKey="month" stroke={chartStyles.axis} fontSize={12} />
                <YAxis stroke={chartStyles.axis} fontSize={12} />
                <CartesianGrid strokeDasharray="3 3" stroke={chartStyles.grid} vertical={false} />
                <Tooltip contentStyle={{ backgroundColor: chartStyles.tooltipBg, borderColor: chartStyles.tooltipBorder, borderRadius: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px', color: chartStyles.legend }} />
                {activeCategories.map((cat, index) => (
                  <Area key={cat} type="monotone" dataKey={cat} stroke={COLORS[index % COLORS.length]} fillOpacity={1} fill={`url(#color-${index})`} />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
