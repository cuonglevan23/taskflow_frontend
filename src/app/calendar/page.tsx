"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Calendar } from "@/components/Calendar";
import type { CalendarView } from "@/components/Calendar";

// Mock events data
const MOCK_EVENTS = [
  {
    id: '1',
    title: 'Team Meeting',
    start: '2025-08-14T10:00:00',
    end: '2025-08-14T11:00:00',
    type: 'meeting' as const,
    color: '#F59E0B',
    description: 'Weekly team sync meeting',
    priority: 'medium' as const,
    allDay: false
  },
  {
    id: '2',
    title: 'Project Deadline',
    start: '2025-08-22',
    type: 'deadline' as const,
    color: '#EF4444',
    description: 'Final project submission deadline',
    priority: 'high' as const,
    allDay: true
  },
  {
    id: '3',
    title: 'Client Review',
    start: '2025-08-28T14:00:00',
    end: '2025-08-28T15:30:00',
    type: 'meeting' as const,
    color: '#F59E0B',
    description: 'Project review with client',
    priority: 'high' as const,
    allDay: false
  }
];

export default function CalendarPage() {
  const [currentView, setCurrentView] = useState<CalendarView>('dayGridMonth');
  const [weekendsVisible, setWeekendsVisible] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date(2025, 7, 1)); // August 2025
  
  // Simple navigation handlers
  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleEventClick = (event: any) => {
    console.log('Event clicked:', event);
  };

  // Calculate header height
  const headerHeight = 121; // 73px (navigation) + 48px (day headers)

  return (
    <>
      {/* Calendar with two parts: fixed header and scrollable content */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-gray-900 pb-2">
        {/* Calendar header with navigation */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-900">
          <div className="flex items-center space-x-4">
            <button
              onClick={goToToday}
              className="px-3 py-1.5 text-sm bg-gray-800 text-gray-300 border border-gray-600 rounded hover:bg-gray-700 transition-colors"
            >
              Today
            </button>
            
            <div className="flex items-center space-x-1">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-1 text-gray-400 hover:text-gray-200 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => navigateMonth('next')}
                className="p-1 text-gray-400 hover:text-gray-200 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <h2 className="text-lg font-semibold text-white">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
          </div>

          {/* Weekends toggle */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-400">Weekends:</span>
            <button
              onClick={() => setWeekendsVisible(!weekendsVisible)}
              className={`px-2 py-1 text-xs rounded-full transition-colors ${
                weekendsVisible 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-300'
              }`}
            >
              {weekendsVisible ? 'On' : 'Off'}
            </button>
          </div>
        </div>

        {/* Day headers */}
        <div className="border-b border-gray-700 bg-gray-900">
          <div className="grid grid-cols-7 w-full text-center py-3">
            <div className="text-gray-400 text-xs font-semibold uppercase tracking-wider">MON</div>
            <div className="text-gray-400 text-xs font-semibold uppercase tracking-wider">TUE</div>
            <div className="text-gray-400 text-xs font-semibold uppercase tracking-wider">WED</div>
            <div className="text-gray-400 text-xs font-semibold uppercase tracking-wider">THU</div>
            <div className="text-gray-400 text-xs font-semibold uppercase tracking-wider">FRI</div>
            <div className="text-gray-400 text-xs font-semibold uppercase tracking-wider">SAT</div>
            <div className="text-gray-400 text-xs font-semibold uppercase tracking-wider">SUN</div>
          </div>
        </div>
      </div>

      {/* Calendar content with padding-top to avoid header overlap */}
      <div 
        className="h-full bg-gray-900 text-white" 
        style={{ paddingTop: `${headerHeight}px` }}
      >
        <Calendar
          events={MOCK_EVENTS}
          currentDate={currentDate}
          onDateChange={setCurrentDate}
          onEventClick={handleEventClick}
          initialView="dayGridMonth"
          height="auto"
          editable={true}
          droppable={true}
          headerToolbar={{
            left: '',
            center: '',
            right: ''
          }}
          fixedWeekCount={false}
          showNonCurrentDates={true}
          dayHeaderFormat={{ weekday: 'short' }}
          // Hide month names in cells
          dayCellContent={(args) => {
            return args.date.getDate();
          }}
        />
      </div>
    </>
  );
}