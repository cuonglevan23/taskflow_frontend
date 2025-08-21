"use client";

import React, { useState } from 'react';
import { TimelineGantt } from '@/components/TimelineGantt';

import { TaskConnection } from '@/components/TimelineGantt/hooks/useWorkflowConnection'; // ✅ Add import
import { ProjectTimelineProvider, useProjectTimeline } from './context/ProjectTimelineContext';
import { useProjectTimelineActions } from './hooks/useProjectTimelineActions';
import { useTheme } from '@/layouts/hooks/useTheme';
import { ViewMode, VIEW_MODES } from '@/components/features/Timeline/ZoomControls';

interface ProjectTimelinePageProps {
  searchValue?: string;
}

function ProjectTimelineContent({ searchValue = "" }: ProjectTimelinePageProps) {
  const { theme } = useTheme();
  const [viewMode, setViewMode] = useState<ViewMode>('resourceTimelineWeek');
  const [connections, setConnections] = useState<TaskConnection[]>([]);

  const {
    ganttTasks,
    tasksBySection,
    loading,
    error,
    projectName,
    handleTaskClick,
    handleSectionToggle,
    handleAddSection
  } = useProjectTimeline();

  // Create demo connections after ganttTasks are loaded  
  React.useEffect(() => {
    if (ganttTasks.length >= 3 && connections.length === 0) {
      const demoConnections: TaskConnection[] = [
        {
          id: 'demo-conn-1',
          fromTaskId: ganttTasks[0].id, // First task
          toTaskId: ganttTasks[1].id,   // Second task
          type: 'finish-to-start',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'demo-conn-2', 
          fromTaskId: ganttTasks[1].id, // Second task
          toTaskId: ganttTasks[2].id,   // Third task
          type: 'finish-to-start',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      
      console.log('🎯 Setting demo connections with real task IDs:', demoConnections);
      setConnections(demoConnections);
      console.log('📊 Demo connections set, should trigger TimelineGantt re-render');
    }
  }, [ganttTasks, connections.length]);

  const handleViewChange = (newView: ViewMode) => {
    setViewMode(newView);
  };

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
    <div className="h-screen flex flex-col" style={{ backgroundColor: theme.background.secondary }}>

      
      {/* Timeline Gantt - Full remaining height */}
      <div className="flex-1 min-h-0">
        <TimelineGantt
          key={`timeline-${connections.length}`} // ✅ Force re-render when connections change
          tasks={ganttTasks}
          tasksBySection={tasksBySection}
          onTaskClick={handleTaskClick}
          onSectionToggle={handleSectionToggle}
          enableWorkflow={true}
          initialConnections={connections} // ✅ Use actual connections state
          workflowConfig={{
            allowSelfConnection: false,
            allowCircularDependencies: false,
            maxConnectionsPerTask: 3,
            validateConnection: async (fromTask, toTask) => {
              // Business logic validation
              if (fromTask.priority === 'low' && toTask.priority === 'urgent') {
                return { valid: false, error: 'Cannot connect low priority task to urgent task' };
              }
              return { valid: true };
            }
          }}
          onConnectionCreate={async (connection) => {
            console.log('🎉 Connection handler called with:', connection);
            console.log('📊 Current connections before add:', connections.length);
            
            // ✅ Add to state immediately for UI update
            setConnections(prev => {
              const newConnections = [...prev, connection];
              console.log('📊 Connections after add:', newConnections.length);
              return newConnections;
            });
            
            // Here you would save to your API/database
            try {
              // await api.createTaskConnection(connection);
              console.log('✅ Connection saved to database');
            } catch (error) {
              console.error('❌ Failed to save connection:', error);
              // Rollback on API failure
              setConnections(prev => prev.filter(c => c.id !== connection.id));
            }
          }}
          onConnectionDelete={async (connectionId) => {
            console.log('🗑️ Connection deleted:', connectionId);
            // ✅ Remove from state immediately for UI update
            const deletedConnection = connections.find(c => c.id === connectionId);
            setConnections(prev => prev.filter(c => c.id !== connectionId));
            
            try {
              // await api.deleteTaskConnection(connectionId);
              console.log('✅ Connection deleted from database');
            } catch (error) {
              console.error('❌ Failed to delete connection:', error);
              // Rollback on API failure
              if (deletedConnection) {
                setConnections(prev => [...prev, deletedConnection]);
              }
            }
          }}
          onConnectionUpdate={async (connectionId, updates) => {
            console.log('📝 Connection updated:', connectionId, updates);
            // ✅ Update state immediately for UI update
            const originalConnection = connections.find(c => c.id === connectionId);
            setConnections(prev => prev.map(c => 
              c.id === connectionId 
                ? { ...c, ...updates, updatedAt: new Date() }
                : c
            ));
            
            try {
              // await api.updateTaskConnection(connectionId, updates);
              console.log('✅ Connection updated in database');
            } catch (error) {
              console.error('❌ Failed to update connection:', error);
              // Rollback on API failure
              if (originalConnection) {
                setConnections(prev => prev.map(c => 
                  c.id === connectionId ? originalConnection : c
                ));
              }
            }
          }}
          loading={loading}
          error={error}
          className="h-full"
          slotMinWidth={VIEW_MODES[viewMode].slotWidth}
          viewMode={viewMode}
          onViewModeChange={handleViewChange}
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