import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useTaskCommentCount } from '@/hooks/useComments';
import { DARK_THEME } from '@/constants/theme';

interface TaskCommentIndicatorProps {
  taskId: string;
  initialCount?: number; // Optional initial count from task data
  className?: string;
}

export const TaskCommentIndicator: React.FC<TaskCommentIndicatorProps> = ({
  taskId,
  initialCount = 0,
  className = ''
}) => {
  // Use the simple SWR-based hook - much cleaner!
  const { count, isLoading } = useTaskCommentCount(taskId);
  
  // Use real-time count if available, otherwise fallback to initial count
  const commentCount = !isLoading ? count : initialCount;

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
