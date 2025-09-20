import { useState, useEffect, useCallback } from 'react';
import { 
  TeamProgress, 
  ProjectProgress,
  ProjectTaskProgress,
  getTeamProgress,
  getProjectProgress,
  refreshProjectProgress,
  getProjectTaskProgress
} from "@/services/process/progressService";
import { toast } from 'react-hot-toast';

// Hook để lấy progress của một team
export const useTeamProgress = (teamId: number) => {
  const [progress, setProgress] = useState<TeamProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeamProgress = useCallback(async () => {
    if (!teamId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await getTeamProgress(teamId);
      setProgress(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load team progress';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  const refreshProgress = useCallback(async () => {
    await fetchTeamProgress();
    toast.success('Team progress refreshed successfully');
  }, [fetchTeamProgress]);

  useEffect(() => {
    fetchTeamProgress();
  }, [fetchTeamProgress]);

  return {
    progress,
    loading,
    error,
    refreshProgress,
    fetchTeamProgress
  };
};

// Hook để lấy progress của một project - UPDATED to use correct API
export const useProjectProgress = (projectId: number) => {
  const [progress, setProgress] = useState<ProjectProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjectProgress = useCallback(async () => {
    if (!projectId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await getProjectProgress(projectId);
      setProgress(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load project progress';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const refreshProgress = useCallback(async () => {
    if (!projectId) return;

    try {
      setLoading(true);
      // Call POST /api/projects/{id}/progress to refresh
      const data = await refreshProjectProgress(projectId);
      setProgress(data);
      toast.success('Project progress refreshed successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh project progress';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchProjectProgress();
  }, [fetchProjectProgress]);

  return {
    progress,
    loading,
    error,
    refreshProgress,
    fetchProjectProgress
  };
};

// Hook để lấy task progress của một project - NEW HOOK for /api/project-tasks/project/{projectId}/progress
export const useProjectTaskProgress = (projectId: number) => {
  const [progress, setProgress] = useState<ProjectTaskProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjectTaskProgress = useCallback(async () => {
    if (!projectId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await getProjectTaskProgress(projectId);
      setProgress(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load project task progress';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const refreshProgress = useCallback(async () => {
    await fetchProjectTaskProgress();
    toast.success('Project task progress refreshed successfully');
  }, [fetchProjectTaskProgress]);

  useEffect(() => {
    fetchProjectTaskProgress();
  }, [fetchProjectTaskProgress]);

  return {
    progress,
    loading,
    error,
    refreshProgress,
    fetchProjectTaskProgress
  };
};
