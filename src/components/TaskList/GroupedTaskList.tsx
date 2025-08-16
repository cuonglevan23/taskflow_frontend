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
import EnhancedTaskSection from './EnhancedTaskSection';

import EmptySearchState from '@/components/ui/EmptySearchState';

interface GroupedTaskListProps {
  tasks: TaskListItem[];
  config?: Partial<TaskListConfig>;
  actions?: TaskListActions;
  loading?: boolean;
  error?: string;
  className?: string;
  hideHeader?: boolean;
  groupBy?: TaskGroupBy;
  revalidate?: () => void; // Thêm prop revalidate
}

const DEFAULT_CONFIG: TaskListConfig = {
  showSearch: true,
  showFilters: true,
  showSort: true,
  enableGrouping: true,
  defaultGroupBy: 'assignmentDate', // Default to Asana-style grouping
  showSelection: true,
};

// Define Asana/ClickUp style default sections
const createDefaultSections = (tasks: TaskListItem[]): TaskSectionType[] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);

  // Filter tasks based on assignment date and due date
  const recentlyAssigned = tasks.filter(task => {
    const createdAt = new Date(task.createdAt);
    const daysDiff = (today.getTime() - createdAt.getTime()) / (1000 * 3600 * 24);
    return daysDiff <= 7; // Tasks created in last 7 days
  });

  const doToday = tasks.filter(task => {
    if (!task.dueDate) return false;
    const dueDate = new Date(task.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate.getTime() === today.getTime();
  });

  const doNextWeek = tasks.filter(task => {
    if (!task.dueDate) return false;
    const dueDate = new Date(task.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate > today && dueDate <= nextWeek;
  });

  const doLater = tasks.filter(task => {
    if (!task.dueDate) return true; // Tasks without due date go to "Do later"
    const dueDate = new Date(task.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate > nextWeek;
  });

  return [
    {
      id: 'recently-assigned',
      title: 'Recently assigned',
      tasks: recentlyAssigned,
      collapsible: true,
      collapsed: false,
    },
    {
      id: 'do-today',
      title: 'Do today',
      tasks: doToday,
      collapsible: true,
      collapsed: false,
    },
    {
      id: 'do-next-week',
      title: 'Do next week',
      tasks: doNextWeek,
      collapsible: true,
      collapsed: false,
    },
    {
      id: 'do-later',
      title: 'Do later',
      tasks: doLater,
      collapsible: true,
      collapsed: false,
    },
  ];
};

const GroupedTaskList = ({
  tasks,
  config = {},
  actions,
  loading = false,
  error,
  className = '',
  hideHeader = false,
  groupBy: propGroupBy,
  revalidate, // Thêm prop revalidate
}: GroupedTaskListProps) => {
  const { theme } = useTheme();
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  // Local state
  const [searchValue, setSearchValue] = useState('');
  const [filters, setFilters] = useState<TaskListFilters>({});
  const [sort, setSort] = useState<TaskListSort>({ field: 'startDate', direction: 'desc' });
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [groupBy, setGroupBy] = useState<TaskGroupBy>(
    propGroupBy || finalConfig.defaultGroupBy || 'assignmentDate'
  );

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

    // Use default Asana/ClickUp style grouping if assignmentDate is selected
    if (groupBy === 'assignmentDate') {
      return createDefaultSections(processedTasks);
    }

    // Use other grouping methods from utils
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
      title: 'New Task',
      description: '',
      status: 'TODO',
      priority: 'NORMAL',
      startDate: startDateFormatted || new Date().toISOString().split('T')[0],
      deadline: endDateFormatted || startDateFormatted || new Date().toISOString().split('T')[0],
      dueDate: startDateFormatted || new Date().toISOString().split('T')[0],
      creatorId: '',
      assignedToIds: [],
      tags: [],
    };

    // actions?.onCreateTask?.(enhancedTaskData);
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
      {/* Header */}
      {!hideHeader && (
        <div
          className="sticky top-0 z-30 shadow-sm border-b"
          style={{
            backgroundColor: theme.background.primary,
            borderColor: theme.border.default,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
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

      {/* Table Column Headers - Sticky */}
      {finalConfig.enableGrouping && processedTasks.length > 0 && (
        <div
          className="sticky top-0 z-40 bg-gray-50 border-b border-gray-200 shadow-sm"
          style={{
            backgroundColor: theme.background.secondary,
            borderColor: theme.border.default,
            top: hideHeader ? '0' : '72px', // Offset for layout header when present
          }}
        >
          <div
            className="flex items-center py-3 text-sm font-medium w-full"
            style={{
              color: theme.text.secondary,
              paddingLeft: '64px',
              paddingRight: '24px'
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
          className="flex items-center justify-between p-3 rounded-lg mx-6 mt-4"
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
              groupedTasks
                .filter(section => section.tasks.length > 0) // Only show sections with tasks
                .map((section) => (
                  <EnhancedTaskSection
                    key={section.id}
                    section={section}
                    actions={actions}
                    selectedTasks={selectedTasks}
                    onSelectTask={handleSelectTask}
                    onSelectAll={handleSelectAll}
                    revalidate={revalidate} // Truyền prop revalidate xuống EnhancedTaskSection
                  />
                ))
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <tbody>

                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>



    </div>
  );
};

export default GroupedTaskList;