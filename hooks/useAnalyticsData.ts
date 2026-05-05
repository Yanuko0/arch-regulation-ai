import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getAllSessionsForAnalytics } from '@/lib/firebase/firebaseDb';
import { getRegionName, getSubRegionName } from '@/constants/regions';
import { useTranslations } from 'next-intl';

export function useAnalyticsData(selectedRegion: string, timeRange: string, locale: string) {
  const { user } = useAuth();
  const t = useTranslations('analytics');
  const catT = useTranslations('categories');

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    regionData: [] as any[],
    issueRanking: [] as any[],
    crossAnalysisData: [] as any[],
    trendData: [] as any[],
    activeCategories: [] as string[],
    anomalyInfo: { category: '---', growth: 0 },
    marketDemandInfo: { category: '---', growth: 0 },
    hottestRegionInfo: { name: '---', percentage: 0, topIssues: [] as string[] }
  });

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
    if (!user) return;

    setLoading(true);
    getAllSessionsForAnalytics().then(sessions => {
      const now = new Date();
      
      // 1. 時間篩選
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

      const rMap: Record<string, number> = {};
      const catMap: Record<string, number> = {};
      const crossMap: Record<string, Record<string, number>> = {};
      const trendMap: Record<string, Record<string, number>> = {};
      const allCats = new Set<string>();
      let totalCount = 0;

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

      // 趨勢與異常分析邏輯
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
        return { cat, growth };
      }).sort((a, b) => b.growth - a.growth);

      let anomalyInfo = { category: '---', growth: 0 };
      let marketDemandInfo = { category: '---', growth: 0 };
      if (growthStats.length > 0) {
        anomalyInfo = { category: growthStats[0].cat, growth: growthStats[0].growth };
        marketDemandInfo = growthStats.length > 1
          ? { category: growthStats[1].cat, growth: growthStats[1].growth }
          : anomalyInfo;
      }

      let hottestRegionInfo = { name: '---', percentage: 0, topIssues: [] as string[] };
      if (newRegionData.length > 0) {
        const topReg = newRegionData[0].name;
        const regIssues = crossMap[topReg]
          ? Object.entries(crossMap[topReg])
            .sort((a, b) => b[1] - a[1])
            .slice(0, 2)
            .map(e => e[0])
          : [];
        hottestRegionInfo = {
          name: topReg,
          percentage: newRegionData[0].percentage,
          topIssues: regIssues
        };
      }

      setData({
        regionData: newRegionData,
        issueRanking: newIssueRanking,
        crossAnalysisData: newCrossAnalysis,
        trendData: newTrendData,
        activeCategories: Array.from(allCats).slice(0, 4),
        anomalyInfo,
        marketDemandInfo,
        hottestRegionInfo
      });
      setLoading(false);
    }).catch(err => {
      console.error('Failed to load analytics', err);
      setLoading(false);
    });
  }, [user, locale, catT, selectedRegion, timeRange, t]);

  return { loading, data };
}
