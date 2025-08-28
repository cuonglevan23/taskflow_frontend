"use client";

import React from 'react';
import { CheckCircle, User, Calendar, Flag, MoreHorizontal } from 'lucide-react';
import { useTheme } from '@/layouts/hooks/useTheme';
import { TaskListItem, TaskListActions } from './types';
import { getPriorityConfig, getStatusConfig, formatDate, isOverdue } from './utils';
import { TaskCommentIndicator } from './TaskRow/components/TaskCommentIndicator';

interface TaskCardProps {
  task: TaskListItem;
  actions?: TaskListActions;
  isSelected?: boolean;
  onSelect?: (taskId: string) => void;
  className?: string;
}

const TaskCard = ({
  task,
  actions,
  isSelected = false,
  onSelect,
  className = '',
}: TaskCardProps) => {
  const { theme } = useTheme();
  const priorityConfig = getPriorityConfig(task.priority);
  const statusConfig = getStatusConfig(task.status);
  const overdueDate = task.dueDate && isOverdue(task.dueDate);

  // Helper function to check if task is completed
  const isTaskCompleted = (task: TaskListItem): boolean => {
    return task.completed || 
           task.status === 'DONE' || 
           (task.status as string) === 'completed' ||
           (task.status as string) === 'done';
  };

  const handleCardClick = () => {
    actions?.onTaskClick?.(task);
  };

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect?.(task.id);
  };

  const handleStatusChange = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextStatus = isTaskCompleted(task) ? 'TODO' : 'DONE';
    actions?.onTaskStatusChange?.(task.id, nextStatus);
  };

  return (
    <div
      className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${className}`}
      style={{
        backgroundColor: isSelected ? theme.background.secondary : theme.background.primary,
        borderColor: isSelected ? theme.border.focus : theme.border.default,
        boxShadow: isSelected ? '0 0 0 1px ' + theme.border.focus : 'none',
      }}
      onClick={handleCardClick}
    >
      {/* Task Header */}
      <div className="flex items-start gap-3 mb-3">
        <button
          onClick={handleCheckboxClick}
          className="flex-shrink-0 mt-0.5 transition-colors duration-200"
        >
          <CheckCircle
            className={`w-5 h-5 ${
              isTaskCompleted(task)
                ? 'text-green-500 fill-current' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          />
        </button>
        
        <div className="flex-1 min-w-0">
          <h3 
            className={`font-medium mb-1 ${
              isTaskCompleted(task) ? 'line-through text-gray-500' : ''
            }`}
            style={{ color: isTaskCompleted(task) ? theme.text.secondary : theme.text.primary }}
          >
            {task.name}
          </h3>
          
          {task.description && (
            <p 
              className="text-sm mb-2 line-clamp-2"
              style={{ color: theme.text.secondary }}
            >
              {task.description}
            </p>
          )}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            // Handle more actions menu
          }}
          className="flex-shrink-0 p-1 rounded transition-colors"
          style={{ color: theme.text.secondary }}
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Task Details */}
      <div className="space-y-2">
        {/* Assignees */}
        {task.assignees.length > 0 && (
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 flex-shrink-0" style={{ color: theme.text.secondary }} />
            <div className="flex items-center gap-1 min-w-0 text-sm">
              {task.assignees.map((assignee, index) => (
                <span
                  key={assignee.id}
                  className="truncate"
                  style={{ color: theme.text.primary }}
                >
                  {assignee.name}
                  {index < task.assignees.length - 1 && ', '}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Due Date */}
        {task.dueDate && (
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 flex-shrink-0" style={{ color: theme.text.secondary }} />
            <span 
              className={`text-sm ${overdueDate ? 'text-red-600 font-medium' : ''}`}
              style={{ color: overdueDate ? '#dc2626' : theme.text.primary }}
            >
              {formatDate(task.dueDate)}
            </span>
          </div>
        )}

        {/* Priority and Status */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <Flag className="w-4 h-4 flex-shrink-0" style={{ color: theme.text.secondary }} />
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityConfig.color}`}>
              {priorityConfig.label}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <TaskCommentIndicator
              taskId={task.id}
              initialCount={task.commentCount || 0}
            />
            <button
              onClick={handleStatusChange}
              className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${statusConfig.color} hover:opacity-80`}
            >
              {statusConfig.label}
            </button>
          </div>
        </div>

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div className="flex items-center gap-1 flex-wrap pt-1">
            {task.tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-0.5 rounded text-xs"
                style={{ 
                  backgroundColor: theme.background.secondary,
                  color: theme.text.secondary 
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;