"use client";

import React from "react";
import { TaskList, TaskListItem, TaskStatus } from "@/components/TaskList";
import { TaskDetailPanel } from "@/components/TaskDetailPanel";
import { useTaskActions } from "../hooks";
import { useTaskManagementContext } from "../context/TaskManagementContext";

interface MyTaskListPageProps {
  searchValue?: string;
}

const MyTaskListPage: React.FC<MyTaskListPageProps> = ({ searchValue = "" }) => {
  // Use shared task management context
  const taskManagement = useTaskManagementContext();

  // Initialize task actions with shared management
  const taskActions = useTaskActions({ 
    taskActions: taskManagement 
  });

  // Task detail panel logic
  const handleTaskSave = (taskId: string, updates: Partial<TaskListItem>) => {
    taskManagement.updateTask(taskId, updates);
  };

  const handleTaskDelete = (taskId: string) => {
    taskManagement.deleteTask(taskId);
  };

  // Update TaskList with search value from layout
  const taskListRef = React.useRef<any>(null);
  
  React.useEffect(() => {
    if (taskListRef.current && typeof taskListRef.current.setSearchValue === 'function') {
      taskListRef.current.setSearchValue(searchValue);
    }
  }, [searchValue]);

  return (
    <>
      <div className="h-full overflow-y-auto">
        <TaskList
          ref={taskListRef}
          tasks={taskManagement.tasks}
          config={{
            showSearch: true,
            showFilters: true,
            showSort: true,
            enableGrouping: true,
            defaultGroupBy: 'assignmentDate',
            showSelection: false,
            columns: [
              { key: 'name', label: 'Name', width: 'flex-1 min-w-[300px]', sortable: true },
              { key: 'dueDate', label: 'Due date', width: 'w-[120px]', sortable: true },
              { key: 'assignees', label: 'Collaborators', width: 'w-[150px]', sortable: false },
              { key: 'project', label: 'Projects', width: 'w-[150px]', sortable: true },
              { key: 'status', label: 'Task visibility', width: 'w-[140px]', sortable: true },
              { key: 'actions', label: '+', width: 'w-[50px]', sortable: false },
            ],
          }}
          actions={taskActions}
          loading={taskManagement.isLoading}
          error={taskManagement.error}
          hideHeader={true}
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

export default MyTaskListPage;
