"use client";

import React, { useState } from 'react';
import { X, Calendar, User, CheckCircle, Plus, MessageCircle, Paperclip, MoreHorizontal } from 'lucide-react';
import DueDatePicker from '@/app/project/list/components/DueDatePicker';
import { EnhancedCalendar } from '@/components/EnhancedCalendar';

interface Task {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  color: string;
  assignee?: string;
  avatar?: string;
}

interface TaskDetailPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Omit<Task, 'id'>) => void;
  selectedDate?: Date;
  editTask?: Task | null;
}

const TaskDetailPanel: React.FC<TaskDetailPanelProps> = ({
  isOpen,
  onClose,
  onSave,
  selectedDate,
  editTask
}) => {
  const [title, setTitle] = useState(editTask?.title || '');
  const [startDate, setStartDate] = useState(
    editTask?.startDate || selectedDate || new Date()
  );
  const [endDate, setEndDate] = useState(
    editTask?.endDate || selectedDate || new Date()
  );
  const [assignee, setAssignee] = useState(editTask?.assignee || '');
  const [isCompleted, setIsCompleted] = useState(false);
  const [description, setDescription] = useState('');
  const [comment, setComment] = useState('');
  
  // Time options
  const [hasStartTime, setHasStartTime] = useState(false);
  const [hasEndTime, setHasEndTime] = useState(false);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [isEnhancedCalendarOpen, setIsEnhancedCalendarOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;

    const avatar = assignee 
      ? assignee.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
      : '';

    // Combine date and time if time is enabled
    const finalStartDate = new Date(startDate);
    const finalEndDate = new Date(endDate);
    
    if (hasStartTime) {
      const [hours, minutes] = startTime.split(':');
      finalStartDate.setHours(parseInt(hours), parseInt(minutes));
    }
    
    if (hasEndTime) {
      const [hours, minutes] = endTime.split(':');
      finalEndDate.setHours(parseInt(hours), parseInt(minutes));
    }

    const newTask = {
      title: title.trim(),
      startDate: finalStartDate,
      endDate: finalEndDate,
      color: editTask?.color || '#60A5FA',
      assignee: assignee.trim() || 'Unassigned',
      avatar,
      hasStartTime,
      hasEndTime,
      startTime: hasStartTime ? startTime : undefined,
      endTime: hasEndTime ? endTime : undefined
    };

    onSave(newTask);
    
    // Reset form
    setTitle('');
    setStartDate(new Date());
    setEndDate(new Date());
    setAssignee('');
    
    onClose();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-end z-[60]">
      <div className="bg-gray-800 w-[480px] h-full overflow-y-auto border-l border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700 bg-gray-800">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCompleted(!isCompleted)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                isCompleted 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              Mark complete
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-700 rounded text-gray-400">
              <MoreHorizontal className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded text-gray-400"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Task Title */}
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xl font-semibold bg-transparent text-white placeholder-gray-400 border-none outline-none resize-none"
              placeholder="Task name"
            />
          </div>

          {/* Simple Form Fields */}
          <div className="space-y-4">
            {/* Enhanced Calendar Section */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 block">Due date & time</label>
              <button
                onClick={() => setIsEnhancedCalendarOpen(true)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded border transition-colors hover:opacity-80 bg-gray-700 border-gray-600 text-white"
              >
                <Calendar className="w-4 h-4" />
                <span>
                  {formatDate(startDate)} - {formatDate(endDate)}
                </span>
              </button>
            </div>

            {/* Assignee */}
            <div>
              <label className="text-sm font-medium text-gray-300 block mb-2">Assignee</label>
              <input
                type="text"
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                className="w-full bg-gray-700 text-white placeholder-gray-400 px-3 py-2 rounded border border-gray-600 outline-none focus:border-blue-500"
                placeholder="Unassigned"
              />
            </div>

            {/* Project Name */}
            <div>
              <label className="text-sm font-medium text-gray-300 block mb-2">Project</label>
              <input
                type="text"
                className="w-full bg-gray-700 text-white placeholder-gray-400 px-3 py-2 rounded border border-gray-600 outline-none focus:border-blue-500"
                placeholder="Project name"
              />
            </div>

            {/* Status */}
            <div>
              <label className="text-sm font-medium text-gray-300 block mb-2">Status</label>
              <select className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 outline-none focus:border-blue-500">
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="review">Review</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSubmit}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium transition-colors"
            >
              Save
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-md font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Enhanced Calendar Modal */}
        <EnhancedCalendar
          isOpen={isEnhancedCalendarOpen}
          onClose={() => setIsEnhancedCalendarOpen(false)}
          onSave={(data) => {
            // Convert dd/mm/yy format to proper date
            const parseDate = (dateStr: string) => {
              if (!dateStr) return new Date();
              const [day, month, year] = dateStr.split('/');
              return new Date(parseInt(`20${year}`), parseInt(month) - 1, parseInt(day));
            };
            
            const startDateParsed = parseDate(data.startDate);
            const endDateParsed = parseDate(data.endDate);
            
            // Update form state
            setStartDate(startDateParsed);
            setEndDate(endDateParsed);
            setStartTime(data.startTime);
            setEndTime(data.endTime);
            setHasStartTime(!!data.startTime);
            setHasEndTime(!!data.endTime);
          }}
        />
      </div>
    </div>
  );
};

export default TaskDetailPanel;