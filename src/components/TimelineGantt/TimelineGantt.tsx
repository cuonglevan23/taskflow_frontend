"use client";

import React, { useState, useMemo } from 'react';
import { ChevronDown, Plus } from 'lucide-react';
import { useTheme } from '@/layouts/hooks/useTheme';

interface GanttTask {
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
}

interface TimelineSection {
  id: string;
  title: string;
  collapsed: boolean;
}

interface TimelineGanttProps {
  tasks: GanttTask[];
  tasksBySection: Record<string, GanttTask[]>;
  onTaskClick?: (task: GanttTask) => void;
  onTaskMove?: (taskId: string, newStartDate: Date, newEndDate: Date) => void;
  onSectionToggle?: (sectionId: string) => void;
  onAddSection?: () => void;
  loading?: boolean;
  error?: string | null;
  className?: string;
}

const TimelineGantt: React.FC<TimelineGanttProps> = ({
  tasks,
  tasksBySection,
  onTaskClick,
  onTaskMove,
  onSectionToggle,
  onAddSection,
  loading = false,
  error,
  className = ''
}) => {
  const { theme } = useTheme();
  const [currentDate] = useState(new Date(2025, 6, 1)); // July 2025

  // Generate timeline weeks
  const timelineWeeks = useMemo(() => {
    const weeks = [];
    const startDate = new Date(2025, 6, 1); // July 1, 2025
    const endDate = new Date(2025, 8, 30); // September 30, 2025
    
    let current = new Date(startDate);
    let weekNumber = 31; // Starting from W31
    
    while (current <= endDate) {
      const weekEnd = new Date(current);
      weekEnd.setDate(current.getDate() + 6);
      
      const monthName = current.toLocaleDateString('en-US', { month: 'long' });
      const dateRange = `${current.getDate()} - ${weekEnd.getDate()}`;
      
      weeks.push({
        weekNumber: `W${weekNumber}`,
        month: monthName,
        dateRange,
        startDate: new Date(current),
        endDate: new Date(weekEnd)
      });
      
      current.setDate(current.getDate() + 7);
      weekNumber++;
    }
    
    return weeks;
  }, []);

  // Default sections
  const sections: TimelineSection[] = [
    { id: 'todo', title: 'To do', collapsed: false },
    { id: 'in_progress', title: 'Doing', collapsed: false },
    { id: 'done', title: 'Done', collapsed: false },
    { id: 'later', title: 'to later', collapsed: false }
  ];

  // Get task position and width based on dates
  const getTaskPosition = (task: GanttTask) => {
    const timelineStart = new Date(2025, 6, 1);
    const timelineEnd = new Date(2025, 8, 30);
    const totalDays = (timelineEnd.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24);
    
    const taskStart = new Date(task.startDate);
    const taskEnd = new Date(task.endDate);
    
    // Calculate position
    const startOffset = Math.max(0, (taskStart.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24));
    const duration = Math.max(1, (taskEnd.getTime() - taskStart.getTime()) / (1000 * 60 * 60 * 24) + 1);
    
    return {
      left: `${(startOffset / totalDays) * 100}%`,
      width: `${(duration / totalDays) * 100}%`
    };
  };

  // Get color based on task properties
  const getTaskColor = (task: GanttTask) => {
    if (task.title.includes('Schedule')) return '#F59E0B'; // Orange
    if (task.title.includes('Share')) return '#8B5CF6'; // Purple
    return '#06B6D4'; // Cyan default
  };

  // Group weeks by month
  const groupedWeeks = useMemo(() => {
    const grouped: Record<string, typeof timelineWeeks> = {};
    timelineWeeks.forEach(week => {
      if (!grouped[week.month]) {
        grouped[week.month] = [];
      }
      grouped[week.month].push(week);
    });
    return grouped;
  }, [timelineWeeks]);

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
    <div className={`timeline-gantt h-full bg-gray-900 text-white ${className}`}>
      {/* Timeline Header */}
      <div className="timeline-header border-b border-gray-700">
        {/* Month and week headers */}
        <div className="flex">
          {/* Left sidebar space */}
          <div className="w-64 border-r border-gray-700"></div>
          
          {/* Timeline columns */}
          <div className="flex-1">
            {/* Month headers */}
            <div className="flex border-b border-gray-700">
              {Object.entries(groupedWeeks).map(([month, weeks]) => (
                <div 
                  key={month} 
                  className="text-center py-2 border-r border-gray-700 text-sm font-medium"
                  style={{ width: `${(weeks.length / timelineWeeks.length) * 100}%` }}
                >
                  {month}
                </div>
              ))}
            </div>
            
            {/* Week headers */}
            <div className="flex">
              {timelineWeeks.map((week, index) => (
                <div 
                  key={index}
                  className="flex-1 text-center py-2 border-r border-gray-700 text-xs"
                >
                  <div className="font-medium">{week.weekNumber}</div>
                  <div className="text-gray-400">{week.dateRange}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Content */}
      <div className="timeline-content flex-1 overflow-y-auto">
        {sections.map((section) => (
          <div key={section.id} className="section">
            {/* Section Header */}
            <div className="flex border-b border-gray-700 min-h-[50px]">
              {/* Section Title */}
              <div className="w-64 px-4 py-3 border-r border-gray-700 flex items-center">
                <button
                  onClick={() => onSectionToggle?.(section.id)}
                  className="flex items-center gap-2 text-sm font-medium hover:text-gray-300"
                >
                  <ChevronDown 
                    className={`w-4 h-4 transition-transform ${section.collapsed ? '-rotate-90' : ''}`}
                  />
                  {section.title}
                </button>
              </div>
              
              {/* Timeline Grid */}
              <div className="flex-1 relative">
                {/* Grid lines */}
                <div className="absolute inset-0 flex">
                  {timelineWeeks.map((_, index) => (
                    <div key={index} className="flex-1 border-r border-gray-800"></div>
                  ))}
                </div>
                
                {/* Tasks */}
                {!section.collapsed && tasksBySection[section.id]?.map((task, taskIndex) => {
                  const position = getTaskPosition(task);
                  return (
                    <div
                      key={task.id}
                      className="absolute h-6 flex items-center px-2 rounded text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity"
                      style={{
                        ...position,
                        top: `${taskIndex * 32 + 8}px`,
                        backgroundColor: getTaskColor(task),
                        color: 'white'
                      }}
                      onClick={() => onTaskClick?.(task)}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {task.assignees.length > 0 && (
                          <div className="w-4 h-4 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-xs font-bold">
                            {task.assignees[0].avatar || task.assignees[0].name.substring(0, 2)}
                          </div>
                        )}
                        <span className="truncate">{task.title}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Section task rows */}
            {!section.collapsed && tasksBySection[section.id] && (
              <div style={{ height: `${Math.max(tasksBySection[section.id].length * 32, 50)}px` }} className="border-b border-gray-700">
                <div className="w-64 border-r border-gray-700 h-full"></div>
              </div>
            )}
          </div>
        ))}
        
        {/* Add Section Button */}
        <div className="flex border-b border-gray-700">
          <div className="w-64 px-4 py-3 border-r border-gray-700">
            <button
              onClick={onAddSection}
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add section
            </button>
          </div>
          <div className="flex-1"></div>
        </div>
      </div>

      <style jsx global>{`
        .timeline-gantt {
          display: flex;
          flex-direction: column;
        }
        
        .timeline-header {
          flex-shrink: 0;
        }
        
        .timeline-content {
          flex: 1;
          overflow-y: auto;
        }
        
        .timeline-content::-webkit-scrollbar {
          width: 8px;
        }
        
        .timeline-content::-webkit-scrollbar-track {
          background: #1F2937;
        }
        
        .timeline-content::-webkit-scrollbar-thumb {
          background: #4B5563;
          border-radius: 4px;
        }
        
        .timeline-content::-webkit-scrollbar-thumb:hover {
          background: #6B7280;
        }
      `}</style>
    </div>
  );
};

export default TimelineGantt;