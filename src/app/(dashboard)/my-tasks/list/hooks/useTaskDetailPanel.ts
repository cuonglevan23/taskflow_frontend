import { TaskListItem } from "@/components/TaskList";

interface UseTaskDetailPanelProps {
  selectedTask: TaskListItem | null;
  isPanelOpen: boolean;
  onClose: () => void;
  onTaskUpdate: (taskId: string, updates: Partial<TaskListItem>) => void;
  onTaskDelete: (taskId: string) => void;
}

/**
 * Custom hook for managing task detail panel operations
 * Handles: panel state, task save/update, task delete operations
 */
export const useTaskDetailPanel = ({
  selectedTask,
  isPanelOpen,
  onClose,
  onTaskUpdate,
  onTaskDelete,
}: UseTaskDetailPanelProps) => {

  const handleTaskSave = (taskId: string, updates: Partial<TaskListItem>) => {
    // Add timestamp for when task was updated
    const updatesWithTimestamp = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    onTaskUpdate(taskId, updatesWithTimestamp);
    
    // Log for debugging (remove in production)
    console.log("Task saved:", taskId, updatesWithTimestamp);
  };

  const handleTaskDelete = (taskId: string) => {
    // Close panel first, then delete
    onClose();
    onTaskDelete(taskId);
    
    // Log for debugging (remove in production)
    console.log("Task deleted:", taskId);
  };

  const handlePanelClose = () => {
    onClose();
  };

  // Panel props that can be passed directly to TaskDetailPanel
  const panelProps = {
    task: selectedTask,
    isOpen: isPanelOpen,
    onClose: handlePanelClose,
    onSave: handleTaskSave,
    onDelete: handleTaskDelete,
  };

  return {
    // Handlers
    handleTaskSave,
    handleTaskDelete,
    handlePanelClose,
    
    // Pre-configured props for TaskDetailPanel
    panelProps,
    
    // State (for reference)
    selectedTask,
    isPanelOpen,
  };
};