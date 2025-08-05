

"use client";

import React from 'react';
import { ChevronLeft, ChevronRight, Plus, Settings, Filter, Download, Upload } from 'lucide-react';

export type UserRole = 'admin' | 'manager' | 'member' | 'viewer';

export interface CalendarHeaderProps {
  currentDate: Date;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
  onCreateTask?: () => void;
  
  // Role-based customization
  userRole?: UserRole;
  showCreateButton?: boolean;
  showImportExport?: boolean;
  showSettings?: boolean;
  showFilters?: boolean;
  
  // Weekends toggle
  weekendsEnabled?: boolean;
  onWeekendsToggle?: () => void;
  
  // Custom actions
  customActions?: React.ReactNode;
  
  // Simple header mode
  simpleHeader?: boolean;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentDate,
  onPrevious,
  onNext,
  onToday,
  onCreateTask,
  userRole = 'member',
  showCreateButton = true,
  showImportExport = false,
  showSettings = false,
  showFilters = false,
  weekendsEnabled = true,
  onWeekendsToggle,
  customActions,
  simpleHeader = false
}) => {
  
  // Role-based permissions
  const canCreate = userRole !== 'viewer' && showCreateButton;
  const canManage = ['admin', 'manager'].includes(userRole);
  const canImportExport = canManage && showImportExport;
  const canAccessSettings = canManage && showSettings;

  // Simple header mode - minimal design
  if (simpleHeader) {
    return (
      <div className="relative w-full bg-gray-900 border-b border-gray-700">
        {/* Simple Navigation Header */}
        <div className="flex items-center justify-between px-4 py-3">
          {/* Left side - Basic navigation */}
          <div className="flex items-center gap-3">
            <button
              onClick={onPrevious}
              className="p-2 hover:bg-gray-800 rounded transition-colors text-white"
              title="Previous month"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <h1 className="text-xl font-semibold text-white">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h1>
            
            <button
              onClick={onNext}
              className="p-2 hover:bg-gray-800 rounded transition-colors text-white"
              title="Next month"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Right side - Today button only */}
          <div className="flex items-center">
            <button
              onClick={onToday}
              className="px-4 py-2 hover:bg-gray-800 rounded transition-colors text-sm text-white font-medium"
            >
              Today
            </button>
          </div>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 border-t border-gray-700 bg-gray-800">
          {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((day) => (
            <div key={day} className="px-3 py-4 text-center border-r border-gray-700 last:border-r-0">
              <div className="text-xs font-semibold text-gray-300 uppercase tracking-wide">{day}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full bg-gray-900 border-b border-gray-700">
      {/* Simplified Navigation Header */}
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left side - Navigation and month */}
        <div className="flex items-center gap-4">
          <button
            onClick={onPrevious}
            className="p-2 hover:bg-gray-800 rounded transition-colors text-white"
            title="Previous"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <h1 className="text-lg font-semibold text-white">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h1>
          
          <button
            onClick={onNext}
            className="p-2 hover:bg-gray-800 rounded transition-colors text-white"
            title="Next"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Right side - Just Today button */}
        <div className="flex items-center">
          <button
            onClick={onToday}
            className="px-4 py-2 hover:bg-gray-800 rounded transition-colors text-sm text-white font-medium"
          >
            Today
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalendarHeader;