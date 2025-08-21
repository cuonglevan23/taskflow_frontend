"use client";

import React, { useState, useCallback, useMemo } from 'react';
import { ProjectCalendar } from '@/components/Calendar';
import { TaskListItem } from '@/components/TaskList';
import { useProjectTasks, useCreateProjectTask, useUpdateProjectTask, useDeleteProjectTask } from '@/hooks/tasks/useProjectTasks';
import { useProject } from '../components/DynamicProjectProvider';
import { useTheme } from '@/layouts/hooks/useTheme';

interface ProjectCalendarPageProps {
  searchValue?: string;
}

function ProjectCalendarContent({ searchValue = "" }: ProjectCalendarPageProps) {
  const { theme } = useTheme();
  const { project } = useProject();
  const projectId = project?.id;
  
  // Use real API data
  const {
    tasks: projectTasks,
    loading,
    error
  } = useProjectTasks({ projectId: projectId, page: 0, size: 100 });

  // Import mutations from separate hooks
  const { trigger: createTask } = useCreateProjectTask();
  const { trigger: updateTask } = useUpdateProjectTask(); 
  const { trigger: deleteTask } = useDeleteProjectTask();

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

      // Convert dates
      const getTaskDate = (dateStr?: string): Date => {
        if (dateStr) {
          return new Date(dateStr);
        }
        return new Date(); // Default to today
      };

      const startDate = getTaskDate(task.startDate || task.deadline);
      const endDate = getTaskDate(task.deadline || task.startDate);

      const calendarTask = {
        id: task.id.toString(),
        title: task.title,
        startDate,
        endDate,
        color: getPriorityColor(task.priority),
        assignee: task.assigneeName || '',
        avatar: task.assigneeName ? task.assigneeName.split(' ').map(n => n[0]).join('').toUpperCase() : '',
      };
      
      return calendarTask;
    });
  }, [projectTasks]);

  // Project-specific calendar handlers using real API
  const handleEventClick = useCallback((task: any) => {
    console.log('Project calendar event clicked:', task);
    // Open task detail panel or modal
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
          deadline: dateStr,
        };
      } else {
        // Called from onTaskCreate with taskData object
        taskData = taskDataOrDateStr;
      }

      const createTaskRequest = {
        title: taskData.name,
        description: taskData.description || '',
        projectId: projectId,
        status: (taskData.status as any) || 'TODO',
        priority: (taskData.priority as any) || 'MEDIUM',
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
      
      await updateTask(Number(taskId), {
        deadline: newDateStr,
        startDate: newDateStr,
      });

    } catch (error) {
      console.error('❌ Failed to drop project calendar task:', error);
    }
  }, [updateTask]);

  const handleEventResize = useCallback(async (taskId: string, newStartDate: string, newEndDate: string) => {
    try {
      if (!taskId || taskId === 'undefined') {
        return;
      }
      
      await updateTask(Number(taskId), {
        startDate: newStartDate,
        deadline: newEndDate,
      });

    } catch (error) {
      console.error('❌ Failed to resize project calendar task:', error);
    }
  }, [updateTask]);

  const handleTaskSave = useCallback(async (taskId: string, updates: Partial<TaskListItem>) => {
    try {
      await updateTask?.(taskId, updates);
      console.log('Project calendar task saved:', { taskId, updates });
    } catch (error) {
      console.error('Failed to save project calendar task:', error);
    }
  }, [updateTask]);

  const handleTaskDelete = useCallback(async (taskId: string) => {
    try {
      await deleteTask?.(taskId);
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
        projectId={projectId}
        projectName={project?.name || 'Project'}
        loading={loading}
        error={error?.message || null}
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