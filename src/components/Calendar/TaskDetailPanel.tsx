"use client";

import React, { useState } from 'react';
import { X, Calendar, User, CheckCircle, Plus, MessageCircle, Paperclip, MoreHorizontal } from 'lucide-react';

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;

    const avatar = assignee 
      ? assignee.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
      : '';

    onSave({
      title: title.trim(),
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      color: editTask?.color || '#60A5FA',
      assignee: assignee.trim(),
      avatar
    });

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
          {/* Task visibility notice */}
          <div className="flex items-start gap-3 p-4 bg-gray-700/50 rounded-lg">
            <div className="w-5 h-5 bg-gray-600 rounded flex items-center justify-center mt-0.5">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            </div>
            <div className="text-sm text-gray-300">
              This task is visible to members of Cross-functional project plan.
            </div>
            <button className="text-blue-400 text-sm hover:underline ml-auto">
              Make public
            </button>
          </div>

          {/* Task Title */}
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-2xl font-bold bg-transparent text-white placeholder-gray-500 border-none outline-none resize-none"
              placeholder="Task name"
            />
          </div>

          {/* Assignee */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Assignee</label>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                {assignee ? assignee.split(' ').map(n => n[0]).join('').slice(0, 2) : 'LC'}
              </div>
              <input
                type="text"
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                className="flex-1 bg-transparent text-white placeholder-gray-500 border-none outline-none"
                placeholder="LÊ VĂN CƯỜNG"
              />
              <X className="w-4 h-4 text-gray-500 cursor-pointer" />
            </div>
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Due date</label>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-white">
                {formatDate(startDate)} - {formatDate(endDate)}
              </span>
              <X className="w-4 h-4 text-gray-500 cursor-pointer ml-auto" />
            </div>
          </div>

          {/* Projects */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Projects</label>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-white">Cross-functional project plan</span>
              <span className="text-gray-500">To do</span>
              <X className="w-4 h-4 text-gray-500 cursor-pointer ml-auto" />
            </div>
            <button className="text-blue-400 text-sm hover:underline">
              Add to projects
            </button>
          </div>

          {/* Dependencies */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Dependencies</label>
            <button className="text-blue-400 text-sm hover:underline">
              Add dependencies
            </button>
          </div>

          {/* Fields */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-300">Fields</label>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-600 rounded-full"></div>
                <span className="text-gray-300">Priority</span>
              </div>
              <span className="text-gray-500">—</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-600 rounded-full"></div>
                <span className="text-gray-300">Status</span>
              </div>
              <span className="text-gray-500">—</span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-300">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full h-24 bg-transparent text-white placeholder-gray-500 border-none outline-none resize-none"
              placeholder="What is this task about?"
            />
          </div>

          {/* Comments */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                LC
              </div>
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="flex-1 bg-gray-700 text-white placeholder-gray-400 px-3 py-2 rounded border-none outline-none"
                placeholder="Add a comment"
              />
            </div>
          </div>

          {/* Collaborators */}
          <div className="space-y-2 border-t border-gray-700 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-300">Collaborators</span>
              <button className="text-blue-400 text-sm hover:underline">
                Leave task
              </button>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                LC
              </div>
              <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center">
                <Plus className="w-3 h-3 text-gray-400" />
              </div>
              <Plus className="w-4 h-4 text-gray-500 cursor-pointer" />
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="sticky bottom-0 bg-gray-800 border-t border-gray-700 p-6">
          <button
            onClick={handleSubmit}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium transition-colors"
          >
            {editTask ? 'Save changes' : 'Create task'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailPanel;