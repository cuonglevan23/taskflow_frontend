import React from 'react';
import { ArrowUpDown } from 'lucide-react';
import { TaskListItem } from '../../types';
import { TaskEditState } from '../types';
import Input from '@/components/ui/Input/Input';
import ButtonIcon from '@/components/ui/Button/ButtonIcon';
import { useThemeContext } from '@/providers/ThemeProvider';

interface TaskNameEditProps {
  task: TaskListItem;
  editState: TaskEditState;
  onStartEdit: () => void;
  onSave: (newName: string) => void;
  onCancel: () => void;
  onUpdateEditValue: (value: string) => void;
  onTaskClick: (task: TaskListItem) => void;
  onShowMoveMenu: (e: React.MouseEvent) => void;
}

export const TaskNameEdit = ({
  task,
  editState,
  onStartEdit,
  onSave,
  onCancel,
  onUpdateEditValue,
  onTaskClick,
  onShowMoveMenu,
}: TaskNameEditProps) => {
  const { theme } = useThemeContext();

  const handleSave = () => {
    onSave(editState.editValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  };

  return (
    <div className="flex-1 min-w-[300px] px-6">
      <div className="flex items-center gap-2">
        {editState.isEditing ? (
          <div className="flex items-center gap-2">
            <Input
              value={editState.editValue}
              onChange={(e) => onUpdateEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleSave}
              className="flex-1 bg-transparent border-none outline-none"
              style={{
                color: theme.text.primary,
                backgroundColor: 'transparent'
              }}
              autoFocus
            />
          </div>
        ) : (
          <div className="flex items-center gap-2 w-full">
            <span
              className="flex-1 text-sm cursor-pointer hover:opacity-80 transition-colors truncate"
              style={{
                color: theme.text.primary,
                textDecoration: task.status === 'DONE' ? 'line-through' : 'none',
                opacity: task.status === 'DONE' ? 0.6 : 1
              }}
              onClick={() => onTaskClick(task)}
              onDoubleClick={onStartEdit}
            >
              {task.name}
            </span>

            {/* Move Task Button */}
            <ButtonIcon
              icon={ArrowUpDown}
              onClick={onShowMoveMenu}
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity w-4 h-4 p-0"
              style={{ color: theme.text.muted }}
            />
          </div>
        )}
      </div>
    </div>
  );
};