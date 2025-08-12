"use client";

import React from "react";
import { useTheme } from "@/layouts/hooks/useTheme";
import { useAuth } from "@/hooks/use-auth";
import BaseCard, { type TabConfig, type ActionButtonConfig } from "@/components/ui/BaseCard";
import UserAvatar from "@/components/ui/UserAvatar/UserAvatar";
import { FaPlus } from "react-icons/fa";
import { BsCircle, BsCheckCircle } from "react-icons/bs";
import { useTasksContext, type Task } from "@/contexts";
import { useTasks, useTaskStats, useUpdateTask, useCreateTask, useMyTasksSummary, useMyTasksStats } from "@/hooks/useTasks";

// Professional MyTasksCard using BaseCard & useTasks Hook - Senior Product Code
const MyTasksCard = () => {
  const { theme } = useTheme();
  const { user } = useAuth();

  // Get UI state from context
  const { globalFilters, globalSort } = useTasksContext();
  
  // Use new My Tasks Summary API for better performance
  const { tasks, isLoading, error } = useMyTasksSummary({
    page: 0,
    size: 20,
    sortBy: 'priority',
    sortDir: 'desc'
  });
  
  // Use new My Tasks Stats API
  const { stats: myTasksStats } = useMyTasksStats();
  
  // Transform stats to match expected format - Use real data from API
  const globalTaskStats = myTasksStats && tasks ? {
    total: myTasksStats.totalParticipatingTasks,
    byStatus: {
      todo: tasks.filter(t => t.status === 'pending').length,
      in_progress: tasks.filter(t => t.status === 'in-progress').length, 
      completed: tasks.filter(t => t.status === 'completed').length
    },
    overdue: tasks.filter(t => t.isOverdue === true).length,
    byPriority: {
      high: tasks.filter(t => t.priority === 'high').length,
      medium: tasks.filter(t => t.priority === 'medium').length,
      low: tasks.filter(t => t.priority === 'low').length
    }
  } : {
    total: 0,
    byStatus: { todo: 0, in_progress: 0, completed: 0 },
    overdue: 0,
    byPriority: { high: 0, medium: 0, low: 0 }
  };
  
  // SWR mutation hooks
  const { updateTask } = useUpdateTask();
  const { createTask } = useCreateTask();

  // Local state for UI management
  const [activeTab, setActiveTab] = React.useState<string>("upcoming");
  const [showAllTasks, setShowAllTasks] = React.useState(false);
  const [taskStates, setTaskStates] = React.useState<Record<string, boolean>>({});

  // Computed values
  const displayedTasks = React.useMemo(() => {
    if (!tasks || !Array.isArray(tasks)) return [];

    let filteredTasks = tasks;

    // Filter by active tab
    if (activeTab === "completed") {
      filteredTasks = tasks.filter(task => task.completed || task.status === 'completed' || taskStates[task.id]);
    } else if (activeTab === "overdue") {
      filteredTasks = tasks.filter(task => {
        const isOverdue = task.dueDateISO && task.dueDateISO < new Date() && !task.completed && task.status !== 'completed' && !taskStates[task.id];
        return isOverdue;
      });
    } else {
      // upcoming
      filteredTasks = tasks.filter(task => !task.completed && task.status !== 'completed' && !taskStates[task.id]);
    }

    // Limit display if not showing all
    return showAllTasks ? filteredTasks : filteredTasks.slice(0, 4);
  }, [tasks, activeTab, showAllTasks, taskStates]);

  const taskStats = React.useMemo(() => {
    if (!tasks || !Array.isArray(tasks)) return { completed: 0, overdue: 0, total: 0 };

    const completed = tasks.filter(task => task.completed || task.status === 'completed' || taskStates[task.id]).length;
    const overdue = tasks.filter(task => {
      const isOverdue = task.dueDateISO && task.dueDateISO < new Date() && !task.completed && task.status !== 'completed' && !taskStates[task.id];
      return isOverdue;
    }).length;

    return { completed, overdue, total: tasks.length };
  }, [tasks, taskStates]);

  const hasMoreTasks = React.useMemo(() => {
    if (!tasks || !Array.isArray(tasks)) return false;

    let filteredCount = 0;
    if (activeTab === "completed") {
      filteredCount = tasks.filter(task => task.completed || task.status === 'completed' || taskStates[task.id]).length;
    } else if (activeTab === "overdue") {
      filteredCount = tasks.filter(task => {
        const isOverdue = task.dueDateISO && task.dueDateISO < new Date() && !task.completed && task.status !== 'completed' && !taskStates[task.id];
        return isOverdue;
      }).length;
    } else {
      filteredCount = tasks.filter(task => !task.completed && task.status !== 'completed' && !taskStates[task.id]).length;
    }

    return filteredCount > 4;
  }, [tasks, activeTab, taskStates]);

  // Helper functions
  const toggleShowAll = () => setShowAllTasks(!showAllTasks);

  const toggleTaskComplete = async (taskId: string | number) => {
    const numericId = typeof taskId === 'string' ? parseInt(taskId) : taskId;

    // Optimistic update
    setTaskStates(prev => ({ ...prev, [numericId]: !prev[numericId] }));

    try {
      const task = tasks.find(t => t.id === numericId);
      if (task) {
        const newCompleted = !task.completed;
        // Map to correct backend status format
        const backendStatus = newCompleted ? 'DONE' : 'TODO';
        await updateTask({
          id: task.id.toString(),
          data: {
            status: backendStatus  // Only send status, backend doesn't expect 'completed' field
          }
        });
      }
    } catch (error) {
      // Revert optimistic update on error
      setTaskStates(prev => ({ ...prev, [numericId]: !prev[numericId] }));
      console.error('Failed to update task status:', error);
    }
  };

  const handleAddTask = async (taskData: any) => {
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
    const isCompleted = taskStates[task.id] || task.completed || task.status === 'completed';

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
    handleAddTask({
      title: "New task",
      dueDate: "Today",
      completed: false,
      priority: 'medium',
      status: 'pending',
      hasTag: false
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
    >
      <div className="space-y-0">
        {error && (
          <div className="flex items-center justify-center py-4">
            <span className="text-sm text-red-500">
              Error: {error?.message || String(error)}
            </span>
          </div>
        )}
        {!error && displayedTasks && displayedTasks.length > 0 ? (
          displayedTasks.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))
        ) : !isLoading && !error ? (
          <div className="flex items-center justify-center py-4">
            <span className="text-sm" style={{ color: theme.text.secondary }}>
              No tasks found
            </span>
          </div>
        ) : null}
        {isLoading && (
          <div className="flex items-center justify-center py-4">
            <span className="text-sm" style={{ color: theme.text.secondary }}>
              Loading...
            </span>
          </div>
        )}
      </div>
    </BaseCard>
  );
};

export default MyTasksCard;