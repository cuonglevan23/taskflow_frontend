import React, { useState } from 'react';
import { ChevronDown, AlertCircle, Circle, ArrowUp, AlertTriangle } from 'lucide-react';
import { DARK_THEME } from '@/constants/theme';

interface TaskPriorityProps {
  task: any;
  onPriorityChange?: (taskId: string, priority: string) => void;
}

const PRIORITY_OPTIONS = [
  { value: 'LOW', label: 'Low', color: '#10b981', icon: Circle },
  { value: 'MEDIUM', label: 'Medium', color: '#f59e0b', icon: AlertCircle },
  { value: 'HIGH', label: 'High', color: '#ef4444', icon: ArrowUp },
  { value: 'URGENT', label: 'Urgent', color: '#dc2626', icon: AlertTriangle },
];

export const TaskPriority: React.FC<TaskPriorityProps> = ({
  task,
  onPriorityChange
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Normalize priority value from backend
  const normalizePriority = (priority: any) => {
    if (!priority) return 'MEDIUM';
    const priorityStr = String(priority).toUpperCase();
    return ['LOW', 'MEDIUM', 'HIGH', 'URGENT'].includes(priorityStr) ? priorityStr : 'MEDIUM';
  };

  const currentPriority = PRIORITY_OPTIONS.find(
    option => option.value === normalizePriority(task.priority)
  ) || PRIORITY_OPTIONS[1]; // Default to medium

  const handlePrioritySelect = (priority: string) => {
    onPriorityChange?.(task.id, priority);
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
        style={{ color: currentPriority.color }}
      >
        <currentPriority.icon className="w-3 h-3" />
        <span className="hidden sm:inline">{currentPriority.label}</span>
        <ChevronDown className="w-3 h-3" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div
            className="absolute top-full left-0 mt-1 z-50 min-w-[120px] rounded-md shadow-lg border"
            style={{
              backgroundColor: DARK_THEME.background.secondary,
              borderColor: DARK_THEME.border.default
            }}
          >
            {PRIORITY_OPTIONS.map((option) => (
              <button
                key={option.value}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-gray-700 first:rounded-t-md last:rounded-b-md transition-colors"
                onClick={() => handlePrioritySelect(option.value)}
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
