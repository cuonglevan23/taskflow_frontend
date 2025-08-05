"use client";

import React from 'react';
import { CheckCircle, User, MoreHorizontal } from 'lucide-react';
import { useTheme } from '@/layouts/hooks/useTheme';
import { TaskListItem, TaskListActions } from './types';
import { getPriorityConfig, getStatusConfig, formatDate, formatTaskDate, isOverdue } from './utils';

interface TaskRowProps {
  task: TaskListItem;
  actions?: TaskListActions;
  isSelected?: boolean;
  onSelect?: (taskId: string) => void;
  className?: string;
}

const TaskRow: React.FC<TaskRowProps> = ({
  task,
  actions,
  isSelected = false,
  onSelect,
  className = '',
}) => {
  const { theme } = useTheme();
  const priorityConfig = getPriorityConfig(task.priority);
  const statusConfig = getStatusConfig(task.status);
  const overdueDate = task.dueDate && isOverdue(task.dueDate);

  const handleRowClick = () => {
    actions?.onTaskClick?.(task);
  };

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect?.(task.id);
  };

  const handleStatusChange = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextStatus = task.status === 'done' ? 'todo' : 'done';
    actions?.onTaskStatusChange?.(task.id, nextStatus);
  };

  return (
    <tr
      className={`group cursor-pointer transition-colors duration-200 hover:bg-gray-50 ${className}`}
      style={{
        backgroundColor: isSelected ? theme.background.secondary : 'transparent',
      }}
      onClick={handleRowClick}
    >
      {/* Task Name */}
      <td className="flex-1 min-w-[300px] py-3 px-2">
        <div className="flex items-center gap-3">
          {onSelect && (
            <button
              onClick={handleCheckboxClick}
              className="flex-shrink-0 transition-colors duration-200"
            >
              <CheckCircle
                className={`w-5 h-5 ${
                  task.status === 'done' 
                    ? 'text-green-500 fill-current' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              />
            </button>
          )}
          <div className="min-w-0 flex-1">
            <div 
              className={`font-medium truncate ${
                task.status === 'done' ? 'line-through text-gray-500' : ''
              }`}
              style={{ color: task.status === 'done' ? theme.text.secondary : theme.text.primary }}
            >
              {task.name}
            </div>
            {task.description && (
              <div 
                className="text-sm truncate mt-1"
                style={{ color: theme.text.secondary }}
              >
                {task.description}
              </div>
            )}
          </div>
        </div>
      </td>

      {/* Due Date */}
      <td className="w-[120px] py-3 px-2">
        {task.dueDate || task.startDate || task.endDate ? (
          <span 
            className={`text-sm ${overdueDate ? 'text-red-600 font-medium' : ''}`}
            style={{ color: overdueDate ? '#dc2626' : theme.text.primary }}
          >
            {formatTaskDate(task)}
          </span>
        ) : (
          <span className="text-sm" style={{ color: theme.text.secondary }}>
            -
          </span>
        )}
      </td>

      {/* Collaborators (Assignees) */}
      <td className="w-[150px] py-3 px-2">
        <div className="flex items-center gap-2">
          {task.assignees.length > 0 ? (
            <div className="flex items-center gap-1">
              <User className="w-4 h-4 flex-shrink-0" style={{ color: theme.text.secondary }} />
              <span className="text-sm truncate" style={{ color: theme.text.primary }}>
                {task.assignees[0].name}
                {task.assignees.length > 1 && ` +${task.assignees.length - 1}`}
              </span>
            </div>
          ) : (
            <span className="text-sm" style={{ color: theme.text.secondary }}>
              -
            </span>
          )}
        </div>
      </td>

      {/* Projects */}
      <td className="w-[150px] py-3 px-2">
        {task.project ? (
          <span className="text-sm truncate" style={{ color: theme.text.primary }}>
            {task.project}
          </span>
        ) : (
          <span className="text-sm" style={{ color: theme.text.secondary }}>
            -
          </span>
        )}
      </td>

      {/* Task Visibility (Status) */}
      <td className="w-[140px] py-3 px-2">
        <button
          onClick={handleStatusChange}
          className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${statusConfig.color} hover:opacity-80`}
        >
          {statusConfig.label}
        </button>
      </td>

      {/* Actions */}
      <td className="w-[50px] py-3 px-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            // Handle more actions menu
          }}
          className="p-1 rounded transition-colors opacity-0 group-hover:opacity-100"
          style={{ color: theme.text.secondary }}
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </td>
    </tr>
  );
};

export default TaskRow;