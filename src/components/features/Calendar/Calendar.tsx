"use client";

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useTheme } from '@/layouts/hooks/useTheme';

interface Task {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  color: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignee?: string;
  avatar?: string;
}

interface AsanaCalendarProps {
  events?: Array<{
    id: string;
    title: string;
    start: string | Date;
    end?: string | Date;
    color?: string;
    [key: string]: unknown;
  }>;
  onEventCreate?: (eventInfo: {
    start: Date;
    end: Date;
    allDay: boolean;
    [key: string]: unknown;
  }) => void;
  onEventClick?: (event: {
    event: {
      id: string;
      title: string;
      start: Date | null;
      end: Date | null;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  }) => void;
  onEventDrop?: (info: {
    event: {
      id: string;
      title: string;
      start: Date | null;
      end: Date | null;
      [key: string]: unknown;
    };
    oldEvent: {
      start: Date | null;
      end: Date | null;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  }) => void;
  onEventResize?: (info: {
    event: {
      id: string;
      title: string;
      start: Date | null;
      end: Date | null;
      [key: string]: unknown;
    };
    oldEvent: {
      start: Date | null;
      end: Date | null;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  }) => void;
  currentDate?: Date;
  onDateChange?: (date: Date) => void;
  initialView?: string;
  headerToolbar?: {
    left?: string;
    center?: string;
    right?: string;
  } | false;
  height?: string | number;
  editable?: boolean;
  droppable?: boolean;
}

const Calendar: React.FC<AsanaCalendarProps> = ({
  events = [],
  onEventCreate,
  onEventClick,
  onEventDrop,
  onEventResize,
  currentDate = new Date(),
  onDateChange,
  height = '100vh',
  editable = true,
}) => {
  const { theme } = useTheme();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [currentYear, setCurrentYear] = useState(currentDate.getFullYear());
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  
  // Sample tasks spread across the year
  const [tasks] = useState<Task[]>([
    // January
    {
      id: '1',
      title: 'Q1 Planning Sprint',
      startDate: new Date(currentYear, 0, 8),
      endDate: new Date(currentYear, 0, 12),
      color: '#3B82F6',
      priority: 'high',
      assignee: 'Team Lead',
      avatar: 'TL'
    },
    {
      id: '2',
      title: 'New Year Setup',
      startDate: new Date(currentYear, 0, 2),
      endDate: new Date(currentYear, 0, 5),
      color: '#10B981',
      priority: 'medium',
      assignee: 'Admin',
      avatar: 'AD'
    },
    // February
    {
      id: '3',
      title: 'Valentine Campaign',
      startDate: new Date(currentYear, 1, 10),
      endDate: new Date(currentYear, 1, 14),
      color: '#EC4899',
      priority: 'medium',
      assignee: 'Marketing',
      avatar: 'MK'
    },
    // March
    {
      id: '4',
      title: 'Spring Product Launch',
      startDate: new Date(currentYear, 2, 15),
      endDate: new Date(currentYear, 2, 20),
      color: '#EF4444',
      priority: 'critical',
      assignee: 'PM',
      avatar: 'PM'
    },
    // April
    {
      id: '5',
      title: 'Q2 Review Meeting',
      startDate: new Date(currentYear, 3, 1),
      endDate: new Date(currentYear, 3, 3),
      color: '#F59E0B',
      priority: 'high',
      assignee: 'Management',
      avatar: 'MG'
    },
    // May
    {
      id: '6',
      title: 'Summer Campaign Prep',
      startDate: new Date(currentYear, 4, 20),
      endDate: new Date(currentYear, 4, 25),
      color: '#06B6D4',
      priority: 'medium',
      assignee: 'Creative',
      avatar: 'CR'
    },
    // June
    {
      id: '7',
      title: 'Mid-Year Assessment',
      startDate: new Date(currentYear, 5, 15),
      endDate: new Date(currentYear, 5, 18),
      color: '#8B5CF6',
      priority: 'high',
      assignee: 'HR',
      avatar: 'HR'
    },
    // July
    {
      id: '8',
      title: 'Summer Break Planning',
      startDate: new Date(currentYear, 6, 1),
      endDate: new Date(currentYear, 6, 15),
      color: '#84CC16',
      priority: 'low',
      assignee: 'Operations',
      avatar: 'OP'
    },
    // August
    {
      id: '9',
      title: 'Back to School Campaign',
      startDate: new Date(currentYear, 7, 20),
      endDate: new Date(currentYear, 7, 30),
      color: '#F97316',
      priority: 'high',
      assignee: 'Marketing',
      avatar: 'MK'
    },
    // September
    {
      id: '10',
      title: 'Q3 Review',
      startDate: new Date(currentYear, 8, 25),
      endDate: new Date(currentYear, 8, 30),
      color: '#6366F1',
      priority: 'high',
      assignee: 'Leadership',
      avatar: 'LD'
    },
    // October
    {
      id: '11',
      title: 'Halloween Campaign',
      startDate: new Date(currentYear, 9, 20),
      endDate: new Date(currentYear, 9, 31),
      color: '#A855F7',
      priority: 'medium',
      assignee: 'Creative',
      avatar: 'CR'
    },
    // November
    {
      id: '12',
      title: 'Black Friday Prep',
      startDate: new Date(currentYear, 10, 15),
      endDate: new Date(currentYear, 10, 25),
      color: '#DC2626',
      priority: 'critical',
      assignee: 'E-commerce',
      avatar: 'EC'
    },
    // December
    {
      id: '13',
      title: 'Year End Review',
      startDate: new Date(currentYear, 11, 15),
      endDate: new Date(currentYear, 11, 20),
      color: '#059669',
      priority: 'high',
      assignee: 'All Teams',
      avatar: 'AT'
    },
    {
      id: '14',
      title: 'Holiday Break',
      startDate: new Date(currentYear, 11, 24),
      endDate: new Date(currentYear, 11, 31),
      color: '#7C3AED',
      priority: 'low',
      assignee: 'Everyone',
      avatar: 'EV'
    }
  ]);

  // Generate all 12 months of the current year
  const renderedMonths = useMemo(() => {
    const months = [];
    for (let month = 0; month < 12; month++) {
      const monthDate = new Date(currentYear, month, 1);
      months.push(monthDate);
    }
    return months;
  }, [currentYear]);

  // Get calendar days for a specific month
  const getMonthDays = (monthDate: Date) => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const firstDay = new Date(year, month, 1);
    
    // Start from Monday of the week containing the first day
    const startDate = new Date(firstDay);
    const dayOfWeek = firstDay.getDay();
    const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startDate.setDate(firstDay.getDate() - mondayOffset);
    
    const days = [];
    const current = new Date(startDate);
    
    // Generate 6 weeks (42 days)
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  // Check if date is in current month
  const isCurrentMonth = (date: Date, monthDate: Date) => {
    return date.getMonth() === monthDate.getMonth() && date.getFullYear() === monthDate.getFullYear();
  };

  // Check if date is today
  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Get tasks for a specific date
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

  // Get task span info for multi-day tasks
  const getTaskSpanInfo = (task: Task, date: Date) => {
    const taskStart = new Date(task.startDate);
    const taskEnd = new Date(task.endDate);
    const isStart = date.toDateString() === taskStart.toDateString();
    const isEnd = date.toDateString() === taskEnd.toDateString();
    const isMiddle = !isStart && !isEnd;
    
    return { isStart, isEnd, isMiddle, isSingle: isStart && isEnd };
  };

  // Navigate to different years
  const navigateYear = (direction: 'prev' | 'next') => {
    setCurrentYear(prev => prev + (direction === 'next' ? 1 : -1));
  };

  // Scroll to current month
  const scrollToCurrentMonth = () => {
    const currentMonth = new Date().getMonth();
    const monthElement = document.getElementById(`month-${currentMonth}`);
    if (monthElement && scrollContainerRef.current) {
      monthElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Auto-scroll to current month on year change
  useEffect(() => {
    if (currentYear === new Date().getFullYear()) {
      setTimeout(scrollToCurrentMonth, 100);
    }
  }, [currentYear]);

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetDate: Date) => {
    e.preventDefault();
    if (!draggedTask) return;
    
    console.log(`Dropped task "${draggedTask.title}" on ${targetDate.toDateString()}`);
    setDraggedTask(null);
  };

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="asana-calendar h-full w-full bg-gray-900 text-white flex flex-col">
      {/* Year Navigation Header */}
      <div className="sticky top-0 z-50 bg-gray-900 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigateYear('prev')}
              className="p-2 hover:bg-gray-800 rounded-md transition-colors text-white"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h1 className="text-2xl font-bold text-white">{currentYear}</h1>
            <button
              onClick={() => navigateYear('next')}
              className="p-2 hover:bg-gray-800 rounded-md transition-colors text-white"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          <button
            onClick={scrollToCurrentMonth}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md transition-colors text-white text-sm font-medium"
          >
            Go to Today
          </button>
        </div>
      </div>

      {/* Full Year Scroll Container */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto overflow-x-hidden"
        style={{ scrollBehavior: 'smooth' }}
      >
        {/* Pre-rendered Months */}
        {renderedMonths.map((monthDate, monthIndex) => {
          const monthDays = getMonthDays(monthDate);
          const monthName = monthDate.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long' 
          });
          
          return (
            <div key={`${monthDate.getFullYear()}-${monthDate.getMonth()}`} className="month-container">
              {/* Sticky Month Header */}
              <div className="sticky top-0 z-40 bg-gray-900 border-b border-gray-700 px-6 py-4">
                <h2 className="text-xl font-semibold text-white">{monthName}</h2>
                
                {/* Day Headers */}
                <div className="grid grid-cols-7 mt-4 border-t border-gray-700">
                  {weekDays.map((day) => (
                    <div key={day} className="px-4 py-3 text-center border-r border-gray-700 last:border-r-0 bg-gray-800">
                      <div className="text-sm font-semibold text-gray-300">{day}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Month Grid */}
              <div className="grid grid-cols-7">
                {monthDays.map((date, dayIndex) => (
                  <div
                    key={`${date.toISOString()}-${dayIndex}`}
                    className={`min-h-[140px] p-3 border-r border-b border-gray-700 relative transition-all duration-200 ${
                      isToday(date) ? 'bg-blue-900/30' : 'bg-gray-900'
                    } hover:bg-gray-800/50`}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, date)}
                  >
                    {/* Date Number */}
                    <div
                      className={`text-sm font-semibold mb-3 inline-block ${
                        isToday(date) 
                          ? 'bg-blue-600 text-white rounded-full w-7 h-7 flex items-center justify-center' 
                          : 'text-white'
                      }`}
                    >
                      {date.getDate()}
                    </div>

                    {/* Tasks Container */}
                    <div className="space-y-1.5 max-h-[90px] overflow-y-auto scrollbar-thin">
                      {getTasksForDate(date).map((task) => {
                        const spanInfo = getTaskSpanInfo(task, date);
                        return (
                          <div
                            key={`${task.id}-${date.toISOString()}`}
                            className={`text-xs px-2 py-1.5 text-white cursor-grab active:cursor-grabbing transition-all duration-200 hover:opacity-90 hover:shadow-lg flex items-center gap-1.5 ${
                              spanInfo.isSingle ? 'rounded-md' :
                              spanInfo.isStart ? 'rounded-l-md rounded-r-none' :
                              spanInfo.isEnd ? 'rounded-r-md rounded-l-none' : 'rounded-none'
                            } ${
                              spanInfo.isEnd || spanInfo.isSingle ? '' : 'mr-[-12px] relative z-10'
                            }`}
                            style={{ 
                              backgroundColor: task.color,
                              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)'
                            }}
                            draggable
                            onDragStart={(e) => handleDragStart(e, task)}
                            title={`${task.title} - ${task.assignee}`}
                          >
                            {(spanInfo.isStart || spanInfo.isSingle) && task.avatar && (
                              <div className="w-4 h-4 bg-white/30 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">
                                {task.avatar}
                              </div>
                            )}
                            <span className="truncate flex-1 font-medium">
                              {spanInfo.isStart || spanInfo.isSingle ? task.title : ''}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Add Task Button */}
                    <button 
                      className="absolute bottom-2 right-2 w-6 h-6 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200"
                      onClick={() => onEventCreate && onEventCreate({ 
                        start: date, 
                        end: new Date(date.getTime() + 24 * 60 * 60 * 1000), // Next day
                        allDay: true 
                      })}
                    >
                      <Plus className="w-3 h-3 text-gray-300" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx global>{`
        .asana-calendar .scrollbar-thin::-webkit-scrollbar {
          width: 4px;
        }
        
        .asana-calendar .scrollbar-thin::-webkit-scrollbar-thumb {
          background-color: #4B5563;
          border-radius: 2px;
        }
        
        .asana-calendar .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        
        /* Main scrollbar */
        .asana-calendar .overflow-y-auto::-webkit-scrollbar {
          width: 8px;
        }
        
        .asana-calendar .overflow-y-auto::-webkit-scrollbar-track {
          background: #1F2937;
        }
        
        .asana-calendar .overflow-y-auto::-webkit-scrollbar-thumb {
          background: #4B5563;
          border-radius: 4px;
        }
        
        .asana-calendar .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: #6B7280;
        }

        /* Smooth month transitions */
        .month-container {
          transition: transform 0.3s ease;
        }

        /* Enhanced task hover effects */
        .asana-calendar [draggable="true"]:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4) !important;
        }

        /* Drag feedback */
        .asana-calendar [draggable="true"].cursor-grabbing {
          transform: rotate(2deg) scale(1.02);
          opacity: 0.8;
          z-index: 1000;
        }
      `}</style>
    </div>
  );
};

export default Calendar;