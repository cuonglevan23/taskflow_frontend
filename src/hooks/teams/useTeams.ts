// SWR Hooks for Teams - Data fetching with caching and real-time sync
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { mutate } from 'swr';
import { teamsService } from '@/services/teams';
import type { Team, TeamsApiResponse, CreateTeamFormData } from '@/types/teams';

// SWR Key generators for consistent cache keys
export const TEAMS_KEYS = {
  all: () => ['teams'] as const,
  lists: () => [...TEAMS_KEYS.all(), 'list'] as const,
  list: (filters: Record<string, any>) => [...TEAMS_KEYS.lists(), filters] as const,
  details: () => [...TEAMS_KEYS.all(), 'detail'] as const,
  detail: (id: number) => [...TEAMS_KEYS.details(), id] as const,
  myTeams: () => [...TEAMS_KEYS.all(), 'my-teams'] as const,
};

// Fetcher functions
const fetchTeams = async (): Promise<TeamsApiResponse> => {
  return teamsService.getTeams();
};

const fetchTeam = async (id: number): Promise<Team> => {
  return teamsService.getTeam(id);
};

const fetchMyTeams = async (): Promise<Team[]> => {
  return teamsService.getMyTeams();
};

// Mutation functions
const createTeamMutation = async (
  url: string, 
  { arg }: { arg: { formData: CreateTeamFormData; userSession?: any } }
): Promise<Team> => {
  const newTeam = await teamsService.createTeam(arg.formData, arg.userSession);
  
  // Invalidate related caches after successful creation
  await Promise.all([
    mutate(TEAMS_KEYS.lists()),
    mutate(TEAMS_KEYS.myTeams()),
    mutate(TEAMS_KEYS.all()),
  ]);
  
  return newTeam;
};

const updateTeamMutation = async (
  url: string,
  { arg }: { arg: { id: number; data: any } }
): Promise<Team> => {
  const updatedTeam = await teamsService.updateTeam(arg.id, arg.data);
  
  // Invalidate related caches
  await Promise.all([
    mutate(TEAMS_KEYS.detail(arg.id)),
    mutate(TEAMS_KEYS.lists()),
    mutate(TEAMS_KEYS.myTeams()),
  ]);
  
  return updatedTeam;
};

const deleteTeamMutation = async (
  url: string,
  { arg }: { arg: { id: number } }
): Promise<void> => {
  await teamsService.deleteTeam(arg.id);
  
  // Invalidate all team-related caches
  await Promise.all([
    mutate(TEAMS_KEYS.all()),
    mutate(TEAMS_KEYS.lists()),
    mutate(TEAMS_KEYS.myTeams()),
  ]);
};

// Hook: Get all teams with caching and auto-refresh
export const useTeams = () => {
  const { data, error, isLoading, mutate: revalidate } = useSWR(
    TEAMS_KEYS.lists(),
    fetchTeams,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 5000, // 5 seconds deduping
    }
  );

  return {
    teams: data?.teams || [],
    totalElements: data?.totalElements || 0,
    isLoading,
    error,
    revalidate,
  };
};

// Hook: Get single team by ID
export const useTeam = (id: number) => {
  const { data, error, isLoading, mutate: revalidate } = useSWR(
    id ? TEAMS_KEYS.detail(id) : null,
    () => fetchTeam(id),
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  return {
    team: data,
    isLoading,
    error,
    revalidate,
  };
};

// Hook: Get current user's teams
export const useMyTeams = () => {
  const { data, error, isLoading, mutate: revalidate } = useSWR(
    TEAMS_KEYS.myTeams(),
    fetchMyTeams
    // Use global SWR config from SWRProvider
  );

  return {
    teams: data || [],
    isLoading,
    error,
    revalidate,
  };
};

// Hook: Create team with optimistic updates
export const useCreateTeam = () => {
  const { trigger, isMutating, error } = useSWRMutation(
    TEAMS_KEYS.all(),
    createTeamMutation
  );

  const createTeam = async (formData: CreateTeamFormData, userSession?: any) => {
    try {
      const newTeam = await trigger({ formData, userSession });
      return newTeam;
    } catch (error) {
      console.error('❌ Failed to create team:', error);
      throw error;
    }
  };

  return {
    createTeam,
    isCreating: isMutating,
    error,
  };
};

// Hook: Update team
export const useUpdateTeam = () => {
  const { trigger, isMutating, error } = useSWRMutation(
    TEAMS_KEYS.all(),
    updateTeamMutation
  );

  const updateTeam = async (id: number, data: any) => {
    try {
      const updatedTeam = await trigger({ id, data });
      return updatedTeam;
    } catch (error) {
      console.error('❌ Failed to update team:', error);
      throw error;
    }
  };

  return {
    updateTeam,
    isUpdating: isMutating,
    error,
  };
};

// Hook: Delete team
export const useDeleteTeam = () => {
  const { trigger, isMutating, error } = useSWRMutation(
    TEAMS_KEYS.all(),
    deleteTeamMutation
  );

  const deleteTeam = async (id: number) => {
    try {
      await trigger({ id });
    } catch (error) {
      console.error('❌ Failed to delete team:', error);
      throw error;
    }
  };

  return {
    deleteTeam,
    isDeleting: isMutating,
    error,
  };
};

// Utility: Manually invalidate teams cache
export const invalidateTeamsCache = async () => {
  await Promise.all([
    mutate(TEAMS_KEYS.all()),
    mutate(TEAMS_KEYS.lists()),
    mutate(TEAMS_KEYS.myTeams()),
  ]);
};

// Utility: Optimistic update for team creation
export const optimisticTeamUpdate = (newTeam: Team) => {
  // Add to existing cache without API call
  mutate(
    TEAMS_KEYS.lists(),
    (currentData: TeamsApiResponse | undefined) => {
      if (!currentData) return currentData;
      return {
        ...currentData,
        teams: [newTeam, ...currentData.teams],
        totalElements: currentData.totalElements + 1,
      };
    },
    false // Don't revalidate immediately
  );
};