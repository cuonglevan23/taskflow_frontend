"use client";

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useTheme } from '@/layouts/hooks/useTheme';
import { TaskListItem } from '@/components/TaskList/types';
import { Plus } from 'lucide-react';
import SortableTaskCard from './SortableTaskCard';

interface DroppableColumnProps {
  id: string;
  title: string;
  color: string;
  tasks: TaskListItem[];
  onTaskClick?: (task: TaskListItem) => void;
  onAddTask?: (columnId: string) => void;
  isAddingTask?: boolean;
  newTaskInput?: React.ReactNode;
}

const DroppableColumn: React.FC<DroppableColumnProps> = ({
  id,
  title,
  color,
  tasks,
  onTaskClick,
  onAddTask,
  isAddingTask = false,
  newTaskInput,
}) => {
  const { theme } = useTheme();
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: {
      type: 'column',
      columnId: id,
    },
  });

  const taskIds = tasks.map(task => task.id);

  return (
    <div className="flex-shrink-0 w-80 flex flex-col h-full">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: color }}
          />
          <h3 
            className="font-semibold"
            style={{ color: theme.text.primary }}
          >
            {title}
          </h3>
          <span 
            className="px-2 py-1 text-xs rounded-full"
            style={{ 
              backgroundColor: theme.background.secondary,
              color: theme.text.secondary 
            }}
          >
            {tasks.length}
          </span>
        </div>
        
        <button
          onClick={() => onAddTask?.(id)}
          className="p-1 rounded hover:bg-opacity-10 hover:bg-gray-500 transition-colors"
          style={{ color: theme.text.secondary }}
          aria-label={`Add task to ${title}`}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Droppable Area */}
      <div
        ref={setNodeRef}
        className={`flex-1 p-2 rounded-lg min-h-[200px] transition-all duration-200 ${
          isOver ? 'ring-2 ring-blue-400 ring-opacity-50' : ''
        }`}
        style={{ 
          backgroundColor: isOver 
            ? `${theme.background.secondary}dd` // Slightly more opaque when hovering
            : theme.background.secondary,
          border: `2px dashed ${isOver ? '#3B82F6' : theme.border.default}`,
          maxHeight: 'calc(100vh - 280px)',
          overflowY: 'auto',
        }}
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {/* New Task Input */}
          {isAddingTask && newTaskInput}

          {/* Existing Tasks */}
          {tasks.map((task) => (
            <SortableTaskCard
              key={task.id}
              task={task}
              onClick={onTaskClick}
            />
          ))}
          
          {/* Empty State */}
          {tasks.length === 0 && !isAddingTask && (
            <div 
              className={`flex items-center justify-center h-32 text-sm transition-opacity duration-200 ${
                isOver ? 'opacity-100' : 'opacity-50'
              }`}
              style={{ color: theme.text.secondary }}
            >
              {isOver ? 'Drop task here' : 'Drop tasks here'}
            </div>
          )}
          
          {/* Drop Indicator */}
          {isOver && tasks.length > 0 && (
            <div 
              className="h-2 rounded bg-blue-400 opacity-50 mt-2 transition-all duration-200"
              style={{ backgroundColor: '#3B82F6' }}
            />
          )}
        </SortableContext>
      </div>
    </div>
  );
};

export default DroppableColumn;