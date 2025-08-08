"use client";

import { useState, useMemo, useCallback } from "react";
import { useProjectsContext } from "@/contexts";

// Re-export types from context for backward compatibility
export type { Project, ProjectColorKey } from "@/contexts";
export { PROJECT_COLORS } from "@/contexts";

// Hook Configuration Interface
interface UseProjectsConfig {
  initialLimit?: number;
  filterByStatus?: import("@/contexts").Project['status'][];
  sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'tasksDue' | 'progress';
  sortOrder?: 'asc' | 'desc';
}

// Professional Projects Hook - Using Global Context
export const useProjects = (config: UseProjectsConfig = {}) => {
  const {
    initialLimit = 4,
    filterByStatus = ['active'],
    sortBy = 'updatedAt',
    sortOrder = 'desc'
  } = config;

  // Get data from global context
  const {
    projects: allProjects,
    featuredProject: contextFeaturedProject,
    regularProjects: contextRegularProjects,
    isLoading,
    addProject,
    updateProject,
    deleteProject,
    setFeaturedProject,
    projectStats
  } = useProjectsContext();

  // Local state for show more functionality
  const [showAllProjects, setShowAllProjects] = useState(false);

  // Computed Values with Filtering and Sorting
  const filteredProjects = useMemo(() => {
    return allProjects
      .filter(project => filterByStatus.includes(project.status))
      .sort((a, b) => {
        const aValue = a[sortBy];
        const bValue = b[sortBy];
        
        if (sortBy === 'name') {
          return sortOrder === 'asc' 
            ? (aValue as string).localeCompare(bValue as string)
            : (bValue as string).localeCompare(aValue as string);
        }
        
        if (sortBy === 'tasksDue' || sortBy === 'progress') {
          const aVal = (aValue as number) || 0;
          const bVal = (bValue as number) || 0;
          return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
        }
        
        // Date sorting
        const aDate = new Date(aValue as Date).getTime();
        const bDate = new Date(bValue as Date).getTime();
        return sortOrder === 'asc' ? aDate - bDate : bDate - aDate;
      });
  }, [allProjects, filterByStatus, sortBy, sortOrder]);

  const featuredProject = useMemo(() => {
    return filteredProjects.find(p => p.featured) || contextFeaturedProject;
  }, [filteredProjects, contextFeaturedProject]);

  const regularProjects = useMemo(() => {
    return filteredProjects.filter(p => !p.featured);
  }, [filteredProjects]);

  const displayedProjects = useMemo(() => {
    return showAllProjects ? regularProjects : regularProjects.slice(0, initialLimit);
  }, [regularProjects, showAllProjects, initialLimit]);

  const hasMoreProjects = useMemo(() => {
    return regularProjects.length > initialLimit;
  }, [regularProjects.length, initialLimit]);

  // Actions
  const toggleShowAll = useCallback(() => {
    setShowAllProjects(prev => !prev);
  }, []);

  return {
    // Data
    projects: filteredProjects,
    featuredProject,
    regularProjects,
    displayedProjects,
    
    // State
    showAllProjects,
    isLoading,
    hasMoreProjects,
    
    // Actions
    toggleShowAll,
    addProject,
    updateProject,
    deleteProject,
    setFeaturedProject,
    
    // Computed
    projectStats,
  };
};

