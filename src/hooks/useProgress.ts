import { useState, useEffect, useCallback } from 'react';
import { 
  TeamProgress, 
  ProjectProgress,
  getTeamOverallProgress, 
  getProjectProgress, 
  refreshTeamProgress,
  refreshProjectProgress
} from '@/services/progressService';
import { useToast } from '@/components/ui/use-toast';

// Hook để lấy progress của một team
export const useTeamProgress = (teamId: number) => {
  const [progress, setProgress] = useState<TeamProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchTeamProgress = useCallback(async () => {
    if (!teamId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await getTeamOverallProgress(teamId);
      setProgress(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load team progress';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [teamId, toast]);

  const refreshProgress = useCallback(async () => {
    if (!teamId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await refreshTeamProgress(teamId);
      setProgress(data);
      toast({
        title: 'Success',
        description: 'Team progress refreshed successfully',
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh team progress';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [teamId, toast]);

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

// Hook để lấy progress của một project
export const useProjectProgress = (projectId: number) => {
  const [progress, setProgress] = useState<ProjectProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

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
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [projectId, toast]);

  const refreshProgress = useCallback(async () => {
    if (!projectId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await refreshProjectProgress(projectId);
      setProgress(data);
      toast({
        title: 'Success',
        description: 'Project progress refreshed successfully',
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh project progress';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [projectId, toast]);

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
