"use client";

import React from "react";
import { BarChart, DonutChart, AreaChart } from '@/components/Chart';
import { AlertCircle, ListChecks, Users, Calendar, Target, RefreshCw } from 'lucide-react';
import { useThemeContext } from "@/providers/ThemeProvider";
import { useLanguageContext } from "@/providers/LanguageProvider";
import { useParams } from 'next/navigation';
import { useProjectDashboard } from '@/hooks/dashboards';

export default function ProjectDashboardPage() {
  const params = useParams();
  const currentProjectId = params?.id as string;
  const { theme, isLoading: themeLoading } = useThemeContext();
  const { messages } = useLanguageContext();

  const { data, loading, error, refetch, clearAndRefetch } = useProjectDashboard(currentProjectId);

  // Safe theme color access with fallbacks
  const getThemeColor = (colorPath: string, fallback: string = '') => {
    if (!theme) return fallback;
    const keys = colorPath.split('.');
    let value: any = theme;
    for (const key of keys) {
      value = value?.[key];
      if (!value) return fallback;
    }
    return value;
  };

  // Get translated messages
  const dashboardMessages = messages?.myTaskDashboard || {};
  const generalMessages = messages?.general || {};

  // Show loading state while theme is loading
  if (themeLoading) {
    return (
      <div className="h-[calc(100vh-140px)] overflow-y-auto px-4 py-6 w-full flex items-center justify-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-4 gap-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Render loading state
  if (loading) {
    return (
      <div
        className="h-[calc(100vh-140px)] overflow-y-auto px-4 py-6 w-full flex items-center justify-center"
        style={{ background: getThemeColor('background.primary', '#ffffff') }}
      >
        <div className="flex flex-col items-center gap-4">
          <div
            className="animate-spin h-8 w-8 border border-current border-t-transparent rounded-full"
            style={{ color: getThemeColor('text.muted', '#64748b') }}
          />
          <div style={{ color: getThemeColor('text.muted', '#64748b') }}>
            {dashboardMessages.loading || 'Đang tải bảng điều khiển...'}
          </div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div
        className="h-[calc(100vh-140px)] overflow-y-auto px-4 py-6 w-full flex items-center justify-center"
        style={{ background: getThemeColor('background.primary', '#ffffff') }}
      >
        <div className="flex flex-col items-center gap-4 max-w-md text-center">
          <AlertCircle className="w-8 h-8" style={{ color: getThemeColor('status.error', '#ef4444') }} />
          <div style={{ color: getThemeColor('text.primary', '#0f172a') }}>
            {dashboardMessages.error || 'Không thể tải dữ liệu bảng điều khiển'}
          </div>
          <div
            className="text-sm p-3 rounded"
            style={{
              color: getThemeColor('text.muted', '#64748b'),
              background: getThemeColor('background.secondary', '#f1f5f9')
            }}
          >
            {generalMessages.error || 'Lỗi'}: {error}
          </div>
          <div className="flex gap-2">
            <button
              onClick={refetch}
              className="flex items-center gap-2 px-4 py-2 rounded text-sm hover:opacity-80"
              style={{
                background: getThemeColor('status.info', '#3b82f6'),
                color: '#ffffff',
                border: 'none'
              }}
            >
              <RefreshCw className="w-4 h-4" />
              {dashboardMessages.retry || 'Thử lại'}
            </button>
            <button
              onClick={clearAndRefetch}
              className="flex items-center gap-2 px-4 py-2 rounded text-sm hover:opacity-80"
              style={{
                background: getThemeColor('status.warning', '#f59e0b'),
                color: '#ffffff',
                border: 'none'
              }}
            >
              <RefreshCw className="w-4 h-4" />
              {generalMessages.clearCache || 'Xóa bộ nhớ đệm & Thử lại'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render no data state
  if (!data) {
    return (
      <div
        className="h-[calc(100vh-140px)] overflow-y-auto px-4 py-6 w-full flex items-center justify-center"
        style={{ background: getThemeColor('background.primary', '#ffffff') }}
      >
        <div className="flex flex-col items-center gap-4">
          <div style={{ color: getThemeColor('text.muted', '#64748b') }}>
            {dashboardMessages.empty?.noData || 'Không có dữ liệu bảng điều khiển'}
          </div>
          <button
            onClick={refetch}
            className="flex items-center gap-2 px-4 py-2 rounded text-sm"
            style={{
              background: getThemeColor('status.info', '#3b82f6'),
              color: '#ffffff',
              border: 'none'
            }}
          >
            <RefreshCw className="w-4 h-4" />
            {generalMessages.loadData || 'Tải dữ liệu'}
          </button>
        </div>
      </div>
    );
  }

  const { stats, taskBreakdown, progressTrends, teamInfo } = data;

  // Create stats array from real API data with translations
  const statsCards = [
    {
      label: dashboardMessages.stats?.projectProgress || 'Tiến độ dự án',
      value: `${stats.projectProgress.toFixed(1)}%`,
      icon: <Target className="w-5 h-5" style={{ color: getThemeColor('status.info', '#3b82f6') }} />,
      subtitle: `${stats.completedTasks}/${stats.totalTasks} ${dashboardMessages.stats?.ofTotal || 'công việc hoàn thành'}`
    },
    {
      label: dashboardMessages.stats?.teamMembers || 'Thành viên nhóm',
      value: teamInfo?.totalMembers || 0,
      icon: <Users className="w-5 h-5" style={{ color: getThemeColor('status.info', '#06b6d4') }} />,
      subtitle: messages?.team?.activeContributors || 'Người đóng góp tích cực'
    },
    {
      label: dashboardMessages.stats?.daysRemaining || 'Ngày còn lại',
      value: stats.daysRemaining,
      icon: <Calendar className="w-5 h-5" style={{ color: getThemeColor('status.warning', '#f59e0b') }} />,
      subtitle: messages?.project?.untilDeadline || 'Cho đến hạn chót dự án'
    },
    {
      label: dashboardMessages.stats?.totalTasks || 'Tổng công việc',
      value: stats.totalTasks,
      icon: <ListChecks className="w-5 h-5" style={{ color: getThemeColor('status.info', '#06b6d4') }} />,
      subtitle: `${dashboardMessages.stats?.completionRate || 'Tỷ lệ hoàn thành'}: ${stats.completionRate.toFixed(1)}%`
    },
  ];

  const chartColumnColor = getThemeColor('status.info', '#3b82f6');

  // Transform data for charts using real API response
  const statusDonutData = taskBreakdown.byStatus.map(status => ({
    label: status.name,
    value: status.count,
    color: chartColumnColor
  }));

  const priorityBarData = taskBreakdown.byPriority.map(priority => ({
    label: priority.name,
    value: priority.count,
    color: chartColumnColor
  }));

  const assigneeBarData = taskBreakdown.byAssignee.map(assignee => ({
    label: assignee.name,
    value: assignee.count,
    color: chartColumnColor
  }));

  // Transform progress trends for area chart
  const areaLabels = progressTrends.weeklyProgress.map(week => week.week);
  const areaDatasets = [
    {
      label: dashboardMessages.charts?.tasksCreated || 'Công việc đã tạo',
      data: progressTrends.weeklyProgress.map(week => week.planned),
      color: getThemeColor('status.info', '#06b6d4'),
      fillOpacity: 0.1,
      tension: 0.4,
    },
    {
      label: dashboardMessages.charts?.tasksCompleted || 'Công việc đã hoàn thành',
      data: progressTrends.weeklyProgress.map(week => week.completed),
      color: chartColumnColor,
      fillOpacity: 0.2,
      tension: 0.4,
    },
  ];

  return (
    <div
      className="h-[calc(100vh-140px)] overflow-y-auto px-4 py-6 w-full"
      style={{
        background: getThemeColor('background.primary', '#ffffff'),
        width: "100%",
        minWidth: "100%"
      }}
    >
      {/* Project Header with Refresh Button */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold" style={{ color: getThemeColor('text.primary', '#0f172a') }}>
            {messages?.project?.dashboard || 'Bảng điều khiển Dự án'}
          </h1>
          <button
            onClick={clearAndRefetch}
            className="flex items-center gap-2 px-3 py-1.5 rounded text-sm hover:opacity-80 transition-opacity"
            style={{
              background: getThemeColor('status.info', '#3b82f6'),
              color: '#ffffff',
              border: 'none'
            }}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {dashboardMessages.refresh || 'Làm mới'}
          </button>
        </div>
        <div className="flex items-center gap-4 text-sm" style={{ color: getThemeColor('text.muted', '#64748b') }}>
          <span>
            {dashboardMessages.stats?.completionRate || 'Tỷ lệ hoàn thành'}: {stats.completionRate.toFixed(1)}%
          </span>
          <span>•</span>
          <span>
            {stats.completedTasks} {generalMessages.of || 'của'} {stats.totalTasks} {dashboardMessages.stats?.ofTotal || 'công việc hoàn thành'}
          </span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 w-full">
        {statsCards.map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg"
            style={{
              background: getThemeColor('background.secondary', '#ffffff'),
              border: `1px solid ${getThemeColor('border.default', '#e2e8f0')}`
            }}
          >
            <div className="p-6 flex flex-col items-center justify-center">
              <div className="flex items-center gap-2 mb-2" style={{ color: getThemeColor('text.muted', '#64748b') }}>
                {stat.icon}
                <span className="text-sm">{stat.label}</span>
              </div>
              <div className="text-3xl font-bold" style={{ color: getThemeColor('text.primary', '#0f172a') }}>
                {stat.value}
              </div>
              <div className="text-xs mt-2 text-center" style={{ color: getThemeColor('text.muted', '#64748b') }}>
                {stat.subtitle}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Task Status Donut Chart */}
        <div
          className="rounded-lg p-6"
          style={{
            background: getThemeColor('background.secondary', '#ffffff'),
            border: `1px solid ${getThemeColor('border.default', '#e2e8f0')}`
          }}
        >
          <h3 className="text-lg font-semibold mb-4" style={{ color: getThemeColor('text.primary', '#0f172a') }}>
            {dashboardMessages.charts?.tasksByStatus || 'Công việc theo Trạng thái'}
          </h3>
          <DonutChart
            data={statusDonutData}
            height={300}
            showLegend={true}
          />
        </div>

        {/* Priority Bar Chart */}
        <div
          className="rounded-lg p-6"
          style={{
            background: getThemeColor('background.secondary', '#ffffff'),
            border: `1px solid ${getThemeColor('border.default', '#e2e8f0')}`
          }}
        >
          <h3 className="text-lg font-semibold mb-4" style={{ color: getThemeColor('text.primary', '#0f172a') }}>
            {messages?.task?.priority || 'Ưu tiên'} - {messages?.task?.distribution || 'Phân bố'}
          </h3>
          <BarChart
            data={priorityBarData}
            height={300}
          />
        </div>
      </div>

      {/* Progress Trends Area Chart */}
      <div className="grid grid-cols-1 gap-6 mb-6">
        <div
          className="rounded-lg p-6"
          style={{
            background: getThemeColor('background.secondary', '#ffffff'),
            border: `1px solid ${getThemeColor('border.default', '#e2e8f0')}`
          }}
        >
          <h3 className="text-lg font-semibold mb-4" style={{ color: getThemeColor('text.primary', '#0f172a') }}>
            {dashboardMessages.charts?.completionTrend || 'Xu hướng Tạo vs Hoàn thành Công việc'}
          </h3>
          <AreaChart
            labels={areaLabels}
            datasets={areaDatasets}
            height={300}
          />
        </div>
      </div>

      {/* Team Assignment Chart */}
      <div className="grid grid-cols-1 gap-6">
        <div
          className="rounded-lg p-6"
          style={{
            background: getThemeColor('background.secondary', '#ffffff'),
            border: `1px solid ${getThemeColor('border.default', '#e2e8f0')}`
          }}
        >
          <h3 className="text-lg font-semibold mb-4" style={{ color: getThemeColor('text.primary', '#0f172a') }}>
            {messages?.team?.taskAssignment || 'Phân công Công việc theo Thành viên'}
          </h3>
          <BarChart
            data={assigneeBarData}
            height={300}
          />
        </div>
      </div>
    </div>
  );
}
