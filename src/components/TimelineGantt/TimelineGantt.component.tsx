/**
 * Timeline Gantt Component - Refactored for better maintainability
 * This is the new modular version that replaces the original TimelineGantt.tsx
 */

"use client";

import React, { useState } from 'react';
import { useTheme } from '@/layouts/hooks/useTheme';
import { useTimelineEvents } from './TimelineEvents';
import WorkflowConnectionManager from './components/WorkflowConnectionManager';
import { WorkflowConnectionConfig, TaskConnection } from './hooks/useWorkflowConnection';

// Import refactored components and types
import { TimelineGanttProps, ViewMode as TimelineViewMode } from './types/timeline.types';
import { useTimelineData } from './hooks/useTimelineData';
import TimelineHeader from './components/TimelineHeader';
import TimelineGrid from './components/TimelineGrid';

const TimelineGantt: React.FC<TimelineGanttProps> = ({
  tasks,
  tasksBySection,
  onTaskClick,
  onTaskMove,
  onSectionToggle,
  enableWorkflow = false,
  initialConnections = [],
  workflowConfig,
  onConnectionCreate,
  onConnectionDelete,
  onConnectionUpdate,
  loading = false,
  height = '600px',
  className = ''
}) => {
  const { theme } = useTheme();
  const [currentView, setCurrentView] = useState<TimelineViewMode>('month');
  const [currentDate, setCurrentDate] = useState(new Date());

  // Use refactored timeline data hook
  const {
    calendarEvents,
    calendarResources,
    connections,
    toggleSection,
    addConnection,
    removeConnection,
    updateConnection,
    getTaskById
  } = useTimelineData({
    tasks,
    tasksBySection,
    initialConnections
  });

  // Use existing timeline events hook for compatibility
  const { events, resources } = useTimelineEvents({
    tasks,
    tasksBySection,
    sections: Object.keys(tasksBySection).map(id => ({
      id,
      title: id,
      collapsed: false
    }))
  });

  // Navigation handlers
  const handlePrevious = () => {
    const newDate = new Date(currentDate);
    switch (currentView) {
      case 'day':
        newDate.setDate(newDate.getDate() - 1);
        break;
      case 'week':
        newDate.setDate(newDate.getDate() - 7);
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() - 1);
        break;
      case 'year':
        newDate.setFullYear(newDate.getFullYear() - 1);
        break;
    }
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    switch (currentView) {
      case 'day':
        newDate.setDate(newDate.getDate() + 1);
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + 7);
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() + 1);
        break;
      case 'year':
        newDate.setFullYear(newDate.getFullYear() + 1);
        break;
    }
    setCurrentDate(newDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleViewChange = (newView: TimelineViewMode) => {
    setCurrentView(newView);
  };

  // Format title based on current view and date
  const formatTitle = (): string => {
    const options: Intl.DateTimeFormatOptions = {};
    
    switch (currentView) {
      case 'day':
        options.weekday = 'long';
        options.year = 'numeric';
        options.month = 'long';
        options.day = 'numeric';
        break;
      case 'week':
        const weekStart = new Date(currentDate);
        weekStart.setDate(currentDate.getDate() - currentDate.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return `${weekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()}`;
      case 'month':
        options.year = 'numeric';
        options.month = 'long';
        break;
      case 'year':
        options.year = 'numeric';
        break;
    }
    
    return currentDate.toLocaleDateString(undefined, options);
  };

  // Handle workflow connections
  const handleConnectionCreate = async (connection: TaskConnection) => {
    addConnection(connection);
    if (onConnectionCreate) {
      await onConnectionCreate(connection);
    }
  };

  const handleConnectionDelete = async (connectionId: string) => {
    removeConnection(connectionId);
    if (onConnectionDelete) {
      await onConnectionDelete(connectionId);
    }
  };

  const handleConnectionUpdate = async (connectionId: string, updates: Partial<TaskConnection>) => {
    updateConnection(connectionId, updates);
    if (onConnectionUpdate) {
      await onConnectionUpdate(connectionId, updates);
    }
  };

  // Handle section toggle
  const handleSectionToggle = (sectionId: string) => {
    toggleSection(sectionId);
    if (onSectionToggle) {
      onSectionToggle(sectionId);
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ height }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading timeline...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`timeline-gantt-container ${className}`}>
      {/* Refactored Header */}
      <TimelineHeader
        currentView={currentView}
        onViewChange={handleViewChange}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onToday={handleToday}
        title={formatTitle()}
        loading={loading}
      />

      {/* Refactored Timeline Grid */}
      <TimelineGrid
        events={events}
        resources={resources}
        viewMode={currentView}
        onTaskClick={onTaskClick}
        onTaskMove={onTaskMove}
        height={`calc(${height} - 60px)`}
        loading={loading}
      />

      {/* Workflow Connection Manager */}
      {enableWorkflow && (
        <WorkflowConnectionManager
          tasks={tasks}
          connections={connections}
          config={workflowConfig}
          onConnectionCreate={handleConnectionCreate}
          onConnectionDelete={handleConnectionDelete}
          onConnectionUpdate={handleConnectionUpdate}
        />
      )}

      {/* Global Styling */}
      <style jsx global>{`
        .timeline-gantt-container {
          background: ${theme === 'dark' ? '#1f2937' : '#ffffff'};
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
        }
      `}</style>
    </div>
  );
};

export default TimelineGantt;