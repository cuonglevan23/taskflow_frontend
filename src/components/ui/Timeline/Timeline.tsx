"use client";

import React from 'react';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DARK_THEME } from '@/constants/theme';
import type { TimelineProps } from './types';
import { groupTimelineItems } from './utils';
import TimelineItemComponent from './TimelineItem';
import TimelineLoadingSkeleton from './TimelineLoadingSkeleton';

// Main Timeline component
export default function Timeline<T = Record<string, unknown>>({
  items,
  config = {},
  className,
  onItemClick,
  onItemHover,
  renderCustomContent,
  renderCustomIcon,
  renderCustomTimestamp,
  emptyMessage = 'No timeline events found',
  loading = false,
}: TimelineProps<T>) {
  // Default configuration
  const finalConfig = {
    showTime: true,
    showDate: true,
    dateFormat: 'relative' as const,
    orientation: 'vertical' as const,
    dotSize: 'md' as const,
    lineStyle: 'solid' as const,
    animated: true,
    groupBy: 'none' as const,
    ...config,
  };

  // Loading state
  if (loading) {
    return (
      <div className={cn('w-full', className)}>
        <TimelineLoadingSkeleton />
      </div>
    );
  }

  // Empty state
  if (!items || items.length === 0) {
    return (
      <div className={cn('w-full flex items-center justify-center py-12', className)}>
        <div className="text-center">
          <div
            className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center"
            style={{ backgroundColor: DARK_THEME.background.muted }}
          >
            <Clock
              className="w-6 h-6"
              style={{ color: DARK_THEME.text.muted }}
            />
          </div>
          <p className="text-sm" style={{ color: DARK_THEME.text.secondary }}>
            {emptyMessage}
          </p>
        </div>
      </div>
    );
  }

  // Sort items by timestamp (newest first)
  const sortedItems = [...items].sort((a, b) => {
    const dateA = typeof a.timestamp === 'string' ? new Date(a.timestamp) : a.timestamp;
    const dateB = typeof b.timestamp === 'string' ? new Date(b.timestamp) : b.timestamp;
    return dateB.getTime() - dateA.getTime();
  });

  // Group items if needed
  const groups = groupTimelineItems(sortedItems, finalConfig.groupBy);

  // Determine layout classes based on orientation
  const isHorizontal = finalConfig.orientation === 'horizontal';

  const containerClasses = isHorizontal
    ? 'flex overflow-x-auto pb-4'
    : 'w-full';

  const groupContainerClasses = isHorizontal
    ? 'flex flex-nowrap gap-8 min-w-max'
    : '';

  return (
    <div className={cn(containerClasses, className)}>
      <div className={groupContainerClasses}>
        {groups.map((group, groupIndex) => {
          const groupSpacingClasses = isHorizontal
            ? 'flex-shrink-0'
            : cn(groupIndex > 0 && 'mt-8');

          return (
            <div key={group.groupKey} className={groupSpacingClasses}>
              {/* Group header */}
              {finalConfig.groupBy !== 'none' && group.groupLabel && (
                <div className={cn('mb-4', isHorizontal && 'text-center')}>
                  <h2
                    className="text-sm font-semibold px-3 py-1 rounded-md inline-block"
                    style={{
                      color: DARK_THEME.text.primary,
                      backgroundColor: DARK_THEME.background.secondary
                    }}
                  >
                    {group.groupLabel}
                  </h2>
                </div>
              )}

              {/* Timeline items */}
              <div className={cn(isHorizontal ? 'flex flex-col space-y-4 min-w-[300px]' : 'space-y-0')}>
                {group.items.map((item, itemIndex) => (
                  <TimelineItemComponent
                    key={item.id}
                    item={item}
                    config={finalConfig}
                    isLast={itemIndex === group.items.length - 1 && groupIndex === groups.length - 1}
                    onItemClick={onItemClick}
                    onItemHover={onItemHover}
                    renderCustomContent={renderCustomContent}
                    renderCustomIcon={renderCustomIcon}
                    renderCustomTimestamp={renderCustomTimestamp}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
