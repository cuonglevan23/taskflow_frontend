"use client";

import React from 'react';
import { ChevronLeft, ChevronRight, Settings, Plus, Upload, Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useThemeContext } from '@/providers/ThemeProvider';
import { useLanguageContext } from '@/providers/LanguageProvider';

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
  const { theme } = useThemeContext();
  const { messages } = useLanguageContext();

  // Helper function to get translated text
  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = messages;
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

  // Format the current date with proper locale
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric'
  }).format(currentDate);

  // Determine if the user has permissions to manage tasks
  const canManageTasks = userRole === 'admin' || userRole === 'owner';

  return (
    <div
      className="flex items-center justify-between p-4 border-b"
      style={{
        backgroundColor: theme.background.primary,
        borderColor: theme.border.default
      }}
    >
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onPrevious}
          style={{
            color: theme.text.secondary,
            backgroundColor: 'transparent'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = theme.background.secondary;
            e.currentTarget.style.color = theme.text.primary;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = theme.text.secondary;
          }}
          title={t('calendar.navigation.previous')}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost" 
          size="sm" 
          onClick={onToday}
          style={{
            color: theme.text.secondary,
            backgroundColor: 'transparent'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = theme.background.secondary;
            e.currentTarget.style.color = theme.text.primary;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = theme.text.secondary;
          }}
        >
          {t('calendar.today')}
        </Button>

        <Button
          variant="ghost" 
          size="sm" 
          onClick={onNext}
          style={{
            color: theme.text.secondary,
            backgroundColor: 'transparent'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = theme.background.secondary;
            e.currentTarget.style.color = theme.text.primary;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = theme.text.secondary;
          }}
          title={t('calendar.navigation.next')}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>

        <h2
          className="text-lg font-semibold ml-4"
          style={{ color: theme.text.primary }}
        >
          {formattedDate}
        </h2>
      </div>

      <div className="flex items-center gap-2">
        {/* Create Button - Only show if user has permissions */}
        {showCreateButton && canManageTasks && (
          <Button 
            variant="primary"
            size="sm"
            onClick={onCreateNew}
            className="flex items-center gap-2"
            style={{
              backgroundColor: theme.status.info,
              color: theme.text.inverse,
              border: 'none'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.filter = 'brightness(0.9)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.filter = 'none';
            }}
          >
            <Plus className="w-4 h-4" />
            {t('calendar.header.createNew')}
          </Button>
        )}

        {/* Import/Export Buttons */}
        {showImportExport && canManageTasks && (
          <>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onImport}
              style={{
                color: theme.text.secondary,
                backgroundColor: 'transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.background.secondary;
                e.currentTarget.style.color = theme.text.primary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = theme.text.secondary;
              }}
              title={t('calendar.header.importCalendar')}
            >
              <Upload className="w-4 h-4 mr-1" />
              {t('calendar.header.import')}
            </Button>

            <Button
              variant="ghost" 
              size="sm" 
              onClick={onExport}
              style={{
                color: theme.text.secondary,
                backgroundColor: 'transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.background.secondary;
                e.currentTarget.style.color = theme.text.primary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = theme.text.secondary;
              }}
              title={t('calendar.header.exportCalendar')}
            >
              <Download className="w-4 h-4 mr-1" />
              {t('calendar.header.export')}
            </Button>
          </>
        )}

        {/* Settings Button */}
        {showSettings && canManageTasks && (
          <Button
            variant="ghost" 
            size="sm" 
            onClick={onSettings}
            style={{
              color: theme.text.secondary,
              backgroundColor: 'transparent'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.background.secondary;
              e.currentTarget.style.color = theme.text.primary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = theme.text.secondary;
            }}
            title={t('calendar.header.settings')}
          >
            <Settings className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
};
