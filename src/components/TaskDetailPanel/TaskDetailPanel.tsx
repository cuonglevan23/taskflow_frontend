"use client";

import React, { useState } from 'react';
import { TaskListItem } from '@/components/TaskList/types';
import { DARK_THEME } from '@/constants/theme';
import TaskDetailHeader from './TaskDetailHeader';
import TaskDetailContent from './TaskDetailContent';
import TaskDetailFooter from './TaskDetailFooter';


interface TaskDetailPanelProps {
  task: TaskListItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (taskId: string, updates: Partial<TaskListItem>) => void;
  onSaveDescription?: (taskId: string, description: string) => void; // Separate callback for description
  onDelete?: (taskId: string) => void;
  onStatusChange?: (taskId: string, status: string) => void;
  onPriorityChange?: (taskId: string, priority: string) => void;
  onFileUpload?: (files: FileList, source: string) => void;
  onRemoveAttachment?: (attachmentId: string) => void;
}

const TaskDetailPanel = ({
  task,
  isOpen,
  onClose,
  onSave,
  onSaveDescription,
  onDelete, // Keep for future use
  onStatusChange,
  onPriorityChange,
  onFileUpload,
  onRemoveAttachment
}: TaskDetailPanelProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [comment, setComment] = useState('');


  React.useEffect(() => {
    if (task) {
      setTitle(task.name || '');
      setDescription(task.description || '');
    } else {
      setTitle('');
      setDescription('');
    }
  }, [task]);

  const handleSave = () => {
    if (onSave && task) {
      onSave(task.id, {
        name: title,
        description: description,
      });
    }
  };

  const handleSaveDescription = (newDescription: string) => {
    // Update local state immediately
    setDescription(newDescription);
    
    // Use dedicated description save callback if available
    if (onSaveDescription && task) {
      onSaveDescription(task.id, newDescription);
    }
    // Don't call general onSave to prevent closing the panel
  };

  const handleMarkComplete = () => {
    console.log('🔄 TaskDetailPanel handleMarkComplete:', {
      task: task ? { id: task.id, status: task.status } : null,
      onStatusChange: !!onStatusChange
    });
    
    if (task && onStatusChange) {
      // Helper function to check if task is completed
      const isCurrentlyCompleted = task.completed || 
                                   task.status === 'DONE' || 
                                   (task.status as string) === 'completed' ||
                                   (task.status as string) === 'done';
      const newStatus = isCurrentlyCompleted ? 'todo' : 'completed';
      console.log('📤 Calling onStatusChange:', { 
        taskId: task.id, 
        currentStatus: task.status, 
        isCurrentlyCompleted,
        newStatus 
      });
      onStatusChange(task.id, newStatus);
    } else {
      console.warn('❌ Cannot mark complete:', { hasTask: !!task, hasOnStatusChange: !!onStatusChange });
    }
  };

  const handleFileUpload = (files: FileList, source: string) => {
    if (onFileUpload && task) {
      console.log(`📎 Uploading ${files.length} files from ${source} for task ${task.id}`);
      onFileUpload(files, source);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className={`fixed top-12 right-0 w-[700px] h-[calc(100vh-4rem)] border-l shadow-2xl z-[55] transform transition-transform duration-300 ease-in-out flex flex-col ${
        isOpen ? 'translate-x-0' : 'translate-x-full' 
      }`}
      style={{
        backgroundColor: DARK_THEME.background.primary,
        borderColor: DARK_THEME.border.default
      }}
    >
      <TaskDetailHeader
        task={task}
        onClose={onClose}
        onMarkComplete={handleMarkComplete}
        onFileUpload={handleFileUpload}
      />
      
      <TaskDetailContent
        task={task}
        title={title}
        setTitle={setTitle}
        description={description}
        setDescription={setDescription}
        onSave={handleSave}
        onSaveDescription={handleSaveDescription}
        onTaskStatusChange={onStatusChange}
        onTaskPriorityChange={onPriorityChange}
        onRemoveAttachment={onRemoveAttachment}
      />

      <TaskDetailFooter
        task={task}
        comment={comment}
        setComment={setComment}
      />

    </div>
  );
};

export default TaskDetailPanel;