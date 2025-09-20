"use client";

import React, { useCallback, useMemo } from 'react';
import { ProjectCalendar } from '@/components/Calendar';
import { TaskListItem } from '@/components/TaskList';
import { useProjectTaskList } from '@/hooks/tasks/useProjectTaskList';
import { useTheme } from '@/layouts/hooks/useTheme';

interface ProjectCalendarPageProps {
  searchValue?: string;
}

function ProjectCalendarContent({ searchValue = "" }: ProjectCalendarPageProps) {
  const { theme } = useTheme();

  // Use the same hook as project list for consistency
  const {
    taskListItems,
    loading,
    error,
    project,
    handleTaskCreate,
    handleTaskEdit,
    handleTaskDelete,
  } = useProjectTaskList();

  const projectId = project?.id;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const unused = searchValue; // Mark as used to avoid lint warnings

  // Convert TaskListItems to calendar format - keeping calendar-specific fields
  const calendarTasks = useMemo(() => {
    if (!taskListItems || !Array.isArray(taskListItems)) {
      return [];
    }

    return taskListItems.map(task => {
      // Color based on priority
      const getPriorityColor = (priority: string): string => {
        switch (priority?.toUpperCase()) {
          case 'CRITICAL': return '#EF4444'; // Red
          case 'HIGH': return '#F97316'; // Orange
          case 'MEDIUM': return '#3B82F6'; // Blue
          case 'LOW': return '#10B981'; // Green
          default: return '#6B7280'; // Gray
        }
      };

      // Format dates properly for calendar
      const formatDate = (dateStr?: string): Date | undefined => {
        if (!dateStr) return undefined;
        return new Date(dateStr);
      };

      // Ensure we have valid start and end dates
      let startDate = task.startDate ? formatDate(task.startDate) : undefined;
      let endDate = task.deadline ? formatDate(task.deadline) : undefined;

      // If only one date is provided, set the other to match for single-day events
      if (startDate && !endDate) {
        endDate = new Date(startDate);
      } else if (!startDate && endDate) {
        startDate = new Date(endDate);
      }

      // Build calendar task object - preserving all task data from useProjectTaskList
      const calendarTask = {
        ...task, // Include all TaskListItem fields (including proper assignees with avatar support)
        title: task.name, // Calendar expects 'title' but TaskListItem uses 'name'
        startDate: startDate,
        endDate: endDate,
        color: getPriorityColor(task.priority),
        projectId: projectId,
        projectName: project?.name || 'Project',
      };

      return calendarTask;
    });
  }, [taskListItems, projectId, project?.name]);

  // Project-specific calendar handlers using real API
  const handleEventClick = useCallback((task: TaskListItem) => {
    // This is handled by ProjectCalendar component internally
  }, []);

  const handleTaskCreateCalendar = useCallback(async (taskDataOrDateStr: any) => {
    try {
      if (!projectId) {
        console.error('No project ID available for task creation');
        return;
      }

      let taskData;

      // Check if it's a date string (from onDateClick) or task object (from onTaskCreate)
      if (typeof taskDataOrDateStr === 'string') {
        // Called from onDateClick with dateStr
        const dateStr = taskDataOrDateStr;

        taskData = {
          name: `New Task - ${dateStr}`,
          description: '',
          status: 'TODO',
          priority: 'MEDIUM',
          startDate: dateStr,
          deadline: dateStr, // Same day as start date for single-day task
        };
      } else {
        // Called from onTaskCreate with taskData object
        taskData = taskDataOrDateStr;

        // Ensure the task has both start and end dates
        if (taskData.startDate && !taskData.deadline) {
          taskData.deadline = taskData.startDate;
        } else if (!taskData.startDate && taskData.deadline) {
          taskData.startDate = taskData.deadline;
        } else if (!taskData.startDate && !taskData.deadline) {
          const today = new Date().toISOString().split('T')[0];
          taskData.startDate = today;
          taskData.deadline = today;
        }
      }

      // Use the hook's task creation function
      await handleTaskCreate(taskData);

    } catch (error) {
      console.error('❌ Failed to create project calendar task:', error);
      throw error;
    }
  }, [handleTaskCreate, projectId]);

  const handleEventDrop = useCallback(async (taskId: string, newDateStr: string) => {
    try {
      if (!taskId || taskId === 'undefined') {
        return;
      }

      // Find the task that was dropped
      const task = taskListItems.find(t => t.id.toString() === taskId);
      if (!task) {
        console.error('Task not found for drag and drop:', taskId);
        return;
      }

      // Calculate the original duration (days) between startDate and deadline
      let durationDays = 0;
      if (task.startDate && task.deadline) {
        const start = new Date(task.startDate);
        const end = new Date(task.deadline);
        durationDays = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      }

      // Calculate new deadline by adding the original duration to the new startDate
      const newStartDate = new Date(newDateStr);
      const newDeadline = new Date(newStartDate);
      newDeadline.setDate(newStartDate.getDate() + Math.max(0, durationDays));

      // Format as YYYY-MM-DD strings for API
      const formattedDeadline = newDeadline.toISOString().split('T')[0];

      // Create updated task object for handleTaskEdit
      const updatedTask = {
        ...task,
        startDate: newDateStr,
        deadline: formattedDeadline,
      };

      // Use handleTaskEdit from the hook
      await handleTaskEdit(updatedTask);

    } catch (error) {
      console.error('❌ Failed to drop project calendar task:', error);
    }
  }, [handleTaskEdit, taskListItems]);

  const handleEventResize = useCallback(async (taskId: string, newStartDate: string, newEndDate: string) => {
    try {
      if (!taskId || taskId === 'undefined') {
        return;
      }

      // Find the task being resized
      const task = taskListItems.find(t => t.id.toString() === taskId);
      if (!task) {
        console.error('Task not found for resize:', taskId);
        return;
      }

      // Validate dates
      if (!newStartDate || !newEndDate) {
        console.error('Invalid dates for task resize:', { taskId, newStartDate, newEndDate });
        return;
      }

      // Ensure newEndDate is not before newStartDate
      const startDate = new Date(newStartDate);
      const endDate = new Date(newEndDate);

      if (endDate < startDate) {
        console.error('End date cannot be before start date:', { taskId, newStartDate, newEndDate });
        newEndDate = newStartDate;
      }

      // Create updated task object for handleTaskEdit
      const updatedTask = {
        ...task,
        startDate: newStartDate,
        deadline: newEndDate,
      };

      // Use handleTaskEdit from the hook
      await handleTaskEdit(updatedTask);

    } catch (error) {
      console.error('❌ Failed to resize project calendar task:', error);
    }
  }, [handleTaskEdit, taskListItems]);

  return (
      <div className="h-full relative" style={{ backgroundColor: theme.background.secondary }}>
        {/* Using ProjectCalendar with unified data from useProjectTaskList */}
        <ProjectCalendar
            tasks={calendarTasks}
            projectId={projectId?.toString()}
            projectName={project?.name || 'Project'}
            loading={loading}
            error={error || undefined}
            height="calc(100vh - 80px)"

            // Project-specific handlers using real API
            onEventClick={handleEventClick}
            onDateClick={handleTaskCreateCalendar}
            onEventDrop={handleEventDrop}
            onEventResize={handleEventResize}
            onTaskCreate={handleTaskCreateCalendar}
            className="h-full"
        />
      </div>
  );
}

export default function ProjectCalendarPage({ searchValue }: ProjectCalendarPageProps) {
  return <ProjectCalendarContent searchValue={searchValue} />;
}