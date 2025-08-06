"use client";

import { useState, useMemo, useCallback } from "react";
import { useTasksContext } from "@/contexts";

// Re-export types from context for backward compatibility
export type { Task, AssignedTask, Goal } from "@/contexts";

// Hook Configuration Interface
interface UseTasksConfig {
  initialLimit?: number;
  filterByStatus?: import("@/contexts").Task['status'][];
  filterByPriority?: import("@/contexts").Task['priority'][];
  sortBy?: 'dueDate' | 'priority' | 'createdAt' | 'updatedAt' | 'title' | 'dueDateISO';
  sortOrder?: 'asc' | 'desc';
  userId?: string;
}

// Professional Tasks Hook - Using Global Context
export const useTasks = (config: UseTasksConfig = {}) => {
  const {
    initialLimit = 4,
    filterByStatus = ['pending', 'in-progress'],
    filterByPriority = ['low', 'medium', 'high', 'urgent'],
    sortBy = 'dueDateISO',
    sortOrder = 'asc',
    userId = 'current-user'
  } = config;

  // Get data from global context
  const {
    tasks: allTasks,
    assignedTasks: allAssignedTasks,
    goals: allGoals,
    isLoading,
    taskStates,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskComplete,
    assignTask,
    updateAssignedTask,
    addGoal,
    updateGoal,
    updateGoalProgress,
    taskStats,
    goalStats
  } = useTasksContext();

  // Local state for UI functionality
  const [showAllTasks, setShowAllTasks] = useState(false);
  const [activeTab, setActiveTab] = useState("upcoming");

  // Helper function to check if task is overdue
  const isOverdue = (task: import("@/contexts").Task): boolean => {
    if (!task.dueDateISO || task.completed || task.status === 'completed') return false;
    return task.dueDateISO < new Date();
  };

  // Computed Values with Filtering and Sorting
  const filteredTasks = useMemo(() => {
    let tasksToFilter = allTasks;

    // Debug logging with caller identification
    if (process.env.NODE_ENV === 'development') {
      const caller = new Error().stack?.split('\n')[2]?.trim() || 'unknown';
      console.log(`🔍 useTasks Debug [${activeTab}]:`, {
        caller: caller.includes('MyTasksCardRefactored') ? 'MyTasksCard' :
                caller.includes('GoalsCardRefactored') ? 'GoalsCard' :
                caller.includes('TasksAssignedCardRefactored') ? 'TasksAssignedCard' : 'Unknown',
        activeTab,
        allTasksCount: allTasks.length,
        completedTasks: allTasks.filter(t => t.completed || t.status === 'completed'),
      });
    }

    // Filter by activeTab first
    if (activeTab === 'completed') {
      tasksToFilter = allTasks.filter(task => task.completed || task.status === 'completed');
      console.log('✅ Completed tasks filtered:', tasksToFilter.length);
      console.log('🔍 Completed tasks raw data:', tasksToFilter.map(t => ({ id: t.id, title: t.title, completed: t.completed, status: t.status })));
    } else if (activeTab === 'overdue') {
      tasksToFilter = allTasks.filter(task => isOverdue(task));
    } else { // upcoming
      tasksToFilter = allTasks.filter(task => 
        !task.completed && 
        task.status !== 'completed' && 
        !isOverdue(task)
      );
    }

    // Apply additional filters only for non-tab-specific filtering
    // Skip status filtering when activeTab already handles status-based filtering
    const shouldApplyStatusFilter = activeTab === 'upcoming';
    
    return tasksToFilter
      .filter(task => {
        // Always apply priority filter
        const priorityMatch = filterByPriority.includes(task.priority);
        
        // Apply status filter only for upcoming tab
        const statusMatch = shouldApplyStatusFilter 
          ? filterByStatus.includes(task.status)
          : true;

        console.log(`🔍 Task ${task.id} (${task.title}):`, {
          priority: task.priority,
          priorityMatch,
          status: task.status,
          statusMatch,
          shouldApplyStatusFilter,
          finalMatch: priorityMatch && statusMatch
        });
          
        return priorityMatch && statusMatch;
      })
      .sort((a, b) => {
        const aValue = a[sortBy];
        const bValue = b[sortBy];
        
        if (sortBy === 'title') {
          return sortOrder === 'asc' 
            ? (aValue as string).localeCompare(bValue as string)
            : (bValue as string).localeCompare(aValue as string);
        }
        
        if (sortBy === 'priority') {
          const priorityOrder = { 'urgent': 4, 'high': 3, 'medium': 2, 'low': 1 };
          const aVal = priorityOrder[aValue as import("@/contexts").Task['priority']];
          const bVal = priorityOrder[bValue as import("@/contexts").Task['priority']];
          return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
        }
        
        // Date sorting
        const aDate = new Date(aValue as Date).getTime();
        const bDate = new Date(bValue as Date).getTime();
        return sortOrder === 'asc' ? aDate - bDate : bDate - aDate;
      });
  }, [allTasks, filterByStatus, filterByPriority, sortBy, sortOrder, activeTab]);

  const myTasks = useMemo(() => {
    // Add null safety check
    if (!filteredTasks || !Array.isArray(filteredTasks)) {
      console.log('⚠️ myTasks: filteredTasks is not array:', filteredTasks);
      return [];
    }
    
    console.log('🔄 myTasks computed:', filteredTasks.length, 'tasks');
    console.log('🔍 myTasks filteredTasks data:', filteredTasks.map(t => ({ id: t.id, title: t.title, completed: t.completed, status: t.status })));
    return filteredTasks; // In real app, filter by userId
  }, [filteredTasks]);

  const displayedTasks = useMemo(() => {
    // Add null safety check
    if (!myTasks || !Array.isArray(myTasks)) {
      console.log('⚠️ displayedTasks: myTasks is not array:', myTasks);
      return [];
    }
    
    const result = showAllTasks ? myTasks : myTasks.slice(0, initialLimit);
    console.log('📊 displayedTasks computed:', result.length, 'tasks for activeTab:', activeTab);
    return result;
  }, [myTasks, showAllTasks, initialLimit, activeTab]);

  const displayedAssignedTasks = useMemo(() => {
    return allAssignedTasks; // Could add pagination here too
  }, [allAssignedTasks]);

  const hasMoreTasks = useMemo(() => {
    return myTasks.length > initialLimit;
  }, [myTasks.length, initialLimit]);

  // Actions
  const toggleShowAll = useCallback(() => {
    setShowAllTasks(prev => !prev);
  }, []);

  const setActiveTabCallback = useCallback((tab: string) => {
    console.log('📝 useTasks setActiveTab called with:', tab);
    setActiveTab(tab);
    console.log('✅ useTasks activeTab state updated to:', tab);
  }, []);

  return {
    // Data
    tasks: filteredTasks,
    assignedTasks: allAssignedTasks,
    goals: allGoals,
    
    // Filtered Data
    myTasks,
    displayedTasks,
    displayedAssignedTasks,
    
    // State
    showAllTasks,
    activeTab,
    isLoading,
    hasMoreTasks,
    taskStates,
    
    // Actions
    toggleShowAll,
    setActiveTab: setActiveTabCallback,
    toggleTaskComplete,
    addTask,
    updateTask,
    deleteTask,
    assignTask,
    updateAssignedTask,
    
    // Goal Actions
    addGoal,
    updateGoal,
    updateGoalProgress,
    
    // Computed
    taskStats,
    goalStats,
  };
};