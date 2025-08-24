"use client";

import React, { useCallback, useMemo } from 'react';
import { useParams } from "next/navigation";
import { EnhancedTeamCalendar } from '@/components/Calendar';
import { DARK_THEME } from "@/constants/theme";
import { useTeamAllTasks } from '@/hooks/tasks/useTasksData';
import { useTeam } from '@/hooks/useTeam';

// Define type for calendar task
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
  actualProjectName?: string; // Added field for the actual project name
  priority?: string;
  status?: string;
  description?: string;
  teamId?: string;
}

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

  // Convert task data to calendar-friendly format
  const tasks = useMemo(() => {
    // Debug full task data structure
    if (rawTasks?.length) {
      console.log('📊 Raw Team Tasks Data (sample):', rawTasks[0]);
    }
    
    if (!rawTasks?.length) return [];
    
    return rawTasks.map(task => {
      let startDate = new Date();
      let endDate = new Date();
      
      // Parse start date if available
      if (task.startDate) {
        startDate = new Date(task.startDate);
      } else {
        // Default to today if no start date
        startDate = new Date();
      }
      
      // Parse deadline if available
      if (task.deadline) {
        endDate = new Date(task.deadline);
        // because FullCalendar uses exclusive end dates
        endDate.setDate(endDate.getDate() + 1); 
      } else {
        // If no deadline, make it at least a 1-day event
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 1);
      }
      
      // Log the processed dates
      console.log('📅 Team calendar processed dates:', {
        id: task.id,
        title: task.title,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        rawStartDate: task.startDate,
        rawDeadline: task.deadline,
        project: task.project?.name || "Unknown", // Log project info to debug
        projectId: task.projectId,
        projectName: task.projectName
      });
      
      // Get actual project name from task data
      const actualProjectName = task.project?.name || null;
      
      // Create the calendar task with all required properties
      return {
        id: task.id?.toString() || '',
        title: task.title || 'Untitled Task',
        startDate: startDate,
        endDate: endDate,
        // Make sure these properties are present for FullCalendarView
        deadline: task.deadline, 
        dueDate: task.deadline, // Add dueDate as alternative field
        color: task.priority === 'HIGH' ? '#EF4444' : 
               task.priority === 'MEDIUM' ? '#F97316' : 
               task.priority === 'LOW' ? '#10B981' : '#6B7280',
        assignee: task.creatorId ? `User ${task.creatorId}` : 'Unassigned',
        assigneeName: task.assigneeName || task.creatorId ? `User ${task.creatorId}` : 'Unassigned',
        avatar: task.creatorId ? `U${task.creatorId}` : 'UA',
        projectId: task.projectId, // Include projectId for context
        projectName: task.project?.name || task.projectName || `Project ${task.projectId}`, // Try both project.name and projectName
        actualProjectName: actualProjectName, // Store the actual project name separately
        priority: task.priority,
        status: task.status,
        description: task.description || '',
        teamId: teamId.toString(), // Include teamId for context
      };
    });
  }, [rawTasks, teamId]);

  // Team calendar handlers - view-only mode
  const handleEventClick = useCallback((task: CalendarTask) => {
    // Just log the click event - the TeamCalendar component will handle showing the detail panel
    console.log('Team calendar task clicked:', {
      id: task.id,
      title: task.title,
      projectId: task.projectId,
      projectName: task.projectName,
      actualProjectName: task.actualProjectName // Log the actual project name
    });
    
    // Do not navigate to project page
    // TeamCalendar component already handles showing the detail panel
  }, []);

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
      <EnhancedTeamCalendar
        tasks={tasks}
        teamId={teamId.toString()}
        teamName={team?.name || `Team ${teamId}`}
        loading={isLoading}
        error={error?.message || null}
        height="calc(100vh - 80px)"
        
        // View-only mode: only allow viewing, no interactions
        onEventClick={handleEventClick}
        // Disable all editing features
        onDateClick={undefined}
        onEventDrop={undefined}
        onEventResize={undefined}
        onTaskCreate={undefined}
        onTaskSave={undefined}
        onTaskDelete={undefined}
        className="h-full"
      />
    </div>
  );
});

TeamCalendarPage.displayName = 'TeamCalendarPage';

export default TeamCalendarPage;
