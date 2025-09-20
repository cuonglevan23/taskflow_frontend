import React, { useState, useEffect, useCallback } from 'react';
import { projectTimelineService } from '@/services/projects';
import type { ProjectTimelineEvent, ProjectTimelineData } from '@/services/projects/projectTimelineService';
import type { TimelineItemType } from '@/components/ui/Timeline';
import { useProject } from '@/app/(dashboard)/projects/[id]/components/DynamicProjectProvider';

// Transform project timeline events to Timeline component format
const transformToTimelineItems = (events: ProjectTimelineEvent[]): TimelineItemType<ProjectTimelineEvent>[] => {
  return events.map(event => ({
    id: event.id,
    title: event.eventDescription,
    description: event.oldValue && event.newValue
      ? `Changed from "${event.oldValue}" to "${event.newValue}"`
      : undefined,
    timestamp: event.createdAt,
    status: event.isImportant ? 'warning' : 'info',
    type: event.eventType,
    icon: event.eventIcon, // Pass the raw icon (component reference or JSX)
    color: event.eventColor,
    metadata: event
  }));
};

export interface UseProjectTimelineReturn {
  // Data
  timelineData: ProjectTimelineEvent[];
  timelineItems: TimelineItemType<ProjectTimelineEvent>[];
  project: any;

  // UI State
  loading: boolean;
  error: string | null;
  showAll: boolean;

  // Computed values
  itemsToShow: TimelineItemType<ProjectTimelineEvent>[];
  hasMoreItems: boolean;

  // Actions
  setShowAll: (show: boolean) => void;
  refreshTimeline: () => Promise<void>;
  handleTimelineItemClick: (item: TimelineItemType<ProjectTimelineEvent>) => void;
}

export function useProjectTimeline(): UseProjectTimelineReturn {
  const { project } = useProject();

  // State
  const [timelineData, setTimelineData] = useState<ProjectTimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  // Load timeline data
  const loadTimeline = useCallback(async () => {
    if (!project?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const timeline: ProjectTimelineData = await projectTimelineService.getProjectTimeline(project.id);
      setTimelineData(timeline.events);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load project timeline';
      setError(errorMessage);
      console.error('Failed to load project timeline:', err);
    } finally {
      setLoading(false);
    }
  }, [project?.id]);

  // Refresh timeline - exposed for manual refresh
  const refreshTimeline = useCallback(async () => {
    await loadTimeline();
  }, [loadTimeline]);

  // Load timeline when project changes
  useEffect(() => {
    loadTimeline();
  }, [loadTimeline]);

  // Handle timeline item click
  const handleTimelineItemClick = useCallback((item: TimelineItemType<ProjectTimelineEvent>) => {
    console.log('Timeline item clicked:', item.metadata);
    // Could emit events or call callbacks passed as props
    // For now, just log - this can be extended with callbacks
  }, []);

  // Transform timeline data to UI format
  const timelineItems = transformToTimelineItems(timelineData);

  // Determine items to show based on showAll state
  const itemsToShow = showAll ? timelineItems : timelineItems.slice(0, 5);
  const hasMoreItems = timelineData.length > 5;

  return {
    // Data
    timelineData,
    timelineItems,
    project,

    // UI State
    loading,
    error,
    showAll,

    // Computed values
    itemsToShow,
    hasMoreItems,

    // Actions
    setShowAll,
    refreshTimeline,
    handleTimelineItemClick,
  };
}
