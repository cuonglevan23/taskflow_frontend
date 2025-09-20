"use client";

import React from 'react';
import { Plus, Search, Filter, ArrowUpDown, Grid3X3, Settings, Check } from 'lucide-react';
import { Button } from '@/components/ui';
import Dropdown, { DropdownItem, DropdownSeparator } from '@/components/ui/Dropdown/Dropdown';
import { useThemeContext } from '@/providers/ThemeProvider';
import { useLanguageContext } from '@/providers/LanguageProvider';

interface TaskListHeaderProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onCreateTask?: () => void;
  onFilterClick?: () => void;
  onSortClick?: () => void;
  onGroupClick?: () => void;
  onOptionsClick?: () => void;
  showSearch?: boolean;
  showFilters?: boolean;
  showSort?: boolean;
  showGroup?: boolean;
  showOptions?: boolean;
  className?: string;
  hideLeftSide?: boolean;
}

const TaskListHeader = ({
  searchValue = '',
  onSearchChange,
  onCreateTask,
  onFilterClick,
  onSortClick,
  onGroupClick,
  onOptionsClick,
  showSearch = true,
  showFilters = true,
  showSort = true,
  showGroup = true,
  showOptions = true,
  className = '',
  hideLeftSide = false,
}: TaskListHeaderProps) => {
  const [isSearchExpanded, setIsSearchExpanded] = React.useState(false);
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

  return (
    <div 
      className={`flex items-center ${hideLeftSide ? '' : 'justify-between py-4 px-6'} w-full ${className}`}
      style={{ 
        backgroundColor: theme.background.primary,
        borderBottom: hideLeftSide ? 'none' : `1px solid ${theme.border.default}`,
        width: '100%',
        minWidth: '100%',
        position: 'relative',
        zIndex: 40,
      }}
    >
      {/* Left Side - Create Button */}
      {!hideLeftSide && (
        <div className="flex items-center">
          <Button
            variant="primary"
            size="sm"
            onClick={onCreateTask}
            className="flex items-center gap-2"
            style={{
              backgroundColor: theme.status.error,
              color: theme.text.inverse,
              border: 'none'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.status.error;
              e.currentTarget.style.filter = 'brightness(0.9)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme.status.error;
              e.currentTarget.style.filter = 'none';
            }}
          >
            <Plus className="w-4 h-4" />
            {t('cards.myTasks.createTask')}
          </Button>
        </div>
      )}

      {/* Right Side - Actions */}
      <div className="flex items-center gap-3">
        {/* Search */}
        {showSearch && (
          <div className="flex items-center">
            {isSearchExpanded ? (
              <div className="flex items-center bg-transparent border rounded-lg px-3 py-2 min-w-[300px]"
                style={{
                  borderColor: theme.border.default,
                  backgroundColor: theme.background.secondary,
                }}
              >
                <Search className="w-4 h-4 mr-2" style={{ color: theme.text.muted }} />
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                  placeholder={t('taskList.search.placeholder')}
                  className="flex-1 bg-transparent outline-none text-sm"
                  style={{
                    color: theme.text.primary,
                  }}
                  autoFocus
                  onBlur={() => {
                    if (!searchValue) {
                      setIsSearchExpanded(false);
                    }
                  }}
                />
                {searchValue && (
                  <button
                    onClick={() => {
                      onSearchChange?.('');
                      setIsSearchExpanded(false);
                    }}
                    className="ml-2 p-1 rounded hover:opacity-70"
                    style={{ color: theme.text.muted }}
                  >
                    ×
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={() => setIsSearchExpanded(true)}
                className="p-2 rounded-lg transition-colors"
                style={{
                  color: theme.text.secondary,
                  backgroundColor: 'transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.background.secondary;
                  e.currentTarget.style.color = theme.text.primary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = theme.text.secondary;
                }}
                title={t('taskList.search.expandSearch')}
              >
                <Search className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Filter */}
        {showFilters && (
          <Dropdown
            trigger={
              <button
                className="p-2 rounded-lg transition-colors flex items-center gap-2"
                style={{
                  color: theme.text.secondary,
                  backgroundColor: 'transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.background.secondary;
                  e.currentTarget.style.color = theme.text.primary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = theme.text.secondary;
                }}
                title={t('taskList.filters.title')}
              >
                <Filter className="w-4 h-4" />
                <span className="text-sm font-medium">{t('taskList.filters.button')}</span>
              </button>
            }
          >
            <DropdownItem onClick={onFilterClick}>
              {t('taskList.filters.title')}
            </DropdownItem>
          </Dropdown>
        )}

        {/* Sort */}
        {showSort && (
          <Dropdown
            trigger={
              <button
                className="p-2 rounded-lg transition-colors flex items-center gap-2"
                style={{
                  color: theme.text.secondary,
                  backgroundColor: 'transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.background.secondary;
                  e.currentTarget.style.color = theme.text.primary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = theme.text.secondary;
                }}
                title={t('taskList.sort.title')}
              >
                <ArrowUpDown className="w-4 h-4" />
                <span className="text-sm font-medium">{t('taskList.sort.button')}</span>
              </button>
            }
          >
            <DropdownItem onClick={onSortClick}>
              {t('taskList.sort.title')}
            </DropdownItem>
          </Dropdown>
        )}

        {/* Group */}
        {showGroup && (
          <Dropdown
            trigger={
              <button
                className="p-2 rounded-lg transition-colors flex items-center gap-2"
                style={{
                  color: theme.text.secondary,
                  backgroundColor: 'transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.background.secondary;
                  e.currentTarget.style.color = theme.text.primary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = theme.text.secondary;
                }}
                title={t('taskList.group.title')}
              >
                <Grid3X3 className="w-4 h-4" />
                <span className="text-sm font-medium">{t('taskList.group.button')}</span>
              </button>
            }
          >
            <DropdownItem onClick={onGroupClick}>
              {t('taskList.group.title')}
            </DropdownItem>
          </Dropdown>
        )}

        {/* Options */}
        {showOptions && (
          <Dropdown
            trigger={
              <button
                className="p-2 rounded-lg transition-colors flex items-center gap-2"
                style={{
                  color: theme.text.secondary,
                  backgroundColor: 'transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.background.secondary;
                  e.currentTarget.style.color = theme.text.primary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = theme.text.secondary;
                }}
                title={t('taskList.options.title')}
              >
                <Settings className="w-4 h-4" />
                <span className="text-sm font-medium">{t('taskList.options.button')}</span>
              </button>
            }
          >
            <DropdownItem onClick={onOptionsClick}>
              {t('taskList.options.title')}
            </DropdownItem>
          </Dropdown>
        )}
      </div>
    </div>
  );
};

export default TaskListHeader;