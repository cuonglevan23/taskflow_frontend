"use client";

import React, { useState, useCallback } from 'react';
import { ProjectTaskListLayout } from '@/components/TaskList/ProjectTaskList';
import ProjectTaskDetailPanel from '@/components/TaskDetailPanel/ProjectTaskDetailPanel';
import { useProjectTaskList } from '@/hooks/tasks/useProjectTaskList';
import { useTaskDetailPanel } from '@/hooks/ui/useTaskDetailPanel';

interface ProjectListPageProps {
  searchValue?: string;
}

function ProjectTaskListContent({ searchValue = "" }: ProjectListPageProps) {
  // Local state for search
  const [searchInput, setSearchInput] = useState(searchValue);

  // Use custom hooks for separated concerns
  const {
    taskListItems,
    loading,
    error,
    project,
    handleTaskCreate,
    handleTaskEdit,
    handleTaskDelete,
    handleTaskStatusChange,
    handleTaskMove,
    handleTaskAssign,
    handleBulkAction,
  } = useProjectTaskList();

  const {
    selectedTask,
    isDetailPanelOpen,
    openDetailPanel,
    closeDetailPanel,
  } = useTaskDetailPanel();

  // UI event handlers
  const handleTaskClick = useCallback((task: any) => {
    openDetailPanel(task);
  }, [openDetailPanel]);

  const handleSearchChange = useCallback((value: string) => {
    setSearchInput(value);
  }, []);

  // Error handling
  if (error && !error.includes('404')) {
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
    <div className="h-full flex flex-col">
      <ProjectTaskListLayout
        tasks={taskListItems}
        loading={loading}
        searchValue={searchInput}
        projectName={project?.name || 'Project'}
        projectId={project?.id?.toString()}

        // Event handlers
        onTaskClick={handleTaskClick}
        onTaskCreate={handleTaskCreate}
        onTaskEdit={handleTaskEdit}
        onTaskDelete={handleTaskDelete}
        onTaskStatusChange={handleTaskStatusChange}
        onTaskMove={handleTaskMove}
        onTaskAssign={handleTaskAssign}
        onBulkAction={handleBulkAction}
        onSearchChange={handleSearchChange}
      />

      {/* Task Detail Panel */}
      {isDetailPanelOpen && selectedTask && (
        <ProjectTaskDetailPanel
          task={selectedTask}
          isOpen={isDetailPanelOpen}
          onClose={closeDetailPanel}
        />
      )}
    </div>
  );
}

export default function ProjectTaskListPage({ searchValue }: ProjectListPageProps) {
  return <ProjectTaskListContent searchValue={searchValue} />;
}