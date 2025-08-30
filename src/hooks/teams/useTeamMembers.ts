import { useEffect, useState } from 'react';
import { teamsService } from '@/services/teams/teamsService';
import { TeamMember } from '@/types/teams';
import { useAuth } from '@/components/auth/AuthProvider'; // Use new auth system

export const useTeamMembers = (teamId: number | undefined) => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user, isAuthenticated } = useAuth(); // Use new auth system

  const fetchTeamMembers = async (id: number) => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    setError(null);
    
    try {
      const data = await teamsService.getTeamMembers(id);
      setMembers(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch team members'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (teamId) {
      fetchTeamMembers(teamId);
    }
  }, [teamId, isAuthenticated]);

  const refetch = () => {
    if (teamId) {
      fetchTeamMembers(teamId);
    }
  };

  return {
    members,
    isLoading,
    error,
    refetch,
  };
};

export default useTeamMembers;
