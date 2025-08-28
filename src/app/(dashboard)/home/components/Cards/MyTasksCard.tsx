"use client";

import React from "react";
import { useTheme } from "@/layouts/hooks/useTheme";
import { useUser } from "@/contexts/UserContext";
import BaseCard, { type TabConfig, type ActionButtonConfig } from "@/components/ui/BaseCard";
import UserAvatar from "@/components/ui/UserAvatar/UserAvatar";
import { FaPlus } from "react-icons/fa";
import { BsCircle, BsCheckCircle } from "react-icons/bs";
import { useTasksContext, type Task } from "@/contexts";
import { CreateTaskDTO } from "@/types/task";
import { useMyTasksSummary } from "@/hooks/tasks";
import { useCreateTask, useUpdateTask } from "@/hooks/tasks/useTasksActions";

// Professional MyTasksCard using BaseCard & useTasks Hook - Senior Product Code
const MyTasksCard = () => {
  const { theme } = useTheme();
  const { user } = useUser();

  // Get UI state from context
  const { optimisticTaskStates, setOptimisticTaskState, clearOptimisticTaskState } = useTasksContext();
  
  // SWR mutation hooks - move before early returns
  const { createTask } = useCreateTask();
  const { updateTask } = useUpdateTask();
  
  // Local state for UI management
  const [activeTab, setActiveTab] = React.useState<string>("upcoming");
  const [showAllTasks, setShowAllTasks] = React.useState(false);
  
  // Use correct API for user's personal tasks - with error handling
  const { tasks, isLoading, error } = useMyTasksSummary({
    page: 0,
    size: 1000,
    sortBy: 'startDate',
    sortDir: 'desc'
  });
  
  // Computed values - memoize to avoid re-rendering
  const displayedTasks = React.useMemo(() => {
    if (!tasks || !Array.isArray(tasks)) return [];

    let filteredTasks = tasks;

    // Helper function to check if task is completed
    const isTaskCompleted = (task: Task) => {
      const optimisticState = optimisticTaskStates[task.id.toString()];
      const actualCompleted = task.completed || task.status === 'completed' || task.status === 'DONE';
      return optimisticState !== undefined ? optimisticState : actualCompleted;
    };

    // Filter by active tab
    if (activeTab === "completed") {
      filteredTasks = tasks.filter(task => isTaskCompleted(task));
    } else if (activeTab === "overdue") {
      filteredTasks = tasks.filter(task => {
        const isOverdue = task.dueDateISO && task.dueDateISO < new Date() && !isTaskCompleted(task);
        return isOverdue;
      });
    } else {
      // upcoming - show all non-completed tasks
      filteredTasks = tasks.filter(task => !isTaskCompleted(task));
    }

    // Limit display if not showing all
    return showAllTasks ? filteredTasks : filteredTasks.slice(0, 4);
  }, [tasks, activeTab, showAllTasks, optimisticTaskStates]);

  const taskStats = React.useMemo(() => {
    if (!tasks || !Array.isArray(tasks)) return { completed: 0, overdue: 0, total: 0 };

    const completed = tasks.filter(task => {
      const optimisticState = optimisticTaskStates[task.id.toString()];
      const actualCompleted = task.completed || task.status === 'completed' || task.status === 'DONE';
      const finalCompleted = optimisticState !== undefined ? optimisticState : actualCompleted;
      
      return finalCompleted;
    }).length;
    
    const overdue = tasks.filter(task => {
      const optimisticState = optimisticTaskStates[task.id.toString()];
      const actualCompleted = task.completed || task.status === 'completed' || task.status === 'DONE';
      const isCompleted = optimisticState !== undefined ? optimisticState : actualCompleted;
      return task.dueDateISO && task.dueDateISO < new Date() && !isCompleted;
    }).length;

    return { completed, overdue, total: tasks.length };
  }, [tasks, optimisticTaskStates]);

  const hasMoreTasks = React.useMemo(() => {
    if (!tasks || !Array.isArray(tasks)) return false;

    let filteredCount = 0;
    if (activeTab === "completed") {
      filteredCount = tasks.filter(task => {
        const optimisticState = optimisticTaskStates[task.id.toString()];
        const actualCompleted = task.completed || task.status === 'completed' || task.status === 'DONE';
        return optimisticState !== undefined ? optimisticState : actualCompleted;
      }).length;
    } else if (activeTab === "overdue") {
      filteredCount = tasks.filter(task => {
        const optimisticState = optimisticTaskStates[task.id.toString()];
        const actualCompleted = task.completed || task.status === 'completed' || task.status === 'DONE';
        const isCompleted = optimisticState !== undefined ? optimisticState : actualCompleted;
        return task.dueDateISO && task.dueDateISO < new Date() && !isCompleted;
      }).length;
    } else {
      filteredCount = tasks.filter(task => {
        const optimisticState = optimisticTaskStates[task.id.toString()];
        const actualCompleted = task.completed || task.status === 'completed' || task.status === 'DONE';
        const isCompleted = optimisticState !== undefined ? optimisticState : actualCompleted;
        return !isCompleted;
      }).length;
    }

    return filteredCount > 4;
  }, [tasks, activeTab, optimisticTaskStates]);
  
  // Simple local task grouping function (without backend dependency)
  const getTaskCountsByGroup = (tasks: Task[]) => {
    const groups = { todo: 0, in_progress: 0, completed: 0, other: 0, total: tasks.length };
    tasks.forEach(task => {
      if (task.completed || task.status === 'DONE' || task.status === 'completed') {
        groups.completed++;
      } else if (task.status === 'IN_PROGRESS' || task.status === 'in-progress' || 
                 task.status === 'TESTING' || task.status === 'REVIEW') {
        groups.in_progress++;
      } else if (task.status === 'TODO' || task.status === 'pending') {
        groups.todo++;
      } else {
        groups.other++;
      }
    });
    return groups;
  };
  
  // Calculate stats directly from tasks data to avoid 403 API errors
  const globalTaskStats = tasks && Array.isArray(tasks) ? {
    total: tasks.length,
    byStatus: getTaskCountsByGroup(tasks),
    overdue: tasks.filter(t => {
      // Calculate overdue from dueDateISO since isOverdue might not be available
      return t.dueDateISO && t.dueDateISO < new Date() && !t.completed && t.status !== 'completed';
    }).length,
    byPriority: {
      HIGH: tasks.filter(t => t.priority === 'HIGH').length,
      MEDIUM: tasks.filter(t => t.priority === 'MEDIUM').length,
      LOW: tasks.filter(t => t.priority === 'LOW').length
    }
  } : {
    total: 0,
    byStatus: { todo: 0, in_progress: 0, completed: 0, other: 0 },
    overdue: 0,
    byPriority: { HIGH: 0, MEDIUM: 0, LOW: 0 }
  };
  
  // Don't render if there's a 401 error to prevent infinite loops
  if (error && (error.status === 401 || error.message?.includes('401'))) {
    return null;
  }

  // Helper functions
  const toggleShowAll = () => setShowAllTasks(!showAllTasks);

  const toggleTaskComplete = async (taskId: string | number) => {
    const numericId = typeof taskId === 'string' ? parseInt(taskId) : taskId;
    const stringId = numericId.toString();

    // Get current state (optimistic or actual)
    const currentOptimistic = optimisticTaskStates[stringId];
    const task = tasks.find(t => t.id === numericId);
    const currentCompleted = currentOptimistic !== undefined ? currentOptimistic : (task?.completed || task?.status === 'completed' || task?.status === 'DONE');

    // Optimistic update using shared state
    setOptimisticTaskState(stringId, !currentCompleted);

    try {
      if (task) {
        const newCompleted = !currentCompleted;
        const backendStatus = newCompleted ? 'completed' : 'todo';
        
        await updateTask({
          id: task.id.toString(),
          data: {
            status: backendStatus
          }
        });
        
        // Clear optimistic state after successful API update
        clearOptimisticTaskState(stringId);
      }
    } catch (error) {
      // Revert optimistic update on error
      setOptimisticTaskState(stringId, currentCompleted);
      console.error('❌ Failed to update task status:', error);
    }
  };

  const handleAddTask = async (taskData: CreateTaskDTO) => {
    try {
      await createTask(taskData);
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  // Debug hook data (disabled to prevent spam)
  // console.log('🏠 MyTasksCardRefactored hook data:', {
  //   displayedTasksCount: displayedTasks?.length || 0,
  //   activeTab,
  //   taskStatsCompleted: globalTaskStats?.byStatus?.completed || 0,
  //   tasksTotal: tasks?.length || 0,
  //   isLoading,
  //   error
  // });

  // Business Logic
  const getDueDateColor = (task: Task): string => {
    // Check if task is overdue
    const isTaskOverdue = task.dueDateISO && task.dueDateISO < new Date() && !task.completed && task.status !== 'completed';

    if (isTaskOverdue) {
      return '#dc2626'; // Red for overdue
    }

    // Handle undefined, null, or non-string dueDate
    if (!task.dueDate || typeof task.dueDate !== 'string') {
      return theme.text.secondary;
    }

    const normalizedDate = task.dueDate.toLowerCase();
    return ['today', 'tomorrow', 'thursday'].includes(normalizedDate)
      ? '#10b981'
      : theme.text.secondary;
  };

  // Task Item Component
  const TaskItem = ({ task }: { task: Task }) => {
    // Check both completion mechanisms for proper synchronization
    const optimisticState = optimisticTaskStates[task.id.toString()];
    const actualCompleted = task.completed || task.status === 'completed' || task.status === 'DONE';
    const isCompleted = optimisticState !== undefined ? optimisticState : actualCompleted;

    return (
      <div
        className="group flex items-center py-3 cursor-pointer transition-colors duration-150 border-b"
        style={{ borderBottomColor: theme.border.default }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = theme.background.secondary;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        {/* Interactive Checkbox */}
        <button
          className="flex-shrink-0 mr-3 p-1 -m-1 transition-all duration-200 hover:scale-110"
          onClick={() => toggleTaskComplete(task.id)}
          aria-label={`Mark task "${task.title}" as ${isCompleted ? 'incomplete' : 'complete'}`}
        >
          {isCompleted ? (
            <BsCheckCircle className="w-4 h-4 text-green-500" />
          ) : (
            <BsCircle
              className="w-4 h-4 transition-colors duration-200"
              style={{ color: theme.text.secondary }}
            />
          )}
        </button>

        {/* Task Content */}
        <div className="flex-1 min-w-0 flex items-center justify-between">
          <span
            className={`text-sm mr-3 transition-all duration-200 ${
              isCompleted ? 'line-through opacity-60' : ''
            }`}
            style={{ color: theme.text.primary }}
          >
            {task.title}
          </span>

          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Avatar display for assignees */}
            {(task.assignees?.length > 0 || task.assignedEmails?.length > 0) && (
              <div className="flex items-center -space-x-1">
                {/* Show assignees */}
                {task.assignees?.slice(0, 2).map((assignee: {id: string; name: string; email?: string; avatar?: string}, index: number) => (
                  <UserAvatar
                    key={assignee.id || index}
                    name={assignee.name}
                    avatar={assignee.avatar}
                    email={assignee.email}
                    size="sm"
                    className="w-5 h-5 border border-white"
                  />
                ))}
                
                {/* Show assigned emails - filter out emails that already have user objects */}
                {(task.assignedEmails || [])
                  .filter((email: string) => 
                    !task.assignees?.some((assignee: {id: string; name: string; email?: string; avatar?: string}) => assignee.email === email)
                  )
                  .slice(0, 2)
                  .map((email: string) => (
                    <UserAvatar
                      key={email}
                      name={email}
                      size="sm"
                      className="w-5 h-5 border border-white"
                    />
                  ))}
                
                {/* Show count if more than 4 total (excluding duplicates) */}
                {(() => {
                  const uniqueEmailsCount = (task.assignedEmails || [])
                    .filter((email: string) => 
                      !task.assignees?.some((assignee: {id: string; name: string; email?: string; avatar?: string}) => assignee.email === email)
                    ).length;
                  const totalCount = (task.assignees?.length || 0) + uniqueEmailsCount;
                  return totalCount > 4 && (
                    <div className="w-5 h-5 bg-gray-500 rounded-full flex items-center justify-center text-xs text-white border border-white">
                      +{totalCount - 4}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Creator Info */}
            {task.creatorName && (
              <span 
                className="px-2 py-1 text-xs rounded-md font-medium bg-blue-100 text-blue-800"
              >
                By: {task.creatorName}
              </span>
            )}
            
            {/* Participation Type */}
            {task.participationType && (
              <span 
                className={`px-2 py-1 text-xs rounded-md font-medium ${
                  task.participationType === 'ASSIGNEE' 
                    ? 'bg-green-100 text-green-800' 
                    : task.participationType === 'TEAM_MEMBER'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-orange-100 text-orange-800'
                }`}
              >
                {task.participationType === 'ASSIGNEE' ? 'Assigned' : 
                 task.participationType === 'TEAM_MEMBER' ? 'Team' : 'Project'}
              </span>
            )}

            {/* Project Tag */}
            {task.hasTag && task.tagText && (
              <span
                className="px-2 py-1 text-xs rounded-md font-medium"
                style={{ backgroundColor: '#8b5cf6', color: '#ffffff' }}
              >
                {task.tagText}
              </span>
            )}

            {/* Completion Percentage */}
            {task.completionPercentage !== undefined && task.completionPercentage > 0 && (
              <span className="text-xs text-gray-500">
                {task.completionPercentage}%
              </span>
            )}

            {/* Due Date with overdue indicator */}
            <span
              className={`text-sm font-medium ${
                task.isOverdue ? 'text-red-600 font-bold' : 
                task.dueDateISO && task.dueDateISO < new Date() && !task.completed && task.status !== 'completed' 
                  ? 'font-semibold' 
                  : ''
              }`}
              style={{ color: task.isOverdue ? '#dc2626' : getDueDateColor(task) }}
            >
              {task.dueDate || 'No due date'}
              {task.isOverdue && ' (Overdue)'}
            </span>

            {/* Assignee Count */}
            {task.assigneeCount && task.assigneeCount > 1 && (
              <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                +{task.assigneeCount}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Business Logic using Hook
  const handleCreateTask = () => {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const userId = typeof user?.id === 'string' ? parseInt(user.id) : user?.id || 1;
    handleAddTask({
      title: "New task",
      startDate: today,
      priority: 'MEDIUM',
      status: 'TODO',
      creatorId: userId
    });
  };

  const handleMenuClick = () => {
    console.log("My tasks menu clicked - Stats:", taskStats);
  };

  // BaseCard Configuration
  const tabs: TabConfig[] = [
    { 
      key: "upcoming", 
      label: "Upcoming", 
      count: globalTaskStats ? globalTaskStats.byStatus.todo + globalTaskStats.byStatus.in_progress : null 
    },
    { 
      key: "overdue", 
      label: "Overdue", 
      count: globalTaskStats?.overdue || null 
    },
    { 
      key: "completed", 
      label: "Completed", 
      count: globalTaskStats?.byStatus?.completed || null 
    }
  ];

  const createAction: ActionButtonConfig = {
    icon: FaPlus,
    label: "Create task",
    onClick: handleCreateTask
  };

  const showMoreButton = {
    show: hasMoreTasks && !showAllTasks,
    onClick: toggleShowAll
  };

  // Debug tab changes
  const handleTabChange = (tabKey: string) => {

    setActiveTab(tabKey);

  };

  return (
    <BaseCard
      title="My tasks"
      avatar={<UserAvatar user={user} size="sm" />}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={handleTabChange}
      createAction={createAction}
      showMoreButton={showMoreButton}
      onMenuClick={handleMenuClick}
      fullHeight={true}
    >
      <div className={`space-y-0 h-full flex flex-col ${showAllTasks ? 'overflow-hidden' : ''}`}>
        {/* Loading state */}
        {isLoading && (
          <div className="flex-1 flex items-center justify-center min-h-[200px]">
            <span className="text-sm" style={{ color: theme.text.secondary }}>
              Loading...
            </span>
          </div>
        )}
        
        {/* Error state */}
        {!isLoading && error && (
          <div className="flex-1 flex items-center justify-center min-h-[200px]">
            <span className="text-sm text-red-500">
              Error: {error?.message || String(error)}
            </span>
          </div>
        )}
        
        {/* Tasks display - Scrollable when expanded */}
        {!isLoading && !error && displayedTasks && displayedTasks.length > 0 && (
          <div className={`flex-1 ${showAllTasks ? 'overflow-y-auto space-y-0' : 'space-y-0'}`}>
            {displayedTasks.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))}
          </div>
        )}
        
        {/* No tasks found */}
        {!isLoading && !error && (!displayedTasks || displayedTasks.length === 0) && (
          <div className="flex-1 flex items-center justify-center min-h-[200px]">
            <span className="text-sm" style={{ color: theme.text.secondary }}>
              No tasks found
            </span>
          </div>
        )}
      </div>
    </BaseCard>
  );
};

export default MyTasksCard;