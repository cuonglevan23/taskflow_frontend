"use client";

import React, { useState, useCallback, useMemo } from 'react';
import TeamCalendar from './TeamCalendar';
import { ProjectNameFetcher } from './ProjectNameFetcher';
import { TaskListItem } from '@/components/TaskList/types';

interface CalendarTask {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  deadline?: string;
  dueDate?: string;
  color: string;
  assignee: string;
  assigneeName?: string;
  avatar: string;
  projectId?: number;
  projectName?: string;
  actualProjectName?: string;
  priority?: string;
  status?: string;
  description?: string;
  teamId?: string;
}

interface EnhancedTeamCalendarProps {
  tasks: CalendarTask[];
  teamId: string;
  teamName?: string;
  loading?: boolean;
  error?: string | null;
  height?: string;
  className?: string;
  onEventClick?: (task: CalendarTask) => void;
  onDateClick?: (dateStr: string) => void;
  onEventDrop?: (taskId: string, newDateStr: string) => void;
  onEventResize?: (taskId: string, newStartDate: string, newEndDate: string) => void;
  onTaskSave?: (taskId: string, updates: Partial<TaskListItem>) => void;
  onTaskDelete?: (taskId: string) => void;
  onTaskCreate?: (taskData: {
    name: string;
    description?: string;
    status?: string;
    startDate?: string;
    deadline?: string;
    priority?: string;
    assigneeId?: string;
  }) => void;
}

/**
 * Enhanced TeamCalendar that fetches and provides project names for tasks
 */
export const EnhancedTeamCalendar: React.FC<EnhancedTeamCalendarProps> = (props) => {
  // Store project names by ID
  const [projectNames, setProjectNames] = useState<Record<number, string>>({});
  
  // Extract unique project IDs from tasks
  const projectIds = useMemo(() => {
    const ids = new Set<number>();
    props.tasks?.forEach(task => {
      if (task.projectId) {
        ids.add(task.projectId);
      }
    });
    return Array.from(ids);
  }, [props.tasks]);
  
  // Callback when a project is fetched
  const handleProjectFetched = useCallback((projectId: number, projectName: string) => {
    setProjectNames(prev => ({
      ...prev,
      [projectId]: projectName
    }));
  }, []);
  
  // Enhance tasks with project names
  const enhancedTasks = useMemo(() => {
    return props.tasks.map(task => {
      // If we have the project name for this task's project ID, add it
      if (task.projectId && projectNames[task.projectId]) {
        return {
          ...task,
          actualProjectName: projectNames[task.projectId]
        };
      }
      return task;
    });
  }, [props.tasks, projectNames]);
  
  return (
    <>
      {/* Render ProjectNameFetcher components for each unique project ID */}
      {projectIds.map(projectId => (
        <ProjectNameFetcher
          key={projectId}
          projectId={projectId}
          onProjectFetched={handleProjectFetched}
        />
      ))}
      
      {/* Render the TeamCalendar with enhanced tasks */}
      <TeamCalendar
        {...props}
        tasks={enhancedTasks}
        error={props.error || undefined}
      />
    </>
  );
};
