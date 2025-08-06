"use client";

import React from 'react';
import { SimpleCalendar } from '@/components/Calendar';
import { ProjectCalendarProvider, useProjectCalendar } from './context/ProjectCalendarContext';
import { useProjectCalendarActions } from './hooks/useProjectCalendarActions';
import { useTheme } from '@/layouts/hooks/useTheme';

interface ProjectCalendarPageProps {
  searchValue?: string;
}

function ProjectCalendarContent({ searchValue = "" }: ProjectCalendarPageProps) {
  const { theme } = useTheme();
  const {
    calendarTasks,
    loading,
    error,
    projectName,
    handleTaskClick,
    handleTaskDrop,
    handleDateClick,
    handleCreateTask
  } = useProjectCalendar();

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 text-lg font-medium mb-2">
            {error}
          </div>
          <p className="text-gray-600">
            Please try refreshing the page.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-current"></div>
          <span style={{ color: theme.text.secondary }}>Loading calendar...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full relative" style={{ backgroundColor: theme.background.secondary }}>
      {/* Simple Calendar */}
      <div className="h-full">
        <SimpleCalendar
          height="100vh"
          initialTasks={calendarTasks}
          onTaskClick={handleTaskClick}
          onTaskDrop={handleTaskDrop}
          onDateClick={handleDateClick}
          onCreateTask={handleCreateTask}
          userRole="member"
          showCreateButton={true}
          showImportExport={false}
          showSettings={false}
          showFilters={true}
          simpleHeader={false}
        />
      </div>
    </div>
  );
}

export default function ProjectCalendarPage({ searchValue }: ProjectCalendarPageProps) {
  return (
    <ProjectCalendarProvider>
      <ProjectCalendarContent searchValue={searchValue} />
    </ProjectCalendarProvider>
  );
}