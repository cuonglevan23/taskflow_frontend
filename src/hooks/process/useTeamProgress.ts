import { useState, useEffect } from 'react';
import { TeamProgress, getAllTeamsProgress } from "@/services/process/progressService";;

export function useTeamProgress() {
  const [teamsProgress, setTeamsProgress] = useState<TeamProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeamsProgress = async () => {
    try {
      setLoading(true);
      setError(null);
      const teams = await getAllTeamsProgress();
      setTeamsProgress(teams);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch teams progress');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamsProgress();
  }, []);

  const refreshProgress = () => {
    fetchTeamsProgress();
  };

  return {
    teamsProgress,
    loading,
    error,
    refreshProgress
  };
}
