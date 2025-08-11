/**
 * Simple Calendar Component - Unified solution
 * Replaces all complex calendar components with single, maintainable component
 */

"use client";

import React, { useState, useMemo, useRef } from 'react';
import { Plus } from 'lucide-react';
import CalendarHeader, { UserRole } from './CalendarHeader';
import TaskDetailPanel from './TaskDetailPanel';

interface Task {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  color: string;
  assignee?: string;
  avatar?: string;
}

interface SimpleCalendarProps {
  height?: string;
  onTaskClick?: (task: Task) => void;
  onTaskDrop?: (task: Task, newDate: Date) => void;
  onDateClick?: (date: Date) => void;
  onCreateTask?: () => void;
  initialTasks?: Task[];
  view?: 'month' | 'year';
  
  // Header customization
  userRole?: UserRole;
  showCreateButton?: boolean;
  showImportExport?: boolean;
  showSettings?: boolean;
  showFilters?: boolean;
  simpleHeader?: boolean;
}

const SimpleCalendar: React.FC<SimpleCalendarProps> = ({
  height = '100vh',
  onTaskClick,
  onTaskDrop,
  onDateClick,
  onCreateTask,
  initialTasks = [],
  view = 'month',
  userRole = 'member',
  showCreateButton = true,
  showImportExport = false,
  showSettings = false,
  showFilters = false,
  simpleHeader = false
}) => {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 7, 1)); // August 2025
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [weekendsEnabled, setWeekendsEnabled] = useState(true);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [dragOverDate, setDragOverDate] = useState<Date | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Tasks state - now mutable for full task management
  const [tasks, setTasks] = useState<Task[]>(initialTasks.length > 0 ? initialTasks : [
    {
      id: '1',
      title: 'jii4',
      startDate: new Date(2025, 6, 21), // July 21, 2025
      endDate: new Date(2025, 6, 21),
      color: '#60A5FA',
      assignee: 'jii4',
      avatar: 'J4'
    },
    {
      id: '2',
      title: 'Schedule kickoff meeting',
      startDate: new Date(2025, 6, 21), // July 21, 2025
      endDate: new Date(2025, 6, 21),
      color: '#34D399',
      assignee: 'Team',
      avatar: ''
    },
    {
      id: '3',
      title: 'Share timeline with teammates',
      startDate: new Date(2025, 6, 22), // July 22, 2025
      endDate: new Date(2025, 6, 23),   // July 23, 2025
      color: '#34D399',
      assignee: 'Team',
      avatar: ''
    },
    {
      id: '4',
      title: 'Schedule kickoff...',
      startDate: new Date(2025, 6, 24), // July 24, 2025
      endDate: new Date(2025, 6, 24),
      color: '#F87171',
      assignee: 'LC',
      avatar: 'LC'
    }
  ]);

  // Generate single month for the current view
  const months = useMemo(() => {
    return [currentDate];
  }, [currentDate]);

  // Get calendar days for a month
  const getMonthDays = (monthDate: Date) => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    const dayOfWeek = firstDay.getDay();
    const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startDate.setDate(firstDay.getDate() - mondayOffset);

    const days = [];
    const current = new Date(startDate);
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return days;
  };

  // Utility functions
  const isCurrentMonth = (date: Date, monthDate: Date) => 
    date.getMonth() === monthDate.getMonth() && date.getFullYear() === monthDate.getFullYear();

  const isToday = (date: Date) => 
    date.toDateString() === new Date().toDateString();

  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => {
      const taskStart = new Date(task.startDate);
      const taskEnd = new Date(task.endDate);
      taskStart.setHours(0, 0, 0, 0);
      taskEnd.setHours(23, 59, 59, 999);
      const checkDate = new Date(date);
      checkDate.setHours(12, 0, 0, 0);
      return checkDate >= taskStart && checkDate <= taskEnd;
    });
  };

  // Get tasks that START on this specific date (for rendering only once)
  const getTasksStartingOnDate = (date: Date) => {
    return tasks.filter(task => {
      const taskStart = new Date(task.startDate);
      taskStart.setHours(0, 0, 0, 0);
      const checkDate = new Date(date);
      checkDate.setHours(0, 0, 0, 0);
      return taskStart.getTime() === checkDate.getTime();
    });
  };

  // Calculate task width in cells
  const getTaskWidth = (task: Task, startDate: Date, monthDays: Date[]) => {
    const taskStart = new Date(task.startDate);
    const taskEnd = new Date(task.endDate);
    taskStart.setHours(0, 0, 0, 0);
    taskEnd.setHours(0, 0, 0, 0);
    
    // Find start and end positions in the grid
    const startIndex = monthDays.findIndex(d => d.getTime() === startDate.getTime());
    const endIndex = monthDays.findIndex(d => d.getTime() === taskEnd.getTime());
    
    if (startIndex === -1 || endIndex === -1) return 1;
    
    // Calculate how many cells to span
    let span = endIndex - startIndex + 1;
    
    // Handle week breaks - if task spans across weeks, need to account for grid layout
    const startRow = Math.floor(startIndex / 7);
    const endRow = Math.floor(endIndex / 7);
    
    if (startRow === endRow) {
      // Same week - simple span
      return span;
    } else {
      // Multiple weeks - calculate total width including week breaks
      return span;
    }
  };

  const getTaskSpanInfo = (task: Task, date: Date) => {
    const taskStart = new Date(task.startDate);
    const taskEnd = new Date(task.endDate);
    const isStart = date.toDateString() === taskStart.toDateString();
    const isEnd = date.toDateString() === taskEnd.toDateString();
    const isSingle = isStart && isEnd;
    
    // Check if this is at week boundaries for better styling
    const dayOfWeek = date.getDay();
    const isMonday = dayOfWeek === 1; // Monday (start of week)
    const isSunday = dayOfWeek === 0; // Sunday (end of week)
    
    // For tasks spanning multiple weeks
    const isWeekStart = isMonday && !isStart; // Task continues from previous week
    const isWeekEnd = isSunday && !isEnd; // Task continues to next week
    
    return { 
      isStart, 
      isEnd, 
      isSingle, 
      isWeekStart, 
      isWeekEnd,
      isMiddle: !isStart && !isEnd && !isWeekStart && !isWeekEnd
    };
  };

  // Task Management Functions
  const generateTaskId = () => `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const handleCreateTask = (taskData: Omit<Task, 'id'>) => {
    const newTask: Task = {
      id: generateTaskId(),
      ...taskData
    };
    setTasks(prev => [...prev, newTask]);
  };

  const handleUpdateTask = (updatedTask: Task) => {
    setTasks(prev => prev.map(task => task.id === updatedTask.id ? updatedTask : task));
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  };

  // Event handlers
  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', ''); // For better browser compatibility
  };

  const handleDragOver = (e: React.DragEvent, date: Date) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverDate(date);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverDate(null);
  };

  const handleDrop = (e: React.DragEvent, targetDate: Date) => {
    e.preventDefault();
    if (!draggedTask) return;
    
    // Calculate duration of original task
    const originalDuration = draggedTask.endDate.getTime() - draggedTask.startDate.getTime();
    
    // Create updated task with new dates
    const updatedTask: Task = {
      ...draggedTask,
      startDate: new Date(targetDate),
      endDate: new Date(targetDate.getTime() + originalDuration)
    };
    
    // Update task in state
    handleUpdateTask(updatedTask);
    
    // Call external handler if provided
    onTaskDrop?.(updatedTask, targetDate);
    
    setDraggedTask(null);
    setDragOverDate(null);
  };

  const handleTaskClick = (task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTask(task);
    setIsTaskModalOpen(true);
    onTaskClick?.(task);
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setEditingTask(null);
    setIsTaskModalOpen(true);
    onDateClick?.(date);
  };

  const handleCreateTaskButton = () => {
    setSelectedDate(currentDate);
    setEditingTask(null);
    setIsTaskModalOpen(true);
    onCreateTask?.();
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handlePrevious = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNext = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleWeekendsToggle = () => {
    setWeekendsEnabled(!weekendsEnabled);
  };

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="simple-calendar h-full w-full bg-gray-900 text-white flex flex-col overflow-hidden" style={{ height }}>
      {/* Calendar Header Component - Fixed at top */}
      <CalendarHeader
        currentDate={currentDate}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onToday={goToToday}
        onCreateTask={handleCreateTaskButton}
        userRole={userRole}
        showCreateButton={showCreateButton}
        showImportExport={showImportExport}
        showSettings={showSettings}
        showFilters={showFilters}
        weekendsEnabled={weekendsEnabled}
        onWeekendsToggle={handleWeekendsToggle}
        simpleHeader={simpleHeader}
      />

      {/* Calendar Content */}
      <div ref={scrollContainerRef} className="flex-1 overflow-hidden">
        {months.map((monthDate, monthIndex) => {
          const monthDays = getMonthDays(monthDate);

          return (
            <div key={monthIndex} className="month-section h-full">
              {/* Calendar Grid - fixed content */}
              <div className="grid grid-cols-7 h-full">
                {monthDays.map((date, dayIndex) => (
                  <div
                    key={dayIndex}
                    className={`h-[calc((100vh-140px)/6)] p-2 border-r border-b border-gray-700 relative cursor-pointer transition-colors overflow-visible ${
                      isToday(date) ? 'bg-blue-600 text-white' : 'bg-gray-900'
                    } ${
                      !isCurrentMonth(date, monthDate) ? 'opacity-40' : ''
                    } ${
                      dragOverDate && dragOverDate.toDateString() === date.toDateString() 
                        ? 'bg-blue-700 ring-2 ring-blue-400' : ''
                    } hover:bg-gray-800`}
                    onDragOver={(e) => handleDragOver(e, date)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, date)}
                    onClick={() => handleDateClick(date)}
                  >
                    {/* Date Number */}
                    <div className={`text-sm font-medium mb-2 ${
                      isToday(date) 
                        ? 'text-white' 
                        : isCurrentMonth(date, monthDate) ? 'text-white' : 'text-gray-500'
                    }`}>
                      {date.getDate()}
                    </div>

                    {/* Tasks - render segment for each day */}
                    <div className="space-y-1 relative">
                      {getTasksForDate(date).map((task, taskIndex) => {
                        const taskStart = new Date(task.startDate);
                        const taskEnd = new Date(task.endDate);
                        const isTaskStart = date.toDateString() === taskStart.toDateString();
                        const isTaskEnd = date.toDateString() === taskEnd.toDateString();
                        const isSingleDay = isTaskStart && isTaskEnd;
                        
                        return (
                          <div
                            key={`${task.id}-${date.toISOString()}`}
                            className={`task-bar relative text-xs px-3 py-2 text-white cursor-grab flex items-center gap-2 h-[24px] transition-all duration-300 ease-out ${
                              isSingleDay ? 'rounded-lg' : 
                              isTaskStart ? 'rounded-l-lg' :
                              isTaskEnd ? 'rounded-r-lg' : ''
                            } ${
                              !isTaskEnd ? 'extend-right' : ''
                            } ${
                              !isTaskStart ? 'extend-left' : ''
                            }`}
                            style={{ 
                              background: `linear-gradient(135deg, ${task.color} 0%, ${task.color}dd 100%)`,
                              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15), 0 1px 3px rgba(0, 0, 0, 0.1)',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              zIndex: 10
                            }}
                            draggable
                            onDragStart={(e) => handleDragStart(e, task)}
                            onClick={(e) => handleTaskClick(task, e)}
                            title={`${task.title} - ${task.assignee}`}
                          >
                            {/* Content container with fixed layout */}
                            <div className="flex items-center gap-2 w-full h-full">
                              {/* Avatar placeholder - always present for consistent sizing */}
                              <div className="w-4 h-4 shrink-0 flex items-center justify-center">
                                {isTaskStart && task.avatar && (
                                  <div className="w-4 h-4 bg-gradient-to-br from-red-400 to-red-600 text-white rounded-full flex items-center justify-center text-[9px] font-bold shadow-lg ring-1 ring-white/20">
                                    {task.avatar}
                                  </div>
                                )}
                              </div>
                              
                              {/* Task Title - consistent space */}
                              <span className="truncate flex-1 text-xs font-semibold tracking-wide min-w-0">
                                {isTaskStart ? task.title : ''}
                              </span>
                              
                              {/* Status indicators placeholder - always present for consistent sizing */}
                              <div className="w-6 h-4 shrink-0 flex items-center justify-end gap-1">
                                {isTaskStart && (
                                  <>
                                    <div className="w-2 h-2 border border-white/40 rounded-full bg-white/20 backdrop-blur-sm"></div>
                                    <div className="w-2 h-2 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full shadow-sm"></div>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>


                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Detail Panel */}
      <TaskDetailPanel
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
          setSelectedDate(null);
        }}
        onSave={editingTask ? 
          (taskData) => {
            const updatedTask = { ...editingTask, ...taskData };
            handleUpdateTask(updatedTask);
          } : 
          handleCreateTask
        }
        selectedDate={selectedDate || undefined}
        editTask={editingTask}
      />

      {/* Simple Styles */}
      <style jsx global>{`
        .simple-calendar .overflow-y-auto::-webkit-scrollbar {
          width: 8px;
        }
        
        .simple-calendar .overflow-y-auto::-webkit-scrollbar-track {
          background: #1F2937;
        }
        
        .simple-calendar .overflow-y-auto::-webkit-scrollbar-thumb {
          background: #4B5563;
          border-radius: 4px;
        }
        
        .simple-calendar .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: #6B7280;
        }

        .simple-calendar .task-segment:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4) !important;
          z-index: 20 !important;
        }

        .simple-calendar .task-segment:active {
          opacity: 0.7;
          transform: scale(0.98);
        }
        
        /* Seamless multi-day task bars */
        .simple-calendar .grid > div {
          overflow: visible !important;
          position: relative;
        }
        
        /* Enhanced task bar extensions */
        .simple-calendar .task-bar.extend-right {
          margin-right: -8px;
          padding-right: 12px;
          border-top-right-radius: 0 !important;
          border-bottom-right-radius: 0 !important;
          position: relative;
        }
        
        .simple-calendar .task-bar.extend-left {
          margin-left: -8px;
          padding-left: 12px;
          border-top-left-radius: 0 !important;
          border-bottom-left-radius: 0 !important;
          position: relative;
        }
        
        /* Task styling with better spacing */
        .simple-calendar .space-y-1 > div {
          margin-bottom: 3px;
        }
        
        /* Enhanced hover effects */
        .simple-calendar .task-bar {
          backdrop-filter: blur(10px);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .simple-calendar .task-bar:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2), 0 4px 10px rgba(0, 0, 0, 0.15) !important;
          filter: brightness(1.1) saturate(1.1);
          z-index: 25 !important;
        }
        
        .simple-calendar .task-bar:active {
          transform: translateY(-1px) scale(1.01);
          transition: all 0.1s ease-out;
        }
        
        /* Remove gaps between task segments */
        .simple-calendar .task-bar.extend-left.extend-right {
          margin-left: -8px;
          margin-right: -8px;
          padding-left: 12px;
          padding-right: 12px;
          border-radius: 0 !important;
        }
        
        /* Subtle glow effect for tasks */
        .simple-calendar .task-bar::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
          border-radius: inherit;
          pointer-events: none;
        }
        
        /* Focus styles for accessibility */
        .simple-calendar .task-bar:focus {
          outline: 2px solid rgba(59, 130, 246, 0.5);
          outline-offset: 2px;
        }
        
        /* Better visual feedback during drag */
        .simple-calendar .task-segment.dragging {
          opacity: 0.5;
          transform: rotate(3deg) scale(1.05);
          z-index: 50 !important;
        }
      `}</style>
    </div>
  );
};

export default SimpleCalendar;