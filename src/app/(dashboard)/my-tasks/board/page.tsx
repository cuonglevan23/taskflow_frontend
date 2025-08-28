"use client";

import React from "react";
import { TaskDetailPanel } from "@/components/TaskDetailPanel";
import { KanbanBoard } from "@/components/features/KanbanBoard";
import { useMyTasksShared } from "@/hooks/tasks/useMyTasksShared";
import { TaskListItem, TaskStatus } from "@/components/TaskList/types";

interface MyTaskBoardPageProps {
  searchValue?: string;
}

const MyTaskBoardPage = ({ searchValue = "" }: MyTaskBoardPageProps) => {
  // State for task detail panel
  const [selectedTask, setSelectedTask] = React.useState<TaskListItem | null>(null);
  const [isPanelOpen, setIsPanelOpen] = React.useState(false);

  // Use shared hook for all data and actions
  const {
    taskListItems,
    isLoading,
    error,
    actions
  } = useMyTasksShared({
    page: 0,
    size: 1000,
    sortBy: 'startDate',
    sortDir: 'desc',
    searchValue
  });

  // Calculate tasksByAssignmentDate from taskListItems
  const tasksByAssignmentDate = React.useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    // Filter tasks based on assignment date and due date
    const recentlyAssigned = taskListItems.filter(task => {
      const createdAt = new Date(task.createdAt);
      const daysDiff = (today.getTime() - createdAt.getTime()) / (1000 * 3600 * 24);
      return daysDiff <= 7; // Tasks created in last 7 days
    });

    const doToday = taskListItems.filter(task => {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate.getTime() === today.getTime();
    });

    const doNextWeek = taskListItems.filter(task => {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate > today && dueDate <= nextWeek;
    });

    const doLater = taskListItems.filter(task => {
      if (!task.dueDate) return true; // Tasks without due date go to "Do later"
      const dueDate = new Date(task.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate > nextWeek;
    });

    return {
      "recently-assigned": recentlyAssigned,
      "do-today": doToday,
      "do-next-week": doNextWeek,
      "do-later": doLater,
    };
  }, [taskListItems]);

  // Task click handlers
  const handleTaskClick = (task: TaskListItem) => {
    setSelectedTask(task);
    setIsPanelOpen(true);
  };

  const handleTaskComplete = async (task: TaskListItem) => {
    await actions.onTaskEdit({ ...task, completed: !task.completed });
  };

  const closeTaskPanel = () => {
    setIsPanelOpen(false);
    setSelectedTask(null);
  };

  // Enhanced actions with task panel handlers
  const enhancedActions = {
    ...actions,
    onTaskClick: handleTaskClick,
    onTaskComplete: handleTaskComplete,
  };

  // Task detail panel logic
  const handleTaskSave = (taskId: string, updates: Partial<TaskListItem>) => {
    const task = taskListItems.find(t => t.id === taskId);
    if (task) {
      actions.onTaskEdit({ ...task, ...updates });
    }
  };

  const handleTaskDelete = (taskId: string) => {
    actions.onTaskDelete(taskId);
    closeTaskPanel();
  };

  const handleTaskStatusChange = (taskId: string, status: string) => {
    const task = taskListItems.find(t => t.id === taskId);
    if (task) {
      const isCompleted = status === 'completed' || status === 'done' || status === 'DONE';
      actions.onTaskEdit({ 
        ...task, 
        status: status as TaskStatus,
        completed: isCompleted
      });
    }
  };

  return (
    <>
      <div className="h-full flex flex-col min-h-0">
        <KanbanBoard
          searchValue={searchValue}
          tasks={taskListItems}
          tasksByAssignmentDate={tasksByAssignmentDate}
          actions={enhancedActions}
          onTaskMove={(taskId: string, sectionId: string) => {
            // Move task based on section, update due date accordingly
            const today = new Date();
            const nextWeek = new Date(today);
            nextWeek.setDate(today.getDate() + 7);
            const later = new Date(today);
            later.setDate(today.getDate() + 14);

            let updates: Partial<TaskListItem> = {};
            
            switch (sectionId) {
              case 'do-today':
                updates.dueDate = today.toISOString().split('T')[0];
                break;
              case 'do-next-week':
                updates.dueDate = nextWeek.toISOString().split('T')[0];
                break;
              case 'do-later':
                updates.dueDate = later.toISOString().split('T')[0];
                break;
              case 'recently-assigned':
                updates.dueDate = undefined; // Remove due date
                break;
            }
            
            actions.onTaskEdit({ ...taskListItems.find((t: TaskListItem) => t.id === taskId)!, ...updates });
          }}
          loading={isLoading}
          error={error?.message || null}
        />
      </div>

      {/* Task Detail Panel */}
      <TaskDetailPanel
        task={selectedTask}
        isOpen={isPanelOpen}
        onClose={closeTaskPanel}
        onSave={handleTaskSave}
        onDelete={handleTaskDelete}
        onStatusChange={handleTaskStatusChange}
      />
    </>
  );
};

export default MyTaskBoardPage;