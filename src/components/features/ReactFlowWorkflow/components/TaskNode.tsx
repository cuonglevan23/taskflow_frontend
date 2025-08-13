import React from 'react';
import { Handle, Position } from 'reactflow';
import { Calendar, Clock, User, Flag } from 'lucide-react';
import { WorkflowTask } from '../types';
import { useTheme } from '@/layouts/hooks/useTheme';

interface TaskNodeProps {
  data: {
    task: WorkflowTask;
    onTaskClick?: (task: WorkflowTask) => void;
    onTaskUpdate?: (taskId: string, updates: Partial<WorkflowTask>) => void;
    isSelected?: boolean;
    isConnecting?: boolean;
  };
}

export default function TaskNode({ data }: TaskNodeProps) {
  const { theme } = useTheme();
  const { task, onTaskClick, isSelected, isConnecting } = data;

  const handleClick = () => {
    onTaskClick?.(task);
  };

  // Priority colors
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return '#EF4444';
      case 'high': return '#F97316';
      case 'medium': return '#3B82F6';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
  };

  // Status colors
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done': return '#10B981';
      case 'in_progress': return '#3B82F6';
      case 'review': return '#F59E0B';
      case 'todo': return '#6B7280';
      case 'cancelled': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const formatDuration = (days: number) => {
    return days === 1 ? '1 day' : `${days} days`;
  };

  return (
    <div 
      className={`bg-white rounded-lg border-2 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer min-w-[280px] max-w-[320px] ${
        isSelected ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
      } ${isConnecting ? 'ring-2 ring-green-500 ring-opacity-50' : ''}`}
      style={{ 
        borderColor: isSelected ? '#3B82F6' : theme.border.default,
        backgroundColor: theme.background.primary
      }}
      onClick={handleClick}
    >
      {/* Connection Handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-blue-500 border-2 border-white hover:bg-blue-600 transition-colors"
        style={{ left: '-8px' }}
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-green-500 border-2 border-white hover:bg-green-600 transition-colors"
        style={{ right: '-8px' }}
      />

      {/* Task Header */}
      <div 
        className="px-4 py-3 border-b"
        style={{ 
          borderColor: theme.border.default,
          background: `linear-gradient(135deg, ${task.color || '#F8FAFC'} 0%, ${task.color || '#F1F5F9'} 100%)`
        }}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 
              className="font-semibold text-sm truncate"
              style={{ color: theme.text.primary }}
              title={task.title}
            >
              {task.title}
            </h3>
            <p 
              className="text-xs mt-1 opacity-70"
              style={{ color: theme.text.secondary }}
            >
              {task.section}
            </p>
          </div>
          
          {/* Priority Badge */}
          <div 
            className="w-3 h-3 rounded-full flex-shrink-0 ml-2"
            style={{ backgroundColor: getPriorityColor(task.priority) }}
            title={`Priority: ${task.priority}`}
          />
        </div>
      </div>

      {/* Task Content */}
      <div className="px-4 py-3 space-y-3">
        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium" style={{ color: theme.text.secondary }}>
              Progress
            </span>
            <span className="text-xs font-medium" style={{ color: theme.text.primary }}>
              {task.progress}%
            </span>
          </div>
          <div 
            className="w-full bg-gray-200 rounded-full h-2"
            style={{ backgroundColor: theme.background.secondary }}
          >
            <div
              className="h-2 rounded-full transition-all duration-300"
              style={{
                width: `${task.progress}%`,
                backgroundColor: getStatusColor(task.status)
              }}
            />
          </div>
        </div>

        {/* Task Details */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" style={{ color: theme.text.secondary }} />
            <span style={{ color: theme.text.secondary }}>
              {task.startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          </div>
          
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" style={{ color: theme.text.secondary }} />
            <span style={{ color: theme.text.secondary }}>
              {formatDuration(task.duration)}
            </span>
          </div>
        </div>

        {/* Assignees */}
        {task.assignees.length > 0 && (
          <div className="flex items-center gap-2">
            <User className="w-3 h-3" style={{ color: theme.text.secondary }} />
            <div className="flex -space-x-1">
              {task.assignees.slice(0, 3).map((assignee) => (
                <div
                  key={assignee.id}
                  className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center border-2 border-white font-medium"
                  title={assignee.name}
                  style={{ backgroundColor: getPriorityColor('medium') }}
                >
                  {assignee.avatar || assignee.name.charAt(0).toUpperCase()}
                </div>
              ))}
              {task.assignees.length > 3 && (
                <div 
                  className="w-6 h-6 rounded-full text-white text-xs flex items-center justify-center border-2 border-white font-medium"
                  style={{ backgroundColor: theme.text.secondary }}
                  title={`+${task.assignees.length - 3} more`}
                >
                  +{task.assignees.length - 3}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Status Badge */}
        <div className="flex items-center justify-between">
          <div 
            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
            style={{
              backgroundColor: `${getStatusColor(task.status)}20`,
              color: getStatusColor(task.status)
            }}
          >
            <div 
              className="w-2 h-2 rounded-full mr-1"
              style={{ backgroundColor: getStatusColor(task.status) }}
            />
            {task.status.replace('_', ' ')}
          </div>
          
          {task.dependencies && task.dependencies.length > 0 && (
            <div className="flex items-center gap-1">
              <Flag className="w-3 h-3" style={{ color: theme.text.secondary }} />
              <span className="text-xs" style={{ color: theme.text.secondary }}>
                {task.dependencies.length} deps
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskNode;