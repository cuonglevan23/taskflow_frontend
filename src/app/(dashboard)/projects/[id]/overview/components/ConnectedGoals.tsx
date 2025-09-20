"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertCircle } from "lucide-react";
import { useProjectProgress } from "@/hooks/process/useProgress";
import { useThemeContext } from "@/providers/ThemeProvider";
import { useLanguageContext } from "@/providers/LanguageProvider";

interface ConnectedGoalsProps {
  projectId: number;
}

const ConnectedGoals: React.FC<ConnectedGoalsProps> = ({ projectId }) => {
  const { progress, loading, error, refreshProgress } = useProjectProgress(projectId);
  const { theme, themeMode } = useThemeContext();
  const { messages, isLoading: languageLoading } = useLanguageContext();

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

  // Get translated messages from config/i18n/messages
  const connectedGoalsMessages = messages?.projectOverview?.connectedGoals || {};
  const dashboardMessages = messages?.myTaskDashboard || {};

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  // Show loading state while language is loading
  if (languageLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-32 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (loading) {
    return (
      <Card
        className="w-full"
        style={{
          background: getThemeColor('background.secondary', '#ffffff'),
          border: `1px solid ${getThemeColor('border.default', '#e2e8f0')}`
        }}
      >
        <CardHeader>
          <CardTitle
            className="flex items-center gap-2"
            style={{ color: getThemeColor('text.primary', '#0f172a') }}
          >
            <RefreshCw
              className="h-4 w-4 animate-spin"
              style={{ color: getThemeColor('text.muted', '#64748b') }}
            />
            {connectedGoalsMessages.loading || 'Đang tải tiến độ dự án...'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div
                  className="h-4 rounded mb-2"
                  style={{ background: getThemeColor('background.muted', '#f1f5f9') }}
                ></div>
                <div
                  className="h-2 rounded"
                  style={{ background: getThemeColor('background.muted', '#f1f5f9') }}
                ></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card
        className="w-full"
        style={{
          background: getThemeColor('background.secondary', '#ffffff'),
          border: `1px solid ${getThemeColor('border.default', '#e2e8f0')}`
        }}
      >
        <CardHeader>
          <CardTitle
            className="flex items-center gap-2"
            style={{ color: getThemeColor('status.error', '#ef4444') }}
          >
            <AlertCircle className="h-4 w-4" />
            {connectedGoalsMessages.error || 'Không thể tải mục tiêu'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p
            className="text-sm mb-4"
            style={{ color: getThemeColor('text.muted', '#64748b') }}
          >
            {error}
          </p>
          <Button
            onClick={refreshProgress}
            variant="outline"
            size="sm"
            style={{
              borderColor: getThemeColor('border.default', '#e2e8f0'),
              color: getThemeColor('text.primary', '#0f172a')
            }}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            {dashboardMessages.retry || 'Thử lại'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!progress) {
    return (
      <Card
        className="w-full"
        style={{
          background: getThemeColor('background.secondary', '#ffffff'),
          border: `1px solid ${getThemeColor('border.default', '#e2e8f0')}`
        }}
      >
        <CardHeader>
          <CardTitle style={{ color: getThemeColor('text.primary', '#0f172a') }}>
            {connectedGoalsMessages.noGoals || 'Không có mục tiêu liên kết'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p
            className="text-sm"
            style={{ color: getThemeColor('text.muted', '#64748b') }}
          >
            {connectedGoalsMessages.noGoals || 'Không có mục tiêu liên kết'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Progress Card */}
      <Card
        style={{
          background: getThemeColor('background.secondary', '#ffffff'),
          border: `1px solid ${getThemeColor('border.default', '#e2e8f0')}`
        }}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle
            className="text-lg font-semibold"
            style={{ color: getThemeColor('text.primary', '#0f172a') }}
          >
            {connectedGoalsMessages.title || 'Mục tiêu liên kết'}
          </CardTitle>
          <Button
            onClick={refreshProgress}
            variant="ghost"
            size="sm"
            style={{ color: getThemeColor('text.muted', '#64748b') }}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span
                className="text-sm font-medium"
                style={{ color: getThemeColor('text.primary', '#0f172a') }}
              >
                {dashboardMessages.stats?.overallProgress || 'Tiến độ tổng thể'}
              </span>
              <span
                className="text-sm"
                style={{ color: getThemeColor('text.muted', '#64748b') }}
              >
                {progress.completedTasks} {dashboardMessages.stats?.ofTotal || 'của tổng số'} {progress.totalTasks} {dashboardMessages.stats?.tasksCompleted || 'công việc hoàn thành'}
              </span>
            </div>

            {/* Using shadcn/ui Progress component */}
            <Progress value={progress.completionPercentage} className="h-3" />

            <div className="flex items-center justify-between text-sm">
              <span
                className="font-semibold text-lg"
                style={{ color: getThemeColor('text.primary', '#0f172a') }}
              >
                {progress.completionPercentage.toFixed(1)}%
              </span>
              <span
                style={{ color: getThemeColor('text.muted', '#64748b') }}
              >
                {dashboardMessages.lastUpdated || 'Cập nhật lần cuối'}: {formatDate(progress.lastUpdated)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConnectedGoals;
