"use client";

import React, { useState, useMemo } from 'react';
import { useTheme } from '@/layouts/hooks/useTheme';
import {
  TaskListItem,
  TaskListConfig,
  TaskListActions,
  TaskListFilters,
  TaskListSort,
  TaskGroupBy,
  TaskSection as TaskSectionType,
} from './types';
import { groupTasks, sortTasks, filterTasks } from './utils';
import TaskListHeader from './TaskListHeader';
import TaskTable from './TaskTable';
import TaskSection from './TaskSection';
import { EnhancedCalendar } from '@/components/features/EnhancedCalendar';
import EmptySearchState from '@/components/ui/EmptySearchState';

interface TaskListProps {
  tasks: TaskListItem[];
  config?: Partial<TaskListConfig>;
  actions?: TaskListActions;
  loading?: boolean;
  error?: string;
  className?: string;
  hideHeader?: boolean;
}

const DEFAULT_CONFIG: TaskListConfig = {
  showSearch: true,
  showFilters: true,
  showSort: true,
  enableGrouping: true,
  defaultGroupBy: 'status',
  showSelection: true,
};

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  config = {},
  actions,
  loading = false,
  error,
  className = '',
  hideHeader = false,
}) => {
  const { theme } = useTheme();
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  // Local state
  const [searchValue, setSearchValue] = useState('');
  const [filters, setFilters] = useState<TaskListFilters>({});
  const [sort, setSort] = useState<TaskListSort>({ field: 'createdAt', direction: 'desc' });
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [groupBy, setGroupBy] = useState<TaskGroupBy>(finalConfig.defaultGroupBy || 'status');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  
  // Enhanced calendar state
  const [isEnhancedCalendarOpen, setIsEnhancedCalendarOpen] = useState(false);
  const [isCreatingTask, setIsCreatingTask] = useState(false);

  // Processed tasks
  const processedTasks = useMemo(() => {
    let result = [...tasks];

    // Apply filters
    const allFilters = { ...filters, search: searchValue };
    result = filterTasks(result, allFilters);

    // Apply sorting
    result = sortTasks(result, sort.field, sort.direction);

    return result;
  }, [tasks, filters, searchValue, sort]);

  // Grouped tasks
  const groupedTasks = useMemo(() => {
    if (!finalConfig.enableGrouping) {
      return [{
        id: 'all',
        title: 'All Tasks',
        tasks: processedTasks,
        collapsible: false,
        collapsed: false,
      }];
    }
    return groupTasks(processedTasks, groupBy);
  }, [processedTasks, groupBy, finalConfig.enableGrouping]);

  // Handlers
  const handleSearchChange = (value: string) => {
    setSearchValue(value);
  };

  const handleSort = (field: keyof TaskListItem) => {
    setSort(prevSort => ({
      field,
      direction: prevSort.field === field && prevSort.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleSelectTask = (taskId: string) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const handleSelectAll = (taskIds: string[]) => {
    setSelectedTasks(taskIds);
  };

  const handleBulkAction = (action: string) => {
    if (selectedTasks.length > 0) {
      actions?.onBulkAction?.(selectedTasks, action);
      setSelectedTasks([]);
    }
  };

  const handleCreateTask = () => {
    setIsCreatingTask(true);
    setIsEnhancedCalendarOpen(true);
  };

  const handleEnhancedCalendarSave = (data: {
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
    repeatType: string;
    repeatDays: string[];
  }) => {
    // Convert dd/mm/yy format to proper date
    const parseDate = (dateStr: string) => {
      if (!dateStr) return null;
      const [day, month, year] = dateStr.split('/');
      return `20${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    };
    
    const startDateFormatted = parseDate(data.startDate);
    const endDateFormatted = parseDate(data.endDate);
    
    // Create enhanced task data
    const enhancedTaskData = {
      name: 'New Task',
      dueDate: startDateFormatted,
      startDate: startDateFormatted,
      endDate: endDateFormatted,
      startTime: data.startTime,
      endTime: data.endTime,
      hasStartTime: !!data.startTime,
      hasEndTime: !!data.endTime,
      project: '',
      status: 'todo' as const
    };
    
    actions?.onCreateTask?.(enhancedTaskData);
    setIsCreatingTask(false);
  };

  // Loading state
  if (loading) {
    return (
      <div 
        className={`flex items-center justify-center h-64 ${className}`}
        style={{ backgroundColor: theme.background.primary }}
      >
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-current"></div>
          <span style={{ color: theme.text.secondary }}>Loading tasks...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div 
        className={`flex items-center justify-center h-64 ${className}`}
        style={{ backgroundColor: theme.background.primary }}
      >
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-medium mb-2" style={{ color: theme.text.primary }}>
            Something went wrong
          </h3>
          <p style={{ color: theme.text.secondary }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`w-full ${className}`}
      style={{ backgroundColor: theme.background.primary }}
    >
      {/* Header - Fixed Position within container with solid background */}
      {!hideHeader && (
        <div 
          className="sticky top-0 z-30 shadow-sm border-b" 
          style={{ 
            backgroundColor: theme.background.primary,
            borderColor: theme.border.default,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
            width: '100%'
          }}
        >
          <TaskListHeader
            searchValue={searchValue}
            onSearchChange={handleSearchChange}
            onCreateTask={handleCreateTask}
            onFilterClick={() => {/* Handle filter modal */}}
            onSortClick={() => {/* Handle sort modal */}}
            onGroupClick={() => {/* Handle group modal */}}
            onOptionsClick={() => {/* Handle options modal */}}
            showSearch={finalConfig.showSearch}
            showFilters={finalConfig.showFilters}
            showSort={finalConfig.showSort}
            showGroup={true}
            showOptions={true}
            className="mb-0"
          />
        </div>
      )}

      {/* Table Column Headers - Always visible when grouped and tasks exist */}
      {finalConfig.enableGrouping && processedTasks.length > 0 && (
        <div 
          className="sticky top-0 z-30 shadow-sm border-b" 
          style={{ 
            backgroundColor: theme.background.primary,
            borderColor: theme.border.default,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
            width: '100%',
            isolation: 'auto' // Ensure this doesn't create a new stacking context
          }}
        >
          <div
            className="flex items-center py-3 border-b text-sm font-medium w-full"
            style={{
              backgroundColor: theme.background.secondary,
              borderColor: theme.border.default,
              color: theme.text.secondary,
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              width: '100%',
              minWidth: '100%',
              paddingLeft: '64px',
              paddingRight: '96px'
            }}
          >
            <div className="flex-1 min-w-[300px] px-2">Name</div>
            <div className="w-[120px] px-2">Due date</div>
            <div className="w-[150px] px-2">Collaborators</div>
            <div className="w-[150px] px-2">Projects</div>
            <div className="w-[140px] px-2">Task visibility</div>

          </div>
        </div>
      )}

      {/* Bulk Actions */}
      {selectedTasks.length > 0 && (
        <div
          className="flex items-center justify-between p-3 rounded-lg mb-4"
          style={{ backgroundColor: theme.background.secondary }}
        >
          <span className="text-sm" style={{ color: theme.text.primary }}>
            {selectedTasks.length} task{selectedTasks.length !== 1 ? 's' : ''} selected
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkAction('delete')}
              className="px-3 py-1 text-sm rounded transition-colors text-red-600 hover:bg-red-50"
            >
              Delete
            </button>
            <button
              onClick={() => handleBulkAction('complete')}
              className="px-3 py-1 text-sm rounded transition-colors"
              style={{ color: theme.text.primary }}
            >
              Mark Complete
            </button>
            <button
              onClick={() => setSelectedTasks([])}
              className="px-3 py-1 text-sm rounded transition-colors"
              style={{ color: theme.text.secondary }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Task Content */}
      <div className="space-y-6 p-6">
        {/* Show empty search state when search has no results */}
        {searchValue && processedTasks.length === 0 ? (
          <EmptySearchState
            searchQuery={searchValue}
            onClearSearch={() => setSearchValue("")}
            onAdvancedSearch={() => {/* Handle advanced search */}}
          />
        ) : (
          <>
            {finalConfig.enableGrouping ? (
              groupedTasks.map((section) => (
                <TaskSection
                  key={section.id}
                  section={section}
                  actions={actions}
                  selectedTasks={selectedTasks}
                  onSelectTask={handleSelectTask}
                  onSelectAll={handleSelectAll}
                  viewMode={viewMode}
                />
              ))
            ) : (
              <TaskTable
                tasks={processedTasks}
                columns={finalConfig.columns}
                actions={actions}
                selectedTasks={selectedTasks}
                onSelectTask={finalConfig.showSelection ? handleSelectTask : undefined}
                onSelectAll={finalConfig.showSelection ? handleSelectAll : undefined}
                onSort={handleSort}
                sortField={sort.field}
                sortDirection={sort.direction}
              />
            )}
          </>
        )}
      </div>

      {/* Empty State - Only show when no search/filters are active */}
      {processedTasks.length === 0 && !loading && !searchValue && Object.keys(filters).length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4 opacity-50">📋</div>
          <h3 className="text-lg font-medium mb-2" style={{ color: theme.text.primary }}>
            No tasks yet
          </h3>
          <p className="text-sm mb-4" style={{ color: theme.text.secondary }}>
            Create your first task to get started
          </p>
          <button
            onClick={handleCreateTask}
            className="px-4 py-2 rounded-lg transition-colors"
            style={{
              backgroundColor: theme.button.primary.background,
              color: theme.button.primary.text,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.button.primary.hover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme.button.primary.background;
            }}
          >
            Create Task
          </button>
        </div>
      )}

      {/* Enhanced Calendar Modal */}
      <EnhancedCalendar
        isOpen={isEnhancedCalendarOpen}
        onClose={() => {
          setIsEnhancedCalendarOpen(false);
          setIsCreatingTask(false);
        }}
        onSave={handleEnhancedCalendarSave}
      />
    </div>
  );
};

export default TaskList;