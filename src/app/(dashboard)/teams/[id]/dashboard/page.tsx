"use client";

import React from "react";
import { BarChart, DonutChart, AreaChart } from '@/components/Chart';
import { AlertCircle, Users, FolderOpen, Target, TrendingUp } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useTeamDashboardData } from '@/hooks/dashboards';
import { useThemeContext } from "@/providers/ThemeProvider";
import { useLanguageContext } from "@/providers/LanguageProvider";

export default function TeamDashboardPage() {
  const params = useParams();
  const teamId = parseInt(params.id as string, 10);
  const { theme } = useThemeContext();
  const { messages } = useLanguageContext();

  // Use real hook instead of mock data
  const {
    data,
    loading,
    error,
    chartData,
    stats,
    hasData,
    refresh,
    forceRefresh
  } = useTeamDashboardData(teamId);

  // Loading state
  if (loading) {
    return (
      <div className="h-[calc(100vh-140px)] overflow-y-auto px-4 py-6 w-full flex items-center justify-center" style={{ background: theme.background.primary }}>
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin h-8 w-8 border border-current border-t-transparent rounded-full" style={{ color: theme.text.muted }} />
          <div style={{ color: theme.text.muted }}>{messages.teamDashboard?.loadingTeamDashboard || 'Loading team dashboard...'}</div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="h-[calc(100vh-140px)] overflow-y-auto px-4 py-6 w-full flex items-center justify-center" style={{ background: theme.background.primary }}>
        <div className="flex flex-col items-center gap-4">
          <AlertCircle className="w-8 h-8" style={{ color: theme.status.error }} />
          <div style={{ color: theme.text.muted }}>{messages.errors?.failedToLoadTeamDashboard || 'Failed to load team dashboard'}</div>
          <button
            onClick={() => refresh()}
            className="px-4 py-2 rounded-lg text-sm"
            style={{ background: theme.status.info, color: theme.text.inverse }}
          >
            {messages.common?.tryAgain || 'Try Again'}
          </button>
        </div>
      </div>
    );
  }

  if (!hasData || !data) return null;

  const { teamStats, memberBreakdown, projectBreakdown, upcomingDeadlines } = data;

  // Icon mapping for stats
  const iconMap = {
    Users: <Users className="w-5 h-5" style={{ color: theme.status.info }} />,
    FolderOpen: <FolderOpen className="w-5 h-5" style={{ color: theme.status.success }} />,
    TrendingUp: <TrendingUp className="w-5 h-5" style={{ color: theme.status.success }} />,
    Target: <Target className="w-5 h-5" style={{ color: theme.status.warning }} />
  };

  return (
    <div className="h-[calc(100vh-140px)] overflow-y-auto px-4 py-6 w-full" style={{ background: theme?.background?.primary, width: "100%", minWidth: "100%" }}>
      {/* Team Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2" style={{ color: theme.text.primary }}>
              {messages.teamDashboard?.teamDashboard || 'Team Dashboard'}
            </h1>
            <div className="flex items-center gap-4 text-sm" style={{ color: theme.text.muted }}>
              <span>{teamStats.totalMembers} {messages.teamDashboard?.members || 'members'}</span>
              <span>•</span>
              <span>{teamStats.totalProjects} {messages.teamDashboard?.projects || 'projects'}</span>
              <span>•</span>
              <span>{teamStats.completionRate.toFixed(1)}% {messages.teamDashboard?.completionRate || 'completion rate'}</span>
            </div>
          </div>
          <button
            onClick={() => forceRefresh()}
            className="px-3 py-1 rounded text-xs"
            style={{ background: theme.status.info, color: theme.text.inverse }}
          >
            {messages.teamDashboard?.refreshData || 'Refresh Data'}
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 w-full">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-lg" style={{ background: theme?.background?.secondary, border: `1px solid ${theme?.border?.default}` }}>
            <div className="p-6 flex flex-col items-center justify-center">
              <div className="flex items-center gap-2 mb-2" style={{ color: theme?.text?.muted }}>
                {iconMap[stat.icon as keyof typeof iconMap]}
                <span className="text-sm">{stat.label}</span>
              </div>
              <div className="text-3xl font-bold" style={{ color: theme?.text?.primary }}>{stat.value}</div>
              <div className="text-xs mt-2" style={{ color: theme?.text?.muted }}>
                {stat.subValue}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="rounded-lg" style={{ background: theme.background.secondary, border: `1px solid ${theme.border.default}` }}>
          <div className="p-4">
            <div className="font-semibold mb-2" style={{ color: theme.text.primary }}>
              {messages.teamDashboard?.teamMembersByRole || 'Team Members by Role'}
            </div>
            <DonutChart data={chartData.roleDonutData} height={220} title={messages.teamDashboard?.teamMembersByRole || 'Team Members by Role'} />
            <div className="text-xs mt-2" style={{ color: theme.text.muted }}>
              {messages.teamDashboard?.currentTeamComposition || 'Current team composition by role'}
            </div>
          </div>
        </div>
        <div className="rounded-lg" style={{ background: theme.background.secondary, border: `1px solid ${theme.border.default}` }}>
          <div className="p-4">
            <div className="font-semibold mb-2" style={{ color: theme.text.primary }}>
              {messages.teamDashboard.workloadDistribution|| 'Workload Distribution'}
            </div>
            <BarChart data={chartData.workloadBarData} height={220} title={messages.teamDashboard?.tasksPerMember || 'Tasks per Member'} />
            <div className="text-xs mt-2" style={{ color: theme.text.muted }}>
              {messages.teamDashboard?.taskDistribution || 'Task distribution among team members'}
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="rounded-lg" style={{ background: theme.background.secondary, border: `1px solid ${theme.border.default}` }}>
          <div className="p-4">
            <div className="font-semibold mb-2" style={{ color: theme.text.primary }}>
              {messages.teamDashboard?.projectsByStatus || 'Projects by Status'}
            </div>
            <DonutChart data={chartData.projectStatusDonutData} height={180} title={messages.teamDashboard?.projectsByStatus || 'Projects by Status'} />
            <div className="text-xs mt-2" style={{ color: theme.text.muted }}>
              {teamStats.totalProjects} {messages.teamDashboard?.totalProjects || 'total projects'}
            </div>
          </div>
        </div>
        <div className="rounded-lg" style={{ background: theme.background.secondary, border: `1px solid ${theme.border.default}` }}>
          <div className="p-4">
            <div className="font-semibold mb-2" style={{ color: theme.text.primary }}>
              {messages.teamDashboard?.teamPerformanceTrend || 'Team Performance Trend'}
            </div>
            <AreaChart
              labels={chartData.performanceTrends.labels}
              datasets={chartData.performanceTrends.datasets}
              height={180}
              title={messages.teamDashboard?.monthlyTaskCompletion || 'Monthly Task Completion'}
            />
            <div className="text-xs mt-2" style={{ color: theme.text.muted }}>
              {messages.teamDashboard?.taskCreationVsCompletion || 'Task creation vs completion over last 5 months'}
            </div>
          </div>
        </div>
      </div>

      {/* Project Progress Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="rounded-lg" style={{ background: theme?.background?.secondary, border: `1px solid ${theme?.border?.default}` }}>
          <div className="p-4">
            <div className="font-semibold mb-3" style={{ color: theme?.text?.primary }}>
              {messages.teamDashboard?.activeProjectsProgress || 'Active Projects Progress'}
            </div>
            <div className="space-y-3">
              {projectBreakdown.byProgress?.map((project, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium" style={{ color: theme?.text?.primary }}>{project.name}</span>
                    <span className="text-xs" style={{ color: theme?.text?.muted }}>{project.progress}%</span>
                  </div>
                  <div className="w-full rounded-full h-2" style={{ background: theme.background.primary }}>
                    <div
                      className="h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${project.progress}%`,
                        background: project.progress >= 80 ? theme.status.success :
                                  project.progress >= 50 ? theme.status.info :
                                  theme.status.warning
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="rounded-lg" style={{ background: theme.background.secondary, border: `1px solid ${theme.border.default}` }}>
          <div className="p-4">
            <div className="font-semibold mb-3" style={{ color: theme.text.primary }}>
              {messages.teamDashboard?.upcomingDeadlines || 'Upcoming Deadlines'}
            </div>
            <div className="space-y-3">
              {/* This Week */}
              {upcomingDeadlines.thisWeek?.length > 0 && (
                <div>
                  <div className="text-xs font-medium mb-2" style={{ color: theme.status.warning }}>
                    {messages.teamDashboard?.thisWeek || 'This Week'}
                  </div>
                  {upcomingDeadlines.thisWeek.map((item) => (
                    <div key={item.id} className="p-2 rounded border-l-2 mb-2" style={{ background: theme.background.primary, borderColor: theme.status.warning }}>
                      <div className="text-sm font-medium" style={{ color: theme.text.primary }}>{item.title}</div>
                      <div className="text-xs" style={{ color: theme.text.muted }}>
                        {item.project} • {item.assignee} • {messages.teamDashboard?.due || 'Due'}: {new Date(item.dueDate).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Overdue */}
              {upcomingDeadlines.overdue?.length > 0 && (
                <div>
                  <div className="text-xs font-medium mb-2" style={{ color: theme.status.error }}>
                    {messages.teamDashboard?.overdue || 'Overdue'}
                  </div>
                  {upcomingDeadlines.overdue.map((item) => (
                    <div key={item.id} className="p-2 rounded border-l-2" style={{ background: theme.background.primary, borderColor: theme.status.error }}>
                      <div className="text-sm font-medium" style={{ color: theme.text.primary }}>{item.title}</div>
                      <div className="text-xs" style={{ color: theme.text.muted }}>
                        {item.project} • {item.assignee} • {item.daysOverdue} {messages.teamDashboard?.daysOverdue || 'days overdue'}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* No deadlines message */}
              {(!upcomingDeadlines.thisWeek?.length && !upcomingDeadlines.overdue?.length) && (
                <div className="text-center py-4" style={{ color: theme.text.muted }}>
                  <div className="text-sm">{messages.teamDashboard?.noUrgentDeadlines || 'No urgent deadlines'}</div>
                  <div className="text-xs mt-1">{messages.teamDashboard?.allTasksOnTrack || 'All tasks are on track'}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
