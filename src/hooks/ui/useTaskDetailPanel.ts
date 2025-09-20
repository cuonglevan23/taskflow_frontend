// Custom hook for managing task detail panel state
import { useState, useCallback } from 'react';
import { TaskListItem } from '@/components/TaskList/types';

export const useTaskDetailPanel = () => {
  const [selectedTask, setSelectedTask] = useState<TaskListItem | null>(null);
  const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(false);

  const openDetailPanel = useCallback((task: TaskListItem) => {
    setSelectedTask(task);
    setIsDetailPanelOpen(true);
  }, []);

  const closeDetailPanel = useCallback(() => {
    setIsDetailPanelOpen(false);
    setSelectedTask(null);
  }, []);

  return {
    selectedTask,
    isDetailPanelOpen,
    openDetailPanel,
    closeDetailPanel,
  };
};
