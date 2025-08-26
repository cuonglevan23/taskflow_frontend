import React, { useEffect, useRef } from 'react';
import { Check, Trash2 } from 'lucide-react';
import { DARK_THEME } from '@/constants/theme';
import { TaskListItem } from '../../types';

interface TaskContextMenuProps {
  task: TaskListItem;
  isOpen: boolean;
  position: { x: number; y: number };
  onClose: () => void;
  onMarkDone: () => void;
  onDelete: () => void;
}

export const TaskContextMenu: React.FC<TaskContextMenuProps> = ({
  task,
  isOpen,
  position,
  onClose,
  onMarkDone,
  onDelete,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  console.log('TaskContextMenu rendering at position:', position);

  // Check if task is already completed
  const isCompleted = task.completed || (task.status as string) === 'completed' || task.status === 'DONE';

  return (
    <div
      ref={menuRef}
      className="fixed z-50 min-w-[180px] rounded-lg shadow-lg border overflow-hidden"
      style={{
        top: position.y,
        left: position.x,
        backgroundColor: DARK_THEME.sidebar.background,
        borderColor: DARK_THEME.border.default,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
      }}
    >
      <div className="py-1">
        {/* Mark as Done/Undone */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMarkDone();
            onClose();
          }}
          className="w-full px-4 py-2 text-left text-sm flex items-center gap-3 transition-colors hover:bg-gray-700"
          style={{
            color: DARK_THEME.text.primary,
          }}
        >
          <Check className="w-4 h-4" />
          <span>{isCompleted ? 'Mark as Todo' : 'Mark as Done'}</span>
        </button>

        {/* Delete */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
            onClose();
          }}
          className="w-full px-4 py-2 text-left text-sm flex items-center gap-3 transition-colors text-red-400 hover:text-red-300 hover:bg-gray-700"
        >
          <Trash2 className="w-4 h-4" />
          <span>Delete Task</span>
        </button>
      </div>
    </div>
  );
};
