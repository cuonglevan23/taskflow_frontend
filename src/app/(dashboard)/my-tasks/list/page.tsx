"use client";

import React, { useState } from "react";
import { GroupedTaskList, TaskListItem } from "@/components/TaskList";
import { TaskDetailPanel } from "@/components/TaskDetailPanel";
import { useTasksContext } from "@/contexts";
import { useMyTasksShared } from "@/hooks/tasks/useMyTasksShared";

interface MyTaskListPageProps {
  searchValue?: string;
}

const MyTaskListPage = ({ searchValue = "" }: MyTaskListPageProps) => {
  // MUI DateRangePicker state
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  
  // Get UI state from context
  const { activeFilters } = useTasksContext();
  
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
    selectedTask: null,
    isPanelOpen: false,
    closeTaskPanel: () => {},
  };

  // MUI DateRangePicker handlers
  const handleCreateTaskWithDatePicker = () => {
    setIsDatePickerOpen(true);
  };

  const handleDateRangePickerSave = (data: {
    startDate: string | null;
    endDate: string | null;
  }) => {
    // Create task with proper backend mapping for startDate and deadline
    const taskData = {
      name: 'New Task',
      dueDate: data.endDate || data.startDate || new Date().toISOString().split('T')[0], // deadline field
      startDate: data.startDate || new Date().toISOString().split('T')[0], // startDate field (required)
      endDate: data.endDate || data.startDate || undefined,
      project: '',
      status: 'todo' as const
    };
    
    actions.onCreateTask(taskData);
  };

  // Handle loading and error states
  if (taskManagement.isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading tasks...</div>
      </div>
    );
  }

  if (taskManagement.error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">
          Error loading tasks: {taskManagement.error}
        </div>
      </div>
    );
  }

  // Task detail panel logic - Using unified management
  const handleTaskSave = (taskId: string, updates: Partial<TaskListItem>) => {
    // Handle task save from detail panel if needed
    console.log('Task save from detail panel:', taskId, updates);
  };

  const handleTaskDelete = (taskId: string) => {
    // Handle task delete from detail panel if needed
    console.log('Task delete from detail panel:', taskId);
  };

  // Note: GroupedTaskList manages its own search state and has enhanced inline editing

  return (
    <>
      <div className="h-full overflow-y-auto">
        <GroupedTaskList
          tasks={taskManagement.tasks}
          config={{
            showSearch: true,
            showFilters: true,
            showSort: true,
            enableGrouping: true,
            defaultGroupBy: 'assignmentDate', // Creates Asana-style sections
            showSelection: true,
          }}
          actions={{
            ...actions,
            onCreateTask: handleCreateTaskWithDatePicker, // MUI DateRangePicker
          }}
          loading={taskManagement.isLoading}
          error={taskManagement.error ?? undefined}
          hideHeader={true} // Use header from layout.tsx to avoid duplication
        />
      </div>

      {/* Task Detail Panel - Synchronized with Global Context */}
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
