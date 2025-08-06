"use client";

import React from 'react';
import { KanbanBoard } from '@/components/KanbanBoard';
import { TaskDetailPanel } from '@/components/TaskDetailPanel';
import { ProjectBoardProvider, useProjectBoard } from './context/ProjectBoardContext';
import { useProjectBoardActions } from './hooks/useProjectBoardActions';
import { useTheme } from '@/layouts/hooks/useTheme';

interface ProjectBoardPageProps {
  searchValue?: string;
}

function ProjectBoardContent({ searchValue = "" }: ProjectBoardPageProps) {
  const { theme } = useTheme();
  const {
    tasks,
    tasksByAssignmentDate,
    loading,
    error,
    selectedTask,
    isPanelOpen,
    closeTaskPanel,
    updateTask,
    deleteTask,
    moveTask,
    projectName
  } = useProjectBoard();
  
  const boardActions = useProjectBoardActions();

  const handleTaskSave = async (taskId: string, updates: Partial<any>) => {
    await updateTask(taskId, updates);
  };

  const handleTaskDelete = async (taskId: string) => {
    await deleteTask(taskId);
    closeTaskPanel();
  };

  const handleTaskMove = async (taskId: string, sectionId: string) => {
    await moveTask(taskId, sectionId);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 text-lg font-medium mb-2">
            {error}
          </div>
          <p className="text-gray-600">
            Please try refreshing the page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full relative" style={{ backgroundColor: theme.background.secondary }}>
      {/* Kanban Board */}
      <div className="h-full">
        <KanbanBoard
          tasks={tasks}
          tasksByAssignmentDate={tasksByAssignmentDate}
          actions={boardActions}
          onTaskMove={handleTaskMove}
          loading={loading}
          error={error}
          searchValue={searchValue}
          className="h-full"
        />
      </div>

      {/* Task Detail Panel */}
      <TaskDetailPanel
        task={selectedTask}
        isOpen={isPanelOpen}
        onClose={closeTaskPanel}
        onSave={handleTaskSave}
        onDelete={handleTaskDelete}
      />
    </div>
  );
}

export default function ProjectBoardPage({ searchValue }: ProjectBoardPageProps) {
  return (
    <ProjectBoardProvider>
      <ProjectBoardContent searchValue={searchValue} />
    </ProjectBoardProvider>
  );
}