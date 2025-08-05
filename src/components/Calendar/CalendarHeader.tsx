

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
      {/* Main Navigation Header */}
      <div className="flex items-center justify-between px-4 py-4">
        {/* Left side - Navigation and month */}
        <div className="flex items-center gap-4">
          <button
            onClick={onPrevious}
            className="p-1 hover:bg-gray-800 rounded transition-colors text-white"
            title="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <button
            onClick={onToday}
            className="px-3 py-1 hover:bg-gray-800 rounded transition-colors text-sm text-white"
          >
            Today
          </button>
          
          <button
            onClick={onNext}
            className="p-1 hover:bg-gray-800 rounded transition-colors text-white"
            title="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          
          <h1 className="text-lg font-medium text-white ml-4">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h1>
        </div>

        {/* Right side - Actions and controls */}
        <div className="flex items-center gap-4">
          {/* Create Task Button - Always show for debugging */}
          {canCreate && onCreateTask && (
            <button
              onClick={onCreateTask}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md transition-colors text-white text-sm font-medium flex items-center gap-2 z-10 relative"
              style={{ display: 'flex' }}
            >
              <Plus className="w-4 h-4" />
              Add Task
            </button>
          )}


          {canImportExport && (
            <div className="flex items-center gap-2">
              <button
                className="p-2 hover:bg-gray-800 rounded-md transition-colors text-gray-400 hover:text-white"
                title="Import"
              >
                <Upload className="w-4 h-4" />
              </button>
              <button
                className="p-2 hover:bg-gray-800 rounded-md transition-colors text-gray-400 hover:text-white"
                title="Export"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Filters - If enabled */}
          {showFilters && (
            <button
              className="p-2 hover:bg-gray-800 rounded-md transition-colors text-gray-400 hover:text-white"
              title="Filters"
            >
              <Filter className="w-4 h-4" />
            </button>
          )}


          {canAccessSettings && (
            <button
              className="p-2 hover:bg-gray-800 rounded-md transition-colors text-gray-400 hover:text-white"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}

          {/* Custom Actions */}
          {customActions}

          {/* Weekends Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Weekends:</span>
            {onWeekendsToggle ? (
              <button
                onClick={onWeekendsToggle}
                className={`text-sm transition-colors ${
                  weekendsEnabled ? 'text-blue-400 hover:text-blue-300' : 'text-gray-500 hover:text-gray-400'
                }`}
              >
                {weekendsEnabled ? 'On' : 'Off'}
              </button>
            ) : (
              <span className={`text-sm ${weekendsEnabled ? 'text-blue-400' : 'text-gray-500'}`}>
                {weekendsEnabled ? 'On' : 'Off'}
              </span>
            )}
          </div>
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

      {/* Role Badge - For debugging/clarity */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-2 right-2 px-2 py-1 bg-black/50 rounded text-xs text-gray-300">
          {userRole}
        </div>
      )}
    </div>
  );
};

export default CalendarHeader;