"use client";

import React from "react";
import { useTheme } from "@/layouts/hooks/useTheme";
import { useAuth } from "@/hooks/use-auth";
import BaseCard, { type TabConfig, type ActionButtonConfig } from "@/components/ui/BaseCard";
import UserAvatar from "@/components/ui/UserAvatar/UserAvatar";
import { FaPlus } from "react-icons/fa";
import { BsCircle, BsCheckCircle } from "react-icons/bs";
import { useTasks, type Task } from "@/hooks";

// Professional MyTasksCard using BaseCard & useTasks Hook - Senior Product Code
const MyTasksCard = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  
  // Use the custom hook for data management
  const hookData = useTasks({
    initialLimit: 4,
    sortBy: 'dueDateISO',
    sortOrder: 'asc'
  });

  const {
    displayedTasks,
    activeTab,
    setActiveTab,
    showAllTasks,
    hasMoreTasks,
    taskStates,
    toggleShowAll,
    toggleTaskComplete,
    addTask,
    taskStats,
    isLoading
  } = hookData;

  // Debug hook data
  console.log('🏠 MyTasksCardRefactored hook data:', {
    displayedTasksCount: displayedTasks.length,
    activeTab,
    taskStatsCompleted: taskStats.completed
  });

  // Business Logic
  const getDueDateColor = (task: Task): string => {
    // Check if task is overdue
    const isTaskOverdue = task.dueDateISO && task.dueDateISO < new Date() && !task.completed && task.status !== 'completed';
    
    if (isTaskOverdue) {
      return '#dc2626'; // Red for overdue
    }
    
    // Handle undefined or null dueDate
    if (!task.dueDate) {
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
            {/* Project Tag */}
            {task.hasTag && task.tagText && (
              <span 
                className="px-2 py-1 text-xs rounded-md font-medium"
                style={{ backgroundColor: '#8b5cf6', color: '#ffffff' }}
              >
                {task.tagText}
              </span>
            )}

            {/* Due Date */}
            <span 
              className={`text-sm font-medium ${
                task.dueDateISO && task.dueDateISO < new Date() && !task.completed && task.status !== 'completed' 
                  ? 'font-semibold' 
                  : ''
              }`}
              style={{ color: getDueDateColor(task) }}
            >
              {task.dueDate || 'No due date'}
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Business Logic using Hook
  const handleCreateTask = () => {
    addTask({
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
    { key: "upcoming", label: "Upcoming", count: null },
    { key: "overdue", label: "Overdue", count: taskStats.overdue || null },
    { key: "completed", label: "Completed", count: taskStats.completed || null }
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
        {displayedTasks.map((task) => (
          <TaskItem key={task.id} task={task} />
        ))}
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