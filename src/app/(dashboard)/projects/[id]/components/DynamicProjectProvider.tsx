"use client";

import { createContext, useContext, useEffect, ReactNode } from 'react';
import { useParams } from 'next/navigation';
import { useProject as useSWRProject } from '@/hooks/projects/useProjects';
import type { Project } from '@/types/project';

interface ProjectContextValue {
  project: Project | null;
  loading: boolean;
  error: string | null;
  updatePageTitle: (title: string) => void;
}

const ProjectContext = createContext<ProjectContextValue | undefined>(undefined);

interface DynamicProjectProviderProps {
  children: ReactNode;
}

export function DynamicProjectProvider({ children }: DynamicProjectProviderProps) {
  const params = useParams();
  const projectId = params?.id as string;
  
  // Convert string ID to number for SWR hook
  const numericProjectId = projectId ? parseInt(projectId, 10) : null;
  
  // Use SWR hook for project data with caching and auto-sync
  const { data: project, error: swrError, isLoading } = useSWRProject(numericProjectId);

  // Function to update page title with retry mechanism
  const updatePageTitle = (title: string) => {
    if (typeof document !== 'undefined') {
      // Update document title immediately
      document.title = `${title} - TaskManager`;
      
      // Function to update header element with retry
      const updateHeaderElement = (retries = 0) => {
        const headerElement = document.querySelector('[data-page-title]');
        if (headerElement) {
          headerElement.textContent = title;
        } else if (retries < 5) {
          // Retry after a short delay if element not found
          setTimeout(() => updateHeaderElement(retries + 1), 100);
        }
      };
      
      // Try immediately and then with retries
      updateHeaderElement();
    }
  };

  // Update page title when project data changes
  useEffect(() => {
    if (isLoading) {
      updatePageTitle('Loading Project...');
    } else if (swrError) {
      updatePageTitle('Project Error');
    } else if (!project) {
      updatePageTitle('Project Not Found');
    } else {
      updatePageTitle(project.name);
    }
  }, [project, isLoading, swrError]);

  // Handle ID validation
  useEffect(() => {
    if (!projectId) {
      updatePageTitle('Invalid Project');
    }
  }, [projectId]);

  const value: ProjectContextValue = {
    project: project || null,
    loading: isLoading,
    error: swrError?.message || (swrError ? 'Failed to load project' : (!projectId ? 'No project ID provided' : null)),
    updatePageTitle,
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a DynamicProjectProvider');
  }
  return context;
}