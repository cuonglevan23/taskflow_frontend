// Example: Proper SWR + Context usage pattern
"use client";

import React from 'react';
import { useTasks, useCreateTask, useUpdateTaskStatus } from '@/hooks/useTasks';
import { useTasksContext, useGlobalFilters } from '@/contexts/TasksContext';
import type { Task } from '@/types';

// Example component showing proper data flow architecture
export const TaskListExample: React.FC = () => {
  // ✅ CORRECT: Get UI state from Context
  const { selectedTaskId, setSelectedTaskId } = useTasksContext();
  const { globalFilters, globalSort } = useGlobalFilters();
  
  // ✅ CORRECT: Use SWR hooks directly for data fetching
  const { tasks, isLoading, error, revalidate } = useTasks({
    filter: globalFilters,
    sort: globalSort,
    page: 1,
    limit: 20
  });
  
  // ✅ CORRECT: Use SWR mutation hooks for data modification
  const { createTask, isCreating } = useCreateTask();
  const { updateTaskStatus, isUpdating } = useUpdateTaskStatus();

  // ✅ CORRECT: Event handlers using SWR mutations
  const handleCreateTask = async () => {
    try {
      await createTask({
        title: 'New Task',
        description: 'Task description',
        priority: 'medium',
        status: 'todo'
      });
      // SWR automatically revalidates cache
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      await updateTaskStatus({ id: taskId, status: newStatus });
      // SWR automatically updates cache
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

  const handleTaskClick = (task: Task) => {
    // ✅ CORRECT: Update UI state via Context
    setSelectedTaskId(task.id);
  };

  if (isLoading) return <div>Loading tasks...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="task-list">
      <div className="task-list-header">
        <h2>Tasks ({tasks.length})</h2>
        <button 
          onClick={handleCreateTask}
          disabled={isCreating}
          className="btn-primary"
        >
          {isCreating ? 'Creating...' : 'Create Task'}
        </button>
      </div>

      <div className="task-items">
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            isSelected={selectedTaskId === task.id}
            onTaskClick={handleTaskClick}
            onStatusChange={handleStatusChange}
            isUpdating={isUpdating}
          />
        ))}
      </div>
    </div>
  );
};

// Example: Component receiving data via Props (scope nhỏ)
interface TaskItemProps {
  task: Task;
  isSelected: boolean;
  onTaskClick: (task: Task) => void;
  onStatusChange: (taskId: string, status: string) => void;
  isUpdating: boolean;
}

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  isSelected,
  onTaskClick,
  onStatusChange,
  isUpdating
}) => {
  return (
    <div 
      className={`task-item ${isSelected ? 'selected' : ''}`}
      onClick={() => onTaskClick(task)}
    >
      <div className="task-content">
        <h3>{task.title}</h3>
        <p>{task.description}</p>
      </div>
      
      <div className="task-actions">
        <select
          value={task.status}
          onChange={(e) => onStatusChange(task.id, e.target.value)}
          disabled={isUpdating}
          onClick={(e) => e.stopPropagation()}
        >
          <option value="todo">Todo</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </select>
      </div>
    </div>
  );
};

// Example: Component with custom render prop
interface TaskListWithCustomRenderProps {
  filter?: any;
  renderTask?: (task: Task, actions: any) => React.ReactNode;
  onTaskClick?: (task: Task) => void;
}

export const TaskListWithCustomRender: React.FC<TaskListWithCustomRenderProps> = ({
  filter,
  renderTask,
  onTaskClick
}) => {
  // ✅ CORRECT: SWR hook for data
  const { tasks, isLoading } = useTasks({ filter });
  const { updateTaskStatus } = useUpdateTaskStatus();

  // ✅ CORRECT: Props for custom behavior
  const defaultRenderTask = (task: Task, actions: any) => (
    <div key={task.id} onClick={() => onTaskClick?.(task)}>
      <span>{task.title}</span>
      <button onClick={() => actions.updateStatus(task.id, 'done')}>
        Complete
      </button>
    </div>
  );

  const actions = {
    updateStatus: (id: string, status: string) => updateTaskStatus({ id, status })
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {tasks.map(task => 
        renderTask ? renderTask(task, actions) : defaultRenderTask(task, actions)
      )}
    </div>
  );
};

export default TaskListExample;