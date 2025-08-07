"use client";

import React, { useState } from 'react';
import { X, Calendar, User, CheckCircle, Plus, MessageCircle, Paperclip, MoreHorizontal } from 'lucide-react';
import { useTheme } from '@/layouts/hooks/useTheme';
import { TaskListItem, TaskStatus, TaskPriority } from '@/components/TaskList/types';
import DueDatePicker from '@/app/project/list/components/DueDatePicker';
import { EnhancedCalendar } from '@/components/features/EnhancedCalendar';

interface TaskDetailPanelProps {
  task: TaskListItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (taskId: string, updates: Partial<TaskListItem>) => void;
  onDelete?: (taskId: string) => void;
}

const TaskDetailPanel: React.FC<TaskDetailPanelProps> = ({
  task,
  isOpen,
  onClose,
  onSave,
  onDelete
}) => {
  const { theme } = useTheme();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [comment, setComment] = useState('');
  
  // Time options
  const [hasStartTime, setHasStartTime] = useState(false);
  const [hasEndTime, setHasEndTime] = useState(false);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [isEnhancedCalendarOpen, setIsEnhancedCalendarOpen] = useState(false);

  React.useEffect(() => {
    if (task) {
      setTitle(task.name || '');
      setDescription(task.description || '');
      
      // Initialize dates from enhanced calendar data if available
      if (task.startDate) {
        const taskStartDate = new Date(task.startDate);
        if (!isNaN(taskStartDate.getTime())) {
          setStartDate(taskStartDate);
        }
      } else if (task.dueDate) {
        const dueDate = new Date(task.dueDate);
        if (!isNaN(dueDate.getTime())) {
          setStartDate(dueDate);
        }
      }
      
      if (task.endDate) {
        const taskEndDate = new Date(task.endDate);
        if (!isNaN(taskEndDate.getTime())) {
          setEndDate(taskEndDate);
        }
      } else if (task.dueDate) {
        const dueDate = new Date(task.dueDate);
        if (!isNaN(dueDate.getTime())) {
          setEndDate(dueDate);
        }
      }
      
      // Initialize time data from enhanced calendar
      if (task.startTime) {
        setStartTime(task.startTime);
        setHasStartTime(true);
      } else {
        setHasStartTime(false);
      }
      
      if (task.endTime) {
        setEndTime(task.endTime);
        setHasEndTime(true);
      } else {
        setHasEndTime(false);
      }
      
    } else {
      // Reset all state when no task
      setTitle('');
      setDescription('');
      setStartDate(new Date());
      setEndDate(new Date());
      setStartTime('09:00');
      setEndTime('17:00');
      setHasStartTime(false);
      setHasEndTime(false);
    }
  }, [task]);

  const handleSave = () => {
    if (task && onSave) {
      onSave(task.id, {
        name: title,
        description: description,
        startDate: (startDate && !isNaN(startDate.getTime())) ? startDate.toISOString().split('T')[0] : undefined,
        endDate: (endDate && !isNaN(endDate.getTime())) ? endDate.toISOString().split('T')[0] : undefined,
        startTime: hasStartTime ? startTime : undefined,
        endTime: hasStartTime ? endTime : undefined,
        hasStartTime,
        hasEndTime: hasStartTime, // End time is available when start time is enabled
      });
    }
  };

  const handleStatusChange = () => {
    if (task && onSave) {
      const newStatus: TaskStatus = task.status === 'done' ? 'todo' : 'done';
      onSave(task.id, { status: newStatus });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDateRange = (startDateString: string, endDateString: string) => {
    if (!startDateString || !endDateString) {
      return startDateString ? formatDate(startDateString) : 'Set date and time';
    }
    
    const startDate = new Date(startDateString);
    const endDate = new Date(endDateString);
    
    // Check if same date
    if (startDate.toDateString() === endDate.toDateString()) {
      return `${startDate.getDate()} ${startDate.toLocaleDateString('en-US', { month: 'short' }).toLowerCase()}`;
    }
    
    // Check if same month
    if (startDate.getMonth() === endDate.getMonth() && startDate.getFullYear() === endDate.getFullYear()) {
      return `${startDate.getDate()}-${endDate.getDate()} ${startDate.toLocaleDateString('en-US', { month: 'short' }).toLowerCase()}`;
    }
    
    // Different months
    return `${startDate.getDate()} ${startDate.toLocaleDateString('en-US', { month: 'short' }).toLowerCase()} - ${endDate.getDate()} ${endDate.toLocaleDateString('en-US', { month: 'short' }).toLowerCase()}`;
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'done': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'review': return 'bg-purple-100 text-purple-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-end z-[60]">
      <div 
        className="w-[480px] h-full overflow-y-auto border-l"
        style={{ 
          backgroundColor: theme.background.primary,
          borderColor: theme.border.default
        }}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between p-6 border-b"
          style={{ 
            backgroundColor: theme.background.primary,
            borderColor: theme.border.default
          }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={handleStatusChange}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                task.status === 'done'
                  ? 'bg-green-600 text-white' 
                  : 'hover:opacity-80'
              }`}
              style={{
                backgroundColor: task.status === 'done' ? '#059669' : theme.background.secondary,
                color: task.status === 'done' ? 'white' : theme.text.primary
              }}
            >
              <CheckCircle className="w-4 h-4" />
              {task.status === 'done' ? 'Completed' : 'Mark complete'}
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              className="p-2 rounded transition-colors"
              style={{ 
                color: theme.text.secondary,
                ':hover': { backgroundColor: theme.background.secondary }
              }}
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded transition-colors"
              style={{ 
                color: theme.text.secondary,
                ':hover': { backgroundColor: theme.background.secondary }
              }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Task visibility notice */}
          <div 
            className="flex items-start gap-3 p-4 rounded-lg"
            style={{ backgroundColor: theme.background.secondary }}
          >
            <div 
              className="w-5 h-5 rounded flex items-center justify-center mt-0.5"
              style={{ backgroundColor: theme.background.tertiary }}
            >
              <div 
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: theme.text.secondary }}
              ></div>
            </div>
            <div className="text-sm" style={{ color: theme.text.secondary }}>
              This task is visible to team members.
            </div>
            <button className="text-blue-400 text-sm hover:underline ml-auto">
              Change privacy
            </button>
          </div>

          {/* Task Title */}
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleSave}
              className="w-full text-2xl font-bold bg-transparent border-none outline-none resize-none"
              style={{ 
                color: theme.text.primary,
                '::placeholder': { color: theme.text.secondary }
              }}
              placeholder="Task name"
            />
          </div>

          {/* Assignees */}
          <div className="space-y-2">
            <label className="text-sm font-medium" style={{ color: theme.text.secondary }}>
              Assignees
            </label>
            <div className="flex items-center gap-3 flex-wrap">
              {task.assignees.map((assignee, index) => (
                <div key={assignee.id} className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {assignee.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <span style={{ color: theme.text.primary }}>{assignee.name}</span>
                </div>
              ))}
              {task.assignees.length === 0 && (
                <div className="flex items-center gap-2">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: theme.background.secondary }}
                  >
                    <User className="w-4 h-4" style={{ color: theme.text.secondary }} />
                  </div>
                  <span style={{ color: theme.text.secondary }}>Unassigned</span>
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Calendar Section */}
          <div className="space-y-4">
            <label className="text-sm font-medium" style={{ color: theme.text.secondary }}>
              Due date & time
            </label>
            <button
              onClick={() => setIsEnhancedCalendarOpen(true)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded border transition-colors hover:opacity-80"
              style={{ 
                backgroundColor: theme.background.secondary,
                borderColor: theme.border.default,
                color: theme.text.primary
              }}
            >
              <Calendar className="w-4 h-4" />
              <span>
                {(() => {
                  // Display enhanced calendar data if available
                  if ((startDate && !isNaN(startDate.getTime())) || (endDate && !isNaN(endDate.getTime()))) {
                    const startStr = (startDate && !isNaN(startDate.getTime())) ? startDate.toISOString().split('T')[0] : null;
                    const endStr = (endDate && !isNaN(endDate.getTime())) ? endDate.toISOString().split('T')[0] : null;
                    
                    if (startStr && endStr) {
                      let display = formatDateRange(startStr, endStr);
                      // Add time if available
                      if (hasStartTime && (startTime || endTime)) {
                        const timeStr = [];
                        if (startTime) timeStr.push(startTime);
                        if (endTime && endTime !== startTime) timeStr.push(endTime);
                        if (timeStr.length > 0) {
                          display += ` ${timeStr.join('-')}`;
                        }
                      }
                      return display;
                    }
                  }
                  
                  // Fallback to task.dueDate with time if available
                  if (task.dueDate) {
                    let display = formatDateRange(task.dueDate, task.dueDate);
                    if (hasStartTime && (startTime || endTime)) {
                      const timeStr = [];
                      if (startTime) timeStr.push(startTime);
                      if (endTime && endTime !== startTime) timeStr.push(endTime);
                      if (timeStr.length > 0) {
                        display += ` ${timeStr.join('-')}`;
                      }
                    }
                    return display;
                  }
                  
                  return 'Set date and time';
                })()}
              </span>
            </button>


          </div>

          {/* Projects */}
          <div className="space-y-2">
            <label className="text-sm font-medium" style={{ color: theme.text.secondary }}>
              Projects
            </label>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span style={{ color: theme.text.primary }}>
                {task.project || 'No project assigned'}
              </span>
            </div>
          </div>

          {/* Fields */}
          <div className="space-y-3">
            <label className="text-sm font-medium" style={{ color: theme.text.secondary }}>
              Fields
            </label>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: theme.background.secondary }}
                ></div>
                <span style={{ color: theme.text.primary }}>Priority</span>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                {task.priority}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: theme.background.secondary }}
                ></div>
                <span style={{ color: theme.text.primary }}>Status</span>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                {task.status.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <label className="text-sm font-medium" style={{ color: theme.text.secondary }}>
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={handleSave}
              className="w-full h-24 bg-transparent border-none outline-none resize-none"
              style={{ 
                color: theme.text.primary,
                '::placeholder': { color: theme.text.secondary }
              }}
              placeholder="What is this task about?"
            />
          </div>

          {/* Comments */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                {task.assignees[0]?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'U'}
              </div>
              <input
                type="text"
                value={comment || ''}
                onChange={(e) => setComment(e.target.value)}
                className="flex-1 px-3 py-2 rounded border-none outline-none"
                style={{ 
                  backgroundColor: theme.background.secondary,
                  color: theme.text.primary,
                  '::placeholder': { color: theme.text.secondary }
                }}
                placeholder="Add a comment"
              />
            </div>
          </div>

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: theme.text.secondary }}>
                Tags
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {task.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 rounded text-xs"
                    style={{ 
                      backgroundColor: theme.background.secondary,
                      color: theme.text.secondary 
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Collaborators */}
          <div className="space-y-2 border-t pt-4" style={{ borderColor: theme.border.default }}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium" style={{ color: theme.text.secondary }}>
                Collaborators
              </span>
              <button className="text-blue-400 text-sm hover:underline">
                Add collaborators
              </button>
            </div>
            <div className="flex items-center gap-2">
              {task.assignees.map((assignee) => (
                <div 
                  key={assignee.id}
                  className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold"
                >
                  {assignee.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
              ))}
              <div 
                className="w-6 h-6 rounded-full flex items-center justify-center"
                style={{ backgroundColor: theme.background.secondary }}
              >
                <Plus className="w-3 h-3" style={{ color: theme.text.secondary }} />
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Calendar Modal */}
        <EnhancedCalendar
          isOpen={isEnhancedCalendarOpen}
          onClose={() => setIsEnhancedCalendarOpen(false)}
          onSave={(data) => {
            console.log('Calendar data saved:', data);
            
            // Convert dd/mm/yy format to proper date
            const parseDate = (dateStr: string) => {
              if (!dateStr) return null;
              const [day, month, year] = dateStr.split('/');
              return `20${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
            };
            
            const startDateFormatted = parseDate(data.startDate);
            const endDateFormatted = parseDate(data.endDate);
            
            // Update local state immediately for UI sync
            if (startDateFormatted) setStartDate(new Date(startDateFormatted));
            if (endDateFormatted) setEndDate(new Date(endDateFormatted));
            
            // Update time state if provided
            if (data.startTime) {
              setStartTime(data.startTime);
              setHasStartTime(true);
            }
            if (data.endTime) {
              setEndTime(data.endTime);
              setHasEndTime(true);
            }
            
            // Save to task data with complete sync
            if (onSave) {
              console.log('TaskDetailPanel saving:', {
                dueDate: endDateFormatted || startDateFormatted, // dueDate should be end date
                startDate: startDateFormatted,
                endDate: endDateFormatted,
              });
              
              onSave(task.id, { 
                dueDate: endDateFormatted || startDateFormatted, // ✅ Fix: dueDate = end date
                startDate: startDateFormatted,
                endDate: endDateFormatted,
                startTime: data.startTime || startTime,
                endTime: data.endTime || endTime,
                hasStartTime: !!(data.startTime || startTime),
                hasEndTime: !!(data.endTime || endTime)
              });
            }
          }}
        />
      </div>
    </div>
  );
};

export default TaskDetailPanel;