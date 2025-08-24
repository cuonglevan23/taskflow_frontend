"use client";

import { createContext, useContext, useEffect, ReactNode, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useProject as useSWRProject } from '@/hooks/projects/useProjects';
// Use the Project type from projects to match the hook return type
import type { Project } from '@/types/projects';

// Type for API errors
interface APIError extends Error {
  status?: number;
  response?: {
    status: number;
    data?: unknown;
  };
}

interface ProjectContextValue {
  project: Project | null;
  loading: boolean;
  error: string | null;
  isRedirecting: boolean;
  updatePageTitle: (title: string) => void;
}

const ProjectContext = createContext<ProjectContextValue | undefined>(undefined);

interface DynamicProjectProviderProps {
  children: ReactNode;
}

export function DynamicProjectProvider({ children }: DynamicProjectProviderProps) {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.id as string;
  
  // Convert string ID to number for SWR hook
  const numericProjectId = projectId ? parseInt(projectId, 10) : null;
  
  // Use SWR hook for project data with caching and auto-sync
  const { data: project, error: swrError, isLoading } = useSWRProject(numericProjectId);
  
  // Track if we're redirecting due to permission error
  const [isRedirecting, setIsRedirecting] = useState(false);

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

  // Handle permission errors and redirect
  useEffect(() => {
    if (swrError) {
      setIsRedirecting(true);
      router.replace('/404');
    }
  }, [swrError, router]);

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
    loading: isLoading || isRedirecting,
    error: swrError?.message || (swrError ? 'Failed to load project' : (!projectId ? 'No project ID provided' : null)),
    isRedirecting,
    updatePageTitle,
  };

  // Only render children if project is valid and not redirecting
  const shouldRenderChildren = !isRedirecting && !swrError && project;
  return (
    <ProjectContext.Provider value={value}>
      {/* Show loading while redirecting or error, never render children if error/redirecting */}
      {isRedirecting || swrError || !project ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Redirecting...</p>
          </div>
        </div>
      ) : (
        children
      )}
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