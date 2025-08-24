"use client";

import React, { useEffect } from 'react';
import { useProject } from '@/hooks/projects/useProjects';

interface ProjectNameFetcherProps {
  projectId: number;
  onProjectFetched: (projectId: number, projectName: string) => void;
}

/**
 * A component that fetches a project name based on projectId and 
 * calls the onProjectFetched callback when the name is available.
 * This component doesn't render anything and just performs the data fetching.
 */
export const ProjectNameFetcher: React.FC<ProjectNameFetcherProps> = ({ 
  projectId, 
  onProjectFetched 
}) => {
  const { data: project, error } = useProject(projectId);
  
  useEffect(() => {
    console.log(`🔄 Fetching project name for ID ${projectId}...`);
    
    if (project && project.name) {
      console.log(`✅ Project fetched for ID ${projectId}:`, {
        name: project.name,
        id: project.id,
        teamIds: project.teamIds
      });
      onProjectFetched(projectId, project.name);
    } else if (error) {
      console.error(`❌ Failed to fetch project ${projectId}:`, error);
    }
  }, [project, error, projectId, onProjectFetched]);
  
  // This component doesn't render anything
  return null;
};
