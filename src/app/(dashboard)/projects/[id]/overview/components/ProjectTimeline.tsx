"use client";

import React from 'react';
import { Timeline } from '@/components/ui/Timeline';
import { projectTimelineService } from '@/services/projects';
import { useThemeContext } from '@/providers/ThemeProvider';
import { useLanguageContext } from '@/providers/LanguageProvider';
import { useProjectTimeline } from '@/hooks/projects/useProjectTimeLine';

export function ProjectTimeline() {
  const { theme, isLoading: themeLoading } = useThemeContext();
  const { messages } = useLanguageContext();

  // Use custom hook for separated concerns
  const {
    timelineData,
    loading,
    error,
    itemsToShow,
    hasMoreItems,
    setShowAll,
    handleTimelineItemClick,
  } = useProjectTimeline();

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
  const timelineMessages = messages?.projectOverview?.timeline || {};

  // Show loading state while theme is loading
  if (themeLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-32"></div>
        <div className="h-32 bg-gray-200 rounded"></div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3
            className="text-lg font-semibold"
            style={{ color: getThemeColor('text.primary', '#0f172a') }}
          >
            {timelineMessages.title || 'Hoạt động gần đây'}
          </h3>
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-3">
              <div
                className="w-3 h-3 rounded-full animate-pulse flex-shrink-0 mt-1"
                style={{ backgroundColor: getThemeColor('background.muted', '#f1f5f9') }}
              />
              <div className="flex-1 space-y-2">
                <div
                  className="h-4 rounded animate-pulse w-3/4"
                  style={{ backgroundColor: getThemeColor('background.muted', '#f1f5f9') }}
                />
                <div
                  className="h-3 rounded animate-pulse w-1/2"
                  style={{ backgroundColor: getThemeColor('background.muted', '#f1f5f9') }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3
            className="text-lg font-semibold"
            style={{ color: getThemeColor('text.primary', '#0f172a') }}
          >
            {timelineMessages.title || 'Hoạt động gần đây'}
          </h3>
        </div>
        <div className="text-center py-8">
          <div
            className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center"
            style={{ backgroundColor: getThemeColor('status.error', '#ef4444') + '20' }}
          >
            <span
              className="text-xl"
              style={{ color: getThemeColor('status.error', '#ef4444') }}
            >
              ⚠️
            </span>
          </div>
          <p
            className="text-sm mb-2"
            style={{ color: getThemeColor('status.error', '#ef4444') }}
          >
            {timelineMessages.errorLoading || 'Không thể tải hoạt động'}
          </p>
          <p
            className="text-xs"
            style={{ color: getThemeColor('text.secondary', '#64748b') }}
          >
            {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3
          className="text-lg font-semibold"
          style={{ color: getThemeColor('text.primary', '#0f172a') }}
        >
          {timelineMessages.title || 'Hoạt động gần đây'}
        </h3>
        {timelineData.length > 0 && (
          <span
            className="text-xs px-2 py-1 rounded-full"
            style={{
              backgroundColor: getThemeColor('status.info', '#3b82f6') + '20',
              color: getThemeColor('status.info', '#3b82f6')
            }}
          >
            {timelineData.length} {timelineMessages.events || 'sự kiện'}
          </span>
        )}
      </div>

      {/* Timeline */}
      <div className="max-h-96 overflow-y-auto">
        <Timeline
          items={itemsToShow}
          config={{
            orientation: 'vertical',
            dotSize: 'sm',
            animated: true,
            showTime: true,
            dateFormat: 'relative',
            groupBy: 'none'
          }}
          onItemClick={handleTimelineItemClick}
          emptyMessage={timelineMessages.noActivity || 'Không tìm thấy hoạt động gần đây'}
          renderCustomIcon={(item) => {
            // Custom icon renderer to handle lucide-react icons properly
            if (item.icon && typeof item.icon === 'object' &&
                '$$typeof' in item.icon &&
                (item.icon as any).$$typeof === Symbol.for('react.forward_ref')) {
              const IconComponent = item.icon as unknown as React.ComponentType<{ className?: string }>;
              return <IconComponent className="w-3 h-3" />;
            } else if (typeof item.icon === 'function') {
              const IconComponent = item.icon as unknown as React.ComponentType<{ className?: string }>;
              return <IconComponent className="w-3 h-3" />;
            } else if (React.isValidElement(item.icon)) {
              return item.icon;
            } else if (item.icon) {
              return <span>{String(item.icon)}</span>;
            }
            return null;
          }}
          renderCustomContent={(item) => (
            <div className="space-y-1">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <h4
                    className="font-medium text-sm leading-tight"
                    style={{ color: getThemeColor('text.primary', '#0f172a') }}
                  >
                    {item.title}
                  </h4>
                </div>
                <time
                  className="text-xs"
                  style={{ color: getThemeColor('text.secondary', '#64748b') }}
                >
                  {projectTimelineService.getTimeAgo(new Date(item.timestamp))}
                </time>
              </div>

              {item.description && (
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: getThemeColor('text.secondary', '#64748b') }}
                >
                  {item.description}
                </p>
              )}

              <div className="flex items-center gap-2">
                <span
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: `${item.color}20`,
                    color: item.color
                  }}
                >
                  {item.metadata?.eventType.replace(/_/g, ' ').toLowerCase()}
                </span>

                {/* Enhanced user display with fallback */}
                {item.metadata?.changedBy && (
                  <div className="flex items-center gap-1">
                    <span
                      className="text-xs"
                      style={{ color: getThemeColor('text.muted', '#9ca3af') }}
                    >
                      {timelineMessages.by || 'bởi'}
                    </span>
                    <span
                      className="text-xs font-medium"
                      style={{ color: getThemeColor('text.secondary', '#64748b') }}
                    >
                      {item.metadata.changedBy.userName || item.metadata.changedBy.userEmail || (timelineMessages.unknownUser || 'Người dùng không xác định')}
                    </span>
                    {item.metadata.changedBy.userName && item.metadata.changedBy.userEmail && (
                      <span
                        className="text-xs"
                        style={{ color: getThemeColor('text.muted', '#9ca3af') }}
                      >
                        ({item.metadata.changedBy.userEmail})
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        />
      </div>

      {/* Empty State */}
      {timelineData.length === 0 && (
        <div className="text-center py-8">
          <div
            className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center"
            style={{ backgroundColor: getThemeColor('background.muted', '#f1f5f9') }}
          >
            <span
              className="text-xl"
              style={{ color: getThemeColor('text.muted', '#9ca3af') }}
            >
              📊
            </span>
          </div>
          <p
            className="text-sm"
            style={{ color: getThemeColor('text.secondary', '#64748b') }}
          >
            {timelineMessages.noActivity || 'Chưa có hoạt động'}
          </p>
          <p
            className="text-xs mt-1"
            style={{ color: getThemeColor('text.muted', '#9ca3af') }}
          >
            {timelineMessages.noActivityDesc || 'Các hoạt động của dự án sẽ xuất hiện ở đây khi chúng xảy ra'}
          </p>
        </div>
      )}

      {/* Show More Button */}
      {hasMoreItems && (
        <div className="text-center pt-4">
          <button
            onClick={() => setShowAll(true)}
            className="text-sm px-4 py-2 rounded-md transition-colors"
            style={{
              color: getThemeColor('status.info', '#3b82f6'),
              backgroundColor: getThemeColor('status.info', '#3b82f6') + '10',
              border: `1px solid ${getThemeColor('status.info', '#3b82f6')}20`
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = getThemeColor('status.info', '#3b82f6') + '20'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = getThemeColor('status.info', '#3b82f6') + '10'}
          >
            {timelineMessages.showMore || 'Xem thêm'}
          </button>
        </div>
      )}
    </div>
  );
}
