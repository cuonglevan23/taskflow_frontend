"use client";

import React from 'react';
import { TaskList } from '@/components/TaskList';
import { TaskDetailPanel } from '@/components/TaskDetailPanel';
import { ProjectTasksProvider, useProjectTasks } from './context/ProjectTasksContext';
import { useProjectTaskActions } from './hooks/useProjectTaskActions';

import { useTheme } from '@/layouts/hooks/useTheme';

interface ProjectListPageProps {
  searchValue?: string;
}

function ProjectTaskListContent({ searchValue = "" }: ProjectListPageProps) {
  const { theme } = useTheme();
  const {
    tasks,
    loading,
    error,
    selectedTask,
    isPanelOpen,
    closeTaskPanel,
    updateTask,
    deleteTask,
    projectName
  } = useProjectTasks();
  
  const taskActions = useProjectTaskActions();

  const handleTaskSave = async (taskId: string, updates: Partial<any>) => {
    await updateTask(taskId, updates);
  };

  const handleTaskDelete = async (taskId: string) => {
    await deleteTask(taskId);
    closeTaskPanel();
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
      {/* Task List */}
      <div className="h-full">
        <TaskList
          tasks={tasks}
          actions={taskActions}
          loading={loading}
          config={{
            showSearch: true,
            showFilters: true,
            showGrouping: true,
            showBulkActions: true,
            showExport: true,
            defaultView: 'table',
            itemsPerPage: 50,
            enableDragDrop: false, // Disable for now, can enable later
            columns: [
              { key: 'name', label: 'Task', sortable: true, width: 'auto' },
              { key: 'status', label: 'Status', sortable: true, width: '120px' },
              { key: 'priority', label: 'Priority', sortable: true, width: '100px' },
              { key: 'assignees', label: 'Assignee', sortable: true, width: '140px' },
              { key: 'dueDate', label: 'Due Date', sortable: true, width: '120px' },
              { key: 'tags', label: 'Tags', sortable: false, width: '200px' },
              { key: 'actions', label: 'Actions', sortable: false, width: '80px' },
            ]
          }}
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

export default function ProjectListPage({ searchValue }: ProjectListPageProps) {
  return (
    <ProjectTasksProvider>
      <ProjectTaskListContent searchValue={searchValue} />
    </ProjectTasksProvider>
  );
}