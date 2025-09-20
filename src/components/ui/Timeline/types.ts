// Timeline Types - All interfaces and types for Timeline components
export interface TimelineItem<T = Record<string, unknown>> {
  id: string;
  title: string;
  description?: string;
  timestamp: Date | string;
  type?: string;
  status?: 'success' | 'warning' | 'error' | 'info' | 'pending';
  icon?: React.ReactNode;
  color?: string;
  metadata?: T; // Generic metadata for additional data
}

// Timeline configuration options
export interface TimelineConfig {
  showTime?: boolean;
  showDate?: boolean;
  dateFormat?: 'relative' | 'absolute' | 'custom';
  orientation?: 'vertical' | 'horizontal';
  dotSize?: 'sm' | 'md' | 'lg';
  lineStyle?: 'solid' | 'dashed' | 'dotted';
  animated?: boolean;
  groupBy?: 'date' | 'type' | 'none';
  customDateFormatter?: (date: Date) => string;
}

// Timeline group interface for grouped items
export interface TimelineGroup<T = Record<string, unknown>> {
  groupKey: string;
  groupLabel: string;
  items: TimelineItem<T>[];
}

// Props for timeline component
export interface TimelineProps<T = Record<string, unknown>> {
  items: TimelineItem<T>[];
  config?: TimelineConfig;
  className?: string;
  onItemClick?: (item: TimelineItem<T>) => void;
  onItemHover?: (item: TimelineItem<T>) => void;
  renderCustomContent?: (item: TimelineItem<T>) => React.ReactNode;
  renderCustomIcon?: (item: TimelineItem<T>) => React.ReactNode;
  renderCustomTimestamp?: (item: TimelineItem<T>) => React.ReactNode;
  emptyMessage?: string;
  loading?: boolean;
}

// Timeline dot props
export interface TimelineDotProps<T> {
  item: TimelineItem<T>;
  config: TimelineConfig;
  renderCustomIcon?: (item: TimelineItem<T>) => React.ReactNode;
}

// Timeline item component props
export interface TimelineItemComponentProps<T> {
  item: TimelineItem<T>;
  config: TimelineConfig;
  isLast: boolean;
  onItemClick?: (item: TimelineItem<T>) => void;
  onItemHover?: (item: TimelineItem<T>) => void;
  renderCustomContent?: (item: TimelineItem<T>) => React.ReactNode;
  renderCustomIcon?: (item: TimelineItem<T>) => React.ReactNode;
  renderCustomTimestamp?: (item: TimelineItem<T>) => React.ReactNode;
}

// Loading skeleton props
export interface TimelineLoadingSkeletonProps {
  count?: number;
}
