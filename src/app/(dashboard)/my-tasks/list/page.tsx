"use client";

import React, { useMemo, useState } from "react";
import { TaskList, TaskListItem, TaskStatus } from "@/components/TaskList";
import { TaskDetailPanel } from "@/components/TaskDetailPanel";
import { useTaskActions } from "../hooks";
import { useTasksContext, type Task } from "@/contexts";

interface MyTaskListPageProps {
  searchValue?: string;
}

// Data transformation function - Senior Product Code
const transformTasksToTaskListItems = (tasks: Task[]): TaskListItem[] => {
  return tasks.map(task => ({
    id: task.id.toString(),
    name: task.title,
    description: task.description || "",
    assignees: task.assigneeId ? [
      { id: task.assigneeId, name: "Assigned User", email: "user@example.com" }
    ] : [],
    dueDate: task.dueDateISO?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
    startDate: task.dueDateISO?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
    endDate: task.dueDateISO?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
    startTime: "09:00",
    endTime: "17:00",
    hasStartTime: false,
    hasEndTime: false,
    priority: task.priority,
    status: task.status === 'completed' ? 'done' : 
            task.status === 'in-progress' ? 'in_progress' :
            task.status === 'pending' ? 'todo' : 'todo',
    tags: task.tags || [],
    project: task.hasTag && task.tagText ? task.tagText : "Default Project",
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  }));
};

const MyTaskListPage: React.FC<MyTaskListPageProps> = ({ searchValue = "" }) => {
  // Use global context for data synchronization with home cards
  const { tasks, updateTask, deleteTask, addTask } = useTasksContext();
  
  // State for task panel
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  
  // Transform tasks to TaskListItem format for compatibility
  const taskListItems = useMemo(() => transformTasksToTaskListItems(tasks), [tasks]);
  
  // Selected task for detail panel
  const selectedTask = useMemo(() => 
    taskListItems.find(task => task.id === selectedTaskId), 
    [taskListItems, selectedTaskId]
  );

  // Task management functions - Complete interface implementation
  const taskManagement = useMemo(() => ({
    tasks: taskListItems,
    selectedTask,
    isPanelOpen,
    isLoading: false,
    error: null,
    openTaskPanel: (taskIdOrTask: string | TaskListItem) => {
      const taskId = typeof taskIdOrTask === 'string' ? taskIdOrTask : taskIdOrTask.id;
      setSelectedTaskId(taskId);
      setIsPanelOpen(true);
    },
    closeTaskPanel: () => {
      setSelectedTaskId(null);
      setIsPanelOpen(false);
    },
    addTask: async (newTaskData: Omit<TaskListItem, 'id' | 'createdAt' | 'updatedAt'>) => {
      try {
        // Convert TaskListItem to Task format for global context
        const taskData = {
          title: newTaskData.name,
          description: newTaskData.description || "",
          dueDate: newTaskData.dueDate || "Today",
          dueDateISO: newTaskData.dueDate ? new Date(newTaskData.dueDate) : new Date(),
          completed: false,
          priority: (newTaskData.priority || 'medium') as Task['priority'],
          status: newTaskData.status === 'done' ? 'completed' :
                  newTaskData.status === 'in_progress' ? 'in-progress' : 'pending',
          hasTag: false,
          tags: newTaskData.tags || []
        };
        
        // FIX: Properly await the async addTask operation
        await addTask(taskData);
        console.log('✅ Task added successfully to global context');
      } catch (error) {
        console.error('❌ Failed to add task:', error);
        throw error;
      }
    },
    updateTask: async (taskId: string, updates: Partial<TaskListItem>) => {
      console.log('🔄 mytask/list updateTask called:', { taskId, updates });
      const numericId = parseInt(taskId);
      const newStatus = updates.status === 'done' ? 'completed' :
                       updates.status === 'in_progress' ? 'in-progress' :
                       updates.status === 'todo' ? 'pending' : 'pending';
      
      const updateData: Partial<Task> = {
        status: newStatus,
        completed: newStatus === 'completed'
      };
      
      // Only update fields that are actually provided (not undefined)
      if (updates.name !== undefined) {
        updateData.title = updates.name;
      }
      if (updates.description !== undefined) {
        updateData.description = updates.description;
      }
      if (updates.priority !== undefined) {
        updateData.priority = updates.priority as Task['priority'];
      }
      
      console.log('📝 Calling global updateTask with:', { numericId, updateData });
      await updateTask(numericId, updateData);
      console.log('✅ Global updateTask completed');
    },
    deleteTask: async (taskId: string) => {
      const numericId = parseInt(taskId);
      await deleteTask(numericId);
    },
    bulkUpdateTasks: async (taskIds: string[], updates: Partial<TaskListItem>) => {
      // Process bulk updates by calling updateTask for each task
      const promises = taskIds.map(async (taskId) => {
        const numericId = parseInt(taskId);
        const newStatus = updates.status === 'done' ? 'completed' :
                         updates.status === 'in_progress' ? 'in-progress' :
                         updates.status === 'todo' ? 'pending' : 'pending';
        
        const updateData: Partial<Task> = {
          status: newStatus,
          completed: newStatus === 'completed'
        };
        
        // Only update fields that are actually provided
        if (updates.name !== undefined) {
          updateData.title = updates.name;
        }
        if (updates.description !== undefined) {
          updateData.description = updates.description;
        }
        if (updates.priority !== undefined) {
          updateData.priority = updates.priority as Task['priority'];
        }
        
        await updateTask(numericId, updateData);
      });
      await Promise.all(promises);
    },
    bulkDeleteTasks: async (taskIds: string[]) => {
      // Process bulk deletions by calling deleteTask for each task
      const promises = taskIds.map(async (taskId) => {
        const numericId = parseInt(taskId);
        await deleteTask(numericId);
      });
      await Promise.all(promises);
    },
    setSelectedTask: (task: TaskListItem | null) => {
      setSelectedTaskId(task?.id || null);
    },
    moveTaskToStatus: async (taskId: string, newStatus: TaskStatus) => {
      console.log('🔄 moveTaskToStatus called:', { taskId, newStatus });
      const numericId = parseInt(taskId);
      const isCompleted = newStatus === 'done';
      const updateData = {
        status: newStatus === 'done' ? 'completed' :
                newStatus === 'in_progress' ? 'in-progress' : 'pending',
        completed: isCompleted
      };
      console.log('📝 moveTaskToStatus updateData:', updateData);
      await updateTask(numericId, updateData);
    },
    refreshTasks: async () => {
      // In this implementation, tasks are automatically refreshed via global context
      console.log('Tasks refreshed from global context');
    },
    setLoading: (loading: boolean) => {
      console.log('Loading state:', loading);
    },
    setError: (error: string | null) => {
      console.log('Error state:', error);
    }
  }), [taskListItems, selectedTask, isPanelOpen, updateTask, deleteTask, addTask]);

  // Initialize task actions with unified management
  const taskActions = useTaskActions({ 
    taskActions: taskManagement 
  });

  // Task detail panel logic - Using unified management
  const handleTaskSave = (taskId: string, updates: Partial<TaskListItem>) => {
    taskManagement.updateTask(taskId, updates);
  };

  const handleTaskDelete = (taskId: string) => {
    taskManagement.deleteTask(taskId);
  };

  // Note: searchValue prop not needed as TaskList manages its own search state

  return (
    <>
      <div className="h-full overflow-y-auto">
        <TaskList
          tasks={taskManagement.tasks}
          config={{
            showSearch: true,
            showFilters: true,
            showSort: true,
            enableGrouping: true,
            defaultGroupBy: 'assignmentDate',
            showSelection: true,
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
          error={taskManagement.error ?? undefined}
          hideHeader={true}
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
