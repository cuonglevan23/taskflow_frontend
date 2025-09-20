"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { format, addDays, differenceInDays, parseISO, subDays } from 'date-fns';
import { useThemeContext } from "@/providers/ThemeProvider";
import { useLanguageContext } from "@/providers/LanguageProvider";

interface SimpleGanttProps {
  tasks: {
    id: string;
    title: string;
    startDate: string;
    endDate: string;
    priority: 'low' | 'medium' | 'high';
    status: string; // Changed to accept any string status
    description?: string; // Optional description for task details
    assignee?: {
      id: string;
      name: string;
      avatar?: string;
    };
  }[];
  viewMode?: 'day' | 'week' | 'month' | 'quarter' | 'year';
  isLoading?: boolean;
  onTaskClick?: (taskId: string) => void;
}

const SimpleGantt: React.FC<SimpleGanttProps> = ({
  tasks = [],
  viewMode = 'day',
  isLoading = false,
  onTaskClick
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [dateHeaders, setDateHeaders] = useState<Date[]>([]);
  const [currentDateOffset, setCurrentDateOffset] = useState(0);
  const [currentViewMode, setCurrentViewMode] = useState<'day' | 'week' | 'month' | 'quarter' | 'year'>(viewMode);

  // Add theme and language context hooks
  const { theme } = useThemeContext();
  const { messages } = useLanguageContext();

  // Handle view mode change
  const handleViewModeChange = (newMode: 'day' | 'week' | 'month' | 'quarter' | 'year') => {
    console.log("Changing view mode to:", newMode);
    setCurrentViewMode(newMode);
    // Reset date offset when changing view mode to avoid confusion
    setCurrentDateOffset(0);
  };

  // Calculate width of timeline cells and total container width
  const getTotalWidth = () => {
    const minCellWidth = currentViewMode === 'year' ? 200 : 
                         currentViewMode === 'quarter' ? 150 : 
                         currentViewMode === 'month' ? 100 : 
                         currentViewMode === 'week' ? 60 : 45;
    
    // Return 100% if no date headers yet, otherwise calculate total width but keep minimum of 100%
    return dateHeaders.length === 0 ? '100%' : `max(100%, ${dateHeaders.length * minCellWidth}px)`;
  };

  // Cell width settings based on view mode
  const cellWidth = currentViewMode === 'year' ? '200px' : 
                    currentViewMode === 'quarter' ? '150px' : 
                    currentViewMode === 'month' ? '100px' : 
                    currentViewMode === 'week' ? '60px' : '45px';

  useEffect(() => {
    // Remove excessive logging that causes performance issues during tab switches
    generateDateHeaders();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentViewMode, tasks, currentDateOffset]);
  
  // Navigation functions
  const goToToday = () => {
    setCurrentDateOffset(0); // Reset to today
  };
  
  const goToPrevious = () => {
    // Calculate the appropriate offset based on view mode and update state
    const newOffset = currentDateOffset - 1;
    setCurrentDateOffset(newOffset);
  };
  
  const goToNext = () => {
    // Calculate the appropriate offset based on view mode and update state
    const newOffset = currentDateOffset + 1;
    setCurrentDateOffset(newOffset);
  };

  // Function to generate date headers based on viewMode and tasks
  const generateDateHeaders = () => {
    // Only log in development when needed for debugging
    if (process.env.NODE_ENV === 'development' && currentDateOffset === 0) {
      console.log("Generating headers for view mode:", currentViewMode);
    }

    // Default date range
    const today = new Date();
    const baseDate = new Date(today);
    
    // Apply the offset differently based on view mode
    if (currentViewMode === 'year') {
      baseDate.setFullYear(today.getFullYear() + currentDateOffset);
    } else if (currentViewMode === 'quarter') {
      baseDate.setMonth(today.getMonth() + (currentDateOffset * 3));
    } else if (currentViewMode === 'month') {
      baseDate.setMonth(today.getMonth() + currentDateOffset);
    } else if (currentViewMode === 'week') {
      baseDate.setDate(today.getDate() + (currentDateOffset * 7));
    } else {
      baseDate.setDate(today.getDate() + currentDateOffset);
    }
    
    console.log("Base date after offset:", baseDate.toISOString());
    
    let headers: Date[] = [];
    
    // Generate default headers based on view mode
    if (currentViewMode === 'year') {
      // Generate 5 years
      for (let i = 0; i < 5; i++) {
        const date = new Date(baseDate);
        date.setFullYear(baseDate.getFullYear() + i);
        date.setMonth(0); // January
        date.setDate(1); // First day of year
        headers.push(date);
      }
    } else if (currentViewMode === 'quarter') {
      // Generate 8 quarters (2 years)
      for (let i = 0; i < 8; i++) {
        const date = new Date(baseDate);
        date.setMonth(Math.floor(baseDate.getMonth() / 3) * 3 + (i * 3));
        date.setDate(1); // First day of quarter
        headers.push(date);
      }
    } else if (currentViewMode === 'month') {
      // Generate 6 months
      for (let i = 0; i < 6; i++) {
        const date = new Date(baseDate);
        date.setMonth(baseDate.getMonth() + i);
        date.setDate(1); // First day of month
        headers.push(date);
      }
    } else if (currentViewMode === 'week') {
      // Generate 8 weeks
      for (let i = 0; i < 8 * 7; i += 7) {
        headers.push(addDays(baseDate, i));
      }
    } else {
      // Generate 14 days
      for (let i = 0; i < 14; i++) {
        headers.push(addDays(baseDate, i));
      }
    }
    
    // If there are tasks, try to adjust headers based on task dates
    if (tasks.length > 0) {
      try {
        // Find earliest start date and latest end date from tasks
        let earliestDate = tasks.reduce((min, task) => {
          const startDate = parseISO(task.startDate);
          return startDate < min ? startDate : min;
        }, parseISO(tasks[0].startDate));
        
        let latestDate = tasks.reduce((max, task) => {
          const endDate = parseISO(task.endDate);
          return endDate > max ? endDate : max;
        }, parseISO(tasks[0].endDate));
        
        // Add padding to the date range
        earliestDate = addDays(earliestDate, -1);
        latestDate = addDays(latestDate, 1);
        
        // For navigation, we need to keep the base offset applied
        // Apply the navigation offset to the task-based dates
        if (currentDateOffset !== 0) {
          if (currentViewMode === 'year') {
            earliestDate.setFullYear(earliestDate.getFullYear() + currentDateOffset);
            latestDate.setFullYear(latestDate.getFullYear() + currentDateOffset);
          } else if (currentViewMode === 'quarter') {
            earliestDate.setMonth(earliestDate.getMonth() + (currentDateOffset * 3));
            latestDate.setMonth(latestDate.getMonth() + (currentDateOffset * 3));
          } else if (currentViewMode === 'month') {
            earliestDate.setMonth(earliestDate.getMonth() + currentDateOffset);
            latestDate.setMonth(latestDate.getMonth() + currentDateOffset);
          } else if (currentViewMode === 'week') {
            earliestDate.setDate(earliestDate.getDate() + (currentDateOffset * 7));
            latestDate.setDate(latestDate.getDate() + (currentDateOffset * 7));
          } else {
            earliestDate.setDate(earliestDate.getDate() + currentDateOffset);
            latestDate.setDate(latestDate.getDate() + currentDateOffset);
          }
        }
        
        // Clear headers and regenerate based on task dates
        headers = [];
        
        if (currentViewMode === 'year') {
          // Generate yearly headers
          const startYear = new Date(earliestDate);
          startYear.setMonth(0); // January
          startYear.setDate(1); // First day of year
          
          const endYear = new Date(latestDate);
          endYear.setMonth(0); // January
          endYear.setDate(1); // First day of year
          
          const currentYear = new Date(startYear);
          
          while (currentYear <= endYear) {
            headers.push(new Date(currentYear));
            currentYear.setFullYear(currentYear.getFullYear() + 1);
          }
          
          // Ensure at least 3 years are shown
          if (headers.length < 3) {
            const lastYear = headers[headers.length - 1];
            for (let i = headers.length; i < 3; i++) {
              const nextYear = new Date(lastYear);
              nextYear.setFullYear(lastYear.getFullYear() + i - headers.length + 1);
              headers.push(nextYear);
            }
          }
        } else if (currentViewMode === 'quarter') {
          // Generate quarterly headers
          const startQuarter = new Date(earliestDate);
          startQuarter.setMonth(Math.floor(startQuarter.getMonth() / 3) * 3); // First month of quarter
          startQuarter.setDate(1); // First day of month
          
          const endQuarter = new Date(latestDate);
          endQuarter.setMonth(Math.floor(endQuarter.getMonth() / 3) * 3); // First month of quarter
          endQuarter.setDate(1); // First day of month
          
          const currentQuarter = new Date(startQuarter);
          
          while (currentQuarter <= endQuarter) {
            headers.push(new Date(currentQuarter));
            currentQuarter.setMonth(currentQuarter.getMonth() + 3); // Add 3 months
          }
          
          // Ensure at least 4 quarters are shown
          if (headers.length < 4) {
            const lastQuarter = headers[headers.length - 1];
            for (let i = headers.length; i < 4; i++) {
              const nextQuarter = new Date(lastQuarter);
              nextQuarter.setMonth(lastQuarter.getMonth() + (i - headers.length + 1) * 3);
              headers.push(nextQuarter);
            }
          }
        } else if (currentViewMode === 'month') {
          // Generate monthly headers
          const startMonth = new Date(earliestDate);
          startMonth.setDate(1); // First day of month
          
          const endMonth = new Date(latestDate);
          endMonth.setDate(1); // First day of month
          
          const currentMonth = new Date(startMonth);
          
          while (currentMonth <= endMonth) {
            headers.push(new Date(currentMonth));
            currentMonth.setMonth(currentMonth.getMonth() + 1);
          }
          
          // Ensure at least 3 months are shown
          if (headers.length < 3) {
            const lastMonth = headers[headers.length - 1];
            for (let i = headers.length; i < 3; i++) {
              const nextMonth = new Date(lastMonth);
              nextMonth.setMonth(lastMonth.getMonth() + i - headers.length + 1);
              headers.push(nextMonth);
            }
          }
        } else if (currentViewMode === 'week') {
          // Generate weekly headers
          const dayDiff = Math.max(7, differenceInDays(latestDate, earliestDate));
          const numWeeks = Math.ceil(dayDiff / 7) + 1;
          
          // Start from beginning of the week
          const startOfWeek = new Date(earliestDate);
          startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
          
          for (let i = 0; i < numWeeks; i++) {
            headers.push(addDays(startOfWeek, i * 7));
          }
        } else {
          // Generate daily headers
          const dayDiff = Math.max(7, differenceInDays(latestDate, earliestDate));
          
          for (let i = 0; i <= dayDiff; i++) {
            headers.push(addDays(earliestDate, i));
          }
        }
      } catch (error) {
        console.error("Error parsing dates:", error);
        // In case of error, we'll use the default headers already generated
      }
    }
    
    setDateHeaders(headers);
  };

  // Get position for a task based on its dates
  const getTaskPosition = (task: SimpleGanttProps['tasks'][0]) => {
    if (!task.startDate || !task.endDate || dateHeaders.length === 0) {
      return { left: 0, width: 0 };
    }
    
    try {
      const startDate = parseISO(task.startDate);
      const endDate = parseISO(task.endDate);
      
      // Calculate position based on viewMode
      if (currentViewMode === 'year') {
        // Yearly view positioning
        const firstHeaderYear = new Date(dateHeaders[0]);
        const yearsDiff = startDate.getFullYear() - firstHeaderYear.getFullYear();
        
        const taskDurationYears = endDate.getFullYear() - startDate.getFullYear() + 1; // +1 to include current year
        
        // Calculate width based on number of date headers
        const cellWidth = 100 / dateHeaders.length;
        
        return {
          left: `${yearsDiff * cellWidth}%`, 
          width: `${taskDurationYears * cellWidth}%`
        };
      } else if (currentViewMode === 'quarter') {
        // Quarterly view positioning
        const firstHeaderQuarter = new Date(dateHeaders[0]);
        const startQuarter = Math.floor(startDate.getMonth() / 3);
        const endQuarter = Math.floor(endDate.getMonth() / 3);
        
        const quartersDiff = (startDate.getFullYear() - firstHeaderQuarter.getFullYear()) * 4 + 
                          (startQuarter - Math.floor(firstHeaderQuarter.getMonth() / 3));
        
        const taskDurationQuarters = (endDate.getFullYear() - startDate.getFullYear()) * 4 + 
                                 (endQuarter - startQuarter) + 1; // +1 to include current quarter
        
        // Calculate width based on number of date headers
        const cellWidth = 100 / dateHeaders.length;
        
        return {
          left: `${quartersDiff * cellWidth}%`, 
          width: `${taskDurationQuarters * cellWidth}%`
        };
      } else if (currentViewMode === 'month') {
        // Monthly view positioning
        const firstHeaderMonth = new Date(dateHeaders[0]);
        const monthsDiff = (startDate.getFullYear() - firstHeaderMonth.getFullYear()) * 12 + 
                          (startDate.getMonth() - firstHeaderMonth.getMonth());
        
        const taskDurationMonths = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                                 (endDate.getMonth() - startDate.getMonth()) + 1; // +1 to include current month
        
        // Calculate width based on number of date headers
        const cellWidth = 100 / dateHeaders.length;
        
        return {
          left: `${monthsDiff * cellWidth}%`, 
          width: `${taskDurationMonths * cellWidth}%`
        };
      } else if (currentViewMode === 'week') {
        // Weekly view positioning
        const firstHeader = dateHeaders[0];
        const weeksDiff = Math.floor(differenceInDays(startDate, firstHeader) / 7);
        const taskDurationWeeks = Math.ceil((differenceInDays(endDate, startDate) + 1) / 7);
        
        // Calculate width based on number of date headers
        const cellWidth = 100 / dateHeaders.length;
        
        return {
          left: `${weeksDiff * cellWidth}%`,
          width: `${taskDurationWeeks * cellWidth}%`
        };
      } else {
        // Daily view positioning
        const firstHeader = dateHeaders[0];
        const daysDiff = differenceInDays(startDate, firstHeader);
        const taskDurationDays = differenceInDays(endDate, startDate) + 1; // +1 to include the end day
        
        // Calculate width based on number of date headers
        const cellWidth = 100 / dateHeaders.length;
        
        return {
          left: `${daysDiff * cellWidth}%`,
          width: `${taskDurationDays * cellWidth}%`
        };
      }
    } catch (error) {
      console.error("Error calculating task position:", error);
      return { left: 0, width: 0 };
    }
  };

  // Get background color based on task status using theme colors
  const getTaskBackground = (status: string, priority: string) => {
    const statusLower = status.toLowerCase();
    
    if (statusLower === 'done' || statusLower === 'completed') {
      return theme.status.success + '20'; // 20% opacity
    }
    if (statusLower === 'in_progress' || statusLower === 'inprogress' || statusLower === 'in-progress') {
      return theme.status.info + '20';
    }
    if (statusLower === 'on_hold' || statusLower === 'blocked') {
      return theme.status.warning + '20';
    }
    if (statusLower === 'review' || statusLower === 'testing') {
      return theme.status.info + '20'; // Use theme info color instead of hardcoded purple
    }

    // Not started or todo - use priority color
    if (priority.toLowerCase() === 'high' || priority.toLowerCase() === 'critical') {
      return theme.status.error + '20';
    }
    if (priority.toLowerCase() === 'medium') {
      return theme.status.warning + '20';
    }

    return theme.background.muted + '40'; // Add opacity for consistency
  };

  // Get border color based on task status using theme colors
  const getTaskBorder = (status: string, priority: string) => {
    const statusLower = status.toLowerCase();
    
    if (statusLower === 'done' || statusLower === 'completed') {
      return theme.status.success;
    }
    if (statusLower === 'in_progress' || statusLower === 'inprogress' || statusLower === 'in-progress') {
      return theme.status.info;
    }
    if (statusLower === 'on_hold' || statusLower === 'blocked') {
      return theme.status.warning;
    }
    if (statusLower === 'review' || statusLower === 'testing') {
      return theme.status.info; // Use theme info color instead of hardcoded purple
    }

    // Not started or todo - use priority color
    if (priority.toLowerCase() === 'high' || priority.toLowerCase() === 'critical') {
      return theme.status.error;
    }
    if (priority.toLowerCase() === 'medium') {
      return theme.status.warning;
    }

    return theme.border.default;
  };

  // Get status text color based on task status using theme colors
  const getStatusTextColor = (status: string) => {
    const statusLower = status.toLowerCase();

    if (statusLower === 'done' || statusLower === 'completed') {
      return theme.status.success;
    }
    if (statusLower === 'in_progress' || statusLower === 'inprogress' || statusLower === 'in-progress') {
      return theme.status.info;
    }
    if (statusLower === 'on_hold' || statusLower === 'blocked') {
      return theme.status.warning;
    }
    if (statusLower === 'review' || statusLower === 'testing') {
      return theme.status.info;
    }

    return theme.text.muted;
  };

  // Handle mouse events for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    
    setIsDragging(true);
    setStartX(e.pageX - containerRef.current.offsetLeft);
    setScrollLeft(containerRef.current.scrollLeft);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // Scroll speed multiplier
    containerRef.current.scrollLeft = scrollLeft - walk;
  };

  if (isLoading) {
    return (
      <div
        className="rounded-lg p-6 space-y-4 w-full"
        style={{
          backgroundColor: theme.background.secondary,
          borderColor: theme.border.default,
          border: '1px solid'
        }}
      >
        <div className="flex gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-[250px] w-full" />
      </div>
    );
  }

  return (
    <div
      className="rounded-lg w-full"
      style={{
        width: "100%",
        minWidth: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        flex: 1,
        backgroundColor: theme.background.secondary,
        borderColor: theme.border.default,
        border: '1px solid'
      }}
    >
      {/* Navigation buttons */}
      <div
        className="flex flex-col space-y-2"
        style={{ borderBottom: `1px solid ${theme.border.muted}` }}
      >
        {/* Date navigation */}
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center space-x-2">
            <button 
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log("Previous button clicked");
                goToPrevious();
              }}
              className="p-1 rounded-md transition-colors"
              style={{
                backgroundColor: 'transparent',
                color: theme.text.muted,
                ':hover': {
                  backgroundColor: theme.background.muted,
                  color: theme.text.primary
                }
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.background.muted;
                e.currentTarget.style.color = theme.text.primary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = theme.text.muted;
              }}
              aria-label="Previous"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button 
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log("Today button clicked");
                goToToday();
              }}
              className="px-3 py-1 text-xs font-medium rounded-md transition-colors"
              style={{
                backgroundColor: theme.button.primary.background + '20',
                color: theme.button.primary.background,
                border: 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.button.primary.background + '30';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = theme.button.primary.background + '20';
              }}
            >
              {messages?.timeline?.today || "TODAY"}
            </button>
            <button 
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log("Next button clicked");
                goToNext();
              }}
              className="p-1 rounded-md transition-colors"
              style={{
                backgroundColor: 'transparent',
                color: theme.text.muted
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.background.muted;
                e.currentTarget.style.color = theme.text.primary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = theme.text.muted;
              }}
              aria-label="Next"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
          <div className="text-sm" style={{ color: theme.text.muted }}>
            {dateHeaders.length > 0 && (
              <span>
                {format(dateHeaders[0], 'MMM dd, yyyy')} 
                {dateHeaders.length > 1 && ` - ${format(dateHeaders[dateHeaders.length - 1], 'MMM dd, yyyy')}`}
              </span>
            )}
          </div>
        </div>
        
        {/* View mode selector */}
        <div className="flex items-center justify-center px-4 pb-2">
          <div
            className="flex rounded-md p-0.5 text-xs"
            style={{ backgroundColor: theme.background.muted }}
          >
            {(['day', 'week', 'month', 'quarter', 'year'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => handleViewModeChange(mode)}
                className="px-3 py-1 rounded-sm transition-colors"
                style={{
                  backgroundColor: currentViewMode === mode ? theme.button.primary.background : 'transparent',
                  color: currentViewMode === mode ? theme.button.primary.text : theme.text.muted
                }}
                onMouseEnter={(e) => {
                  if (currentViewMode !== mode) {
                    e.currentTarget.style.backgroundColor = theme.background.muted + '80';
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentViewMode !== mode) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                {messages?.timeline?.viewModes?.[mode] || mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>
      {isDragging && (
        <div 
          className="fixed inset-0 z-50 cursor-grabbing" 
          onMouseUp={handleMouseUp} 
          onMouseMove={handleMouseMove}
        />
      )}
      
      <div 
        ref={containerRef}
        className="overflow-x-auto cursor-grab pb-4 scrollbar-hide w-full"
        style={{ 
          overflowY: 'hidden', 
          padding: '12px', 
          minWidth: '100%',
          width: '100%',
          flex: 1,
          height: "100%",
          display: "flex",
          flexDirection: "column"
        }}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseUp}
      >
        {/* Date Headers */}
        <div className="grid w-full" style={{ 
          gridTemplateColumns: `repeat(${dateHeaders.length}, minmax(${cellWidth}, 1fr))`,
          position: 'sticky',
          top: 0,
          backgroundColor: theme.background.primary,
          zIndex: 10,
          marginBottom: '12px',
          width: '100%',
          minWidth: '100%'
        }}>
          {dateHeaders.map((date, index) => (
            <div
              key={index}
              className="text-center text-xs font-medium p-2"
              style={{
                borderRight: `1px solid ${theme.border.muted}`,
                color: theme.text.muted
              }}
            >
              {currentViewMode === 'year'
                ? format(date, 'yyyy')
                : currentViewMode === 'quarter' 
                ? `Q${Math.floor(date.getMonth() / 3) + 1} ${format(date, 'yyyy')}`
                : currentViewMode === 'month' 
                ? format(date, 'MMM yyyy')
                : format(date, 'MMM dd')}
            </div>
          ))}
        </div>
        
        {/* Tasks Grid */}
        <div className="relative w-full" style={{ 
          width: "100%", 
          minWidth: "100%",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          height: "100%"
        }}>
          {/* Background Grid Lines */}
          <div className="grid absolute inset-0 w-full" style={{ 
            gridTemplateColumns: `repeat(${dateHeaders.length}, minmax(${cellWidth}, 1fr))`,
            height: '100%',
            width: '100%',
            minWidth: '100%',
            minHeight: '300px'
          }}>
            {dateHeaders.map((_, index) => (
              <div key={index} className="border-r border-border/10 h-full"></div>
            ))}
          </div>
          
          {/* Tasks */}
          <div className="space-y-3 relative w-full" style={{ 
            width: "100%", 
            minWidth: "100%",
            flex: 1,
            minHeight: "300px",
            height: "100%"
          }}>
            {tasks.length > 0 ? (
              // Map tasks if there are any
              tasks.map((task) => (
                <div key={task.id} className="relative flex items-center w-full"
                  style={{
                    height: currentViewMode === 'year' ? '45px' : 
                            currentViewMode === 'quarter' ? '50px' : 
                            currentViewMode === 'month' ? '55px' : '60px'
                  }}>
                  <div 
                    style={{
                      position: 'absolute',
                      left: getTaskPosition(task).left,
                      width: getTaskPosition(task).width,
                      height: currentViewMode === 'year' ? '35px' : 
                              currentViewMode === 'quarter' ? '40px' : 
                              currentViewMode === 'month' ? '45px' : '50px',
                      borderRadius: '4px',
                      border: '1px solid',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      overflow: 'hidden',
                      zIndex: 10
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      if (onTaskClick) {
                        console.log('Task clicked:', task.id);
                        onTaskClick(task.id);
                      }
                    }}
                    className={`hover:shadow-lg hover:brightness-105 task-card group ${getTaskBackground(task.status, task.priority)} ${getTaskBorder(task.status, task.priority)} relative`}
                  >
                    {/* Task tooltip */}
                    <div
                      className="absolute opacity-0 group-hover:opacity-100 transition-opacity invisible group-hover:visible shadow-lg rounded-md p-3 z-50 w-64 pointer-events-none"
                      style={{
                        bottom: 'calc(100% + 10px)',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        maxWidth: '300px',
                        backgroundColor: theme.background.primary,
                        color: theme.text.primary,
                        border: `1px solid ${theme.border.default}`,
                        boxShadow: `0 5px 15px ${theme.background.primary === '#1e1f21' ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.1)'}`
                      }}
                    >
                      <div className="space-y-2">
                        <h3 className="font-medium text-sm" style={{ color: theme.text.primary }}>
                          {task.title}
                        </h3>
                        {task.description && (
                          <p className="text-xs" style={{ color: theme.text.muted }}>
                            {task.description}
                          </p>
                        )}
                        <div className="grid grid-cols-2 gap-1 text-xs">
                          <div>
                            <span style={{ color: theme.text.muted }}>Status:</span>
                            <span
                              className="ml-1 font-medium"
                              style={{ color: getStatusTextColor(task.status) }}
                            >
                              {task.status.toLowerCase() === 'not_started' || task.status.toLowerCase() === 'todo' || task.status.toUpperCase() === 'TODO' ? 'Not Started' :
                               task.status.toLowerCase() === 'in_progress' || task.status.toLowerCase() === 'inprogress' || task.status.toUpperCase() === 'IN_PROGRESS' ? 'In Progress' :
                               task.status.toLowerCase() === 'done' || task.status.toLowerCase() === 'completed' || task.status.toUpperCase() === 'DONE' ? 'Done' :
                               task.status.toLowerCase() === 'review' || task.status.toUpperCase() === 'REVIEW' ? 'Review' :
                               task.status.toLowerCase() === 'testing' || task.status.toUpperCase() === 'TESTING' ? 'Testing' :
                               task.status.toLowerCase() === 'on_hold' || task.status.toLowerCase() === 'blocked' || task.status.toUpperCase() === 'BLOCKED' ? 'Blocked' : task.status}
                            </span>
                          </div>
                          <div>
                            <span style={{ color: theme.text.muted }}>Priority:</span>
                            <span
                              className="ml-1 font-medium"
                              style={{
                                color: task.priority === 'high' ? theme.status.error :
                                       task.priority === 'medium' ? theme.status.warning :
                                       theme.text.muted
                              }}
                            >
                              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                            </span>
                          </div>
                          <div>
                            <span style={{ color: theme.text.muted }}>Start:</span>
                            <span className="ml-1" style={{ color: theme.text.secondary }}>
                              {format(parseISO(task.startDate), 'MMM dd, yyyy')}
                            </span>
                          </div>
                          <div>
                            <span style={{ color: theme.text.muted }}>End:</span>
                            <span className="ml-1" style={{ color: theme.text.secondary }}>
                              {format(parseISO(task.endDate), 'MMM dd, yyyy')}
                            </span>
                          </div>
                          {task.assignee && (
                            <div className="col-span-2">
                              <span style={{ color: theme.text.muted }}>Assignee:</span>
                              <span className="ml-1" style={{ color: theme.text.secondary }}>
                                {task.assignee.name}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      {/* Tooltip arrow */}
                      <div
                        className="absolute w-3 h-3 rotate-45 -bottom-1.5 left-1/2 -translate-x-1/2"
                        style={{
                          backgroundColor: theme.background.primary,
                          border: `1px solid ${theme.border.default}`,
                          borderTop: 'none',
                          borderLeft: 'none'
                        }}
                      ></div>
                    </div>
                    <div
                      className="flex justify-between items-center mb-1 px-2 pt-2"
                      style={{ color: theme.text.primary }}
                    >
                      <div className={`font-medium truncate max-w-[150px] flex items-center gap-1 ${
                        currentViewMode === 'year' ? 'text-[10px]' : 
                        currentViewMode === 'quarter' ? 'text-[11px]' : 
                        currentViewMode === 'month' ? 'text-xs' : 'text-sm'
                      }`}
                      style={{ color: theme.text.primary }}
                      >
                        {(task.status.toLowerCase() === 'done' || task.status.toLowerCase() === 'completed' || task.status.toUpperCase() === 'DONE') && (
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            viewBox="0 0 24 24" 
                            className={`flex-shrink-0 ${
                              currentViewMode === 'year' ? 'w-2.5 h-2.5' : 
                              currentViewMode === 'quarter' ? 'w-3 h-3' : 
                              currentViewMode === 'month' ? 'w-3.5 h-3.5' : 'w-4 h-4'
                            }`}
                            fill="currentColor"
                            strokeWidth="2"
                            style={{ color: theme.status.success }}
                          >
                            <circle cx="12" cy="12" r="10" fill="currentColor" />
                            <path d="M8 12l3 3 5-6" stroke="white" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                        <span className="truncate">{task.title}</span>
                      </div>
                    </div>
                    {(currentViewMode !== 'year') && (
                      <div className={`flex items-center gap-1 px-2 ${
                        currentViewMode === 'quarter' ? 'text-[10px]' : 
                        currentViewMode === 'month' ? 'text-xs' : 'text-xs'
                      }`}
                      style={{ color: theme.text.muted }}
                      >
                        {task.assignee && currentViewMode !== 'quarter' && (
                          <span
                            className="inline-block text-[10px] px-1 py-0.5 rounded-sm"
                            style={{
                              backgroundColor: theme.background.muted + '50',
                              color: theme.text.secondary
                            }}
                          >
                            {task.assignee.name}
                          </span>
                        )}
                        <span
                          className={currentViewMode === 'quarter' ? 'text-[9px]' : 'text-[10px] ml-auto'}
                          style={{ color: theme.text.muted }}
                        >
                          {currentViewMode === 'quarter'
                            ? format(parseISO(task.startDate), 'MMM')
                            : format(parseISO(task.startDate), 'MMM dd')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              // Empty placeholder to maintain timeline height when no tasks
              <div className="min-h-[300px] relative w-full" style={{ 
                width: "100%", 
                minWidth: "100%",
                height: "100%",
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <div
                  className="absolute inset-0 flex items-center justify-center text-sm w-full"
                  style={{
                    width: "100%",
                    height: "100%",
                    color: theme.text.muted
                  }}
                >
                  <div className="text-center p-4">
                    <p style={{ color: theme.text.muted }}>
                      {messages?.gantt?.noTasks || 'Không có task nào'}
                    </p>
                    <p
                      className="text-xs mt-1"
                      style={{ color: theme.text.muted + '80' }}
                    >
                      {messages?.gantt?.noTasksHint || 'Khi có task, chúng sẽ hiển thị ở đây'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleGantt;
