import React, { useState } from 'react';
import { ChevronDown, Clock, Play, CheckCircle } from 'lucide-react';
import { DARK_THEME } from '@/constants/theme';

interface TaskStatusDropdownProps {
  task: any;
  onStatusChange?: (taskId: string, status: string) => void;
}

const STATUS_OPTIONS = [
  { value: 'TODO', label: 'To Do', color: '#6b7280', icon: Clock },
  { value: 'IN_PROGRESS', label: 'In Progress', color: '#3b82f6', icon: Play },
  { value: 'DONE', label: 'Done', color: '#10b981', icon: CheckCircle },
];

export const TaskStatusDropdown: React.FC<TaskStatusDropdownProps> = ({
  task,
  onStatusChange
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Normalize status value from backend
  const normalizeStatus = (status: any) => {
    if (!status) return 'TODO';
    const statusStr = String(status).toUpperCase();

    // Map common variations to backend format
    if (statusStr === 'COMPLETE' || statusStr === 'COMPLETED') return 'DONE';
    if (statusStr === 'IN PROGRESS' || statusStr === 'INPROGRESS') return 'IN_PROGRESS';

    // Return if valid backend status
    const validStatuses = ['TODO', 'IN_PROGRESS', 'DONE'];
    return validStatuses.includes(statusStr) ? statusStr : 'TODO';
  };

  // Check if task is completed based on various fields
  const getTaskStatus = () => {
    if (task.completed) return 'DONE';
    return normalizeStatus(task.status);
  };

  const currentStatus = STATUS_OPTIONS.find(
    option => option.value === getTaskStatus()
  ) || STATUS_OPTIONS[0]; // Default to TO DO

  const handleStatusSelect = (status: string) => {
    onStatusChange?.(task.id, status);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        className="flex items-center gap-1.5 px-2 py-1 text-xs rounded hover:bg-gray-700 transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        style={{ color: currentStatus.color }}
      >
        <currentStatus.icon className="w-3 h-3" />
        <span className="hidden sm:inline truncate max-w-[80px]">{currentStatus.label}</span>
        <ChevronDown className="w-3 h-3" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div
            className="absolute top-full left-0 mt-1 z-50 min-w-[140px] rounded-md shadow-lg border"
            style={{
              backgroundColor: DARK_THEME.background.secondary,
              borderColor: DARK_THEME.border.default
            }}
          >
            {STATUS_OPTIONS.map((option) => (
              <button
                key={option.value}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-gray-700 first:rounded-t-md last:rounded-b-md transition-colors text-left"
                onClick={() => handleStatusSelect(option.value)}
                style={{ color: option.color }}
              >
                <option.icon className="w-3 h-3" />
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
