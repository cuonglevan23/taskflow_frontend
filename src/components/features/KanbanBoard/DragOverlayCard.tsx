"use client";

import React from 'react';
import { useTheme } from '@/layouts/hooks/useTheme';
import { TaskListItem } from '@/components/TaskList/types';
import { formatTaskDate } from '@/components/TaskList/utils';
import { MoreHorizontal } from 'lucide-react';

interface DragOverlayCardProps {
  task: TaskListItem;
}

const DragOverlayCard: React.FC<DragOverlayCardProps> = ({ task }) => {
  const { theme } = useTheme();

  return (
    <div
      className="p-3 rounded-lg shadow-2xl border-2 border-blue-500 transform rotate-3 opacity-95"
      style={{
        backgroundColor: theme.background.primary,
        borderColor: '#3B82F6', // Blue border to indicate dragging
        minWidth: '300px',
        maxWidth: '300px',
      }}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 
          className="text-sm font-medium line-clamp-2"
          style={{ color: theme.text.primary }}
        >
          {task.name}
        </h4>
        <MoreHorizontal 
          className="w-4 h-4 opacity-50" 
          style={{ color: theme.text.secondary }}
        />
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
        <div className="flex items-center gap-2">
          {task.dueDate && (
            <span 
              className="px-2 py-1 rounded text-xs"
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
              className={`px-2 py-1 rounded text-white text-xs ${
                task.priority === 'urgent' ? 'bg-red-500' :
                task.priority === 'high' ? 'bg-orange-500' :
                task.priority === 'medium' ? 'bg-yellow-500' :
                'bg-gray-500'
              }`}
            >
              {task.priority}
            </span>
          )}
        </div>

        {task.assignees && task.assignees.length > 0 && (
          <div className="flex -space-x-1">
            {task.assignees.slice(0, 3).map((assignee, index) => (
              <div
                key={assignee.id}
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium text-white"
                style={{ backgroundColor: theme.colors?.primary || '#3B82F6' }}
                title={assignee.name}
              >
                {assignee.name.charAt(0).toUpperCase()}
              </div>
            ))}
            {task.assignees.length > 3 && (
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
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
  );
};

export default DragOverlayCard;