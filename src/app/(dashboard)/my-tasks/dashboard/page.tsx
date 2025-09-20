"use client";

import React from "react";
import { BarChart, DonutChart, AreaChart } from '@/components/Chart';
import { CheckCircle, XCircle, AlertCircle, ListChecks, RefreshCw, Zap } from 'lucide-react';
import { THEME_COLORS } from '@/constants/theme';
import { useLanguageContext } from "@/providers/LanguageProvider";
import { useThemeContext } from "@/providers/ThemeProvider";
import { useDashboard } from '@/services/dashboard/mytaskDashboardService';

export default function MyTaskDashboardPage() {
  const { messages } = useLanguageContext();
  const { theme } = useThemeContext();
  const { data, loading, error, refresh, forceRefresh } = useDashboard();

  // Helper function với support biến {var}
  const t = (key: string, vars?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let value: any = messages;
    for (const k of keys) {
      value = value?.[k];
    }
    if (typeof value !== 'string') return key;

    if (!vars) return value;
    return Object.entries(vars).reduce(
        (s, [k, v]) => s.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v)),
        value
    );
  };

  // Loading state
  if (loading) {
    return (
        <div className="h-[calc(100vh-140px)] overflow-y-auto px-4 py-6 w-full flex items-center justify-center" style={{ background: theme.background.primary }}>
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin h-8 w-8 border border-current border-t-transparent rounded-full" style={{ color: theme.text.muted }} />
            <div style={{ color: theme.text.muted }}>{t('myTaskDashboard.loading')}</div>
          </div>
        </div>
    );
  }

  // Error state
  if (error) {
    return (
        <div className="h-[calc(100vh-140px)] overflow-y-auto px-4 py-6 w-full flex items-center justify-center" style={{ background: theme.background.primary }}>
          <div className="flex flex-col items-center gap-4">
            <div className="text-center" style={{ color: theme.text.primary }}>
              <h2 className="text-xl font-semibold mb-2">{t('myTaskDashboard.error')}</h2>
              <button
                  onClick={refresh}
                  className="px-4 py-2 rounded-lg flex items-center gap-2 hover:opacity-80 transition-opacity"
                  style={{
                    background: THEME_COLORS.primary[600],
                    color: 'white'
                  }}
              >
                <RefreshCw className="w-4 h-4" />
                {t('myTaskDashboard.retry')}
              </button>
            </div>
          </div>
        </div>
    );
  }

  if (!data) return null;

  const { taskStats, taskBreakdown, upcomingTasks, completionTrends, cacheInfo } = data;

  // Destructure taskStats với default để tránh undefined
  const {
    completedTasks: completed = 0,
    overdueTasks: overdue = 0,
    pendingTasks: pending = 0,
    totalTasks: total = 0,
    completionRate = 0,
    tasksThisMonth = 0
  } = taskStats || {};

  // Stats array
  const stats = [
    {
      id: 'completed',
      label: t('myTaskDashboard.stats.totalCompleted'),
      value: completed,
      icon: <CheckCircle className="w-5 h-5" style={{ color: THEME_COLORS.success[500] }} />,
      description: `${completionRate.toFixed(1)}% ${t('myTaskDashboard.stats.completionRate')}`
    },
    {
      id: 'incomplete',
      label: t('myTaskDashboard.stats.totalIncomplete'),
      value: pending,
      icon: <XCircle className="w-5 h-5" style={{ color: THEME_COLORS.warning[500] }} />,
      description: total > 0 ? `${((pending / total) * 100).toFixed(1)}% ${t('myTaskDashboard.stats.ofTotal')}` : ''
    },
    {
      id: 'overdue',
      label: t('myTaskDashboard.stats.totalOverdue'),
      value: overdue,
      icon: <AlertCircle className="w-5 h-5" style={{ color: THEME_COLORS.error[500] }} />,
      description: overdue > 0 ? `${overdue} ${t('myTaskDashboard.stats.needAttention')}` : ''
    },
    {
      id: 'total',
      label: t('myTaskDashboard.stats.totalTasks'),
      value: total,
      icon: <ListChecks className="w-5 h-5" style={{ color: THEME_COLORS.info[500] }} />,
      description: `${tasksThisMonth} ${t('myTaskDashboard.stats.createdThisMonth')}`
    },
  ];

  const chartColumnColor = 'rgb(184, 172, 255)';

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

  const areaLabels = completionTrends.monthlyTrends.map(trend =>
      new Date(trend.month).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  );

  const areaDatasets = [
    {
      label: t('myTaskDashboard.charts.tasksCreated'),
      data: completionTrends.monthlyTrends.map(trend => trend.created),
      color: 'rgb(59, 130, 246)',
      fillOpacity: 0.1,
      tension: 0.4,
    },
    {
      label: t('myTaskDashboard.charts.tasksCompleted'),
      data: completionTrends.monthlyTrends.map(trend => trend.completed),
      color: chartColumnColor,
      fillOpacity: 0.2,
      tension: 0.4,
    },
  ];

  return (
      <div className="h-[calc(100vh-140px)] overflow-y-auto px-4 py-6 w-full" style={{ background: theme.background.primary, width: "100%", minWidth: "100%" }}>
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold" style={{ color: theme.text.primary }}>
            {t('myTaskDashboard.title')}
          </h1>
          <button
              onClick={forceRefresh}
              className="px-4 py-2 rounded-lg flex items-center gap-2 hover:opacity-80 transition-opacity text-sm"
              style={{
                background: theme.background.secondary,
                border: `1px solid ${theme.border.default}`,
                color: theme.text.muted
              }}
          >
            <RefreshCw className="w-4 h-4" />
            {t('myTaskDashboard.refresh')}
          </button>
        </div>



        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 w-full" style={{ width: "100%" }}>
          {stats.map((stat) => (
              <div key={stat.id} className="rounded-lg" style={{ background: theme.background.secondary, border: `1px solid ${theme.border.default}` }}>
                <div className="p-6 flex flex-col items-center justify-center">
                  <div className="flex items-center gap-2 mb-2" style={{ color: theme.text.muted }}>
                    {stat.icon}
                    <span className="text-sm">{stat.label}</span>
                  </div>
                  <div className="text-3xl font-bold" style={{ color: theme.text.primary }}>{stat.value}</div>
                  {stat.description && (
                      <div className="text-xs mt-2 text-center" style={{ color: theme.text.muted }}>
                        {stat.description}
                      </div>
                  )}
                </div>
              </div>
          ))}
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="rounded-lg" style={{ background: theme.background.secondary, border: `1px solid ${theme.border.default}` }}>
            <div className="p-4">
              <div className="font-semibold mb-2" style={{ color: theme.text.primary }}>
                {t('myTaskDashboard.charts.tasksByProject')}
              </div>
              <BarChart data={sectionBarData} height={220} title={t('myTaskDashboard.charts.tasksByProject')} />
              <div className="text-xs mt-2" style={{ color: theme.text.muted }}>
                {sectionBarData.length} {t('myTaskDashboard.charts.projectsLabel')} • {sectionBarData.reduce((sum, item) => sum + item.value, 0)} {t('myTaskDashboard.charts.totalTasksLabel')}
              </div>
            </div>
          </div>
          <div className="rounded-lg" style={{ background: theme.background.secondary, border: `1px solid ${theme.border.default}` }}>
            <div className="p-4">
              <div className="font-semibold mb-2" style={{ color: theme.text.primary }}>
                {t('myTaskDashboard.charts.tasksByStatus')}
              </div>
              <DonutChart data={donutData} height={220} title={t('myTaskDashboard.charts.tasksByStatus')} />
              <div className="text-xs mt-2" style={{ color: theme.text.muted }}>
                {t('myTaskDashboard.charts.statusDistribution')}
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="rounded-lg" style={{ background: theme.background.secondary, border: `1px solid ${theme.border.default}` }}>
            <div className="p-4">
              <div className="font-semibold mb-2" style={{ color: theme.text.primary }}>
                {t('myTaskDashboard.charts.topProjects')}
              </div>
              <BarChart data={projectBarData} height={180} title={t('myTaskDashboard.charts.topProjects')} />
              <div className="text-xs mt-2" style={{ color: theme.text.muted }}>
                {t('myTaskDashboard.charts.showingTop')} {projectBarData.length} {t('myTaskDashboard.charts.projects')}
              </div>
            </div>
          </div>
          <div className="rounded-lg" style={{ background: theme.background.secondary, border: `1px solid ${theme.border.default}` }}>
            <div className="p-4">
              <div className="font-semibold mb-2" style={{ color: theme.text.primary }}>
                {t('myTaskDashboard.charts.completionTrend')}
              </div>
              <AreaChart labels={areaLabels} datasets={areaDatasets} height={180} title={t('myTaskDashboard.charts.completionTrend')} />
              <div className="text-xs mt-2" style={{ color: theme.text.muted }}>
                Last {completionTrends.monthlyTrends.length} {t('myTaskDashboard.charts.monthsTrend')}
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Tasks */}
        {(upcomingTasks.urgentTasks.length > 0 || upcomingTasks.dueTodayTasks.length > 0 || upcomingTasks.overdueTasks.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Urgent */}
              {upcomingTasks.urgentTasks.length > 0 && (
                  <div className="rounded-lg" style={{ background: theme.background.secondary, border: `1px solid ${THEME_COLORS.error[500]}` }}>
                    <div className="p-4">
                      <div className="font-semibold mb-3 flex items-center gap-2" style={{ color: THEME_COLORS.error[500] }}>
                        🚨 {t('myTaskDashboard.upcomingTasks.urgent')} ({upcomingTasks.urgentTasks.length})
                      </div>
                      <div className="space-y-2">
                        {upcomingTasks.urgentTasks.slice(0, 3).map((task) => (
                            <div key={task.id} className="p-2 rounded border-l-2" style={{ background: theme.background.primary, borderColor: THEME_COLORS.error[500] }}>
                              <div className="text-sm font-medium" style={{ color: theme.text.primary }}>{task.title}</div>
                              <div className="text-xs" style={{ color: theme.text.muted }}>{task.projectName}</div>
                            </div>
                        ))}
                        {upcomingTasks.urgentTasks.length > 3 && (
                            <div className="text-xs text-center mt-2" style={{ color: theme.text.muted }}>
                              {t('myTaskDashboard.upcomingTasks.viewAll')}
                            </div>
                        )}
                      </div>
                    </div>
                  </div>
              )}

              {/* Due Today */}
              {upcomingTasks.dueTodayTasks.length > 0 && (
                  <div className="rounded-lg" style={{ background: theme.background.secondary, border: `1px solid ${THEME_COLORS.warning[500]}` }}>
                    <div className="p-4">
                      <div className="font-semibold mb-3 flex items-center gap-2" style={{ color: THEME_COLORS.warning[500] }}>
                        ⏰ {t('myTaskDashboard.upcomingTasks.dueToday')} ({upcomingTasks.dueTodayTasks.length})
                      </div>
                      <div className="space-y-2">
                        {upcomingTasks.dueTodayTasks.slice(0, 3).map((task) => (
                            <div key={task.id} className="p-2 rounded border-l-2" style={{ background: theme.background.primary, borderColor: THEME_COLORS.warning[500] }}>
                              <div className="text-sm font-medium" style={{ color: theme.text.primary }}>{task.title}</div>
                              <div className="text-xs" style={{ color: theme.text.muted }}>{task.projectName}</div>
                            </div>
                        ))}
                        {upcomingTasks.dueTodayTasks.length > 3 && (
                            <div className="text-xs text-center mt-2" style={{ color: theme.text.muted }}>
                              {t('myTaskDashboard.upcomingTasks.viewAll')}
                            </div>
                        )}
                      </div>
                    </div>
                  </div>
              )}

              {/* Overdue */}
              {upcomingTasks.overdueTasks.length > 0 && (
                  <div className="rounded-lg" style={{ background: theme.background.secondary, border: `1px solid ${THEME_COLORS.error[600]}` }}>
                    <div className="p-4">
                      <div className="font-semibold mb-3 flex items-center gap-2" style={{ color: THEME_COLORS.error[600] }}>
                        ⚠️ {t('myTaskDashboard.upcomingTasks.overdue')} ({upcomingTasks.overdueTasks.length})
                      </div>
                      <div className="space-y-2">
                        {upcomingTasks.overdueTasks.slice(0, 3).map((task) => (
                            <div key={task.id} className="p-2 rounded border-l-2" style={{ background: theme.background.primary, borderColor: THEME_COLORS.error[600] }}>
                              <div className="text-sm font-medium" style={{ color: theme.text.primary }}>{task.title}</div>
                              <div className="text-xs" style={{ color: theme.text.muted }}>{task.projectName}</div>
                            </div>
                        ))}
                        {upcomingTasks.overdueTasks.length > 3 && (
                            <div className="text-xs text-center mt-2" style={{ color: theme.text.muted }}>
                              {t('myTaskDashboard.upcomingTasks.viewAll')}
                            </div>
                        )}
                      </div>
                    </div>
                  </div>
              )}
            </div>
        )}

        {/* Empty State */}
        {total === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="text-center">
                <Zap className="w-16 h-16 mx-auto mb-4" style={{ color: theme.text.muted }} />
                <h3 className="text-lg font-semibold mb-2" style={{ color: theme.text.primary }}>
                  {t('myTaskDashboard.empty.noTasks')}
                </h3>
                <p className="text-sm" style={{ color: theme.text.muted }}>
                  {t('myTaskDashboard.empty.createFirst')}
                </p>
              </div>
            </div>
        )}
      </div>
  );
}
