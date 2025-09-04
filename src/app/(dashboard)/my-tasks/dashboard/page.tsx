"use client";

import React from "react";
import { BarChart, DonutChart, AreaChart } from '@/components/Chart';
import { CheckCircle, XCircle, AlertCircle, ListChecks, RefreshCw, Zap } from 'lucide-react';
import { useTheme } from '@/layouts/hooks/useTheme';
import { THEME_COLORS, DARK_THEME } from '@/constants/theme';
// Import from new dashboard module
import {
  useDashboard,
  formatCompletionRate,
  getTaskPriorityColor,
  transformForChart,
  formatCacheExpiry,
  calculateProductivityScore,
  getProductivityLevel
} from '@/services/dashboard';

export default function MyTaskDashboardPage() {
  const { theme } = useTheme?.() || {};
  const { data, loading, error, refresh, forceRefresh } = useDashboard();

  // Loading state
  if (loading) {
    return (
      <div className="h-[calc(100vh-140px)] overflow-y-auto px-4 py-6 w-full flex items-center justify-center" style={{ background: DARK_THEME.background.primary }}>
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin h-8 w-8 border border-current border-t-transparent rounded-full" style={{ color: DARK_THEME.text.muted }} />
          <div style={{ color: DARK_THEME.text.muted }}>Loading dashboard...</div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <></>
    );
  }

  if (!data) return null;

  const { taskStats, taskBreakdown, upcomingTasks, completionTrends, cacheInfo } = data;

  // Create stats array from API data
  const stats = [
    {
      label: 'Total completed tasks',
      value: taskStats.completedTasks,
      icon: <CheckCircle className="w-5 h-5" style={{ color: THEME_COLORS.success[500] }} />
    },
    {
      label: 'Total incomplete tasks',
      value: taskStats.pendingTasks,
      icon: <XCircle className="w-5 h-5" style={{ color: THEME_COLORS.warning[500] }} />
    },
    {
      label: 'Total overdue tasks',
      value: taskStats.overdueTasks,
      icon: <AlertCircle className="w-5 h-5" style={{ color: THEME_COLORS.error[500] }} />
    },
    {
      label: 'Total tasks',
      value: taskStats.totalTasks,
      icon: <ListChecks className="w-5 h-5" style={{ color: THEME_COLORS.info[500] }} />
    },
  ];

  const chartColumnColor = DARK_THEME.chart?.column || 'rgb(184, 172, 255)';

  // Transform API data for charts
  const sectionBarData = taskBreakdown.byProject.map(project => ({
    label: project.name,
    value: project.count,
    color: chartColumnColor
  }));

  const donutData = taskBreakdown.byStatus.map(status => ({
    label: status.name,
    value: status.count,
    color: chartColumnColor
  }));

  const projectBarData = taskBreakdown.byProject.slice(0, 5).map(project => ({
    label: project.name,
    value: project.count,
    color: chartColumnColor
  }));

  // Transform monthly trends for area chart
  const areaLabels = completionTrends.monthlyTrends.map(trend =>
    new Date(trend.month).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  );

  const areaDatasets = [
    {
      label: 'Tasks Created',
      data: completionTrends.monthlyTrends.map(trend => trend.created),
      color: 'rgb(59, 130, 246)',
      fillOpacity: 0.1,
      tension: 0.4,
    },
    {
      label: 'Tasks Completed',
      data: completionTrends.monthlyTrends.map(trend => trend.completed),
      color: chartColumnColor,
      fillOpacity: 0.2,
      tension: 0.4,
    },
  ];

  return (
    <div className="h-[calc(100vh-140px)] overflow-y-auto px-4 py-6 w-full" style={{ background: DARK_THEME.background.primary, width: "100%", minWidth: "100%" }}>



      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 w-full" style={{ width: "100%" }}>
        {stats.map((stat, idx) => (
          <div key={stat.label} className="rounded-lg" style={{ background: DARK_THEME.background.secondary, border: `1px solid ${DARK_THEME.border.default}` }}>
            <div className="p-6 flex flex-col items-center justify-center">
              <div className="flex items-center gap-2 mb-2" style={{ color: DARK_THEME.text.muted }}>
                {stat.icon}
                <span className="text-sm">{stat.label}</span>
              </div>
              <div className="text-3xl font-bold" style={{ color: DARK_THEME.text.primary }}>{stat.value}</div>
              <div className="text-xs mt-2" style={{ color: DARK_THEME.text.muted }}>
                {idx === 0 && `${taskStats.completionRate.toFixed(1)}% completion rate`}
                {idx === 1 && `${((taskStats.pendingTasks / taskStats.totalTasks) * 100).toFixed(1)}% of total`}
                {idx === 2 && stat.value > 0 && `${stat.value} tasks need attention`}
                {idx === 3 && `${taskStats.tasksThisMonth} created this month`}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="rounded-lg" style={{ background: DARK_THEME.background.secondary, border: `1px solid ${DARK_THEME.border.default}` }}>
          <div className="p-4">
            <div className="font-semibold mb-2" style={{ color: DARK_THEME.text.primary }}>Tasks by Project</div>
            <BarChart data={sectionBarData} height={220} title="Tasks by Project" />
            <div className="text-xs mt-2" style={{ color: DARK_THEME.text.muted }}>
              {sectionBarData.length} project(s) • {sectionBarData.reduce((sum, item) => sum + item.value, 0)} total tasks
            </div>
          </div>
        </div>
        <div className="rounded-lg" style={{ background: DARK_THEME.background.secondary, border: `1px solid ${DARK_THEME.border.default}` }}>
          <div className="p-4">
            <div className="font-semibold mb-2" style={{ color: DARK_THEME.text.primary }}>Tasks by Status</div>
            <DonutChart data={donutData} height={220} title="Tasks by Status" />
            <div className="text-xs mt-2" style={{ color: DARK_THEME.text.muted }}>
              Current status distribution
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="rounded-lg" style={{ background: DARK_THEME.background.secondary, border: `1px solid ${DARK_THEME.border.default}` }}>
          <div className="p-4">
            <div className="font-semibold mb-2" style={{ color: DARK_THEME.text.primary }}>Top Projects by Task Count</div>
            <BarChart data={projectBarData} height={180} title="Top Projects by Task Count" />
            <div className="text-xs mt-2" style={{ color: DARK_THEME.text.muted }}>
              Showing top {projectBarData.length} projects
            </div>
          </div>
        </div>
        <div className="rounded-lg" style={{ background: DARK_THEME.background.secondary, border: `1px solid ${DARK_THEME.border.default}` }}>
          <div className="p-4">
            <div className="font-semibold mb-2" style={{ color: DARK_THEME.text.primary }}>Task Creation vs Completion Trend</div>
            <AreaChart labels={areaLabels} datasets={areaDatasets} height={180} title="Task Creation vs Completion Trend" />
            <div className="text-xs mt-2" style={{ color: DARK_THEME.text.muted }}>
              Last {completionTrends.monthlyTrends.length} months trend
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Tasks Section */}
      {(upcomingTasks.urgentTasks.length > 0 || upcomingTasks.dueTodayTasks.length > 0 || upcomingTasks.overdueTasks.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Urgent Tasks */}
          {upcomingTasks.urgentTasks.length > 0 && (
            <div className="rounded-lg" style={{ background: DARK_THEME.background.secondary, border: `1px solid ${THEME_COLORS.error[500]}` }}>
              <div className="p-4">
                <div className="font-semibold mb-3 flex items-center gap-2" style={{ color: THEME_COLORS.error[500] }}>
                  🚨 Urgent Tasks ({upcomingTasks.urgentTasks.length})
                </div>
                <div className="space-y-2">
                  {upcomingTasks.urgentTasks.slice(0, 3).map((task) => (
                    <div key={task.id} className="p-2 rounded border-l-2" style={{ background: DARK_THEME.background.primary, borderColor: THEME_COLORS.error[500] }}>
                      <div className="text-sm font-medium" style={{ color: DARK_THEME.text.primary }}>{task.title}</div>
                      <div className="text-xs" style={{ color: DARK_THEME.text.muted }}>{task.projectName}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Due Today */}
          {upcomingTasks.dueTodayTasks.length > 0 && (
            <div className="rounded-lg" style={{ background: DARK_THEME.background.secondary, border: `1px solid ${THEME_COLORS.warning[500]}` }}>
              <div className="p-4">
                <div className="font-semibold mb-3 flex items-center gap-2" style={{ color: THEME_COLORS.warning[500] }}>
                  📅 Due Today ({upcomingTasks.dueTodayTasks.length})
                </div>
                <div className="space-y-2">
                  {upcomingTasks.dueTodayTasks.slice(0, 3).map((task) => (
                    <div key={task.id} className="p-2 rounded border-l-2" style={{ background: DARK_THEME.background.primary, borderColor: THEME_COLORS.warning[500] }}>
                      <div className="text-sm font-medium" style={{ color: DARK_THEME.text.primary }}>{task.title}</div>
                      <div className="text-xs" style={{ color: DARK_THEME.text.muted }}>{task.projectName}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Overdue Tasks */}
          {upcomingTasks.overdueTasks.length > 0 && (
            <div className="rounded-lg" style={{ background: DARK_THEME.background.secondary, border: `1px solid ${THEME_COLORS.error[700]}` }}>
              <div className="p-4">
                <div className="font-semibold mb-3 flex items-center gap-2" style={{ color: THEME_COLORS.error[700] }}>
                  ⚠️ Overdue ({upcomingTasks.overdueTasks.length})
                </div>
                <div className="space-y-2">
                  {upcomingTasks.overdueTasks.slice(0, 3).map((task) => (
                    <div key={task.id} className="p-2 rounded border-l-2" style={{ background: DARK_THEME.background.primary, borderColor: THEME_COLORS.error[700] }}>
                      <div className="text-sm font-medium" style={{ color: DARK_THEME.text.primary }}>{task.title}</div>
                      <div className="text-xs" style={{ color: DARK_THEME.text.muted }}>
                        {task.projectName} • {task.daysOverdue} days overdue
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
