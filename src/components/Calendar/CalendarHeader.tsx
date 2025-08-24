"use client";

import React from 'react';
import { ChevronLeft, ChevronRight, Settings, Plus, Upload, Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface CalendarHeaderProps {
  currentDate: Date;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
  userRole?: 'member' | 'admin' | 'owner';
  showCreateButton?: boolean;
  showImportExport?: boolean;
  showSettings?: boolean;
  onCreateNew?: () => void;
  onExport?: () => void;
  onImport?: () => void;
  onSettings?: () => void;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentDate,
  onPrevious,
  onNext,
  onToday,
  userRole = 'member',
  showCreateButton = true,
  showImportExport = false,
  showSettings = false,
  onCreateNew,
  onExport,
  onImport,
  onSettings
}) => {
  // Format the current date
  const formattedDate = new Intl.DateTimeFormat('vi-VN', {
    month: 'long',
    year: 'numeric'
  }).format(currentDate);

  // Determine if the user has permissions to manage tasks
  const canManageTasks = userRole === 'admin' || userRole === 'owner';

  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-700">
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onPrevious}
          className="rounded-full p-2 h-auto text-gray-400 hover:text-white hover:bg-gray-700"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onNext}
          className="rounded-full p-2 h-auto text-gray-400 hover:text-white hover:bg-gray-700"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onToday}
          className="px-3 py-1 text-sm h-auto text-gray-300 hover:text-white hover:bg-gray-700"
        >
          Today
        </Button>
        <h2 className="text-xl font-semibold text-white ml-3">{formattedDate}</h2>
      </div>
      
      <div className="flex items-center gap-2">
        {showCreateButton && canManageTasks && (
          <Button 
            variant="default" 
            size="sm" 
            onClick={onCreateNew}
            className="flex items-center gap-1 h-8"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </Button>
        )}
        
        {showImportExport && canManageTasks && (
          <>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onImport}
              className="rounded-full p-2 h-auto text-gray-400 hover:text-white hover:bg-gray-700"
            >
              <Upload className="w-5 h-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onExport}
              className="rounded-full p-2 h-auto text-gray-400 hover:text-white hover:bg-gray-700"
            >
              <Download className="w-5 h-5" />
            </Button>
          </>
        )}
        
        {showSettings && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onSettings}
            className="rounded-full p-2 h-auto text-gray-400 hover:text-white hover:bg-gray-700"
          >
            <Settings className="w-5 h-5" />
          </Button>
        )}
      </div>
    </div>
  );
};
