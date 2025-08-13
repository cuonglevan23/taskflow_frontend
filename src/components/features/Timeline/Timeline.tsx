"use client";

import React, { useState, useMemo } from 'react';
import { Calendar, Clock, User, Flag, ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';
import { useTheme } from '@/layouts/hooks/useTheme';
import TimelineSection from './TimelineSection';

export interface TimelineTask {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  progress: number; // 0-100
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in_progress' | 'review' | 'done' | 'cancelled';
  assignees: {
    id: string;
    name: string;
    avatar?: string;
  }[];
  milestone?: boolean;
  dependencies?: string[];
}

export interface TimelineSection {
  id: string;
  title: string;
  collapsed: boolean;
}

export interface TimelineProps {
  tasks: TimelineTask[];
  onTaskClick?: (task: TimelineTask) => void;
  onTaskUpdate?: (taskId: string, updates: Partial<TimelineTask>) => void;
  loading?: boolean;
  error?: string | null;
  className?: string;
  viewMode?: 'week' | 'month' | 'quarter';
}

const Timeline = ({
  tasks,
  onTaskClick,
  onTaskUpdate,
  loading = false,
  error,
  className = '',
  viewMode = 'month'
}: TimelineProps) => {
  const { theme } = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [sections, setSections] = useState<TimelineSection[]>([
    { id: 'todo', title: 'To do', collapsed: false },
    { id: 'in_progress', title: 'Doing', collapsed: false },
    { id: 'done', title: 'Done', collapsed: false },
    { id: 'later', title: 'Do later', collapsed: false }
  ]);

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return '#EF4444';
      case 'high': return '#F97316';
      case 'medium': return '#3B82F6';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done': return '#10B981';
      case 'in_progress': return '#3B82F6';
      case 'review': return '#F59E0B';
      case 'todo': return '#6B7280';
      case 'cancelled': return '#EF4444';
      default: return '#6B7280';
    }
  };

  // Generate timeline dates based on view mode
  const timelineRange = useMemo(() => {
    const start = new Date(currentDate);
    const end = new Date(currentDate);
    
    switch (viewMode) {
      case 'week':
        start.setDate(start.getDate() - start.getDay()); // Start of week
        end.setDate(start.getDate() + 6); // End of week
        break;
      case 'month':
        start.setDate(1); // Start of month
        end.setMonth(end.getMonth() + 1);
        end.setDate(0); // End of month
        break;
      case 'quarter':
        const quarter = Math.floor(start.getMonth() / 3);
        start.setMonth(quarter * 3, 1);
        end.setMonth((quarter + 1) * 3, 0);
        break;
    }
    
    return { start, end };
  }, [currentDate, viewMode]);

  // Generate date columns
  const dateColumns = useMemo(() => {
    const columns = [];
    const current = new Date(timelineRange.start);
    
    while (current <= timelineRange.end) {
      columns.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return columns;
  }, [timelineRange]);

  // Group tasks by sections
  const tasksBySection = useMemo(() => {
    const grouped: Record<string, TimelineTask[]> = {
      'todo': [],
      'in_progress': [],
      'done': [],
      'later': []
    };

    tasks.forEach(task => {
      switch (task.status) {
        case 'todo':
          grouped['todo'].push(task);
          break;
        case 'in_progress':
          grouped['in_progress'].push(task);
          break;
        case 'review':
        case 'done':
          grouped['done'].push(task);
          break;
        case 'cancelled':
        default:
          grouped['later'].push(task);
          break;
      }
    });

    return grouped;
  }, [tasks]);

  // Calculate task position and width
  const getTaskPosition = (task: TimelineTask) => {
    const taskStart = new Date(task.startDate);
    const taskEnd = new Date(task.endDate);
    const rangeStart = timelineRange.start;
    const rangeEnd = timelineRange.end;
    
    // Clamp dates to visible range
    const startDate = taskStart < rangeStart ? rangeStart : taskStart;
    const endDate = taskEnd > rangeEnd ? rangeEnd : taskEnd;
    
    const totalDays = (rangeEnd.getTime() - rangeStart.getTime()) / (1000 * 60 * 60 * 24);
    const startOffset = (startDate.getTime() - rangeStart.getTime()) / (1000 * 60 * 60 * 24);
    const duration = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24) + 1;
    
    return {
      left: `${(startOffset / totalDays) * 100}%`,
      width: `${(duration / totalDays) * 100}%`,
      isPartial: taskStart < rangeStart || taskEnd > rangeEnd
    };
  };

  const handlePrevious = () => {
    const newDate = new Date(currentDate);
    switch (viewMode) {
      case 'week':
        newDate.setDate(newDate.getDate() - 7);
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() - 1);
        break;
      case 'quarter':
        newDate.setMonth(newDate.getMonth() - 3);
        break;
    }
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    switch (viewMode) {
      case 'week':
        newDate.setDate(newDate.getDate() + 7);
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() + 1);
        break;
      case 'quarter':
        newDate.setMonth(newDate.getMonth() + 3);
        break;
    }
    setCurrentDate(newDate);
  };

  const formatHeaderDate = () => {
    switch (viewMode) {
      case 'week':
        return `Week of ${currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
      case 'month':
        return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      case 'quarter':
        const quarter = Math.floor(currentDate.getMonth() / 3) + 1;
        return `Q${quarter} ${currentDate.getFullYear()}`;
      default:
        return '';
    }
  };

  const handleSectionToggle = (sectionId: string) => {
    setSections(prev => {
      const newSections = prev.map(section => 
        section.id === sectionId 
          ? { ...section, collapsed: !section.collapsed }
          : section
      );
      return newSections;
    });
  };

  const handleCollapseAll = () => {
    const allCollapsed = sections.every(section => section.collapsed);
    const newCollapsedState = !allCollapsed;
    
    setSections(prev => prev.map(section => ({ 
      ...section, 
      collapsed: newCollapsedState 
    })));
  };

  // Check if all sections are collapsed for UI state
  const allSectionsCollapsed = sections.every(section => section.collapsed);
  const anySectionCollapsed = sections.some(section => section.collapsed);

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

  return (
    <div className={`timeline-container h-full ${className}`} style={{ backgroundColor: theme.background.primary }}>
      {/* Timeline Header */}
      <div className="timeline-header border-b" style={{ borderColor: theme.border.default, backgroundColor: theme.background.secondary }}>
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <button onClick={handlePrevious} className="p-2 hover:bg-gray-100 rounded transition-colors" style={{ color: theme.text.secondary }}>
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold" style={{ color: theme.text.primary }}>
              {formatHeaderDate()}
            </h2>
            <button onClick={handleNext} className="p-2 hover:bg-gray-100 rounded transition-colors" style={{ color: theme.text.secondary }}>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleCollapseAll();
              }}
              className="p-2 hover:bg-gray-100 rounded transition-colors flex items-center gap-1 border"
              style={{ 
                color: theme.text.secondary,
                borderColor: theme.border.default,
                backgroundColor: allSectionsCollapsed ? theme.background.tertiary : 'transparent'
              }}
              title={allSectionsCollapsed ? "Expand all sections" : "Collapse all sections"}
            >
              <ChevronUp 
                className={`w-4 h-4 transition-transform duration-200 ${allSectionsCollapsed ? 'rotate-180' : ''}`} 
              />
              <span className="text-xs font-medium">
                {allSectionsCollapsed ? "Expand All" : "Collapse All"}
              </span>
            </button>
            <div className="text-sm" style={{ color: theme.text.secondary }}>
              {tasks.length} tasks
            </div>
          </div>

        </div>
        
        {/* Date Headers */}
        <div className="flex border-t" style={{ borderColor: theme.border.default }}>
          <div className="w-64 p-3 border-r font-medium text-sm" style={{ borderColor: theme.border.default, color: theme.text.secondary }}>
            Task
          </div>
          <div className="flex-1 relative">
            <div className="flex">
              {dateColumns.map((date, index) => (
                <div
                  key={index}
                  className="flex-1 p-2 border-r text-center text-xs border-r"
                  style={{ borderColor: theme.border.default, color: theme.text.secondary }}
                >
                  <div className="font-medium">{date.getDate()}</div>
                  <div className="text-xs opacity-60">
                    {date.toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Content */}
      <div className="timeline-content flex-1 overflow-y-auto">
        {sections.map((section) => (
          <TimelineSection
            key={section.id}
            section={section}
            tasks={tasksBySection[section.id] || []}
            dateColumns={dateColumns}
            timelineRange={timelineRange}
            onSectionToggle={handleSectionToggle}
            onTaskClick={onTaskClick}
            getPriorityColor={getPriorityColor}
            getStatusColor={getStatusColor}
            getTaskPosition={getTaskPosition}
          />
        ))}
      </div>

      <style jsx global>{`
        .timeline-container .timeline-content::-webkit-scrollbar {
          width: 8px;
        }
        
        .timeline-container .timeline-content::-webkit-scrollbar-track {
          background: ${theme.background.secondary};
        }
        
        .timeline-container .timeline-content::-webkit-scrollbar-thumb {
          background: ${theme.border.default};
          border-radius: 4px;
        }
        
        .timeline-container .timeline-content::-webkit-scrollbar-thumb:hover {
          background: ${theme.text.secondary};
        }
      `}</style>
    </div>
  );
};

export default Timeline;