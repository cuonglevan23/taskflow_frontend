"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { format, addDays, differenceInDays, parseISO, subDays } from 'date-fns';

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
  const [currentDateOffset, setCurrentDateOffset] = useState(0); // New state for date navigation
  const [currentViewMode, setCurrentViewMode] = useState<'day' | 'week' | 'month' | 'quarter' | 'year'>(viewMode);

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
    console.log("Recalculating headers due to change in viewMode, tasks, or currentDateOffset:", currentDateOffset);
    generateDateHeaders();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentViewMode, tasks, currentDateOffset]);
  
  // Navigation functions
  const goToToday = () => {
    console.log("Going to today (resetting offset)");
    setCurrentDateOffset(0); // Reset to today
  };
  
  const goToPrevious = () => {
    console.log("Going to previous, current offset:", currentDateOffset);
    // Calculate the appropriate offset based on view mode and update state
    const newOffset = currentDateOffset - 1;
    console.log("Setting new offset:", newOffset);
    setCurrentDateOffset(newOffset);
  };
  
  const goToNext = () => {
    console.log("Going to next, current offset:", currentDateOffset);
    // Calculate the appropriate offset based on view mode and update state
    const newOffset = currentDateOffset + 1;
    console.log("Setting new offset:", newOffset);
    setCurrentDateOffset(newOffset);
  };

  // Function to generate date headers based on viewMode and tasks
  const generateDateHeaders = () => {
    console.log("Generating date headers with offset:", currentDateOffset, "view mode:", currentViewMode);
    
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

  // Get background color based on task status
  const getTaskBackground = (status: string, priority: string) => {
    // Convert status to lowercase for case-insensitive comparison
    const statusLower = status.toLowerCase();
    
    if (statusLower === 'done' || statusLower === 'completed') return 'bg-green-100 dark:bg-green-900/15';
    if (statusLower === 'in_progress' || statusLower === 'inprogress' || statusLower === 'in-progress') return 'bg-blue-100 dark:bg-blue-900/15';
    if (statusLower === 'on_hold' || statusLower === 'blocked') return 'bg-amber-100 dark:bg-amber-900/15';
    if (statusLower === 'review' || statusLower === 'testing') return 'bg-purple-100 dark:bg-purple-900/15';
    
    // Not started or todo - use priority color
    if (priority.toLowerCase() === 'high' || priority.toLowerCase() === 'critical') return 'bg-red-100 dark:bg-red-900/15';
    if (priority.toLowerCase() === 'medium') return 'bg-orange-100 dark:bg-orange-900/15';
    
    return 'bg-muted/30';
  };

  // Get border color based on task status
  const getTaskBorder = (status: string, priority: string) => {
    // Convert status to lowercase for case-insensitive comparison
    const statusLower = status.toLowerCase();
    
    if (statusLower === 'done' || statusLower === 'completed') return 'border-green-300 dark:border-green-800';
    if (statusLower === 'in_progress' || statusLower === 'inprogress' || statusLower === 'in-progress') return 'border-blue-300 dark:border-blue-800';
    if (statusLower === 'on_hold' || statusLower === 'blocked') return 'border-amber-300 dark:border-amber-800';
    if (statusLower === 'review' || statusLower === 'testing') return 'border-purple-300 dark:border-purple-800';
    
    // Not started or todo - use priority color
    if (priority.toLowerCase() === 'high' || priority.toLowerCase() === 'critical') return 'border-red-300 dark:border-red-800';
    if (priority.toLowerCase() === 'medium') return 'border-orange-300 dark:border-orange-800';
    
    return 'border-muted';
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
      <div className="border border-border/30 rounded-lg bg-card/30 p-6 space-y-4 w-full">
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
    <div className="border border-border/30 rounded-lg bg-card/30 w-full" style={{ 
      width: "100%", 
      minWidth: "100%", 
      height: "100%", 
      display: "flex", 
      flexDirection: "column",
      flex: 1
    }}>
      {/* Navigation buttons */}
      <div className="flex flex-col space-y-2 border-b border-border/30">
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
              className="p-1 rounded-md hover:bg-muted/30 text-muted-foreground hover:text-foreground transition-colors"
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
              className="px-3 py-1 text-xs font-medium rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
            >
              TODAY
            </button>
            <button 
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log("Next button clicked");
                goToNext();
              }}
              className="p-1 rounded-md hover:bg-muted/30 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Next"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
          <div className="text-sm text-muted-foreground">
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
          <div className="flex bg-muted/20 rounded-md p-0.5 text-xs">
            <button
              type="button"
              onClick={() => handleViewModeChange('day')}
              className={`px-3 py-1 rounded-sm transition-colors ${
                currentViewMode === 'day' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'hover:bg-muted/50 text-muted-foreground'
              }`}
            >
              Day
            </button>
            <button
              type="button"
              onClick={() => handleViewModeChange('week')}
              className={`px-3 py-1 rounded-sm transition-colors ${
                currentViewMode === 'week' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'hover:bg-muted/50 text-muted-foreground'
              }`}
            >
              Week
            </button>
            <button
              type="button"
              onClick={() => handleViewModeChange('month')}
              className={`px-3 py-1 rounded-sm transition-colors ${
                currentViewMode === 'month' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'hover:bg-muted/50 text-muted-foreground'
              }`}
            >
              Month
            </button>
            <button
              type="button"
              onClick={() => handleViewModeChange('quarter')}
              className={`px-3 py-1 rounded-sm transition-colors ${
                currentViewMode === 'quarter' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'hover:bg-muted/50 text-muted-foreground'
              }`}
            >
              Quarter
            </button>
            <button
              type="button"
              onClick={() => handleViewModeChange('year')}
              className={`px-3 py-1 rounded-sm transition-colors ${
                currentViewMode === 'year' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'hover:bg-muted/50 text-muted-foreground'
              }`}
            >
              Year
            </button>
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
          background: 'var(--color-background-primary)',
          zIndex: 10,
          marginBottom: '12px',
          width: '100%',
          minWidth: '100%'
        }}>
          {dateHeaders.map((date, index) => (
            <div key={index} className="text-center text-xs font-medium border-r border-border/20 p-2 text-muted-foreground">
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
                    <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity invisible group-hover:visible bg-popover text-popover-foreground shadow-lg rounded-md p-3 z-50 w-64 pointer-events-none" 
                      style={{
                        bottom: 'calc(100% + 10px)',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        maxWidth: '300px',
                        boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
                      }}
                    >
                      <div className="space-y-2">
                        <h3 className="font-medium text-sm">{task.title}</h3>
                        {task.description && (
                          <p className="text-xs text-muted-foreground">{task.description}</p>
                        )}
                        <div className="grid grid-cols-2 gap-1 text-xs">
                          <div>
                            <span className="text-muted-foreground">Status:</span>
                            <span className={`ml-1 font-medium ${
                              (task.status.toLowerCase() === 'done' || task.status.toLowerCase() === 'completed' || task.status.toUpperCase() === 'DONE') ? 'text-green-500' :
                              (task.status.toLowerCase() === 'in_progress' || task.status.toLowerCase() === 'inprogress' || task.status.toUpperCase() === 'IN_PROGRESS') ? 'text-blue-500' :
                              (task.status.toLowerCase() === 'on_hold' || task.status.toLowerCase() === 'blocked' || task.status.toUpperCase() === 'BLOCKED') ? 'text-amber-500' :
                              (task.status.toLowerCase() === 'review' || task.status.toLowerCase() === 'testing' || task.status.toUpperCase() === 'REVIEW' || task.status.toUpperCase() === 'TESTING') ? 'text-purple-500' : 'text-muted-foreground'
                            }`}>
                              {task.status.toLowerCase() === 'not_started' || task.status.toLowerCase() === 'todo' || task.status.toUpperCase() === 'TODO' ? 'Not Started' :
                               task.status.toLowerCase() === 'in_progress' || task.status.toLowerCase() === 'inprogress' || task.status.toUpperCase() === 'IN_PROGRESS' ? 'In Progress' :
                               task.status.toLowerCase() === 'done' || task.status.toLowerCase() === 'completed' || task.status.toUpperCase() === 'DONE' ? 'Done' :
                               task.status.toLowerCase() === 'review' || task.status.toUpperCase() === 'REVIEW' ? 'Review' :
                               task.status.toLowerCase() === 'testing' || task.status.toUpperCase() === 'TESTING' ? 'Testing' :
                               task.status.toLowerCase() === 'on_hold' || task.status.toLowerCase() === 'blocked' || task.status.toUpperCase() === 'BLOCKED' ? 'Blocked' : task.status}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Priority:</span>
                            <span className={`ml-1 font-medium ${
                              task.priority === 'high' ? 'text-red-500' :
                              task.priority === 'medium' ? 'text-orange-500' : 'text-muted-foreground'
                            }`}>
                              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Start:</span>
                            <span className="ml-1">{format(parseISO(task.startDate), 'MMM dd, yyyy')}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">End:</span>
                            <span className="ml-1">{format(parseISO(task.endDate), 'MMM dd, yyyy')}</span>
                          </div>
                          {task.assignee && (
                            <div className="col-span-2">
                              <span className="text-muted-foreground">Assignee:</span>
                              <span className="ml-1">{task.assignee.name}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      {/* Tooltip arrow */}
                      <div className="absolute w-3 h-3 bg-popover rotate-45 -bottom-1.5 left-1/2 -translate-x-1/2"></div>
                    </div>
                    <div className="flex justify-between items-center mb-1 px-2 pt-2">
                      <div className={`font-medium truncate max-w-[150px] text-foreground group-hover:text-foreground/90 flex items-center gap-1 ${
                        currentViewMode === 'year' ? 'text-[10px]' : 
                        currentViewMode === 'quarter' ? 'text-[11px]' : 
                        currentViewMode === 'month' ? 'text-xs' : 'text-sm'
                      }`}>
                        {(task.status.toLowerCase() === 'done' || task.status.toLowerCase() === 'completed' || task.status.toUpperCase() === 'DONE') && (
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            viewBox="0 0 24 24" 
                            className={`text-green-500 flex-shrink-0 ${
                              currentViewMode === 'year' ? 'w-2.5 h-2.5' : 
                              currentViewMode === 'quarter' ? 'w-3 h-3' : 
                              currentViewMode === 'month' ? 'w-3.5 h-3.5' : 'w-4 h-4'
                            }`}
                            fill="currentColor"
                            strokeWidth="2"
                          >
                            <circle cx="12" cy="12" r="10" fill="currentColor" />
                            <path d="M8 12l3 3 5-6" stroke="white" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                        <span className="truncate">{task.title}</span>
                      </div>
                    </div>
                    {(currentViewMode !== 'year') && (
                      <div className={`text-muted-foreground/80 flex items-center gap-1 px-2 ${
                        currentViewMode === 'quarter' ? 'text-[10px]' : 
                        currentViewMode === 'month' ? 'text-xs' : 'text-xs'
                      }`}>
                        {task.assignee && currentViewMode !== 'quarter' && (
                          <span className="inline-block text-[10px] px-1 py-0.5 bg-muted/30 rounded-sm">
                            {task.assignee.name}
                          </span>
                        )}
                        <span className={currentViewMode === 'quarter' ? 'text-[9px]' : 'text-[10px] ml-auto'}>
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
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm w-full" style={{ 
                  width: "100%",
                  height: "100%"
                }}>
                  <div className="text-center p-4">
                    <p>Không có task nào</p>
                    <p className="text-xs mt-1">Khi có task, chúng sẽ hiển thị ở đây</p>
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
