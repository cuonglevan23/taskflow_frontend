"use client";

import React from 'react';
import { Timeline } from '@/components/Timeline';
import { TaskListHeader } from '@/components/TaskList';
import { ProjectTimelineProvider, useProjectTimeline } from './context/ProjectTimelineContext';
import { useProjectTimelineActions } from './hooks/useProjectTimelineActions';
import { useTheme } from '@/layouts/hooks/useTheme';

interface ProjectTimelinePageProps {
  searchValue?: string;
}

function ProjectTimelineContent({ searchValue = "" }: ProjectTimelinePageProps) {
  const { theme } = useTheme();
  const {
    timelineTasks,
    loading,
    error,
    projectName,
    handleTaskClick,
    handleTaskUpdate,
    viewMode,
    setViewMode
  } = useProjectTimeline();

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
          <span style={{ color: theme.text.secondary }}>Loading timeline...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full relative" style={{ backgroundColor: theme.background.secondary }}>
      {/* Task List Header */}
      <TaskListHeader
        searchValue={searchValue}
        onSearchChange={() => {}}
        onCreateTask={() => {}}
        showSearch={true}
        showFilters={true}
        showSort={true}
        showGroup={true}
        showOptions={true}
      />
      
      {/* Timeline */}
      <div className="h-[calc(100%-80px)]">
        <Timeline
          tasks={timelineTasks}
          onTaskClick={handleTaskClick}
          onTaskUpdate={handleTaskUpdate}
          loading={loading}
          error={error}
          viewMode={viewMode}
          className="h-full"
        />
      </div>
    </div>
  );
}

export default function ProjectTimelinePage({ searchValue }: ProjectTimelinePageProps) {
  return (
    <ProjectTimelineProvider>
      <ProjectTimelineContent searchValue={searchValue} />
    </ProjectTimelineProvider>
  );
}