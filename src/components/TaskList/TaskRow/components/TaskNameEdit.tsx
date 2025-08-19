import React from 'react';
import { ArrowUpDown } from 'lucide-react';
import { TaskListItem } from '../../types';
import { TaskEditState } from '../types';
import Input from '@/components/ui/Input/Input';
import ButtonIcon from '@/components/ui/Button/ButtonIcon';

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
              onBlur={handleSave}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={handleKeyDown}
              inputSize="sm"
              className="bg-gray-700 border-blue-400 text-white text-xs h-6"
              style={{ 
                width: Math.max(100, editState.editValue.length * 7 + 16) + 'px',
                minWidth: '100px',
                maxWidth: '200px'
              }}
              autoFocus
              onFocus={(e) => e.target.select()}
            />
            <span className="text-xs text-gray-500 whitespace-nowrap">Enter to save</span>
          </div>
        ) : (
          <>
            <span 
              className={`text-xs cursor-pointer inline-block px-1 py-0.5 rounded hover:bg-gray-700/50 transition-colors ${
                (task.status === 'DONE' || task.status === 'done' || task.status === 'completed' || task.completed)
                  ? 'line-through text-green-400 font-medium' 
                  : 'text-white group-hover:text-blue-100'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                onStartEdit();
              }}
              title="Click to edit task name"
              style={{
                width: 'fit-content',
                minWidth: 'auto'
              }}
            >
              {task.name}
            </span>
            

            
            <div 
              className="flex-1 h-6 cursor-pointer hover:bg-gray-700/20 rounded transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onTaskClick(task);
              }}
              title="Click to view task details"
            />
          </>
        )}
      </div>
    </div>
  );
};