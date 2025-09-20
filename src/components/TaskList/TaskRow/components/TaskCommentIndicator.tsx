import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useTaskCommentCount, useProjectTaskCommentCount } from '@/hooks/useComments';
import { DARK_THEME } from '@/constants/theme';

interface TaskCommentIndicatorProps {
  taskId: string;
  initialCount?: number; // Optional initial count from task data
  className?: string;
  taskType?: 'mytask' | 'project'; // NEW: Specify task type to use correct API
}

export const TaskCommentIndicator: React.FC<TaskCommentIndicatorProps> = ({
  taskId,
  initialCount = 0,
  className = '',
  taskType = 'mytask' // Default to mytask for backward compatibility
}) => {
  // Always fetch count for accurate display - don't rely on initialCount
  const myTaskHook = useTaskCommentCount(
    taskType === 'mytask' ? taskId : null
  );
  const projectTaskHook = useProjectTaskCommentCount(
    taskType === 'project' ? taskId : null
  );

  // Select the correct hook data based on task type
  const { count, isLoading } = taskType === 'project' ? projectTaskHook : myTaskHook;

  // Use fetched count, fallback to initial count only if loading
  const commentCount = isLoading ? initialCount : count;

  // Don't render if no comments
  if (commentCount === 0) {
    return null;
  }

  return (
    <div 
      className={`flex items-center gap-1 text-xs transition-colors duration-200 ${className}`}
      style={{ color: DARK_THEME.text.muted }}
      title={`${commentCount} comment${commentCount > 1 ? 's' : ''}`}
    >
      <MessageCircle 
        className="w-3 h-3" 
        style={{ color: DARK_THEME.text.muted }}
      />
      <span className="text-xs font-medium">{commentCount}</span>
    </div>
  );
};

export default TaskCommentIndicator;
