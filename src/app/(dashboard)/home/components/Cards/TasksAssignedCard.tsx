"use client";

import React from "react";
import { useTheme } from "@/layouts/hooks/useTheme";
import BaseCard, { type TabConfig, type ActionButtonConfig } from "@/components/ui/BaseCard";
import { FaPlus } from "react-icons/fa";
import { BsCircle, BsCheckCircle } from "react-icons/bs";
import { useTasksContext, type Task } from "@/contexts";
import { useTasks, useTaskStats, useMyTasksSummary, useMyTasksStats } from "@/hooks/useTasks";

// Professional TasksAssignedCard using BaseCard & Direct Context - Senior Product Code
const TasksAssignedCard = () => {
  const { theme } = useTheme();
  
  // Use direct context to avoid activeTab conflicts with MyTasksCard
  // Get UI state from context
  const { globalFilters, globalSort } = useTasksContext();
  
  // Use new My Tasks Summary API - it already filters for participating tasks
  const { tasks, isLoading, error } = useMyTasksSummary({
    page: 0,
    size: 20,
    sortBy: 'updatedAt',
    sortDir: 'desc'
  });
  
  // Use new My Tasks Stats API
  const { stats: myTasksStats } = useMyTasksStats();
  
  // Transform stats for compatibility with real API data
  const taskStats = myTasksStats && tasks ? {
    total: myTasksStats.totalParticipatingTasks,
    overdue: tasks.filter(t => t.isOverdue === true).length,
    byStatus: {
      todo: tasks.filter(t => t.status === 'pending').length,
      in_progress: tasks.filter(t => t.status === 'in-progress').length,
      completed: tasks.filter(t => t.status === 'completed').length
    },
    byParticipationType: {
      assignee: tasks.filter(t => t.participationType === 'ASSIGNEE').length,
      team_member: tasks.filter(t => t.participationType === 'TEAM_MEMBER').length,
      project_member: tasks.filter(t => t.participationType === 'PROJECT_MEMBER').length
    }
  } : {
    total: 0,
    overdue: 0,
    byStatus: { todo: 0, in_progress: 0, completed: 0 },
    byParticipationType: { assignee: 0, team_member: 0, project_member: 0 }
  };

  // Local activeTab state for this component only
  const [activeTab, setActiveTab] = React.useState("upcoming");

  // Filter tasks based on active tab
  const filteredTasks = React.useMemo(() => {
    if (!tasks || !Array.isArray(tasks)) return [];
    
    switch (activeTab) {
      case "upcoming":
        return tasks.filter(task => !task.completed && task.status !== 'completed');
      case "overdue":
        return tasks.filter(task => {
          const isOverdue = task.dueDateISO && task.dueDateISO < new Date() && !task.completed && task.status !== 'completed';
          return isOverdue;
        });
      case "completed":
        return tasks.filter(task => task.completed || task.status === 'completed');
      default:
        return tasks;
    }
  }, [tasks, activeTab]);

  // Business Logic - Safe date handling
  const getDueDateColor = (dueDate?: string): string => {
    if (!dueDate || typeof dueDate !== 'string') {
      return theme.text.secondary;
    }
    
    const normalizedDate = dueDate.toLowerCase();
    return ['today', 'tomorrow'].includes(normalizedDate) 
      ? '#10b981' 
      : theme.text.secondary;
  };

  // Assigned Task Item Component  
  const AssignedTaskItem = ({ task }: { task: Task }) => {
    // Check both completion mechanisms for proper synchronization
    const isCompleted = task.completed || task.status === 'completed';
    
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
        {/* Task Checkbox */}
        <button 
          className="flex-shrink-0 mr-3 p-1 -m-1 transition-all duration-200 hover:scale-110"
          aria-label={`Mark task "${task.title}" as complete`}
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
            className={`text-sm mr-3 flex-1 truncate transition-all duration-200 ${
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
            
            {/* Participation Type Badge */}
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
                {task.participationType === 'ASSIGNEE' ? 'Direct' : 
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

            {/* Progress indicator */}
            {task.completionPercentage !== undefined && (
              <div className="flex items-center gap-1">
                <div className="w-12 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 transition-all duration-300"
                    style={{ width: `${task.completionPercentage}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500">{task.completionPercentage}%</span>
              </div>
            )}

            {/* Due Date with overdue styling */}
            <span 
              className={`text-sm font-medium ${task.isOverdue ? 'text-red-600 font-bold' : ''}`}
              style={{ color: task.isOverdue ? '#dc2626' : getDueDateColor(task.dueDate) }}
            >
              {task.dueDate}
              {task.isOverdue && ' ⚠️'}
            </span>

            {/* Team size indicator */}
            {task.assigneeCount && task.assigneeCount > 1 && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                👥 {task.assigneeCount}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Business Logic using Direct Context
  const handleAssignTask = () => {
    console.log("Assign new task - Total assigned tasks:", tasks?.length || 0);
    // Could integrate with a task assignment modal here
  };

  const handleMenuClick = () => {
    console.log("Tasks assigned menu clicked - Stats:", taskStats);
  };

  // BaseCard Configuration with real counts
  const tabs: TabConfig[] = [
    { 
      key: "upcoming", 
      label: "Upcoming", 
      count: taskStats ? taskStats.byStatus.todo + taskStats.byStatus.in_progress : null 
    },
    { 
      key: "overdue", 
      label: "Overdue", 
      count: taskStats?.overdue || null 
    },
    { 
      key: "completed", 
      label: "Completed", 
      count: taskStats?.byStatus?.completed || null 
    }
  ];

  const createAction: ActionButtonConfig = {
    icon: FaPlus,
    label: "Assign task",
    onClick: handleAssignTask
  };

  return (
    <BaseCard
      title="Tasks I've assigned"
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      createAction={createAction}
      onMenuClick={handleMenuClick}
    >
      <div className="space-y-0">
        {filteredTasks && filteredTasks.length > 0 ? filteredTasks.map((task) => (
          <AssignedTaskItem key={task.id} task={task} />
        )) : (
          <div className="text-gray-500 text-sm py-4">No assigned tasks found</div>
        )}
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

export default TasksAssignedCard;