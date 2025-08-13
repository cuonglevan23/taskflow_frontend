"use client";

import React, { useState } from "react";
import { useTheme } from "@/layouts/hooks/useTheme";
import { Calendar, X } from "lucide-react";

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskName: string) => void;
  columnTitle?: string;
}

const AddTaskModal = ({
  isOpen,
  onClose,
  onSave,
  columnTitle = "task"
}: AddTaskModalProps) => {
  const { theme } = useTheme();
  const [taskName, setTaskName] = useState("");

  const handleSave = () => {
    if (taskName.trim()) {
      onSave(taskName.trim());
      setTaskName("");
      onClose();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleClose = () => {
    setTaskName("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div 
        className="relative w-full max-w-md mx-4 rounded-xl border shadow-2xl"
        style={{ 
          backgroundColor: theme.background.primary,
          borderColor: theme.border.default
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: theme.border.default }}>
          <h3 className="text-lg font-semibold" style={{ color: theme.text.primary }}>
            Add task to {columnTitle}
          </h3>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" style={{ color: theme.text.secondary }} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Task Input */}
          <div 
            className="flex items-center gap-3 p-4 rounded-lg border-2 border-dashed mb-6"
            style={{ 
              backgroundColor: theme.background.secondary,
              borderColor: theme.border.default
            }}
          >
            <div className="flex-shrink-0">
              <div 
                className="w-5 h-5 rounded border-2"
                style={{ borderColor: theme.text.secondary }}
              />
            </div>
            
            <input
              type="text"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Write a task name"
              className="flex-1 bg-transparent border-none outline-none text-base"
              style={{ color: theme.text.primary }}
              autoFocus
            />
            
            <button
              className="flex-shrink-0 p-2 rounded-lg border-2 border-dashed hover:border-solid hover:bg-gray-50 transition-all"
              style={{ borderColor: theme.border.default }}
            >
              <Calendar 
                className="w-5 h-5" 
                style={{ color: theme.text.secondary }}
              />
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <button
              onClick={handleSave}
              disabled={!taskName.trim()}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: taskName.trim() ? theme.colors?.primary || '#3B82F6' : theme.background.secondary,
                color: taskName.trim() ? 'white' : theme.text.secondary
              }}
            >
              <span className="text-lg">+</span>
              Add task
            </button>
            
            <button
              onClick={handleClose}
              className="px-4 py-2 rounded-lg font-medium transition-colors hover:bg-gray-100"
              style={{ color: theme.text.secondary }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddTaskModal;