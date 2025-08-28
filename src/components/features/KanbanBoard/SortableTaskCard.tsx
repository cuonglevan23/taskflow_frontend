"use client";

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useTheme } from '@/layouts/hooks/useTheme';
import { TaskListItem } from '@/components/TaskList/types';
import { formatTaskDate } from '@/components/TaskList/utils';
import { MoreHorizontal, GripVertical } from 'lucide-react';
import UserAvatar from '@/components/ui/UserAvatar/UserAvatar';

interface SortableTaskCardProps {
  task: TaskListItem;
  onClick?: (task: TaskListItem) => void;
  isDragging?: boolean;
}

const SortableTaskCard = ({ 
  task, 
  onClick,
}: SortableTaskCardProps) => {
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
      onClick={() => {
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
            className="text-sm font-medium line-clamp-2 flex-1 mr-2 break-words"
            style={{ color: theme.text.primary }}
            title={task.name}
          >
            {task.name}
          </h4>
          <button 
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded flex-shrink-0"
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
        
        {/* Description */}
        <div className="mb-2">
          <p 
            className="text-xs line-clamp-2 break-words"
            style={{ color: theme.text.secondary }}
            title={task.description || "No description"}
          >
            {task.description || "No description"}
          </p>
        </div>

        <div className="flex items-center justify-between text-xs flex-wrap gap-2">
          <div className="flex items-center gap-1 flex-wrap min-w-0">
            {task.dueDate && (
              <span 
                className="px-2 py-1 rounded text-xs whitespace-nowrap"
                style={{ 
                  backgroundColor: theme.background.secondary,
                  color: theme.text.secondary 
                }}
                title={`Due: ${formatTaskDate(task)}`}
              >
                {formatTaskDate(task)}
              </span>
            )}
            
            {task.priority && (
              <span 
                className={`px-2 py-1 rounded text-white text-xs whitespace-nowrap ${
                  task.priority.toLocaleLowerCase() === 'high' ? 'bg-red-500' :
                  task.priority.toLocaleLowerCase() === 'low' ? 'bg-green-500' :
                  task.priority.toLocaleLowerCase() === 'medium' ? 'bg-yellow-500' :
                  'bg-red-800'
                }`}
              >
                {task.priority}
              </span>
            )}

            {task.project && (
              <span 
                className="px-2 py-1 rounded text-xs whitespace-nowrap truncate max-w-24"
                style={{ 
                  backgroundColor: theme.background.secondary,
                  color: theme.text.secondary 
                }}
                title={task.project}
              >
                {task.project}
              </span>
            )}
          </div>

          {((task.assignees && task.assignees.length > 0) || (task.assignedEmails && task.assignedEmails.length > 0)) && (
            <div className="flex -space-x-1 ml-2">
              {/* Show assignees */}
              {task.assignees?.slice(0, 2).map((assignee) => {
                // Debug log for each assignee
                if (process.env.NODE_ENV === 'development') {
                  console.log('🔍 Board assignee DETAIL:', { 
                    assignee, 
                    assigneeEmail: assignee.email,
                    assigneeEmailType: typeof assignee.email,
                    taskId: task.id, 
                    taskName: task.name,
                    allAssignedEmails: task.assignedEmails 
                  });
                }
                return (
                  <UserAvatar
                    key={assignee.id}
                    name={assignee.name}
                    avatar={assignee.avatar}
                    email={assignee.email}
                    size="sm"
                    className="w-6 h-6 border-2 border-white"
                  />
                );
              })}
              
              {/* Show assigned emails - filter out emails that already have user objects */}
              {(task.assignedEmails || [])
                .filter((email: string) => {
                  const isDuplicate = task.assignees?.some(assignee => assignee.email === email);
                  if (process.env.NODE_ENV === 'development') {
                    console.log('🔍 Board email filter:', { email, isDuplicate, taskId: task.id });
                  }
                  return !isDuplicate;
                })
                .slice(0, 2)
                .map((email: string) => {
                  if (process.env.NODE_ENV === 'development') {
                    console.log('🔍 Board email avatar:', { email, taskId: task.id });
                  }
                  return (
                    <UserAvatar
                      key={email}
                      name={email}
                      size="sm"
                      className="w-6 h-6 border-2 border-white"
                    />
                  );
                })}
              
              {/* Show count if more than 4 total (excluding duplicates) */}
              {(() => {
                const uniqueEmailsCount = (task.assignedEmails || [])
                  .filter((email: string) => 
                    !task.assignees?.some(assignee => assignee.email === email)
                  ).length;
                const totalCount = (task.assignees?.length || 0) + uniqueEmailsCount;
                return totalCount > 4 && (
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs border-2 border-white bg-gray-500 text-white"
                  >
                    +{totalCount - 4}
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SortableTaskCard;