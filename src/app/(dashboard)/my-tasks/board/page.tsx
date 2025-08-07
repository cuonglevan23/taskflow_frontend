"use client";

import React from "react";
import { TaskDetailPanel } from "@/components/TaskDetailPanel";
import { KanbanBoard } from "@/components/features/KanbanBoard";
import { useTaskActions } from "../hooks";
import { useTaskManagementContext } from "../context/TaskManagementContext";

interface MyTaskBoardPageProps {
  searchValue?: string;
}

const MyTaskBoardPage: React.FC<MyTaskBoardPageProps> = ({ searchValue = "" }) => {
  // Use shared task management context
  const taskManagement = useTaskManagementContext();
  
  // Initialize task actions with shared management
  const taskActions = useTaskActions({ 
    taskActions: taskManagement 
  });

  // Task detail panel logic
  const handleTaskSave = (taskId: string, updates: Partial<typeof SAMPLE_TASKS[0]>) => {
    taskManagement.updateTask(taskId, updates);
  };

  const handleTaskDelete = (taskId: string) => {
    taskManagement.deleteTask(taskId);
  };

  return (
    <>
      <div className="h-full overflow-hidden">
        <KanbanBoard
          searchValue={searchValue}
          tasks={taskManagement.tasks}
          tasksByAssignmentDate={taskManagement.tasksByAssignmentDate}
          actions={taskActions}
          onTaskMove={(taskId, sectionId) => {
            // Move task based on section, update due date accordingly
            const today = new Date();
            const nextWeek = new Date(today);
            nextWeek.setDate(today.getDate() + 7);
            const later = new Date(today);
            later.setDate(today.getDate() + 14);

            let updates: Partial<typeof taskManagement.tasks[0]> = {};
            
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
            
            taskManagement.updateTask(taskId, updates);
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