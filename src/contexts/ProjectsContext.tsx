"use client";

import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from "react";
import { GrProjects } from "react-icons/gr";

// Project Data Model - Centralized
export interface Project {
  id: number;
  name: string;
  color: string;
  icon?: React.ComponentType<{ className?: string }>;
  tasksDue?: number;
  featured?: boolean;
  createdAt: Date;
  updatedAt: Date;
  status: 'active' | 'completed' | 'archived';
  teamId?: string;
  description?: string;
  progress?: number; // 0-100
}

// Project Color Palette - Centralized Theme Colors
export const PROJECT_COLORS = {
  pink: '#e91e63',
  purple: '#8b5cf6', 
  blue: '#3f51b5',
  lightBlue: '#2196f3',
  green: '#10b981',
  orange: '#f59e0b',
  red: '#ef4444',
  indigo: '#6366f1',
  yellow: '#eab308',
  teal: '#14b8a6',
} as const;

export type ProjectColorKey = keyof typeof PROJECT_COLORS;

// Context Interface - Senior Product Code
interface ProjectsContextType {
  // Data
  projects: Project[];
  featuredProject: Project | undefined;
  regularProjects: Project[];
  
  // State
  isLoading: boolean;
  error: string | null;
  
  // Actions
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateProject: (id: number, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: number) => Promise<void>;
  setFeaturedProject: (id: number) => Promise<void>;
  refreshProjects: () => Promise<void>;
  
  // Computed
  projectStats: {
    total: number;
    active: number;
    completed: number;
    withTasksDue: number;
    byStatus: Record<Project['status'], number>;
  };
}

// Create Context
const ProjectsContext = createContext<ProjectsContextType | undefined>(undefined);

// Initial Data - Professional Mock Data
const INITIAL_PROJECTS: Project[] = [
  { 
    id: 1, 
    name: "Website Redesign", 
    description: "Complete redesign of company website",
    color: PROJECT_COLORS.pink, 
    icon: GrProjects,
    status: 'active',
    progress: 75,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20')
  },
  { 
    id: 2, 
    name: "Mobile App Development", 
    description: "Native iOS and Android app",
    color: PROJECT_COLORS.blue, 
    icon: GrProjects,
    status: 'active',
    progress: 45,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-18')
  },
  { 
    id: 3, 
    name: "Marketing Campaign Q1", 
    description: "Digital marketing campaign for Q1",
    color: PROJECT_COLORS.green, 
    icon: GrProjects,
    status: 'active',
    progress: 90,
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-19')
  },
  { 
    id: 4, 
    name: "User Research Study", 
    description: "Comprehensive user experience research",
    color: PROJECT_COLORS.purple, 
    icon: GrProjects,
    status: 'active',
    progress: 30,
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-17')
  },
  { 
    id: 5, 
    name: "Request Tracking System", 
    description: "Internal request management system",
    color: PROJECT_COLORS.lightBlue, 
    icon: GrProjects,
    status: 'active',
    progress: 60,
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-16')
  },
  {
    id: 6,
    name: "Content Management Platform",
    description: "CMS for marketing team",
    color: PROJECT_COLORS.orange,
    icon: GrProjects,
    status: 'active',
    progress: 25,
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: 7,
    name: "Product Development Pipeline",
    description: "Streamline product development process",
    color: PROJECT_COLORS.indigo,
    icon: GrProjects,
    status: 'active',
    progress: 80,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-14')
  },
  { 
    id: 8, 
    name: "Team Collaboration Platform", 
    description: "Internal team communication platform",
    color: PROJECT_COLORS.purple, 
    icon: GrProjects, 
    tasksDue: 3, 
    featured: true,
    status: 'active',
    progress: 95,
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-21')
  },
];

// Provider Props
interface ProjectsProviderProps {
  children: ReactNode;
}

// Professional Projects Provider - Senior Product Implementation
export function ProjectsProvider({ children }: ProjectsProviderProps) {
  // State Management
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Computed Values - Memoized for Performance
  const featuredProject = useMemo(() => {
    return projects.find(p => p.featured);
  }, [projects]);

  const regularProjects = useMemo(() => {
    return projects.filter(p => !p.featured && p.status === 'active');
  }, [projects]);

  const projectStats = useMemo(() => {
    const byStatus = projects.reduce((acc, project) => {
      acc[project.status] = (acc[project.status] || 0) + 1;
      return acc;
    }, {} as Record<Project['status'], number>);

    return {
      total: projects.length,
      active: projects.filter(p => p.status === 'active').length,
      completed: projects.filter(p => p.status === 'completed').length,
      withTasksDue: projects.filter(p => p.tasksDue && p.tasksDue > 0).length,
      byStatus,
    };
  }, [projects]);

  // Actions - Professional Implementation
  const addProject = useCallback(async (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newProject: Project = {
        ...projectData,
        id: Math.max(...projects.map(p => p.id), 0) + 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      setProjects(prev => [newProject, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add projects');
    } finally {
      setIsLoading(false);
    }
  }, [projects]);

  const updateProject = useCallback(async (id: number, updates: Partial<Project>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setProjects(prev => prev.map(project => 
        project.id === id 
          ? { ...project, ...updates, updatedAt: new Date() }
          : project
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update projects');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteProject = useCallback(async (id: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setProjects(prev => prev.filter(project => project.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete projects');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setFeaturedProject = useCallback(async (id: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 200));
      
      setProjects(prev => prev.map(project => ({
        ...project,
        featured: project.id === id ? true : false,
        updatedAt: project.id === id ? new Date() : project.updatedAt
      })));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set featured projects');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshProjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call to refresh data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In real app, fetch from API
      // const response = await api.getProjects();
      // setProjects(response.data);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh projects');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Context Value - Memoized to Prevent Unnecessary Re-renders
  const contextValue = useMemo(() => ({
    // Data
    projects,
    featuredProject,
    regularProjects,
    
    // State
    isLoading,
    error,
    
    // Actions
    addProject,
    updateProject,
    deleteProject,
    setFeaturedProject,
    refreshProjects,
    
    // Computed
    projectStats,
  }), [
    projects,
    featuredProject,
    regularProjects,
    isLoading,
    error,
    addProject,
    updateProject,
    deleteProject,
    setFeaturedProject,
    refreshProjects,
    projectStats,
  ]);

  return (
    <ProjectsContext.Provider value={contextValue}>
      {children}
    </ProjectsContext.Provider>
  );
};

// Custom Hook - Professional Implementation
export const useProjectsContext = () => {
  const context = useContext(ProjectsContext);
  if (context === undefined) {
    throw new Error('useProjectsContext must be used within a ProjectsProvider');
  }
  return context;
};

// Export types for external use
export type { ProjectsContextType };