"use client";

import { createContext, useContext, useEffect, ReactNode, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useProject as useSWRProject } from '@/hooks/projects/useProjects';
// Use the Project type from projects to match the hook return type
import type { Project } from '@/types/projects';

interface ProjectContextValue {
  project: Project | null;
  loading: boolean;
  error: string | null;
  isRedirecting: boolean;
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
  const { data: project, error: swrError, isLoading, mutate } = useSWRProject(numericProjectId);
  
  // Track if we're redirecting due to permission error
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Force refresh project data when projectId changes to ensure fresh data
  useEffect(() => {
    if (numericProjectId && mutate) {
      mutate();
    }
  }, [numericProjectId, mutate]);

  // Handle permission errors and redirect
  useEffect(() => {
    if (swrError) {
      setIsRedirecting(true);
      router.replace('/404');
    }
  }, [swrError, router]);

  // Simple and reliable title update - use multiple strategies for maximum compatibility
  useEffect(() => {
    if (!project?.name) return;

    // Strategy 1: Update document title immediately
    document.title = `${project.name} - TaskManager`;
    
    // Strategy 2: Update header element with aggressive timing
    const updateHeaderTitle = () => {
      const headerElement = document.querySelector('[data-page-title]');
      if (headerElement) {
        headerElement.textContent = project.name;
        return true;
      }
      return false;
    };

    // Immediate attempt
    updateHeaderTitle();
    
    // Multiple retry attempts with different timing
    const timeouts = [0, 50, 100, 200, 500, 1000];
    timeouts.forEach(delay => {
      setTimeout(() => {
        if (!updateHeaderTitle()) {
          // If still not found, try with requestAnimationFrame
          requestAnimationFrame(() => updateHeaderTitle());
        }
      }, delay);
    });

    // Strategy 3: Use MutationObserver to catch when header element is added
    const observer = new MutationObserver(() => {
      if (updateHeaderTitle()) {
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Cleanup observer after 3 seconds
    setTimeout(() => observer.disconnect(), 3000);

  }, [project?.name]);

  const value: ProjectContextValue = {
    project: project || null,
    loading: isLoading || isRedirecting,
    error: swrError?.message || (swrError ? 'Failed to load project' : (!projectId ? 'No project ID provided' : null)),
    isRedirecting,
  };

  // Only render children if project is valid and not redirecting
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