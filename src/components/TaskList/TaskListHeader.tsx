"use client";

import React from 'react';
import { Plus, Search, Filter, ArrowUpDown, Grid3X3, Settings, Check } from 'lucide-react';
import { Button } from '@/components/ui';
import Dropdown, { DropdownItem, DropdownSeparator } from '@/components/ui/Dropdown/Dropdown';
import { DARK_THEME } from '@/constants/theme';

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

  return (
    <div 
      className={`flex items-center ${hideLeftSide ? '' : 'justify-between py-4 px-6'} w-full ${className}`}
      style={{ 
        backgroundColor: DARK_THEME.background.primary,
        borderBottom: hideLeftSide ? 'none' : `1px solid ${DARK_THEME.border.default}`,
        width: '100%',
        minWidth: '100%',
        position: 'relative',
        zIndex: 40 // Higher than column headers (z-30)
      }}
    >
      {/* Left side - Empty space where Add Task Button was */}
      {!hideLeftSide && (
        <div className="flex items-center">
          {/* Add task button removed */}
        </div>
      )}

      {/* Right side - Action Dropdowns */}
      <div className="flex items-center gap-2">

        {showFilters && (
          <Dropdown
            usePortal={true}
            trigger={
              <button 
                className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors"
                style={{
                  color: DARK_THEME.text.secondary,
                  backgroundColor: 'transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = DARK_THEME.background.secondary;
                  e.currentTarget.style.color = DARK_THEME.text.primary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = DARK_THEME.text.secondary;
                }}
              >
                <Filter className="w-4 h-4" />
                <span>Filter</span>
              </button>
            }
            placement="bottom-right"
          >
            <div className="p-2" style={{ backgroundColor: DARK_THEME.background.primary }}>
              <div className="text-xs font-semibold uppercase tracking-wide px-2 py-1" style={{ color: DARK_THEME.text.secondary }}>Status</div>
              <DropdownItem onClick={() => {}}>
                <Check className="w-4 h-4 text-transparent" />
                To Do
              </DropdownItem>
              <DropdownItem onClick={() => {}}>
                <Check className="w-4 h-4 text-transparent" />
                In Progress
              </DropdownItem>
              <DropdownItem onClick={() => {}}>
                <Check className="w-4 h-4 text-transparent" />
                Review
              </DropdownItem>
              <DropdownItem onClick={() => {}}>
                <Check className="w-4 h-4 text-transparent" />
                Done
              </DropdownItem>
              <DropdownSeparator />
              <div className="text-xs font-semibold uppercase tracking-wide px-2 py-1" style={{ color: DARK_THEME.text.secondary }}>Priority</div>
              <DropdownItem onClick={() => {}}>
                <Check className="w-4 h-4 text-transparent" />
                Low
              </DropdownItem>
              <DropdownItem onClick={() => {}}>
                <Check className="w-4 h-4 text-transparent" />
                Medium
              </DropdownItem>
              <DropdownItem onClick={() => {}}>
                <Check className="w-4 h-4 text-transparent" />
                High
              </DropdownItem>
              <DropdownItem onClick={() => {}}>
                <Check className="w-4 h-4 text-transparent" />
                Urgent
              </DropdownItem>
            </div>
          </Dropdown>
        )}

        {showSort && (
          <Dropdown
            usePortal={true}
            trigger={
              <button 
                className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors"
                style={{
                  color: DARK_THEME.text.secondary,
                  backgroundColor: 'transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = DARK_THEME.background.secondary;
                  e.currentTarget.style.color = DARK_THEME.text.primary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = DARK_THEME.text.secondary;
                }}
              >
                <ArrowUpDown className="w-4 h-4" />
                <span>Sort</span>
              </button>
            }
            placement="bottom-right"
          >
            <div className="p-2" style={{ backgroundColor: DARK_THEME.background.primary }}>
              <DropdownItem onClick={() => {}}>
                Name
              </DropdownItem>
              <DropdownItem onClick={() => {}}>
                Due Date
              </DropdownItem>
              <DropdownItem onClick={() => {}}>
                Priority
              </DropdownItem>
              <DropdownItem onClick={() => {}}>
                Status
              </DropdownItem>
              <DropdownItem onClick={() => {}}>
                Created Date
              </DropdownItem>
              <DropdownSeparator />
              <DropdownItem onClick={() => {}}>
                Ascending
              </DropdownItem>
              <DropdownItem onClick={() => {}}>
                Descending
              </DropdownItem>
            </div>
          </Dropdown>
        )}

        {showGroup && (
          <Dropdown
            usePortal={true}
            trigger={
              <button 
                className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors"
                style={{
                  color: DARK_THEME.text.secondary,
                  backgroundColor: 'transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = DARK_THEME.background.secondary;
                  e.currentTarget.style.color = DARK_THEME.text.primary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = DARK_THEME.text.secondary;
                }}
              >
                <Grid3X3 className="w-4 h-4" />
                <span>Group</span>
              </button>
            }
            placement="bottom-right"
          >
            <div className="p-2" style={{ backgroundColor: DARK_THEME.background.primary }}>
              <DropdownItem onClick={() => {}}>
                <Check className="w-4 h-4 text-blue-600" />
                Status
              </DropdownItem>
              <DropdownItem onClick={() => {}}>
                <Check className="w-4 h-4 text-transparent" />
                Priority
              </DropdownItem>
              <DropdownItem onClick={() => {}}>
                <Check className="w-4 h-4 text-transparent" />
                Assignment Date
              </DropdownItem>
              <DropdownItem onClick={() => {}}>
                <Check className="w-4 h-4 text-transparent" />
                Project
              </DropdownItem>
              <DropdownItem onClick={() => {}}>
                <Check className="w-4 h-4 text-transparent" />
                Assignee
              </DropdownItem>
              <DropdownSeparator />
              <DropdownItem onClick={() => {}}>
                No Grouping
              </DropdownItem>
            </div>
          </Dropdown>
        )}

        {showOptions && (
          <Dropdown
            usePortal={true}
            trigger={
              <button 
                className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors"
                style={{
                  color: DARK_THEME.text.secondary,
                  backgroundColor: 'transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = DARK_THEME.background.secondary;
                  e.currentTarget.style.color = DARK_THEME.text.primary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = DARK_THEME.text.secondary;
                }}
              >
                <Settings className="w-4 h-4" />
                <span>Options</span>
              </button>
            }
            placement="bottom-right"
          >
            <div className="p-2" style={{ backgroundColor: DARK_THEME.background.primary }}>
              <DropdownItem onClick={() => {}}>
                View Settings
              </DropdownItem>
              <DropdownItem onClick={() => {}}>
                Column Settings
              </DropdownItem>
              <DropdownSeparator />
              <DropdownItem onClick={() => {}}>
                Export Tasks
              </DropdownItem>
              <DropdownItem onClick={() => {}}>
                Import Tasks
              </DropdownItem>
              <DropdownSeparator />
              <DropdownItem onClick={() => {}}>
                Keyboard Shortcuts
              </DropdownItem>
              <DropdownItem onClick={() => {}}>
                Help & Support
              </DropdownItem>
            </div>
          </Dropdown>
        )}

        {showSearch && (
          <div className="relative">
            {isSearchExpanded ? (
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchValue}
                    onChange={(e) => onSearchChange?.(e.target.value)}
                    onBlur={() => {
                      if (!searchValue) {
                        setIsSearchExpanded(false);
                      }
                    }}
                    placeholder="Search task names"
                    className="pl-10 pr-12 py-2 w-80 rounded-full border transition-all duration-200 outline-none focus:ring-2 focus:ring-blue-500"
                    style={{
                      backgroundColor: DARK_THEME.background.primary,
                      borderColor: DARK_THEME.border.default,
                      color: DARK_THEME.text.primary,
                    }}
                    autoFocus
                  />
                  <button
                    onClick={() => setIsSearchExpanded(false)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    ⋯
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsSearchExpanded(true)}
                className="p-2 rounded-lg transition-colors"
                style={{
                  color: DARK_THEME.text.secondary,
                  backgroundColor: 'transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = DARK_THEME.background.secondary;
                  e.currentTarget.style.color = DARK_THEME.text.primary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = DARK_THEME.text.secondary;
                }}
              >
                <Search className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskListHeader;