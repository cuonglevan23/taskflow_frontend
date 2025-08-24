"use client";


import React from "react";
import { BarChart, DonutChart, AreaChart } from '@/components/Chart';
import { CheckCircle, XCircle, AlertCircle, ListChecks } from 'lucide-react';
import { useTheme } from '@/layouts/hooks/useTheme';
import { THEME_COLORS, DARK_THEME } from '@/constants/theme';

// Mock data for demo
const stats = [
  { label: 'Total completed tasks', value: 5, icon: <CheckCircle className="w-5 h-5" style={{ color: THEME_COLORS.success[500] }} /> },
  { label: 'Total incomplete tasks', value: 22, icon: <XCircle className="w-5 h-5" style={{ color: THEME_COLORS.warning[500] }} /> },
  { label: 'Total overdue tasks', value: 2, icon: <AlertCircle className="w-5 h-5" style={{ color: THEME_COLORS.error[500] }} /> },
  { label: 'Total tasks', value: 27, icon: <ListChecks className="w-5 h-5" style={{ color: THEME_COLORS.info[500] }} /> },
];


const chartColumnColor = DARK_THEME.chart?.column || 'rgb(184, 172, 255)';

const sectionBarData = [
  { label: 'Recently', value: 4, color: chartColumnColor },
  { label: 'Do today', value: 10, color: chartColumnColor },
  { label: 'Do next', value: 13, color: chartColumnColor },
  { label: 'Do later', value: 0, color: chartColumnColor },
  { label: 'Untitled', value: 0, color: chartColumnColor },
];

const donutData = [
  { label: 'Completed', value: 1, color: chartColumnColor },
];

const projectBarData = [
  { label: 'Project A', value: 2, color: chartColumnColor },
  { label: 'Project B', value: 1, color: chartColumnColor },
];

const areaLabels = ['14/08', '15/08', '16/08', '17/08', '18/08', '19/08', '20/08', '21/08', '22/08', '23/08', '24/08'];
const areaDatasets = [
  {
    label: 'Task completion',
    data: [0, 0, 0, 1, 25, 25, 25, 25, 25, 25, 27],
    color: chartColumnColor,
    fillOpacity: 0.2,
    tension: 0.4,
  },
];

export default function MyTaskDashboardPage() {
  const { theme } = useTheme?.() || {};
  return (
    <div className="h-[calc(100vh-140px)] overflow-y-auto px-4 py-6 w-full" style={{ background: DARK_THEME.background.primary, width: "100%", minWidth: "100%" }}>
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 w-full"  style={{ width: "100%" }}>
        {stats.map((stat, idx) => (
          <div key={stat.label} className="rounded-lg" style={{ background: DARK_THEME.background.secondary, border: `1px solid ${DARK_THEME.border.default}` }}>
            <div className="p-6 flex flex-col items-center justify-center">
              <div className="flex items-center gap-2 mb-2" style={{ color: DARK_THEME.text.muted }}>{stat.icon} <span className="text-sm">{stat.label}</span></div>
              <div className="text-3xl font-bold" style={{ color: DARK_THEME.text.primary }}>{stat.value}</div>
              <div className="text-xs mt-2" style={{ color: DARK_THEME.text.muted }}>{idx === 3 ? 'No Filters' : '1 Filter'}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="rounded-lg" style={{ background: DARK_THEME.background.secondary, border: `1px solid ${DARK_THEME.border.default}` }}>
          <div className="p-4">
            <div className="font-semibold mb-2" style={{ color: DARK_THEME.text.primary }}>Total tasks by section</div>
            <BarChart data={sectionBarData} height={220} title="Total tasks by section" />
            <div className="text-xs mt-2" style={{ color: DARK_THEME.text.muted }}>1 Filter</div>
          </div>
        </div>
        <div className="rounded-lg" style={{ background: DARK_THEME.background.secondary, border: `1px solid ${DARK_THEME.border.default}` }}>
          <div className="p-4">
            <div className="font-semibold mb-2" style={{ color: DARK_THEME.text.primary }}>Tasks by completion status this upcoming month</div>
            <DonutChart data={donutData} height={220} title="Tasks by completion status this upcoming month" />
            <div className="text-xs mt-2" style={{ color: DARK_THEME.text.muted }}>2 Filters</div>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-lg" style={{ background: DARK_THEME.background.secondary, border: `1px solid ${DARK_THEME.border.default}` }}>
          <div className="p-4">
            <div className="font-semibold mb-2" style={{ color: DARK_THEME.text.primary }}>Total tasks by project</div>
            <BarChart data={projectBarData} height={180} title="Total tasks by project" />
          </div>
        </div>
        <div className="rounded-lg" style={{ background: DARK_THEME.background.secondary, border: `1px solid ${DARK_THEME.border.default}` }}>
          <div className="p-4">
            <div className="font-semibold mb-2" style={{ color: DARK_THEME.text.primary }}>Task completion over time</div>
            <AreaChart labels={areaLabels} datasets={areaDatasets} height={180} title="Task completion over time" />
          </div>
        </div>
      </div>
    </div>
  );
}

