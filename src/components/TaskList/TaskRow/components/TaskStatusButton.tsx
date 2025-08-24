import React from 'react';
import { TaskListItem } from '../../types';

interface TaskStatusButtonProps {
  task: TaskListItem;
  onToggle: (e: React.MouseEvent) => void;
}

export const TaskStatusButton = ({ 
  task, 
  onToggle 
}: TaskStatusButtonProps) => {
  // ✅ FIX: Use same completion check logic as MyTasksCard
  const isCompleted = task.completed || (task.status as string) === 'completed' || task.status === 'DONE';
  
  return (
    <div className="flex-shrink-0 mr-3">
      <button
        type="button"
        className={`w-4 h-4 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 ${
          isCompleted
            ? 'bg-green-500 hover:bg-green-600 shadow-lg border-2 border-green-400'
            : 'border-2 border-gray-400 hover:border-green-400 hover:bg-green-50/10'
        }`}
        onClick={onToggle}
        title={isCompleted ? "Mark as incomplete" : "Mark as complete"}
      >
        {isCompleted && (
          <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )}
      </button>
    </div>
  );
};