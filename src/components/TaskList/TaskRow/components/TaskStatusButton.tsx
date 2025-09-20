import React from 'react';
import { TaskListItem } from '../../types';
import { useThemeContext } from '@/providers/ThemeProvider';
import { useLanguageContext } from '@/providers/LanguageProvider';

interface TaskStatusButtonProps {
  task: TaskListItem;
  onToggle: (e: React.MouseEvent) => void;
}

export const TaskStatusButton = ({ 
  task, 
  onToggle 
}: TaskStatusButtonProps) => {
  const { theme } = useThemeContext();
  const { messages } = useLanguageContext();

  // Helper function to get translated text
  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = messages;
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

  // ✅ FIX: Use same completion check logic as MyTasksCard
  const isCompleted = task.completed || (task.status as string) === 'completed' || task.status === 'DONE';
  
  return (
    <div className="flex-shrink-0 mr-3">
      <button
        type="button"
        className="w-4 h-4 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
        style={{
          backgroundColor: isCompleted
            ? theme.status.success
            : 'transparent',
          border: `2px solid ${isCompleted 
            ? theme.status.success 
            : theme.border.muted}`,
          boxShadow: isCompleted
            ? `0 4px 6px -1px ${theme.status.success}40`
            : 'none',
        }}
        onMouseEnter={(e) => {
          if (!isCompleted) {
            e.currentTarget.style.borderColor = theme.status.success;
            e.currentTarget.style.backgroundColor = `${theme.status.success}10`;
          } else {
            e.currentTarget.style.backgroundColor = theme.status.success;
            e.currentTarget.style.filter = 'brightness(0.9)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isCompleted) {
            e.currentTarget.style.borderColor = theme.border.muted;
            e.currentTarget.style.backgroundColor = 'transparent';
          } else {
            e.currentTarget.style.backgroundColor = theme.status.success;
            e.currentTarget.style.filter = 'none';
          }
        }}
        onClick={onToggle}
        title={isCompleted ? t('taskRow.markUndone') : t('taskRow.markDone')}
      >
        {isCompleted && (
          <svg
            className="w-2.5 h-2.5"
            fill="currentColor"
            viewBox="0 0 20 20"
            style={{ color: theme.text.inverse || '#ffffff' }}
          >
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )}
      </button>
    </div>
  );
};