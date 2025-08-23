"use client";

import React, { useCallback, useMemo } from 'react';
import { useParams } from "next/navigation";
import { TeamCalendar } from '@/components/Calendar';
import { DARK_THEME } from "@/constants/theme";
import { useTeamAllTasks } from '@/hooks/tasks/useTasksData';
import { useTeam } from '@/hooks/useTeam';

const TeamCalendarPage = React.memo(() => {
  const params = useParams();
  const teamId = useMemo(() => {
    const id = params.id as string;
    return parseInt(id, 10);
  }, [params.id]);

  // Fetch team data for context
  const { team } = useTeam(teamId);

  // Fetch all tasks from all projects of the team
  const { 
    tasks: rawTasks, 
    isLoading, 
    error, 
    revalidate 
  } = useTeamAllTasks(teamId);

  // Transform backend task data to calendar format
  const tasks = useMemo(() => {
    return rawTasks.map(task => ({
      id: task.id?.toString() || '',
      title: task.title || 'Untitled Task',
      startDate: task.startDate ? new Date(task.startDate) : new Date(),
      endDate: task.deadline ? new Date(task.deadline) : new Date(Date.now() + 60 * 60 * 1000),
      color: task.priority === 'HIGH' ? '#EF4444' : 
             task.priority === 'MEDIUM' ? '#F97316' : 
             task.priority === 'LOW' ? '#10B981' : '#6B7280',
      assignee: task.creatorId ? `User ${task.creatorId}` : 'Unassigned',
      avatar: task.creatorId ? `U${task.creatorId}` : 'UA',
    }));
  }, [rawTasks]);

  // Team calendar handlers with real data integration
  const handleEventClick = useCallback((task: any) => {
    // Open task details - navigate to project with task focus
    if (task.id && task.projectId) {
      window.location.href = `/projects/${task.projectId}?taskId=${task.id}`;
    }
  }, []);

  const handleDateClick = useCallback((dateStr: string) => {
    // TODO: Open create task modal for this date and team
    console.log('Create task for team on date:', { teamId, dateStr });
  }, [teamId]);

  const handleEventDrop = useCallback(async (taskId: string, newDateStr: string) => {
    try {
      // TODO: Update task date via tasksService
      console.log('Moving team task:', { taskId, newDateStr });
      
      // Optimistic update would be handled by SWR mutation
      // For now, revalidate to get fresh data
      await revalidate();
    } catch (error) {
      console.error('Failed to move team task:', error);
    }
  }, [revalidate]);

  const handleEventResize = useCallback(async (taskId: string, newStartDate: string, newEndDate: string) => {
    try {
      // TODO: Update task dates via tasksService
      console.log('Resizing team task:', { taskId, newStartDate, newEndDate });
      
      // Revalidate to get fresh data
      await revalidate();
    } catch (error) {
      console.error('Failed to resize team task:', error);
    }
  }, [revalidate]);

  const handleTaskCreate = useCallback(async (taskData: any) => {
    try {
      // TODO: Create task via tasksService
      console.log('Creating team task:', taskData);
      
      // After creation, revalidate to get fresh data
      await revalidate();
    } catch (error) {
      console.error('Failed to create team task:', error);
    }
  }, [revalidate]);

  const handleTaskSave = useCallback(async (taskId: string, updates: any) => {
    try {
      // TODO: Save task via tasksService
      console.log('Saving team task:', { taskId, updates });
      
      // Revalidate to get fresh data
      await revalidate();
    } catch (error) {
      console.error('Failed to save team task:', error);
    }
  }, [revalidate]);

  const handleTaskDelete = useCallback(async (taskId: string) => {
    try {
      // TODO: Delete task via tasksService
      console.log('Deleting team task:', taskId);
      
      // Revalidate to get fresh data
      await revalidate();
    } catch (error) {
      console.error('Failed to delete team task:', error);
    }
  }, [revalidate]);

  // Handle error state
  if (error) {
    return (
      <div 
        className="h-screen flex items-center justify-center"
        style={{ backgroundColor: DARK_THEME.background.primary }}
      >
        <div className="text-center">
          <p className="text-red-400 mb-4">Failed to load team tasks: {error.message}</p>
          <button 
            onClick={() => revalidate()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="h-screen"
      style={{ backgroundColor: DARK_THEME.background.primary }}
    >
      <TeamCalendar
        tasks={tasks}
        teamId={teamId.toString()}
        teamName={team?.name || `Team ${teamId}`}
        loading={isLoading}
        error={error?.message || null}
        height="calc(100vh - 80px)"
        
        // Team-specific handlers with real data integration
        onEventClick={handleEventClick}
        onDateClick={handleDateClick}
        onEventDrop={handleEventDrop}
        onEventResize={handleEventResize}
        onTaskCreate={handleTaskCreate}
        onTaskSave={handleTaskSave}
        onTaskDelete={handleTaskDelete}
        className="h-full"
      />
    </div>
  );
});

TeamCalendarPage.displayName = 'TeamCalendarPage';

export default TeamCalendarPage;