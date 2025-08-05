"use client";

import React from 'react';
import { Plus, Search, Filter, ArrowUpDown, Grid3X3, Settings, Check } from 'lucide-react';
import { Button } from '@/components/ui';
import Dropdown, { DropdownItem, DropdownSeparator } from '@/components/ui/Dropdown/Dropdown';
import { useTheme } from '@/layouts/hooks/useTheme';

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

const TaskListHeader: React.FC<TaskListHeaderProps> = ({
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
}) => {
  const { theme } = useTheme();
  const [isSearchExpanded, setIsSearchExpanded] = React.useState(false);

  return (
    <div 
      className={`flex items-center ${hideLeftSide ? '' : 'justify-between py-4 px-6'} w-full ${className}`}
      style={{ 
        backgroundColor: theme.background.primary,
        borderBottom: hideLeftSide ? 'none' : `1px solid ${theme.border.default}`,
        width: '100%',
        minWidth: '100%'
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
            trigger={
              <button 
                className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors"
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
              >
                <Filter className="w-4 h-4" />
                <span>Filter</span>
              </button>
            }
            placement="bottom-right"
          >
            <div className="p-2" style={{ backgroundColor: theme.background.primary }}>
              <div className="text-xs font-semibold uppercase tracking-wide px-2 py-1" style={{ color: theme.text.secondary }}>Status</div>
              <DropdownItem onClick={() => console.log('Filter by To Do')}>
                <Check className="w-4 h-4 text-transparent" />
                To Do
              </DropdownItem>
              <DropdownItem onClick={() => console.log('Filter by In Progress')}>
                <Check className="w-4 h-4 text-transparent" />
                In Progress
              </DropdownItem>
              <DropdownItem onClick={() => console.log('Filter by Review')}>
                <Check className="w-4 h-4 text-transparent" />
                Review
              </DropdownItem>
              <DropdownItem onClick={() => console.log('Filter by Done')}>
                <Check className="w-4 h-4 text-transparent" />
                Done
              </DropdownItem>
              <DropdownSeparator />
              <div className="text-xs font-semibold uppercase tracking-wide px-2 py-1" style={{ color: theme.text.secondary }}>Priority</div>
              <DropdownItem onClick={() => console.log('Filter by Low')}>
                <Check className="w-4 h-4 text-transparent" />
                Low
              </DropdownItem>
              <DropdownItem onClick={() => console.log('Filter by Medium')}>
                <Check className="w-4 h-4 text-transparent" />
                Medium
              </DropdownItem>
              <DropdownItem onClick={() => console.log('Filter by High')}>
                <Check className="w-4 h-4 text-transparent" />
                High
              </DropdownItem>
              <DropdownItem onClick={() => console.log('Filter by Urgent')}>
                <Check className="w-4 h-4 text-transparent" />
                Urgent
              </DropdownItem>
            </div>
          </Dropdown>
        )}

        {showSort && (
          <Dropdown
            trigger={
              <button 
                className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors"
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
              >
                <ArrowUpDown className="w-4 h-4" />
                <span>Sort</span>
              </button>
            }
            placement="bottom-right"
          >
            <div className="p-2" style={{ backgroundColor: theme.background.primary }}>
              <DropdownItem onClick={() => console.log('Sort by Name')}>
                Name
              </DropdownItem>
              <DropdownItem onClick={() => console.log('Sort by Due Date')}>
                Due Date
              </DropdownItem>
              <DropdownItem onClick={() => console.log('Sort by Priority')}>
                Priority
              </DropdownItem>
              <DropdownItem onClick={() => console.log('Sort by Status')}>
                Status
              </DropdownItem>
              <DropdownItem onClick={() => console.log('Sort by Created Date')}>
                Created Date
              </DropdownItem>
              <DropdownSeparator />
              <DropdownItem onClick={() => console.log('Sort Ascending')}>
                Ascending
              </DropdownItem>
              <DropdownItem onClick={() => console.log('Sort Descending')}>
                Descending
              </DropdownItem>
            </div>
          </Dropdown>
        )}

        {showGroup && (
          <Dropdown
            trigger={
              <button 
                className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors"
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
              >
                <Grid3X3 className="w-4 h-4" />
                <span>Group</span>
              </button>
            }
            placement="bottom-right"
          >
            <div className="p-2" style={{ backgroundColor: theme.background.primary }}>
              <DropdownItem onClick={() => console.log('Group by Status')}>
                <Check className="w-4 h-4 text-blue-600" />
                Status
              </DropdownItem>
              <DropdownItem onClick={() => console.log('Group by Priority')}>
                <Check className="w-4 h-4 text-transparent" />
                Priority
              </DropdownItem>
              <DropdownItem onClick={() => console.log('Group by Assignment Date')}>
                <Check className="w-4 h-4 text-transparent" />
                Assignment Date
              </DropdownItem>
              <DropdownItem onClick={() => console.log('Group by Project')}>
                <Check className="w-4 h-4 text-transparent" />
                Project
              </DropdownItem>
              <DropdownItem onClick={() => console.log('Group by Assignee')}>
                <Check className="w-4 h-4 text-transparent" />
                Assignee
              </DropdownItem>
              <DropdownSeparator />
              <DropdownItem onClick={() => console.log('No Grouping')}>
                No Grouping
              </DropdownItem>
            </div>
          </Dropdown>
        )}

        {showOptions && (
          <Dropdown
            trigger={
              <button 
                className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors"
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
              >
                <Settings className="w-4 h-4" />
                <span>Options</span>
              </button>
            }
            placement="bottom-right"
          >
            <div className="p-2" style={{ backgroundColor: theme.background.primary }}>
              <DropdownItem onClick={() => console.log('View Settings')}>
                View Settings
              </DropdownItem>
              <DropdownItem onClick={() => console.log('Column Settings')}>
                Column Settings
              </DropdownItem>
              <DropdownSeparator />
              <DropdownItem onClick={() => console.log('Export Tasks')}>
                Export Tasks
              </DropdownItem>
              <DropdownItem onClick={() => console.log('Import Tasks')}>
                Import Tasks
              </DropdownItem>
              <DropdownSeparator />
              <DropdownItem onClick={() => console.log('Keyboard Shortcuts')}>
                Keyboard Shortcuts
              </DropdownItem>
              <DropdownItem onClick={() => console.log('Help & Support')}>
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
                      backgroundColor: theme.background.primary,
                      borderColor: theme.border.default,
                      color: theme.text.primary,
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