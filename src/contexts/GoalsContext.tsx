"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo } from "react";
import { GoalListItem, GoalFilters, CreateGoalData, UpdateGoalData, GoalTab } from "@/types/goals";
import { getAllGoals } from "@/services/progressService";
import useSWR from 'swr';

// Key for SWR caching
const GOALS_CACHE_KEY = 'goals';

// Interface for the context value
interface GoalsContextValue {
  goals: GoalListItem[];
  loading: boolean;
  error: string | null;
  activeTab: GoalTab;
  filters: GoalFilters;
  
  // Actions
  setActiveTab: (tab: GoalTab) => void;
  fetchGoals: () => Promise<void>;
  createGoal: (data: CreateGoalData) => Promise<GoalListItem | null>;
  updateGoal: (data: UpdateGoalData) => Promise<GoalListItem | null>;
  deleteGoal: (id: string) => Promise<boolean>;
  toggleGoalExpanded: (id: string) => void;
  
  // Filter actions
  setFilters: (filters: GoalFilters) => void;
  clearFilters: () => void;
  
  // Computed values
  filteredGoals: GoalListItem[];
}

// Create the context with a default value
const GoalsContext = createContext<GoalsContextValue | undefined>(undefined);

// Provider component
export function GoalsProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState<GoalTab>('my-goals');
  const [filters, setFilters] = useState<GoalFilters>({});

  // Use SWR to fetch and cache goals data
  const { data: goals = [], error: fetchError, isLoading, mutate } = useSWR(
    GOALS_CACHE_KEY, 
    getAllGoals,
    {
      revalidateOnFocus: false, // Don't revalidate on focus to prevent loading state flashing
      dedupingInterval: 5000,    // Avoid duplicate requests within 5 seconds
      keepPreviousData: true,    // Keep showing previous data while loading new data
      errorRetryCount: 2,        // Retry failed requests maximum 2 times
    }
  );
  
  const loading = isLoading;
  const error = fetchError ? 'Failed to fetch goals' : null;

  // Fetch goals - this just triggers SWR's mutate
  const fetchGoals = useCallback(async () => {
    try {
      await mutate();
    } catch (error) {
      console.error("Error fetching goals:", error);
    }
  }, [mutate]);

  // Create a new goal
  const createGoal = useCallback(async (data: CreateGoalData) => {
    try {
      // In a real implementation, this would call an API
      alert("Creating goal functionality will be implemented");
      
      // For now, just create a mock goal
      const newGoalListItem: GoalListItem = {
        id: Date.now().toString(),
        name: data.name,
        workspaceName: data.workspaceId ? 'My workspace' : undefined,
        teamName: data.teamId ? 'My team' : undefined,
        timePeriod: data.timePeriod,
        progress: 0,
        status: 'no status',
        ownerId: data.ownerId || 'current-user',
        hasRisk: false
      };

      // Update the SWR cache
      mutate([...(goals || []), newGoalListItem], false);
      
      return newGoalListItem;
    } catch (error) {
      console.error("Error creating goal:", error);
      return null;
    }
  }, [goals, mutate]);

  // Update an existing goal
  const updateGoal = useCallback(async (data: UpdateGoalData) => {
    try {
      // In a real implementation, this would call an API
      const updatedGoals = (goals || []).map(goal => 
        goal.id === data.id 
          ? { ...goal, ...data } 
          : goal
      );
      
      // Update the SWR cache
      mutate(updatedGoals, false);
      
      // Return the updated goal
      const updatedGoal = updatedGoals.find(goal => goal.id === data.id);
      return updatedGoal || null;
    } catch (error) {
      console.error("Error updating goal:", error);
      return null;
    }
  }, [goals, mutate]);

  // Delete a goal
  const deleteGoal = useCallback(async (id: string): Promise<boolean> => {
    try {
      // In a real implementation, this would call an API
      const filteredGoals = (goals || []).filter(goal => goal.id !== id);
      
      // Update the SWR cache
      mutate(filteredGoals, false);
      
      return true;
    } catch (error) {
      console.error("Error deleting goal:", error);
      return false;
    }
  }, [goals, mutate]);

  // Toggle the expanded state of a goal (for UI)
  const toggleGoalExpanded = useCallback((id: string) => {
    const updatedGoals = (goals || []).map(goal => 
      goal.id === id 
        ? { ...goal, isExpanded: !goal.isExpanded } 
        : goal
    );
    
    // Update the SWR cache
    mutate(updatedGoals, false);
  }, [goals, mutate]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  // Computed filtered goals based on current filters and active tab
  const filteredGoals = useMemo(() => {
    let result = goals || [];
    
    // Filter by tab
    if (activeTab === 'my-goals') {
      // For "My Goals" tab, show goals without a team or where user is the owner
      result = result.filter(goal => !goal.teamName || goal.ownerId === 'current-user');
    } else if (activeTab === 'team-goals') {
      // For "Team Goals" tab, show goals with a team
      result = result.filter(goal => !!goal.teamName);
    }
    
    // Apply additional filters
    if (filters && Object.keys(filters).length > 0) {
      result = result.filter(goal => {
        // Filter by time periods
        if (filters.timePeriods && filters.timePeriods.length > 0 && !filters.timePeriods.includes(goal.timePeriod)) {
          return false;
        }
        
        // Filter by statuses
        if (filters.statuses && filters.statuses.length > 0 && !filters.statuses.includes(goal.status)) {
          return false;
        }
        
        // Filter by owner IDs
        if (filters.ownerIds && filters.ownerIds.length > 0 && !filters.ownerIds.includes(goal.ownerId)) {
          return false;
        }
        
        return true;
      });
    }
    
    return result;
  }, [goals, filters, activeTab]);

  const value = {
    goals: goals || [],
    loading,
    error,
    activeTab,
    filters,
    filteredGoals,
    setActiveTab,
    fetchGoals,
    createGoal,
    updateGoal,
    deleteGoal,
    toggleGoalExpanded,
    setFilters,
    clearFilters
  };

  return (
    <GoalsContext.Provider value={value}>
      {children}
    </GoalsContext.Provider>
  );
}

// Custom hook to use the Goals context
export function useGoals(): GoalsContextValue {
  const context = useContext(GoalsContext);
  if (context === undefined) {
    throw new Error('useGoals must be used within a GoalsProvider');
  }
  return context;
}
