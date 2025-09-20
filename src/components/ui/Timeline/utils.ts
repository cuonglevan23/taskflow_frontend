// Timeline Constants and Utilities
import React from 'react';
import { Check, AlertTriangle, X, Info, Circle } from 'lucide-react';
import { DARK_THEME } from '@/constants/theme';
import type { TimelineItem, TimelineConfig, TimelineGroup } from './types';

// Status colors using DARK_THEME constants
export const STATUS_COLORS = {
  success: DARK_THEME.status.success,
  warning: DARK_THEME.status.warning,
  error: DARK_THEME.status.error,
  info: DARK_THEME.status.info,
} as const;

// Default status icons
export const STATUS_ICONS = {
  success: '✓',
  warning: '⚠',
  error: '✕',
  info: 'ℹ',
  pending: '○',
} as const;

// Utility function to format timestamps
export const formatTimestamp = (
  timestamp: Date | string,
  format: TimelineConfig['dateFormat'] = 'relative',
  customFormatter?: (date: Date) => string
): string => {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;

  if (customFormatter) {
    return customFormatter(date);
  }

  switch (format) {
    case 'relative':
      return getRelativeTime(date);
    case 'absolute':
      return date.toLocaleString();
    case 'custom':
      return date.toLocaleDateString();
    default:
      return getRelativeTime(date);
  }
};

// Get relative time string
export const getRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
  return `${Math.floor(diffDays / 365)}y ago`;
};

// Group timeline items
export const groupTimelineItems = <T,>(
  items: TimelineItem<T>[],
  groupBy: TimelineConfig['groupBy']
): TimelineGroup<T>[] => {
  if (groupBy === 'none' || !groupBy) {
    return [{ groupKey: 'all', groupLabel: '', items }];
  }

  const groups = new Map<string, TimelineItem<T>[]>();

  items.forEach(item => {
    let groupKey: string;
    let groupLabel: string;

    if (groupBy === 'date') {
      const date = typeof item.timestamp === 'string' ? new Date(item.timestamp) : item.timestamp;
      groupKey = date.toDateString();
      groupLabel = date.toLocaleDateString();
    } else if (groupBy === 'type') {
      groupKey = item.type || 'default';
      groupLabel = item.type || 'Other';
    } else {
      groupKey = 'default';
      groupLabel = '';
    }

    if (!groups.has(groupKey)) {
      groups.set(groupKey, []);
    }
    groups.get(groupKey)!.push(item);
  });

  return Array.from(groups.entries()).map(([groupKey, groupItems]) => ({
    groupKey,
    groupLabel: groupBy === 'date' ? groupItems[0] ?
      (typeof groupItems[0].timestamp === 'string' ?
        new Date(groupItems[0].timestamp) : groupItems[0].timestamp).toLocaleDateString() : groupKey
      : groupKey,
    items: groupItems.sort((a, b) => {
      const dateA = typeof a.timestamp === 'string' ? new Date(a.timestamp) : a.timestamp;
      const dateB = typeof b.timestamp === 'string' ? new Date(b.timestamp) : b.timestamp;
      return dateB.getTime() - dateA.getTime();
    })
  }));
};
