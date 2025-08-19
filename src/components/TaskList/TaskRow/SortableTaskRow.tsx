import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TaskRow } from './TaskRow';
import { TaskListItem } from '../types';

interface SortableTaskRowProps {
  task: TaskListItem;
  onTaskClick?: (task: TaskListItem) => void;
  onMoveTask?: (taskId: string, newBucket: string) => void;
  onTaskEdit?: (task: TaskListItem) => void;
  onTaskDelete?: (taskId: string) => void;
  onTaskStatusChange?: (taskId: string, status: string) => void;
  onTaskAssign?: (taskId: string, assigneeData: {
    id: string;
    name: string;
    email: string;
  }) => void;
}

export const SortableTaskRow = ({ 
  task, 
  onTaskClick, 
  onMoveTask,
  onTaskEdit,
  onTaskDelete,
  onTaskStatusChange,
  onTaskAssign
}: SortableTaskRowProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1000 : 'auto',
  };

  return (
    <div ref={setNodeRef} style={style} className="select-none">
      <TaskRow 
        task={task} 
        onTaskClick={onTaskClick} 
        onMoveTask={onMoveTask}
        onTaskEdit={onTaskEdit}
        onTaskDelete={onTaskDelete}
        onTaskStatusChange={onTaskStatusChange}
        onTaskAssign={onTaskAssign}
        isDragging={isDragging}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
};