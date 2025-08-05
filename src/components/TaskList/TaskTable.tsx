"use client";

import React from 'react';
import { Plus } from 'lucide-react';
import { useTheme } from '@/layouts/hooks/useTheme';
import { TaskTableColumn, TaskListItem, TaskListActions } from './types';
import { DEFAULT_COLUMNS } from './utils';
import TaskRow from './TaskRow';

interface TaskTableProps {
  tasks: TaskListItem[];
  columns?: TaskTableColumn[];
  actions?: TaskListActions;
  selectedTasks?: string[];
  onSelectTask?: (taskId: string) => void;
  onSelectAll?: (taskIds: string[]) => void;
  onSort?: (field: keyof TaskListItem) => void;
  sortField?: keyof TaskListItem;
  sortDirection?: 'asc' | 'desc';
  className?: string;
}

const TaskTable: React.FC<TaskTableProps> = ({
  tasks,
  columns = DEFAULT_COLUMNS,
  actions,
  selectedTasks = [],
  onSelectTask,
  onSelectAll,
  onSort,
  sortField,
  sortDirection,
  className = '',
}) => {
  const { theme } = useTheme();

  const handleSelectAll = () => {
    if (onSelectAll) {
      const allSelected = tasks.length > 0 && tasks.every(task => selectedTasks.includes(task.id));
      if (allSelected) {
        onSelectAll([]);
      } else {
        onSelectAll(tasks.map(task => task.id));
      }
    }
  };

  const handleSort = (field: keyof TaskListItem) => {
    if (onSort) {
      onSort(field);
    }
  };

  const isAllSelected = tasks.length > 0 && tasks.every(task => selectedTasks.includes(task.id));
  const isIndeterminate = tasks.some(task => selectedTasks.includes(task.id)) && !isAllSelected;

  return (
    <div className={`${className}`}>
      {/* Table Header Row */}
      <div
        className="flex items-center px-6 py-3 border-b text-sm font-medium"
        style={{
          backgroundColor: theme.background.secondary,
          borderColor: theme.border.default,
          color: theme.text.secondary
        }}
      >
        {/* Select All Checkbox */}
        {onSelectAll && (
          <div className="w-6 mr-4">
            <input
              type="checkbox"
              checked={isAllSelected}
              ref={(el) => {
                if (el) el.indeterminate = isIndeterminate;
              }}
              onChange={handleSelectAll}
              className="rounded transition-colors"
              style={{ accentColor: theme.border.focus }}
            />
          </div>
        )}

        {columns.map((column) => (
          <div
            key={column.key}
            className={`${column.width || 'flex-1'} px-2`}
          >
            {column.sortable ? (
              <button
                onClick={() => handleSort(column.key as keyof TaskListItem)}
                className="flex items-center gap-1 hover:text-current transition-colors text-left"
                style={{ color: theme.text.secondary }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = theme.text.primary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = theme.text.secondary;
                }}
              >
                {column.label}
                {sortField === column.key && (
                  <span className="text-xs">
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </button>
            ) : (
              <span className="text-left">{column.label}</span>
            )}
          </div>
        ))}
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-0">
          {/* Table Body */}

          <tbody>
            {tasks.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (onSelectAll ? 1 : 0)}
                  className="px-6 py-12 text-center"
                  style={{ color: theme.text.secondary }}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="text-4xl opacity-50">📝</div>
                    <p>No tasks found</p>
                    <button
                      onClick={actions?.onCreateTask}
                      className="mt-2 px-4 py-2 text-sm rounded-lg transition-colors"
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
                      Create your first task
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              tasks.map((task) => (
                <React.Fragment key={task.id}>
                  {onSelectAll && (
                    <td className="w-6 px-6 py-3">
                      <input
                        type="checkbox"
                        checked={selectedTasks.includes(task.id)}
                        onChange={() => onSelectTask?.(task.id)}
                        className="rounded transition-colors"
                        style={{ accentColor: theme.border.focus }}
                      />
                    </td>
                  )}
                  <TaskRow
                    task={task}
                    actions={actions}
                    isSelected={selectedTasks.includes(task.id)}
                    onSelect={onSelectTask}
                  />
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TaskTable;