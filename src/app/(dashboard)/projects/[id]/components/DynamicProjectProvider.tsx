"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useParams } from 'next/navigation';

interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
  teamId: string;
  managerId: string;
  status: string;
  startDate: Date | string;
  endDate: Date | string;
}

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
  
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    const fetchProject = async () => {
      if (!projectId) {
        setError('No projects ID provided');
        updatePageTitle('Invalid Project');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        setProject(null);
        
        // Set initial loading title
        updatePageTitle('Loading Project...');
        
        const response = await fetch('/api/projects');
        const projects = await response.json();
        const currentProject = projects.find((p: Project) => p.id === projectId);
        
        if (currentProject) {
          setProject(currentProject);
          // Delay title update to ensure component is ready
          setTimeout(() => updatePageTitle(currentProject.name), 50);
        } else {
          setProject(null);
          setError('Project not found');
          setTimeout(() => updatePageTitle('Project Not Found'), 50);
        }
      } catch (err) {
        console.error('Error fetching projects:', err);
        setProject(null);
        setError('Failed to load projects');
        setTimeout(() => updatePageTitle('Project Error'), 50);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  const value: ProjectContextValue = {
    project,
    loading,
    error,
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