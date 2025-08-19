"use client";

import React, { useState } from 'react';
import { TaskListItem, TaskStatus, TaskPriority } from '@/components/TaskList/types';
import { DARK_THEME } from '@/constants/theme';
import TaskDetailHeader from './TaskDetailHeader';
import TaskDetailContent from './TaskDetailContent';
import TaskDetailFooter from './TaskDetailFooter';


interface TaskDetailPanelProps {
  task: TaskListItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (taskId: string, updates: Partial<TaskListItem>) => void;
  onDelete?: (taskId: string) => void;
  onStatusChange?: (taskId: string, status: string) => void;
}

const TaskDetailPanel = ({
  task,
  isOpen,
  onClose,
  onSave,
  onDelete,
  onStatusChange
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

  const handleMarkComplete = () => {
    console.log('🔄 TaskDetailPanel handleMarkComplete:', {
      task: task ? { id: task.id, status: task.status } : null,
      onStatusChange: !!onStatusChange
    });
    
    if (task && onStatusChange) {
      // Handle both "completed"/"done" and "todo" status values
      const isCurrentlyCompleted = task.status === 'done' || task.status === 'completed' || task.completed;
      const newStatus: TaskStatus = isCurrentlyCompleted ? 'todo' : 'completed';
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
      />
      
      <TaskDetailContent
        task={task}
        title={title}
        setTitle={setTitle}
        description={description}
        setDescription={setDescription}
        onSave={handleSave}
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