"use client";

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useTheme } from '@/layouts/hooks/useTheme';
import { TaskListItem } from '@/components/TaskList/types';
import { formatTaskDate } from '@/components/TaskList/utils';
import { MoreHorizontal, GripVertical } from 'lucide-react';

interface SortableTaskCardProps {
  task: TaskListItem;
  onClick?: (task: TaskListItem) => void;
  isDragging?: boolean;
}

const SortableTaskCard: React.FC<SortableTaskCardProps> = ({ 
  task, 
  onClick,
  isDragging = false,
}) => {
  const { theme } = useTheme();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: 'task',
      task,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      className={`group relative mb-2 rounded-lg border transition-all hover:shadow-md cursor-grab active:cursor-grabbing ${
        isSortableDragging ? 'z-50 opacity-50' : ''
      }`}
      {...attributes}
      {...listeners}
      data-task-id={task.id}
      style={{
        ...style,
        backgroundColor: theme.background.primary,
        borderColor: isSortableDragging ? '#3B82F6' : theme.border.default,
        border: `1px solid ${isSortableDragging ? '#3B82F6' : theme.border.default}`,
      }}
      onClick={(e) => {
        // Only handle click if not dragging
        if (!isSortableDragging) {
          onClick?.(task);
        }
      }}
    >
      {/* Drag Indicator */}
      <div
        className="absolute left-1 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
        aria-hidden="true"
      >
        <GripVertical 
          className="w-3 h-3" 
          style={{ color: theme.text.secondary }}
        />
      </div>

      {/* Task Content */}
      <div className="p-3 pl-6">
        <div className="flex items-start justify-between mb-2">
          <h4 
            className="text-sm font-medium line-clamp-2 flex-1 mr-2"
            style={{ color: theme.text.primary }}
          >
            {task.name}
          </h4>
          <button 
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded"
            onClick={(e) => {
              e.stopPropagation();
              // Handle task menu
            }}
          >
            <MoreHorizontal 
              className="w-4 h-4" 
              style={{ color: theme.text.secondary }}
            />
          </button>
        </div>
        
        {task.description && (
          <p 
            className="text-xs mb-2 line-clamp-2"
            style={{ color: theme.text.secondary }}
          >
            {task.description}
          </p>
        )}

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            {task.dueDate && (
              <span 
                className="px-2 py-1 rounded text-xs whitespace-nowrap"
                style={{ 
                  backgroundColor: theme.background.secondary,
                  color: theme.text.secondary 
                }}
              >
                {formatTaskDate(task)}
              </span>
            )}
            
            {task.priority && (
              <span 
                className={`px-2 py-1 rounded text-white text-xs whitespace-nowrap ${
                  task.priority === 'urgent' ? 'bg-red-500' :
                  task.priority === 'high' ? 'bg-orange-500' :
                  task.priority === 'medium' ? 'bg-yellow-500' :
                  'bg-gray-500'
                }`}
              >
                {task.priority}
              </span>
            )}

            {task.project && (
              <span 
                className="px-2 py-1 rounded text-xs whitespace-nowrap"
                style={{ 
                  backgroundColor: theme.background.secondary,
                  color: theme.text.secondary 
                }}
              >
                {task.project}
              </span>
            )}
          </div>

          {task.assignees && task.assignees.length > 0 && (
            <div className="flex -space-x-1 ml-2">
              {task.assignees.slice(0, 3).map((assignee, index) => (
                <div
                  key={assignee.id}
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium text-white border-2 border-white"
                  style={{ backgroundColor: theme.colors?.primary || '#3B82F6' }}
                  title={assignee.name}
                >
                  {assignee.name.charAt(0).toUpperCase()}
                </div>
              ))}
              {task.assignees.length > 3 && (
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs border-2 border-white"
                  style={{ 
                    backgroundColor: theme.background.secondary,
                    color: theme.text.secondary 
                  }}
                >
                  +{task.assignees.length - 3}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SortableTaskCard;