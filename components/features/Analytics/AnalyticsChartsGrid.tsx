'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, Legend
} from 'recharts';
import { useTranslations } from 'next-intl';

const COLORS = ['#3498db', '#e67e22', '#2ecc71', '#9b59b6', '#e74c3c', '#95a5a6'];

interface ChartsGridProps {
  data: {
    regionData: any[];
    issueRanking: any[];
    crossAnalysisData: any[];
    trendData: any[];
    activeCategories: string[];
  };
  chartStyles: any;
}

export function AnalyticsChartsGrid({ data, chartStyles }: ChartsGridProps) {
  const t = useTranslations('analytics');

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-10">
        {/* 地區查詢量分佈 */}
        <div className="glass-card p-10 border-[var(--color-border)] bg-[var(--color-bg-card)] shadow-2xl" style={{ padding: '20px' }}>
          <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-10 tracking-widest uppercase opacity-80">{t('distributionTitle')}</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.regionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, payload }) => `${name} ${payload.percentage}%`}
                  labelLine={false}
                >
                  {data.regionData.map((entry, index) => (
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

        {/* 問題類型排名 */}
        <div className="glass-card p-10 border-[var(--color-border)] bg-[var(--color-bg-card)] shadow-2xl" style={{ padding: '20px' }}>
          <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-10 tracking-widest uppercase opacity-80">{t('rankingTitle')}</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.issueRanking} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartStyles.grid} horizontal={true} vertical={false} />
                <XAxis type="number" stroke={chartStyles.axis} fontSize={12} />
                <YAxis dataKey="name" type="category" stroke={chartStyles.axis} fontSize={12} width={100} />
                <Tooltip
                  cursor={{ fill: chartStyles.grid, opacity: 0.4 }}
                  contentStyle={{ backgroundColor: chartStyles.tooltipBg, borderColor: chartStyles.tooltipBorder, borderRadius: '12px', color: chartStyles.tooltipText }}
                />
                <Bar dataKey="count" fill="#38bdf8" radius={[0, 4, 4, 0]} barSize={24}>
                  {data.issueRanking.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-10">
        {/* 交叉分析 */}
        <div className="glass-card p-10 border-[var(--color-border)] bg-[var(--color-bg-card)] shadow-2xl" style={{ padding: '20px' }}>
          <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-10 tracking-widest uppercase opacity-80">{t('crossAnalysisTitle')}</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.crossAnalysisData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartStyles.grid} vertical={false} />
                <XAxis dataKey="region" stroke={chartStyles.axis} fontSize={12} />
                <YAxis stroke={chartStyles.axis} fontSize={12} />
                <Tooltip
                  cursor={{ fill: chartStyles.grid, opacity: 0.4 }}
                  contentStyle={{ backgroundColor: chartStyles.tooltipBg, borderColor: chartStyles.tooltipBorder, borderRadius: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px', color: chartStyles.legend }} />
                {data.activeCategories.map((cat, index) => (
                  <Bar key={cat} dataKey={cat} stackId="a" fill={COLORS[index % COLORS.length]} radius={index === data.activeCategories.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 成長趨勢 */}
        <div className="glass-card p-10 border-[var(--color-border)] bg-[var(--color-bg-card)] shadow-2xl" style={{ padding: '20px' }}>
          <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-10 tracking-widest uppercase opacity-80">{t('trendTitle')}</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  {data.activeCategories.map((cat, index) => (
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
                {data.activeCategories.map((cat, index) => (
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
