"use client";

import React from "react";
import { TaskList, TaskListItem, TaskStatus } from "@/components/TaskList";
import { TaskDetailPanel } from "@/components/TaskDetailPanel";
import { useTaskState, useTaskActions, useTaskDetailPanel } from "./hooks";

const MyTaskListPage: React.FC = () => {
  // Initialize task state management
  const {
    tasks,
    selectedTask,
    isPanelOpen,
    openTaskPanel,
    closeTaskPanel,
    addTask,
    updateTask,
    deleteTask,
    bulkUpdateTasks,
    bulkDeleteTasks,
  } = useTaskState();

  // Create task handler with enhanced calendar support
  const handleCreateTask = (taskData: string | { 
    name: string; 
    dueDate?: string; 
    startDate?: string;
    endDate?: string;
    startTime?: string;
    endTime?: string;
    hasStartTime?: boolean;
    hasEndTime?: boolean;
    project?: string; 
    status?: TaskStatus;
  } = "New task") => {
    // Handle both string and object formats for backward compatibility
    let taskName = "New task";
    let taskDueDate: string | undefined;
    let taskStartDate: string | undefined;
    let taskEndDate: string | undefined;
    let taskStartTime: string | undefined;
    let taskEndTime: string | undefined;
    let hasStartTime: boolean = false;
    let hasEndTime: boolean = false;
    let taskProject: string | undefined;
    let taskStatus: TaskStatus = "todo";

    if (typeof taskData === 'string') {
      taskName = taskData;
    } else {
      taskName = taskData.name;
      taskDueDate = taskData.dueDate;
      taskStartDate = taskData.startDate;
      taskEndDate = taskData.endDate;
      taskStartTime = taskData.startTime;
      taskEndTime = taskData.endTime;
      hasStartTime = taskData.hasStartTime || false;
      hasEndTime = taskData.hasEndTime || false;
      taskProject = taskData.project;
      taskStatus = taskData.status || "todo";
    }

    // Create a new task with enhanced calendar data
    const newTask: TaskListItem = {
      id: Date.now().toString(),
      name: taskName,
      description: "",
      assignees: [],
      dueDate: taskDueDate,
      startDate: taskStartDate,
      endDate: taskEndDate,
      startTime: taskStartTime,
      endTime: taskEndTime,
      hasStartTime,
      hasEndTime,
      priority: "medium",
      status: taskStatus,
      project: taskProject,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    addTask(newTask);
  };

  // Initialize task actions
  const taskActions = useTaskActions({
    onTaskClick: openTaskPanel,
    onCreateTask: handleCreateTask,
    onTaskUpdate: updateTask,
    onTaskDelete: deleteTask,
    onBulkUpdate: bulkUpdateTasks,
    onBulkDelete: bulkDeleteTasks,
  });

  // Initialize task detail panel logic
  const { panelProps } = useTaskDetailPanel({
    selectedTask,
    isPanelOpen,
    onClose: closeTaskPanel,
    onTaskUpdate: updateTask,
    onTaskDelete: deleteTask,
  });

  return (
    <>
      {/* Fixed height container to prevent page scroll */}
      <div className="h-[calc(100vh-140px)] overflow-y-auto">
        <TaskList
          tasks={tasks}
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
          loading={false}
          error={undefined}
        />
      </div>

      {/* Task Detail Panel */}
      <TaskDetailPanel {...panelProps} />
    </>
  );
};

export default MyTaskListPage;
