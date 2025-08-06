"use client";

import { useMemo } from 'react';
import { GanttTask, TimelineSection } from './TimelineGantt';

export interface TimelineEventsProps {
  tasks: GanttTask[];
  tasksBySection: Record<string, GanttTask[]>;
  sections: TimelineSection[];
}

export const useTimelineEvents = ({ tasks, tasksBySection, sections }: TimelineEventsProps) => {
  // Convert tasks to FullCalendar events
  const calendarEvents = useMemo(() => {
    const events: any[] = [];
    
    sections.forEach(section => {
      if (!section.collapsed && tasksBySection[section.id]) {
        tasksBySection[section.id].forEach(task => {
          // Get color based on task properties
          let backgroundColor = getTaskColor(task);
          
          events.push({
            id: task.id,
            resourceId: section.id,
            title: task.title,
            start: task.startDate,
            end: task.endDate,
            backgroundColor,
            borderColor: backgroundColor,
            textColor: '#FFFFFF',
            extendedProps: {
              task: task,
              priority: task.priority,
              assignees: task.assignees
            }
          });
        });
      }
    });
    
    return events;
  }, [tasks, tasksBySection, sections]);

  // Convert sections to FullCalendar resources
  const calendarResources = useMemo(() => {
    return sections.map(section => ({
      id: section.id,
      title: `${section.title} (${tasksBySection[section.id]?.length || 0})`,
      extendedProps: {
        collapsed: section.collapsed,
        taskCount: tasksBySection[section.id]?.length || 0
      }
    }));
  }, [sections, tasksBySection]);

  return { calendarEvents, calendarResources };
};

// Helper function to determine task color
const getTaskColor = (task: GanttTask): string => {
  // Priority-based colors
  switch (task.priority) {
    case 'urgent':
      return '#EF4444'; // Red
    case 'high':
      return '#F97316'; // Orange
    case 'medium':
      return '#3B82F6'; // Blue
    case 'low':
      return '#10B981'; // Green
    default:
      return '#06B6D4'; // Cyan
  }
};

// Status-based colors (alternative approach)
export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'todo':
      return '#6B7280'; // Gray
    case 'in_progress':
      return '#3B82F6'; // Blue
    case 'review':
      return '#F59E0B'; // Yellow
    case 'done':
      return '#10B981'; // Green
    case 'cancelled':
      return '#EF4444'; // Red
    default:
      return '#6B7280'; // Gray
  }
};

// Priority colors mapping
export const PRIORITY_COLORS = {
  urgent: '#EF4444',
  high: '#F97316',
  medium: '#3B82F6',
  low: '#10B981'
} as const;

// Status colors mapping
export const STATUS_COLORS = {
  todo: '#6B7280',
  in_progress: '#3B82F6',
  review: '#F59E0B',
  done: '#10B981',
  cancelled: '#EF4444'
} as const;