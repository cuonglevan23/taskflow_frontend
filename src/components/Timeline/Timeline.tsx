"use client";

import React, { useState, useMemo } from 'react';
import { Calendar, Clock, User, Flag, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from '@/layouts/hooks/useTheme';

interface TimelineTask {
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

interface TimelineProps {
  tasks: TimelineTask[];
  onTaskClick?: (task: TimelineTask) => void;
  onTaskUpdate?: (taskId: string, updates: Partial<TimelineTask>) => void;
  loading?: boolean;
  error?: string | null;
  className?: string;
  viewMode?: 'week' | 'month' | 'quarter';
}

const Timeline: React.FC<TimelineProps> = ({
  tasks,
  onTaskClick,
  onTaskUpdate,
  loading = false,
  error,
  className = '',
  viewMode = 'month'
}) => {
  const { theme } = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date());

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
            <button onClick={handlePrevious} className="p-2 hover:bg-gray-100 rounded" style={{ color: theme.text.secondary }}>
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold" style={{ color: theme.text.primary }}>
              {formatHeaderDate()}
            </h2>
            <button onClick={handleNext} className="p-2 hover:bg-gray-100 rounded" style={{ color: theme.text.secondary }}>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          
          <div className="text-sm" style={{ color: theme.text.secondary }}>
            {tasks.length} tasks
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
        {tasks.map((task, index) => {
          const position = getTaskPosition(task);
          
          return (
            <div
              key={task.id}
              className="timeline-row flex border-b hover:bg-gray-50 transition-colors"
              style={{ borderColor: theme.border.default }}
            >
              {/* Task Info */}
              <div className="w-64 p-3 border-r" style={{ borderColor: theme.border.default }}>
                <div className="flex items-start gap-2">
                  {task.milestone && <Flag className="w-4 h-4 text-orange-500 mt-0.5" />}
                  <div className="flex-1 min-w-0">
                    <div 
                      className="font-medium text-sm truncate cursor-pointer hover:text-blue-600"
                      style={{ color: theme.text.primary }}
                      onClick={() => onTaskClick?.(task)}
                    >
                      {task.title}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex -space-x-1">
                        {task.assignees.slice(0, 3).map((assignee) => (
                          <div
                            key={assignee.id}
                            className="w-5 h-5 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center border-2 border-white"
                            title={assignee.name}
                          >
                            {assignee.avatar || assignee.name.charAt(0)}
                          </div>
                        ))}
                        {task.assignees.length > 3 && (
                          <div className="w-5 h-5 rounded-full bg-gray-400 text-white text-xs flex items-center justify-center border-2 border-white">
                            +{task.assignees.length - 3}
                          </div>
                        )}
                      </div>
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: getStatusColor(task.status) }}
                        title={task.status}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline Bar */}
              <div className="flex-1 relative p-3">
                <div
                  className="absolute top-1/2 h-6 rounded transform -translate-y-1/2 cursor-pointer hover:opacity-80 transition-opacity"
                  style={{
                    left: position.left,
                    width: position.width,
                    backgroundColor: getPriorityColor(task.priority),
                    opacity: task.status === 'done' ? 0.6 : 1,
                  }}
                  onClick={() => onTaskClick?.(task)}
                >
                  {/* Progress Bar */}
                  <div
                    className="h-full bg-white bg-opacity-30 rounded"
                    style={{ width: `${task.progress}%` }}
                  />
                  
                  {/* Task Label */}
                  <div className="absolute inset-0 flex items-center px-2">
                    <span className="text-white text-xs font-medium truncate">
                      {task.title}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
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