"use client";

import React, { useMemo, useState } from "react";
import { GroupedTaskList, TaskListItem, TaskStatus } from "@/components/TaskList";
import { TaskDetailPanel } from "@/components/TaskDetailPanel";

import { useTasksContext, type Task } from "@/contexts";
import { useTasks, useUpdateTask, useDeleteTask, useCreateTask, useMyTasksSummary } from "@/hooks/useTasks";
import { CookieAuth } from '@/utils/cookieAuth';

interface MyTaskListPageProps {
  searchValue?: string;
}



const MyTaskListPage: React.FC<MyTaskListPageProps> = ({ searchValue = "" }) => {
  // MUI DateRangePicker state
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  
  // Get UI state from context
  const { activeFilters } = useTasksContext();
  
  // Use global SWR hooks for data
  const { tasks, isLoading, error } = useMyTasksSummary({
    page: 0,
    size: 1000,
    sortBy: 'startDate',
    sortDir: 'desc'
  });
  
  // SWR mutation hooks
  const { updateTask } = useUpdateTask();
  const { deleteTask } = useDeleteTask();
  const { createTask } = useCreateTask();
  
  // Transform tasks to TaskListItem format
  const taskListItems = useMemo(() => {
    if (!tasks || !Array.isArray(tasks)) return [];
    
    // Helper function to format dates consistently
    const formatDate = (date: Date | string | null | undefined) => {
      if (!date) return undefined;
      if (typeof date === 'string') return date;
      if (date instanceof Date) {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      }
      return undefined;
    };
    
    return tasks.map(task => ({
      id: task.id.toString(),
      name: task.title,
      description: task.description || '',
      assignees: task.creatorName ? [{
        id: 'creator',
        name: task.creatorName,
        email: '',
      }] : [],
      dueDate: task.dueDate && task.dueDate !== 'No deadline' ? task.dueDate : undefined,
      startDate: formatDate(task.startDate), // Use actual startDate from backend
      deadline: formatDate(task.endDate),    // Map endDate to deadline for backend compatibility
      startTime: '',
      endTime: '',
      hasStartTime: false,
      hasEndTime: false,
      priority: (task.priority as any) || 'medium',
      status: task.status === 'completed' ? 'done' : 
              task.status === 'in-progress' ? 'in_progress' : 'todo',
      tags: task.tags || [],
      project: task.tagText || 'Default Project',
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
    }));
  }, [tasks]);

  // Task management object
  const taskManagement = useMemo(() => ({
    tasks: taskListItems,
    isLoading,
    error: error?.message || null,
  }), [taskListItems, isLoading, error]);



  // Enhanced task actions for GroupedTaskList
  const taskActions = {
    onTaskClick: (task: TaskListItem) => {
      console.log('Task clicked:', task);
      // Could open task detail panel or navigate
    },
    
    onTaskEdit: async (task: TaskListItem) => {
      console.log('Task edited:', task);
      try {
        // Map to correct backend format với startDate và deadline
        const backendData = {
          title: task.name,
          description: task.description || '',
          status: task.status === 'done' ? 'COMPLETED' : 
                 task.status === 'in_progress' ? 'IN_PROGRESS' : 
                 task.status === 'review' ? 'REVIEW' : 'TODO',
          priority: task.priority === 'low' ? 'LOW' :
                   task.priority === 'medium' ? 'MEDIUM' :
                   task.priority === 'high' ? 'HIGH' : 'URGENT',
          startDate: task.startDate || new Date().toISOString().split('T')[0], // REQUIRED - start date
          deadline: task.deadline || task.dueDate || null, // Optional - deadline field (check both fields)
          groupId: null,
          projectId: null,
          assignedToIds: task.assignees.map(a => a.id).filter(id => !id.startsWith('temp-')),
        };
        
        await updateTask({ 
          id: task.id, 
          data: backendData
        });
      } catch (error) {
        console.error('Failed to update task:', error);
      }
    },
    
    onCreateTask: async (taskData: any) => {
      console.log('Creating task:', taskData);
      try {
        // Map to correct backend format với startDate và deadline
        const backendData = {
          title: taskData.name || 'New Task',
          description: taskData.description || '',
          status: taskData.status === 'done' ? 'COMPLETED' : 
                 taskData.status === 'in_progress' ? 'IN_PROGRESS' : 
                 taskData.status === 'review' ? 'REVIEW' : 'TODO',
          priority: taskData.priority === 'low' ? 'LOW' :
                   taskData.priority === 'medium' ? 'MEDIUM' :
                   taskData.priority === 'high' ? 'HIGH' : 'MEDIUM', // Default to MEDIUM
          startDate: taskData.startDate || new Date().toISOString().split('T')[0], // REQUIRED - start date
          deadline: taskData.dueDate || taskData.endDate || null, // Optional - due date/deadline
          groupId: taskData.groupId || null,
          projectId: taskData.projectId || null,
          creatorId: taskData.creatorId || null, // Will be set by backend from token
          assignedToIds: taskData.assignedToIds || [],
        };
        
        await createTask(backendData);
      } catch (error) {
        console.error('Failed to create task:', error);
      }
    },
    
    onTaskDelete: async (taskId: string) => {
      console.log('Deleting task:', taskId);
      try {
        await deleteTask(taskId);
      } catch (error) {
        console.error('Failed to delete task:', error);
      }
    },
    
    onTaskStatusChange: async (taskId: string, status: TaskStatus) => {
      console.log('Status change:', taskId, '→', status);
      try {
        // Map to correct backend status format
        const backendStatus = status === 'done' ? 'COMPLETED' : 
                            status === 'in_progress' ? 'IN_PROGRESS' : 
                            status === 'review' ? 'REVIEW' : 'TODO';
        
        await updateTask({ 
          id: taskId, 
          data: { 
            status: backendStatus,
            startDate: new Date().toISOString().split('T')[0], // REQUIRED - start date
            deadline: null // Keep existing deadline
          }
        });
      } catch (error) {
        console.error('Failed to update task status:', error);
      }
    },
    
    onTaskAssign: async (taskId: string, assigneeId: string) => {
      console.log('Assigning task:', taskId, 'to', assigneeId);
      try {
        // Map to correct backend format for assignment
        const backendData = {
          assignedToIds: [assigneeId], // Use proper assignedToIds array
          startDate: new Date().toISOString().split('T')[0] // Ensure startDate is always present
        };
        
        await updateTask({ 
          id: taskId, 
          data: backendData
        });
      } catch (error) {
        console.error('Failed to assign task:', error);
      }
    },
    
    onBulkAction: async (taskIds: string[], action: string) => {
      console.log('Bulk action:', action, 'on', taskIds.length, 'tasks');
      
      if (action === 'delete') {
        try {
          await Promise.all(taskIds.map(id => deleteTask(id)));
        } catch (error) {
          console.error('Failed to bulk delete tasks:', error);
        }
      } else if (action === 'complete') {
        try {
          await Promise.all(taskIds.map(id => 
            updateTask({ id, data: { status: 'completed' } })
          ));
        } catch (error) {
          console.error('Failed to bulk complete tasks:', error);
        }
      }
    }
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
    
    taskActions.onCreateTask(taskData);
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
            ...taskActions,
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
