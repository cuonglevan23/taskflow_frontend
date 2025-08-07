"use client";

import React from "react";
import { useTheme } from "@/layouts/hooks/useTheme";
import BaseCard, { type TabConfig, type ActionButtonConfig } from "@/components/ui/BaseCard";
import { FaPlus } from "react-icons/fa";
import { BsCircle, BsCheckCircle } from "react-icons/bs";
import { useTasksContext, type AssignedTask } from "@/contexts";

// Professional TasksAssignedCard using BaseCard & Direct Context - Senior Product Code
const TasksAssignedCard = () => {
  const { theme } = useTheme();
  
  // Use direct context to avoid activeTab conflicts with MyTasksCard
  const {
    assignedTasks,
    isLoading,
    taskStats,
    assignTask
  } = useTasksContext();

  // Local activeTab state for this component only
  const [activeTab, setActiveTab] = React.useState("upcoming");

  // Business Logic
  const getDueDateColor = (dueDate: string): string => {
    const normalizedDate = dueDate.toLowerCase();
    return ['today', 'tomorrow'].includes(normalizedDate) 
      ? '#10b981' 
      : theme.text.secondary;
  };

  // Assigned Task Item Component  
  const AssignedTaskItem = ({ task }: { task: AssignedTask }) => {
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
              className="text-sm font-medium"
              style={{ color: getDueDateColor(task.dueDate) }}
            >
              {task.dueDate}
            </span>

            {/* Assignee Avatar */}
            <div 
              className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: task.assignee.color }}
            >
              <span className="text-white text-xs">{task.assignee.avatar}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Business Logic using Direct Context
  const handleAssignTask = () => {
    console.log("Assign new task - Total assigned tasks:", assignedTasks.length);
    // Could integrate with a task assignment modal here
  };

  const handleMenuClick = () => {
    console.log("Tasks assigned menu clicked - Stats:", taskStats);
  };

  // BaseCard Configuration
  const tabs: TabConfig[] = [
    { key: "upcoming", label: "Upcoming", count: null },
    { key: "overdue", label: "Overdue", count: taskStats.overdue || null },
    { key: "completed", label: "Completed", count: taskStats.completed || null }
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
        {assignedTasks.map((task) => (
          <AssignedTaskItem key={task.id} task={task} />
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

export default TasksAssignedCard;