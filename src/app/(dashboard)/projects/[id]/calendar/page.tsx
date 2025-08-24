"use client";

import React, { useCallback, useMemo } from 'react';
import { ProjectCalendar } from '@/components/Calendar';
import { TaskListItem } from '@/components/TaskList';
import { useProjectTasksContext } from '../context/ProjectTasksProvider';
import { useProject } from '../components/DynamicProjectProvider';
import { useTheme } from '@/layouts/hooks/useTheme';
import type { UpdateProjectTaskRequest } from '@/services/tasks/projectTaskService';

interface ProjectCalendarPageProps {
  searchValue?: string;
}

function ProjectCalendarContent({ searchValue = "" }: ProjectCalendarPageProps) {
  const { theme } = useTheme();
  const { project } = useProject();
  const projectId = project?.id;
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const unused = searchValue; // Mark as used to avoid lint warnings
  
  // Use shared context instead of individual hooks
  const {
    tasks: projectTasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask
  } = useProjectTasksContext();

  // Convert API project tasks to calendar format
  const calendarTasks = useMemo(() => {
    if (!projectTasks || !Array.isArray(projectTasks)) {
      return [];
    }
    
    return projectTasks.map(task => {
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
      
      // Log task dates for debugging
      console.log('📅 Task dates for calendar:', {
        id: task.id,
        title: task.title,
        startDate: task.startDate,
        deadline: task.deadline,
        formattedStart: startDate?.toISOString().split('T')[0],
        formattedEnd: endDate?.toISOString().split('T')[0]
      });

      // Build calendar task object with properly formatted dates
      const calendarTask = {
        id: task.id.toString(),
        title: task.title,
        startDate: startDate,
        endDate: endDate,
        deadline: task.deadline,
        dueDate: task.deadline, // Add dueDate as alternative field
        color: getPriorityColor(task.priority),
        assignee: task.assigneeName || '',
        assigneeName: task.assigneeName || '',
        avatar: task.assigneeName ? task.assigneeName.split(' ').map(n => n[0]).join('').toUpperCase() : '',
        status: task.status,
        priority: task.priority,
        description: task.description || '',
        projectId: projectId,
        projectName: project?.name || 'Project',
      };
      
      return calendarTask;
    });
  }, [projectTasks, projectId, project?.name]);

  // Project-specific calendar handlers using real API
  const handleEventClick = useCallback((task: TaskListItem) => {
    console.log('Project calendar event clicked:', task);
    // Open task detail panel or modal
  }, []);

  interface TaskCreateData {
    name: string;
    description?: string;
    status?: string;
    priority?: string;
    startDate?: string;
    deadline?: string;
  }

  const handleTaskCreateCalendar = useCallback(async (taskDataOrDateStr: TaskCreateData | string) => {
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
        
        // Set deadline to same day as startDate for single-day event by default
        // Users can resize later if they want multi-day events
        const startDateStr = dateStr;
        const deadlineStr = dateStr; // Same day task by default
        
        console.log('📅 Creating new calendar task:', {
          startDate: startDateStr,
          deadline: deadlineStr,
          duration: '1 day (same day task)'
        });
        
        taskData = {
          name: `New Task - ${dateStr}`,
          description: '',
          status: 'TODO',
          priority: 'MEDIUM',
          startDate: startDateStr,
          deadline: deadlineStr, // Same day as start date
        };
      } else {
        // Called from onTaskCreate with taskData object
        taskData = taskDataOrDateStr;
        
        // Ensure the task has both start and end dates
        if (taskData.startDate && !taskData.deadline) {
          // If only startDate provided, set deadline to same day (single day task)
          taskData.deadline = taskData.startDate;
        } else if (!taskData.startDate && taskData.deadline) {
          // If only deadline provided, set startDate to same day (single day task)
          taskData.startDate = taskData.deadline;
        } else if (!taskData.startDate && !taskData.deadline) {
          // If neither provided, set both to today (single day task)
          const today = new Date();
          const todayStr = today.toISOString().split('T')[0];
          
          taskData.startDate = todayStr;
          taskData.deadline = todayStr;
        }
      }

      console.log('📝 Creating task with dates:', {
        startDate: taskData.startDate,
        deadline: taskData.deadline
      });

      const createTaskRequest = {
        title: taskData.name,
        description: taskData.description || '',
        projectId: projectId,
        status: taskData.status as 'TODO' | 'IN_PROGRESS' | 'DONE' | 'TESTING' | 'BLOCKED' | 'REVIEW' || 'TODO',
        priority: taskData.priority as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' || 'MEDIUM',
        startDate: taskData.startDate,
        deadline: taskData.deadline,
        progressPercentage: 0,
      };

      await createTask(createTaskRequest);
      

    } catch (error) {
      console.error('Failed to create project calendar task:', error);
    }
  }, [createTask, projectId]);

  const handleEventDrop = useCallback(async (taskId: string, newDateStr: string) => {
    try {
      if (!taskId || taskId === 'undefined') {
        return;
      }
      
      // Find the task that was dropped
      const task = projectTasks.find(t => t.id.toString() === taskId);
      if (!task) {
        console.error('Task not found for drag and drop:', taskId);
        return;
      }
      
      // Calculate the original duration (days) between startDate and deadline
      let durationDays = 0;
      if (task.startDate && task.deadline) {
        const start = new Date(task.startDate);
        const end = new Date(task.deadline);
        // Add 1 to include both start and end date (inclusive duration)
        durationDays = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      } else if (!task.startDate && task.deadline) {
        // If only deadline exists, use 0 days duration (single day task)
        durationDays = 0;
      } else if (task.startDate && !task.deadline) {
        // If only startDate exists, use 0 days duration (single day task)
        durationDays = 0;
      } else {
        // Neither exists (shouldn't happen), default to 0
        durationDays = 0;
      }
      
      // Calculate new deadline by adding the original duration to the new startDate
      const newStartDate = new Date(newDateStr);
      const newDeadline = new Date(newStartDate);
      // When adding days, ensure we add at least 0 (for same-day tasks)
      newDeadline.setDate(newStartDate.getDate() + Math.max(0, durationDays));
      
      // Format as YYYY-MM-DD strings for API
      const formattedDeadline = newDeadline.toISOString().split('T')[0];
      
      console.log('🔄 Dropped task:', {
        taskId,
        originalStartDate: task.startDate,
        originalDeadline: task.deadline,
        durationDays,
        newStartDate: newDateStr,
        newDeadline: formattedDeadline
      });
      
      // Update with new dates while preserving the duration
      await updateTask(Number(taskId), {
        startDate: newDateStr,
        deadline: formattedDeadline,
      });

    } catch (error) {
      console.error('❌ Failed to drop project calendar task:', error);
    }
  }, [updateTask, projectTasks]);

  const handleEventResize = useCallback(async (taskId: string, newStartDate: string, newEndDate: string) => {
    try {
      if (!taskId || taskId === 'undefined') {
        return;
      }
      
      // Find the task being resized
      const task = projectTasks.find(t => t.id.toString() === taskId);
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
        // Use start date as end date in this case
        newEndDate = newStartDate;
      }
      
      // Log the input values
      console.log('📏 Project calendar: Received resize event:', { 
        taskId, 
        newStartDate, 
        newEndDate,
        originalTask: task
      });
      
      // Make API call with exact dates received from FullCalendarView
      // FullCalendarView has already adjusted the endDate correctly
      const updateResult = await updateTask(Number(taskId), {
        startDate: newStartDate,
        deadline: newEndDate,
      });
      
      console.log('✅ Project calendar: Task updated with new dates:', {
        taskId,
        updatedTask: updateResult,
        newDates: {
          startDate: newStartDate,
          deadline: newEndDate
        }
      });

    } catch (error) {
      console.error('❌ Failed to resize project calendar task:', error);
    }
  }, [updateTask, projectTasks]);

  // These handlers are kept for future integration but not currently used in the UI
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleTaskSave = useCallback(async (taskId: string, updates: Partial<TaskListItem>) => {
    try {
      // Convert TaskListItem to UpdateProjectTaskRequest
      const taskUpdates: UpdateProjectTaskRequest = {
        title: updates.name, // TaskListItem uses 'name' instead of 'title'
        description: updates.description,
        // Convert UI component status to backend status
        status: updates.status === 'CANCELLED' ? 'BLOCKED' : updates.status as 'TODO' | 'IN_PROGRESS' | 'DONE' | 'TESTING' | 'BLOCKED' | 'REVIEW' | undefined,
        // Convert UI component priority to backend priority
        priority: updates.priority === 'URGENT' ? 'CRITICAL' : updates.priority as 'LOW' | 'MEDIUM' | 'HIGH' | undefined,
        // Handle date conversions (calendar component uses Date objects)
        startDate: updates.startDate, // Already in YYYY-MM-DD format
        deadline: updates.deadline || updates.endDate, // Use either one that's available
      };
      
      await updateTask(Number(taskId), taskUpdates);
      console.log('Project calendar task saved:', { taskId, updates });
    } catch (error) {
      console.error('Failed to save project calendar task:', error);
    }
  }, [updateTask]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleTaskDelete = useCallback(async (taskId: string) => {
    try {
      await deleteTask(Number(taskId));
      console.log('Project calendar task deleted:', taskId);
    } catch (error) {
      console.error('Failed to delete project calendar task:', error);
    }
  }, [deleteTask]);

  return (
    <div className="h-full relative" style={{ backgroundColor: theme.background.secondary }}>
      {/* Using ProjectCalendar with inherited FullCalendarView + TaskDetailPanel interface */}
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