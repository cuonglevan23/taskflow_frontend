"use client";

import React, { useState, useRef, useMemo } from 'react';
import { useTheme } from '@/layouts/hooks/useTheme';
import FullCalendar from '@fullcalendar/react';
import CalendarHeader from '@/components/Calendar/CalendarHeader';
import { useTimelineEvents } from './TimelineEvents';
import { createCalendarOptions, createEventContent } from './timelineConfig';
import { ViewMode } from '@/components/Timeline/ZoomControls';
import WorkflowConnectionManager from './components/WorkflowConnectionManager';
import { WorkflowConnectionConfig, TaskConnection } from './hooks/useWorkflowConnection';
import { createReactEventContent } from './components/TaskEventContent_new';


export interface GanttTask {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in_progress' | 'review' | 'done' | 'cancelled';
  assignees: {
    id: string;
    name: string;
    avatar?: string;
  }[];
  section: string;
  dependencies?: string[]; // Array of task IDs this task depends on
}

export interface TimelineSection {
  id: string;
  title: string;
  collapsed: boolean;
}

export interface TimelineGanttProps {
  tasks: GanttTask[];
  tasksBySection: Record<string, GanttTask[]>;
  onTaskClick?: (task: GanttTask) => void;
  onTaskMove?: (taskId: string, newStartDate: Date, newEndDate: Date) => void;
  onSectionToggle?: (sectionId: string) => void;
  // Workflow system props
  enableWorkflow?: boolean;
  initialConnections?: TaskConnection[];
  workflowConfig?: WorkflowConnectionConfig;
  onConnectionCreate?: (connection: TaskConnection) => Promise<void>;
  onConnectionDelete?: (connectionId: string) => Promise<void>;
  onConnectionUpdate?: (connectionId: string, updates: Partial<TaskConnection>) => Promise<void>;
  loading?: boolean;
  error?: string | null;
  className?: string;
  slotMinWidth?: number;
  viewMode?: ViewMode;
  onViewModeChange?: (viewMode: ViewMode) => void;
}

// Default sections configuration - To do first and larger
const DEFAULT_SECTIONS: TimelineSection[] = [
  { id: 'todo', title: 'To do', collapsed: false },
  { id: 'in_progress', title: 'Doing', collapsed: false },
  { id: 'done', title: 'Done', collapsed: false },
  { id: 'later', title: 'Do later', collapsed: false }
];

const TimelineGantt: React.FC<TimelineGanttProps> = ({
  tasks,
  tasksBySection,
  onTaskClick,
  onTaskMove,
  onSectionToggle,
  enableWorkflow = true,
  initialConnections = [],
  workflowConfig = {},
  onConnectionCreate,
  onConnectionDelete,
  onConnectionUpdate,
  loading = false,
  error,
  className = '',
  slotMinWidth = 80,
  viewMode = 'resourceTimelineWeek',
  onViewModeChange
}) => {
  const { theme } = useTheme();
  const calendarRef = useRef<FullCalendar>(null);
  const timelineContainerRef = useRef<HTMLDivElement>(null);
  const connectionManagerRef = useRef<any>(null); // ✅ Store connectionManager reference
  const [currentDate, setCurrentDate] = useState(new Date(2025, 6, 1));
  const [sections, setSections] = useState<TimelineSection[]>(DEFAULT_SECTIONS);



  // Professional workflow configuration
  const professionalWorkflowConfig: WorkflowConnectionConfig = useMemo(() => ({
    allowSelfConnection: false,
    allowCircularDependencies: false,
    maxConnectionsPerTask: 5,
    validateConnection: async (fromTask, toTask) => {
      // Custom validation logic
      if (fromTask.section === toTask.section && fromTask.section === 'done') {
        return { valid: false, error: 'Cannot connect tasks within Done section' };
      }
      return { valid: true };
    },
    onConnectionCreate: async (connection) => {
      console.log('Creating connection:', connection);
      await onConnectionCreate?.(connection);
    },
    onConnectionDelete: async (connectionId) => {
      console.log('Deleting connection:', connectionId);
      await onConnectionDelete?.(connectionId);
    },
    onConnectionUpdate: async (connectionId, updates) => {
      console.log('Updating connection:', connectionId, updates);
      await onConnectionUpdate?.(connectionId, updates);
    },
    ...workflowConfig
  }), [workflowConfig, onConnectionCreate, onConnectionDelete, onConnectionUpdate]);

  // Generate events and resources
  const { calendarEvents, calendarResources } = useTimelineEvents({
    tasks,
    tasksBySection,
    sections
  });

  // Handlers
  const handleSectionToggle = (sectionId: string) => {
    setSections(prev => prev.map(section => 
      section.id === sectionId 
        ? { ...section, collapsed: !section.collapsed }
        : section
    ));
    onSectionToggle?.(sectionId);
  };

  const handleNavigation = (direction: 'prev' | 'next' | 'today') => {
    const calendarApi = calendarRef.current?.getApi();
    if (!calendarApi) return;

    switch (direction) {
      case 'prev':
        setCurrentDate(prev => {
          const newDate = new Date(prev);
          newDate.setMonth(newDate.getMonth() - 1);
          return newDate;
        });
        calendarApi.prev();
        break;
      case 'next':
        setCurrentDate(prev => {
          const newDate = new Date(prev);
          newDate.setMonth(newDate.getMonth() + 1);
          return newDate;
        });
        calendarApi.next();
        break;
      case 'today':
        setCurrentDate(new Date());
        calendarApi.today();
        break;
    }


  };

  // Event handlers for FullCalendar
  const handleEventClick = (info: any) => {
    const task = info.event.extendedProps.task;
    if (task) {
      onTaskClick?.(task);
    }
  };

  const handleEventDrop = (info: any) => {
    const task = info.event.extendedProps.task;
    if (task && onTaskMove) {
      onTaskMove(task.id, info.event.start!, info.event.end!);
    }
  };

  const handleEventResize = (info: any) => {
    const task = info.event.extendedProps.task;
    if (task && onTaskMove) {
      onTaskMove(task.id, info.event.start!, info.event.end!);
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`} style={{ backgroundColor: theme.background.primary }}>
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-current"></div>
          <span style={{ color: theme.text.secondary }}>Loading timeline...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`} style={{ backgroundColor: theme.background.primary }}>
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-medium mb-2" style={{ color: theme.text.primary }}>Something went wrong</h3>
          <p style={{ color: theme.text.secondary }}>{error}</p>
        </div>
      </div>
    );
  }



  // React-based event content factory  
  const createReactBasedEventContent = (connectionManager: any) => {
    return createReactEventContent(
      enableWorkflow,
      connectionManager.isConnecting,
      connectionManager.connectingFromTaskId,
      connectionManager.onConnectionClick
    );
  };



  // Navigation handlers updated for workflow
  const handleCalendarNavigation = (direction: 'prev' | 'next' | 'today') => {
    handleNavigation(direction);
    // Reset any active connections when navigating
    // This will be handled by the WorkflowConnectionManager
  };

  // Create resource label content
  const createResourceLabelContent = (arg: any) => {
    const section = sections.find(s => s.id === arg.resource.id);
    if (!section) return '';
    
    // Different sizes for To do vs others - Even wider for better appearance
    const isTodoSection = section.id === 'todo';
    const height = isTodoSection ? '120px' : '100px';
    const fontSize = isTodoSection ? '19px' : '17px';
    const padding = isTodoSection ? 'px-7 py-8' : 'px-6 py-7';
    const chevronSize = isTodoSection ? '24' : '20';
    const chevronClass = isTodoSection ? 'w-6 h-6 mr-5' : 'w-5 h-5 mr-4';
    
    const container = document.createElement('div');
    container.className = `timeline-section-header flex items-center ${padding} cursor-pointer transition-colors w-full box-border font-medium border-b hover:bg-black/5`;
    container.style.cssText = `
      background-color: ${theme.background.secondary};
      color: ${theme.text.primary};
      border-bottom-color: ${theme.border.default};
      height: ${height};
      min-height: ${height};
      max-height: ${height};
      ${isTodoSection ? 'border-bottom-width: 2px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);' : ''}
    `;
    
    const chevron = document.createElement('div');
    chevron.className = `${chevronClass} transition-transform duration-200 flex items-center justify-center ${section.collapsed ? '-rotate-90' : 'rotate-0'}`;
    chevron.style.color = theme.text.secondary;
    chevron.innerHTML = `<svg width="${chevronSize}" height="${chevronSize}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6,9 12,15 18,9"></polyline></svg>`;
    
    const title = document.createElement('span');
    title.className = 'overflow-hidden text-ellipsis whitespace-nowrap flex-1';
    title.style.cssText = `
      color: ${theme.text.primary};
      font-size: ${fontSize};
      font-weight: ${isTodoSection ? '600' : '500'};
      line-height: 1.4;
    `;
    title.textContent = `${section.title} (${tasksBySection[section.id]?.length || 0})`;
    
    container.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      handleSectionToggle(section.id);
    });
    
    container.addEventListener('mouseenter', () => {
      container.style.backgroundColor = isTodoSection ? 'rgba(59, 130, 246, 0.1)' : 'rgba(0,0,0,0.08)';
    });
    
    container.addEventListener('mouseleave', () => {
      container.style.backgroundColor = theme.background.secondary;
    });
    
    container.appendChild(chevron);
    container.appendChild(title);
    
    return { domNodes: [container] };
  };

  // Calendar options with dynamic slot width and initial view
  const calendarOptions = {
    ...createCalendarOptions(
      calendarResources,
      calendarEvents,
      handleEventClick,
      handleEventDrop,
      handleEventResize
    ),
    slotMinWidth: slotMinWidth,
    initialView: viewMode
  };

  // Handle view mode changes
  React.useEffect(() => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi && calendarApi.view.type !== viewMode) {
      calendarApi.changeView(viewMode);
    }
  }, [viewMode]);



  return (
    <div 
      className={`h-full flex flex-col ${className}`}
      style={{ 
        backgroundColor: theme.background.primary
      }}
    >
      {/* Header */}
      <CalendarHeader
        currentDate={currentDate}
        onPrevious={() => handleCalendarNavigation('prev')}
        onNext={() => handleCalendarNavigation('next')}
        onToday={() => handleCalendarNavigation('today')}
        userRole="member"
        showCreateButton={false}
        showImportExport={false}
        showSettings={true}
        showFilters={true}
        weekendsEnabled={true}
        onWeekendsToggle={() => {}}
        simpleHeader={false}
        viewMode={viewMode}
        onViewModeChange={onViewModeChange}
      />

      {/* Professional Workflow System */}
      {enableWorkflow ? (
        <div 
          ref={timelineContainerRef}
          className={`flex-1 overflow-hidden min-h-0 flex flex-col relative`} 
          style={{ height: 'calc(100vh - 120px)' }}
        >
          <WorkflowConnectionManager
            tasks={tasks}
            initialConnections={initialConnections}
            config={professionalWorkflowConfig}
            containerRef={timelineContainerRef}
          >
            {(connectionManager) => {
              // ✅ Store connectionManager reference for global click handler
              connectionManagerRef.current = connectionManager;
              
              return (
                <div 
                  className={`w-full h-full relative ${connectionManager.isConnecting ? 'connecting-mode' : ''}`}
                >
                <FullCalendar
                  ref={calendarRef}
                  {...calendarOptions}
                  resourceLabelContent={createResourceLabelContent}
                  eventContent={createReactBasedEventContent(connectionManager)}
                  resourceLaneDidMount={(info) => {
                    const resourceId = info.resource.id;
                    const isTodoSection = resourceId === 'todo';
                    const height = isTodoSection ? '120px' : '100px';
                    
                    Object.assign(info.el.style, {
                      minHeight: height,
                      height: height,
                      maxHeight: height,
                      padding: '0',
                      margin: '0'
                    });
                  }}
                />
              </div>
            );
          }}
        </WorkflowConnectionManager>
        </div>
      ) : (
        <div 
          ref={timelineContainerRef}
          className="flex-1 overflow-hidden min-h-0 flex flex-col" 
          style={{ height: 'calc(100vh - 120px)' }}
        >
          <FullCalendar
            ref={calendarRef}
            {...calendarOptions}
            resourceLabelContent={createResourceLabelContent}
            eventContent={createEventContent}
            resourceLaneDidMount={(info) => {
              const resourceId = info.resource.id;
              const isTodoSection = resourceId === 'todo';
              const height = isTodoSection ? '120px' : '100px';
              
              Object.assign(info.el.style, {
                minHeight: height,
                height: height,
                maxHeight: height,
                padding: '0',
                margin: '0'
              });
            }}
          />
        </div>
      )}

      {/* Inline Styles for FullCalendar */}
      <style jsx global>{`
        /* FullCalendar Base */
        .fc {
          font-family: inherit !important;
          height: 100% !important;
        }
        
        .fc-view-harness {
          height: 100% !important;
        }
        
        .fc-resource-timeline-view {
          height: 100% !important;
        }
        
        /* Theme Colors */
        .fc-theme-standard td,
        .fc-theme-standard th {
          border-color: ${theme.border.default} !important;
        }
        
        /* Timeline Slots */
        .fc-timeline-slot {
          border-right: 1px solid ${theme.border.default} !important;
        }
        
        .fc-timeline-slot-minor {
          border-right: 1px solid ${theme.border.default} !important;
        }
        
        /* Column Headers - All Possible Selectors */
        .fc-col-header-cell {
          background: ${theme.background.secondary} !important;
          color: white !important;
          font-size: 0.75rem !important;
          font-weight: 600 !important;
          padding: 8px 4px !important;
          text-align: center !important;
          border-bottom: 2px solid ${theme.border.default} !important;
        }
        
        .fc-timeline-header .fc-col-header-cell {
          min-width: ${slotMinWidth}px !important;
          color: white !important;
        }
        
        /* All text elements in headers */
        .fc-col-header-cell * {
          color: white !important;
        }
        
        .fc-col-header-cell a {
          color: white !important;
        }
        
        .fc-col-header-cell span {
          color: white !important;
        }
        
        .fc-col-header-cell .fc-col-header-cell-cushion * {
          color: white !important;
        }
        
        /* Resource Areas */
        .fc-resource-timeline .fc-datagrid-header {
          background: ${theme.background.secondary} !important;
          border-bottom: 2px solid ${theme.border.default} !important;
        }
        
        .fc-resource-timeline .fc-datagrid-header .fc-datagrid-header-cell {
          background: ${theme.background.secondary} !important;
          color: ${theme.text.primary} !important;
          font-weight: 600 !important;
          font-size: 0.875rem !important;
          padding: 12px 16px !important;
        }
        
        /* Resource Rows - Exact Heights with Reset - Even wider for better appearance */
        .fc-resource-timeline .fc-datagrid-body .fc-datagrid-row {
          border-bottom: 1px solid ${theme.border.default} !important;
          border-top: none !important;
          border-left: none !important;
          border-right: none !important;
          min-height: 100px !important;
          height: 100px !important;
          max-height: 100px !important;
          margin: 0 !important;
          padding: 0 !important;
          box-sizing: border-box !important;
          line-height: 100px !important;
          vertical-align: top !important;
        }
        
        /* To do section - Extra wide */
        .fc-resource-timeline .fc-datagrid-body .fc-datagrid-row[data-resource-id="todo"] {
          min-height: 120px !important;
          height: 120px !important;
          max-height: 120px !important;
          line-height: 120px !important;
        }
        
        .fc-datagrid-cell-frame {
          height: 100% !important;
          min-height: inherit !important;
          max-height: inherit !important;
          margin: 0 !important;
          padding: 0 !important;
          border: none !important;
          box-sizing: border-box !important;
          line-height: inherit !important;
        }
        
        .fc-datagrid-cell {
          height: 100% !important;
          min-height: inherit !important;
          max-height: inherit !important;
          margin: 0 !important;
          padding: 0 !important;
          background: ${theme.background.secondary} !important;
          border-right: 1px solid ${theme.border.default} !important;
          border-top: none !important;
          border-bottom: none !important;
          border-left: none !important;
          box-sizing: border-box !important;
          display: flex !important;
          align-items: center !important;
          line-height: inherit !important;
          vertical-align: top !important;
        }
        
        /* Timeline Content Area - Complete Reset - Even wider for better appearance */
        .fc-timeline-lane {
          border-bottom: 1px solid ${theme.border.default} !important;
          border-top: none !important;
          border-left: none !important;
          border-right: none !important;
          min-height: 100px !important;
          height: 100px !important;
          max-height: 100px !important;
          padding: 0 !important;
          margin: 0 !important;
          display: flex !important;
          align-items: center !important;
          box-sizing: border-box !important;
          line-height: 100px !important;
          vertical-align: top !important;
        }
        
        /* To do timeline lane - Match extra wide section exactly */
        .fc-timeline-lane[data-resource-id="todo"] {
          min-height: 120px !important;
          height: 120px !important;
          max-height: 120px !important;
          line-height: 120px !important;
        }
        
        /* Timeline slots - Complete reset */
        .fc-timeline-slot {
          height: 100% !important;
          box-sizing: border-box !important;
          margin: 0 !important;
          padding: 0 !important;
          border-top: none !important;
          border-bottom: none !important;
          vertical-align: top !important;
        }
        
        /* Timeline body - Reset all spacing */
        .fc-timeline-body * {
          margin: 0 !important;
          vertical-align: top !important;
        }
        
        .fc-timeline-lane:hover {
          background: rgba(0, 0, 0, 0.02) !important;
        }
        
        /* Timeline Body */
        .fc-timeline-body {
          background: ${theme.background.primary} !important;
          min-height: calc(100vh - 200px) !important;
          height: 100% !important;
        }
        
        .fc-timeline-body .fc-scroller {
          height: calc(100vh - 200px) !important;
          min-height: calc(100vh - 200px) !important;
          overflow-y: auto !important;
          overflow-x: auto !important;
        }
        
        .fc-scroller-liquid-absolute {
          position: absolute !important;
          height: 100% !important;
        }
        
        /* Events - Proportionally larger for the wider sections */
        .fc-event {
          border-radius: 10px !important;
          font-size: 0.9rem !important;
          border: none !important;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06) !important;
          transition: all 0.2s ease !important;
          cursor: pointer !important;
          position: relative !important;
          overflow: hidden !important;
          min-height: 48px !important;
          margin: 6px 0 !important;
        }
        
        .fc-event::before {
          content: '' !important;
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
          background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%) !important;
          pointer-events: none !important;
          border-radius: inherit !important;
        }
        
        .fc-event:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1) !important;
          filter: brightness(1.1) !important;
          z-index: 10 !important;
        }
        
        .fc-event-title {
          font-weight: 500 !important;
          color: white !important;
          position: relative !important;
          z-index: 2 !important;
        }
        
        /* Resource Datagrid */
        .fc-resource-timeline .fc-datagrid {
          border-right: 2px solid ${theme.border.default} !important;
          flex-shrink: 0 !important;
          width: 200px !important;
        }
        
        .fc-resource-timeline .fc-datagrid-body {
          height: auto !important;
          overflow-y: visible !important;
        }
        
        .fc-resource-area {
          flex-shrink: 0 !important;
          max-width: 200px !important;
        }
        
        /* Timeline Grid */
        .fc-timeline-body-container {
          flex: 1 !important;
          min-height: 300px !important;
        }
        
        /* Perfect Alignment - Complete Reset */
        .fc-resource-timeline {
          display: flex !important;
          align-items: stretch !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        
        .fc-resource-timeline .fc-datagrid,
        .fc-timeline-body {
          vertical-align: top !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        
        /* Header Reset */
        .fc-timeline-header {
          border-bottom: 2px solid ${theme.border.default} !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        
        .fc-resource-timeline .fc-datagrid-header {
          border-bottom: 2px solid ${theme.border.default} !important;
          height: auto !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        
        /* Force exact alignment */
        .fc-resource-timeline .fc-datagrid-header .fc-datagrid-header-cell {
          margin: 0 !important;
          padding: 12px 16px !important;
          border: none !important;
          border-bottom: 2px solid ${theme.border.default} !important;
          line-height: 1.2 !important;
          vertical-align: middle !important;
        }
        
        /* Timeline header cells - All possible text elements */
        .fc-col-header-cell .fc-col-header-cell-cushion {
          margin: 0 !important;
          padding: 8px 4px !important;
          line-height: 1.2 !important;
          vertical-align: middle !important;
          color: white !important;
        }
        
        /* Additional FullCalendar header selectors */
        .fc-timeline-header th {
          color: white !important;
        }
        
        .fc-timeline-header .fc-scrollgrid-sync-inner {
          color: white !important;
        }
        
        .fc-timeline-header .fc-col-header-cell-cushion {
          color: white !important;
        }
        
        .fc-timeline-header span {
          color: white !important;
        }
        
        .fc-timeline-header a {
          color: white !important;
          text-decoration: none !important;
        }
        
        /* Force all timeline header text to white */
        .fc-timeline-header * {
          color: white !important;
        }
        
        /* Scrollgrid headers */
        .fc-scrollgrid-section-header th {
          color: white !important;
        }
        
        .fc-scrollgrid-section-header * {
          color: white !important;
        }
        
        /* Global reset for FullCalendar */
        .fc * {
          box-sizing: border-box !important;
        }
        
        .fc table {
          border-collapse: collapse !important;
          border-spacing: 0 !important;
        }
        
        .fc td, .fc th {
          vertical-align: top !important;
          margin: 0 !important;
        }
        
        /* Workflow Connection Points */
        .task-workflow-container {
          overflow: visible !important;
          position: relative !important;
        }
        
        .task-workflow-container:hover {
          z-index: 50 !important;
        }
        
        /* Force connection points to be visible with better interaction */
        .task-workflow-container .absolute {
          position: absolute !important;
          z-index: 100 !important;
          pointer-events: all !important;
          transition: all 0.2s ease !important;
        }
        
        .task-workflow-container:hover .absolute {
          opacity: 1 !important;
        }
        
        /* Enhanced connection point styles */
        .task-workflow-container .absolute:hover {
          transform: scale(1.1) !important;
        }
        
        /* Better click feedback */
        .task-workflow-container .absolute:active {
          transform: scale(0.95) !important;
        }
        
        /* Connecting state styles */
        .connecting-mode {
          cursor: crosshair !important;
        }
        
        .connecting-mode .task-workflow-container {
          cursor: crosshair !important;
        }
        
        .connecting-mode .task-workflow-container:hover {
          box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.5) !important;
        }
        
        /* Ensure events are positioned correctly */
        .fc-event {
          overflow: visible !important;
          position: relative !important;
        }
        
        /* Force hover states */
        .fc-event:hover .task-workflow-container .absolute {
          opacity: 1 !important;
          display: block !important;
        }
        
        /* Step connection line animations */
        @keyframes flow {
          0% {
            stroke-dashoffset: 0;
          }
          100% {
            stroke-dashoffset: 12;
          }
        }
        
        .connection-flow {
          animation: flow 2s linear infinite;
        }
        
        /* Enhanced connection line hover effects */
        .connection-line:hover {
          stroke-width: 4 !important;
          filter: drop-shadow(0 4px 12px rgba(16, 185, 129, 0.6)) !important;
        }
        
        /* Step path styling improvements */
        .step-path {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .step-path:hover {
          transform: scale(1.02);
          filter: brightness(1.2);
        }
        
        /* Enhanced step line effects */
        .connection-line {
          stroke-linejoin: round !important;
          stroke-linecap: square !important;
        }
        
        .connection-line:hover {
          stroke-width: 4 !important;
          filter: drop-shadow(0 4px 12px rgba(16, 185, 129, 0.6)) !important;
        }
      `}</style>
    </div>
  );
};

export default TimelineGantt;