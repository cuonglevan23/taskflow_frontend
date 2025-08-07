import { useState } from "react";
import { TaskListItem } from "@/components/TaskList";
import { SAMPLE_TASKS } from "./sampleData";

/**
 * Custom hook for managing task state
 * Handles: tasks array, selected task, panel visibility
 */
export const useTaskState = () => {
  const [tasks, setTasks] = useState<TaskListItem[]>(SAMPLE_TASKS);
  const [selectedTask, setSelectedTask] = useState<TaskListItem | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  // Task selection and panel management
  const openTaskPanel = (task: TaskListItem) => {
    setSelectedTask(task);
    setIsPanelOpen(true);
  };

  const closeTaskPanel = () => {
    setIsPanelOpen(false);
    setSelectedTask(null);
  };

  // Task CRUD operations
  const addTask = (newTask: TaskListItem) => {
    setTasks(prevTasks => [...prevTasks, newTask]);
  };

  const updateTask = (taskId: string, updates: Partial<TaskListItem>) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId ? { ...task, ...updates } : task
      )
    );
    
    // Update selectedTask if it's the one being edited
    if (selectedTask?.id === taskId) {
      setSelectedTask({ ...selectedTask, ...updates });
    }
  };

  const deleteTask = (taskId: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
    
    // Close panel if deleted task was selected
    if (selectedTask?.id === taskId) {
      closeTaskPanel();
    }
  };

  const bulkUpdateTasks = (taskIds: string[], updates: Partial<TaskListItem>) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        taskIds.includes(task.id) ? { ...task, ...updates } : task
      )
    );
  };

  const bulkDeleteTasks = (taskIds: string[]) => {
    setTasks(prevTasks => prevTasks.filter(task => !taskIds.includes(task.id)));
    
    // Close panel if deleted task was selected
    if (selectedTask && taskIds.includes(selectedTask.id)) {
      closeTaskPanel();
    }
  };

  return {
    // State
    tasks,
    selectedTask,
    isPanelOpen,
    
    // Actions
    openTaskPanel,
    closeTaskPanel,
    addTask,
    updateTask,
    deleteTask,
    bulkUpdateTasks,
    bulkDeleteTasks,
    
    // Direct state setters (for advanced use cases)
    setTasks,
    setSelectedTask,
    setIsPanelOpen,
  };
};