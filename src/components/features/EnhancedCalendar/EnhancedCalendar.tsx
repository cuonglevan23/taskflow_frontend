"use client";

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface EnhancedCalendarProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
    repeatType: string;
    repeatDays: string[];
  }) => void;
}

const EnhancedCalendar: React.FC<EnhancedCalendarProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [startDate, setStartDate] = useState('05/08/25');
  const [endDate, setEndDate] = useState('28/08/25');
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('10:30');
  const [repeatType, setRepeatType] = useState('Weekly');
  const [selectedDays, setSelectedDays] = useState(['T']); // Thursday selected
  const [selectedDateRange, setSelectedDateRange] = useState<Date[]>([]);
  const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(new Date(2025, 7, 5)); // August 5, 2025
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(new Date(2025, 7, 28)); // August 28, 2025
  const [isSelectingRange, setIsSelectingRange] = useState(false);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekdays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const weekdaysFull = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const weekdaysUnique = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    // Get first day of week (0 = Sunday, 1 = Monday, etc.)
    const firstDayOfWeek = (firstDay.getDay() + 6) % 7; // Convert to Monday = 0
    
    const days = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < firstDayOfWeek; i++) {
      const prevMonthDate = new Date(year, month, 0 - (firstDayOfWeek - 1 - i));
      days.push({ date: prevMonthDate, isCurrentMonth: false });
    }
    
    // Add days of current month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({ date: new Date(year, month, day), isCurrentMonth: true });
    }
    
    // Add days from next month to fill the grid
    const remainingCells = 42 - days.length;
    for (let day = 1; day <= remainingCells; day++) {
      days.push({ date: new Date(year, month + 1, day), isCurrentMonth: false });
    }
    
    return days;
  };

  const isDateInRange = (date: Date) => {
    // For demo, highlight dates between 5th and 28th of August 2025
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();
    
    if (year === 2025 && month === 7) { // August
      return day >= 5 && day <= 28;
    }
    return false;
  };

  const isStartDate = (date: Date) => {
    if (!selectedStartDate) return false;
    return date.toDateString() === selectedStartDate.toDateString();
  };

  const isEndDate = (date: Date) => {
    if (!selectedEndDate) return false;
    return date.toDateString() === selectedEndDate.toDateString();
  };

  const isMiddleDate = (date: Date) => {
    if (!selectedStartDate || !selectedEndDate) return false;
    return date > selectedStartDate && date < selectedEndDate;
  };

  const handleDateClick = (date: Date) => {
    if (!isSelectingRange) {
      // Start new selection
      setSelectedStartDate(date);
      setSelectedEndDate(null);
      setIsSelectingRange(true);
      
      // Update date input
      const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear().toString().slice(-2)}`;
      setStartDate(formattedDate);
      setEndDate('');
    } else {
      // Complete selection
      if (selectedStartDate && date >= selectedStartDate) {
        setSelectedEndDate(date);
        setIsSelectingRange(false);
        
        // Update end date input
        const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear().toString().slice(-2)}`;
        setEndDate(formattedDate);
      } else if (selectedStartDate && date < selectedStartDate) {
        // If clicked date is before start, make it the new start
        setSelectedStartDate(date);
        setSelectedEndDate(selectedStartDate);
        setIsSelectingRange(false);
        
        // Update both dates
        const formattedStartDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear().toString().slice(-2)}`;
        const formattedEndDate = `${selectedStartDate.getDate().toString().padStart(2, '0')}/${(selectedStartDate.getMonth() + 1).toString().padStart(2, '0')}/${selectedStartDate.getFullYear().toString().slice(-2)}`;
        setStartDate(formattedStartDate);
        setEndDate(formattedEndDate);
      }
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const toggleDay = (day: string) => {
    setSelectedDays(prev => {
      if (prev.includes(day)) {
        return prev.filter(d => d !== day);
      } else {
        return [...prev, day];
      }
    });
  };

  const handleClear = () => {
    setStartDate('');
    setEndDate('');
    setStartTime('');
    setEndTime('');
    setSelectedDays([]);
    setSelectedDateRange([]);
  };

  if (!isOpen) return null;

  const days = getDaysInMonth(currentDate);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70]">
      <div className="bg-gray-800 rounded-lg p-6 w-[500px] max-h-[80vh] overflow-y-auto">
        {/* Header with date/time inputs */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Start Date & Time */}
          <div className="space-y-2">
            <div className="relative">
              <input
                type="text"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 pr-8"
                placeholder="dd/mm/yy"
              />
              <X className="absolute right-2 top-2.5 w-4 h-4 text-gray-400 cursor-pointer" />
            </div>
            <div className="relative">
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 pr-8"
              />
              <X className="absolute right-2 top-2.5 w-4 h-4 text-gray-400 cursor-pointer" />
            </div>
          </div>

          {/* End Date & Time */}
          <div className="space-y-2">
            <div className="relative">
              <input
                type="text"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 pr-8"
                placeholder="dd/mm/yy"
              />
              <X className="absolute right-2 top-2.5 w-4 h-4 text-gray-400 cursor-pointer" />
            </div>
            <div className="relative">
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 pr-8"
              />
              <X className="absolute right-2 top-2.5 w-4 h-4 text-gray-400 cursor-pointer" />
            </div>
          </div>
        </div>

        {/* Calendar */}
        <div className="mb-6">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-1 hover:bg-gray-700 rounded"
            >
              <ChevronLeft className="w-5 h-5 text-gray-300" />
            </button>
            <h3 className="text-lg font-medium text-gray-300">
              {months[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
            <button
              onClick={() => navigateMonth('next')}
              className="p-1 hover:bg-gray-700 rounded"
            >
              <ChevronRight className="w-5 h-5 text-gray-300" />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 mb-2">
            {weekdays.map((day, index) => (
              <div key={weekdaysUnique[index]} className="text-center text-sm text-gray-400 font-medium p-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-0 border border-gray-600 rounded-lg overflow-hidden">
            {days.map((dayInfo, index) => {
              const { date, isCurrentMonth } = dayInfo;
              const day = date.getDate();
              const isStart = isStartDate(date);
              const isEnd = isEndDate(date);
              const isMiddle = isMiddleDate(date);
              const rowIndex = Math.floor(index / 7);
              const colIndex = index % 7;
              
              // Check if it's the first or last day of the week for range styling
              const isFirstInWeek = colIndex === 0;
              const isLastInWeek = colIndex === 6;
              
              let classes = ['h-10 w-full text-sm transition-all duration-200 relative border-r border-b border-gray-600'];
              
              // Remove right border on last column
              if (isLastInWeek) {
                classes.push('border-r-0');
              }
              
              // Remove bottom border on last row
              if (rowIndex === 5) {
                classes.push('border-b-0');
              }
              
              if (!isCurrentMonth) {
                classes.push('text-gray-600');
              } else if (isStart || isEnd) {
                // Start and end dates - darker blue with rounded corners
                classes.push('bg-blue-700 text-white font-semibold relative z-10');
                if (isStart) {
                  classes.push('rounded-l-md');
                }
                if (isEnd) {
                  classes.push('rounded-r-md');
                }
              } else if (isMiddle) {
                // Middle dates in range - lighter blue, full width
                classes.push('bg-blue-600 text-white');
              } else {
                // Regular dates
                classes.push('text-gray-300 hover:bg-gray-700 hover:text-white');
              }
              
              return (
                <button
                  key={index}
                  onClick={() => isCurrentMonth && handleDateClick(date)}
                  disabled={!isCurrentMonth}
                  className={classes.join(' ')}
                  style={{
                    // Add connecting background for range
                    ...(isMiddle && {
                      backgroundColor: '#2563eb',
                      borderRadius: '0'
                    }),
                    ...(isStart && {
                      backgroundColor: '#1d4ed8',
                      borderTopLeftRadius: '6px',
                      borderBottomLeftRadius: '6px'
                    }),
                    ...(isEnd && {
                      backgroundColor: '#1d4ed8',
                      borderTopRightRadius: '6px',
                      borderBottomRightRadius: '6px'
                    }),
                    cursor: isCurrentMonth ? 'pointer' : 'default'
                  }}
                >
                  <span className="relative z-10">{day}</span>
                  
                  {/* Background connector for range */}
                  {(isStart || isMiddle || isEnd) && (
                    <div 
                      className="absolute inset-0 bg-blue-600"
                      style={{
                        zIndex: -1,
                        borderRadius: isStart ? '6px 0 0 6px' : isEnd ? '0 6px 6px 0' : '0'
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Repeats section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-300 font-medium">Repeats</span>
            <select
              value={repeatType}
              onChange={(e) => setRepeatType(e.target.value)}
              className="bg-gray-700 text-white px-3 py-1 rounded border border-gray-600"
            >
              <option value="Never">Never</option>
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
              <option value="Monthly">Monthly</option>
              <option value="Yearly">Yearly</option>
            </select>
          </div>

          {/* Days of week */}
          <div>
            <div className="text-gray-300 text-sm mb-2">On these days</div>
            <div className="grid grid-cols-7 gap-2">
              {weekdaysFull.map((day, index) => (
                <button
                  key={`day-${index}`}
                  onClick={() => toggleDay(day)}
                  className={`
                    w-8 h-8 text-sm font-medium rounded transition-colors
                    ${selectedDays.includes(day) 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }
                  `}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="p-2 bg-gray-700 rounded hover:bg-gray-600">
              <div className="w-4 h-4 bg-gray-500 rounded"></div>
            </button>
            <button className="p-2 bg-gray-700 rounded hover:bg-gray-600">
              <div className="w-4 h-4 bg-gray-500 rounded"></div>
            </button>
          </div>
          <button
            onClick={handleClear}
            className="text-gray-400 hover:text-white transition-colors"
          >
            Clear
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSave({
                startDate,
                endDate,
                startTime,
                endTime,
                repeatType,
                repeatDays: selectedDays
              });
              onClose();
            }}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnhancedCalendar;