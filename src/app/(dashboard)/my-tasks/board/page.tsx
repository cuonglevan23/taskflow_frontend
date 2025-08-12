"use client";

import React from "react";
import { TaskDetailPanel } from "@/components/TaskDetailPanel";
import { KanbanBoard } from "@/components/features/KanbanBoard";
import { useTasksContext } from "@/contexts";
import { useMyTasksSummary } from "@/hooks/useTasks";

interface MyTaskBoardPageProps {
  searchValue?: string;
}

const MyTaskBoardPage: React.FC<MyTaskBoardPageProps> = ({ searchValue = "" }) => {
  // Use global hooks for data
  const { tasks, isLoading, error } = useMyTasksSummary({
    page: 0,
    size: 1000,
    sortBy: 'startDate',
    sortDir: 'desc'
  });

  // Transform tasks to TaskListItem format
  const taskListItems = React.useMemo(() => {
    if (!tasks || !Array.isArray(tasks)) return [];
    
    return tasks.map(task => ({
      id: task.id.toString(),
      name: task.title,
      dueDate: task.dueDate || 'No deadline',
      status: task.status === 'completed' ? 'done' : 
              task.status === 'in-progress' ? 'in_progress' : 'todo',
      priority: task.priority || 'medium',
    }));
  }, [tasks]);

  // Simple task management object
  const taskManagement = {
    tasks: taskListItems,
    isLoading,
    error: error?.message || null,
    updateTask: (taskId: string, updates: any) => {
      console.log('Update task:', taskId, updates);
    },
    deleteTask: (taskId: string) => {
      console.log('Delete task:', taskId);
    },
    tasksByAssignmentDate: {},
  };

  // Simple task actions
  const taskActions = {
    onTaskClick: (task: any) => console.log('Task clicked:', task),
    onCreateTask: (taskData: any) => console.log('Create task:', taskData),
  };

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