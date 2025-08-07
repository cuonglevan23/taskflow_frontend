"use client";

import React, { useState } from 'react';
import { X, Calendar, User, Palette } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  color: string;
  assignee?: string;
  avatar?: string;
}

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Omit<Task, 'id'>) => void;
  selectedDate?: Date;
  editTask?: Task | null;
}

const TASK_COLORS = [
  '#60A5FA', // Blue
  '#34D399', // Green  
  '#F87171', // Red
  '#FBBF24', // Yellow
  '#A78BFA', // Purple
  '#FB7185', // Pink
  '#10B981', // Emerald
  '#F59E0B', // Amber
];

const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  selectedDate,
  editTask
}) => {
  // Helper function to ensure valid date
  const ensureValidDate = (date: any): Date => {
    if (date instanceof Date && !isNaN(date.getTime())) {
      return date;
    }
    return new Date();
  };

  const [title, setTitle] = useState(editTask?.title || '');
  const [startDate, setStartDate] = useState(() => 
    ensureValidDate(editTask?.startDate || selectedDate)
  );
  const [endDate, setEndDate] = useState(() => 
    ensureValidDate(editTask?.endDate || selectedDate)
  );
  const [assignee, setAssignee] = useState(editTask?.assignee || '');
  const [selectedColor, setSelectedColor] = useState(editTask?.color || TASK_COLORS[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;

    // Generate avatar from assignee name
    const avatar = assignee 
      ? assignee.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
      : '';

    onSave({
      title: title.trim(),
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      color: selectedColor,
      assignee: assignee.trim(),
      avatar
    });

    // Reset form
    setTitle('');
    setAssignee('');
    setSelectedColor(TASK_COLORS[0]);
    onClose();
  };

  const formatDate = (date: Date) => {
    try {
      // Ensure we have a valid date
      const validDate = ensureValidDate(date);
      return validDate.toISOString().split('T')[0];
    } catch (error) {
      console.warn('Invalid date provided to formatDate:', date);
      return new Date().toISOString().split('T')[0];
    }
  };

  const handleDateChange = (dateStr: string, isStart: boolean) => {
    const newDate = new Date(dateStr);
    
    // Validate the new date
    if (isNaN(newDate.getTime())) {
      console.warn('Invalid date string provided:', dateStr);
      return;
    }
    
    if (isStart) {
      setStartDate(newDate);
      // Ensure end date is not before start date
      if (newDate > endDate) {
        setEndDate(newDate);
      }
    } else {
      setEndDate(newDate);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">
            {editTask ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-700 rounded transition-colors text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Task Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Task Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter task title..."
              required
              autoFocus
            />
          </div>

          {/* Assignee */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <User className="w-4 h-4 inline mr-1" />
              Assignee
            </label>
            <input
              type="text"
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Assign to..."
            />
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Start Date
              </label>
              <input
                type="date"
                value={formatDate(startDate)}
                onChange={(e) => handleDateChange(e.target.value, true)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={formatDate(endDate)}
                onChange={(e) => handleDateChange(e.target.value, false)}
                min={formatDate(startDate)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Color Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Palette className="w-4 h-4 inline mr-1" />
              Color
            </label>
            <div className="flex flex-wrap gap-2">
              {TASK_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    selectedColor === color 
                      ? 'border-white ring-2 ring-blue-500' 
                      : 'border-gray-600 hover:border-gray-400'
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-600 text-gray-300 rounded-md hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            >
              {editTask ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;