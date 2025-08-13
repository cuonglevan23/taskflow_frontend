"use client";

import React from "react";
import { TaskDetailPanel } from "@/components/TaskDetailPanel";
import { KanbanBoard } from "@/components/features/KanbanBoard";
import { useMyTasksShared } from "@/hooks/tasks/useMyTasksShared";

interface MyTaskBoardPageProps {
  searchValue?: string;
}

const MyTaskBoardPage = ({ searchValue = "" }: MyTaskBoardPageProps) => {
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

  // Task management object for compatibility
  const taskManagement = {
    tasks: taskListItems,
    isLoading,
    error: error?.message || null,
    updateTask: actions.onTaskEdit,
    deleteTask: actions.onTaskDelete,
    tasksByAssignmentDate: {},
    selectedTask: null,
    isPanelOpen: false,
    closeTaskPanel: () => {},
  };

  // Task detail panel logic
  const handleTaskSave = (taskId: string, updates: Partial<TaskListItem>) => {
    const task = taskManagement.tasks.find(t => t.id === taskId);
    if (task) {
      actions.onTaskEdit({ ...task, ...updates });
    }
  };

  const handleTaskDelete = (taskId: string) => {
    actions.onTaskDelete(taskId);
  };

  return (
    <>
      <div className="h-full overflow-hidden">
        <KanbanBoard
          searchValue={searchValue}
          tasks={taskManagement.tasks}
          tasksByAssignmentDate={taskManagement.tasksByAssignmentDate}
          actions={actions}
          onTaskMove={(taskId, sectionId) => {
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
            
            actions.onTaskEdit({ ...taskManagement.tasks.find(t => t.id === taskId)!, ...updates });
          }}
          loading={taskManagement.isLoading}
          error={taskManagement.error}
        />
      </div>

      {/* Task Detail Panel */}
      <TaskDetailPanel
        task={taskManagement.selectedTask}
        isOpen={taskManagement.isPanelOpen}
        onClose={taskManagement.closeTaskPanel}
        onSave={handleTaskSave}
        onDelete={handleTaskDelete}
      />
    </>
  );
};

export default MyTaskBoardPage;