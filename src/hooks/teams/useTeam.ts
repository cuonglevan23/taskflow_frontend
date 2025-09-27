import { useEffect, useMemo, useState, useCallback } from 'react';
import { useTeamContext } from '@/contexts/TeamContext';
import { useAuth } from '@/components/auth/AuthProvider';
import { teamsService } from '@/services/teams/teamsService';
import type { Team, TeamMember, TeamInvitationRequestDto } from '@/types/teams';

// Custom hook for team operations
export function useTeam(teamId?: number) {
  const {
    state,
    fetchTeam: contextFetchTeam,
    updateTeam,
    updateDescription,
    fetchMembers: contextFetchMembers,
    inviteMember,
    removeMember,
    setEditingDescription,
  } = useTeamContext();

  const { user, isAuthenticated } = useAuth();

  // Local state for team and members
  const [team, setTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [membersLoading, setMembersLoading] = useState(true);
  const [membersError, setMembersError] = useState<string | null>(null);
  const [teamLoading, setTeamLoading] = useState(true);
  const [teamError, setTeamError] = useState<string | null>(null);

  // Fetch team data
  const fetchTeam = useCallback(async (id: number) => {
    if (!isAuthenticated) return;

    setTeamLoading(true);
    setTeamError(null);

    try {
      const teamData = await teamsService.getTeam(id);
      setTeam(teamData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch team';
      setTeamError(errorMessage);
      console.error('Failed to fetch team:', error);
    } finally {
      setTeamLoading(false);
    }
  }, [isAuthenticated]);

  // Fetch team members
  const fetchMembers = useCallback(async (id: number) => {
    if (!isAuthenticated) return;

    setMembersLoading(true);
    setMembersError(null);

    try {
      const membersData = await teamsService.getTeamMembers(id);
      setMembers(membersData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch team members';
      setMembersError(errorMessage);
      console.error('Failed to fetch team members:', error);
    } finally {
      setMembersLoading(false);
    }
  }, [isAuthenticated]);

  // Kick/remove member from team
  const kickMember = useCallback(async (memberId: number) => {
    if (!teamId || !isAuthenticated) {
      throw new Error('Team ID is required and user must be authenticated');
    }

    try {
      await teamsService.removeMember(teamId, memberId);

      // Remove the member from local state immediately for better UX
      setMembers(prevMembers => prevMembers.filter(member => member.id !== memberId));

      console.log('Member removed successfully');
    } catch (error) {
      console.error('Failed to remove member:', error);
      // Re-throw the error so the calling component can handle it
      throw error;
    }
  }, [teamId, isAuthenticated]);

  // Refresh both team and members data
  const refresh = useCallback(async () => {
    if (!teamId) return;

    await Promise.all([
      fetchTeam(teamId),
      fetchMembers(teamId)
    ]);
  }, [teamId, fetchTeam, fetchMembers]);

  // Get current user's role in the team
  const currentUserRole = team?.currentUserRole ||
    members.find(member => member.email === user?.email)?.role ||
    'MEMBER';

  // Initial data fetch
  useEffect(() => {
    if (teamId && isAuthenticated) {
      fetchTeam(teamId);
      fetchMembers(teamId);
    }
  }, [teamId, isAuthenticated, fetchTeam, fetchMembers]);

  // Computed values
  const computed = useMemo(() => {
    return {
      // Team info
      teamName: team?.name || '',
      teamDescription: team?.description || '',

      // Member stats
      memberCount: members.length,
      activeMembers: members.filter(m => m.status === 'ACTIVE'),

      // Member roles
      owners: members.filter(m => m.role === 'OWNER'),
      admins: members.filter(m => m.role === 'ADMIN'),
      regularMembers: members.filter(m => m.role === 'MEMBER'),

      // Permissions
      canEditTeam: team?.leaderId !== undefined, // Basic check
      canInviteMembers: true, // TODO: Add proper permission logic
      canRemoveMembers: true, // TODO: Add proper permission logic
    };
  }, [team, members]);

  // Team operations with teamId binding
  const teamOperations = useMemo(() => {
    if (!teamId) return {};

    return {
      // Update team info
      updateTeamInfo: async (updates: { name?: string; description?: string }) => {
        return updateTeam(teamId, updates);
      },

      // Update description specifically
      saveDescription: async (description: string) => {
        return updateDescription(teamId, description);
      },

      // Member management
      addMember: async (email: string, role: 'MEMBER' | 'LEADER' = 'MEMBER') => {
        const invitation: TeamInvitationRequestDto = { email, role };
        return inviteMember(teamId, invitation);
      },

      kickMember: async (memberId: number) => {
        return removeMember(teamId, memberId);
      },

      // Refresh data
      refresh: async () => {
        await Promise.all([
          fetchTeam(teamId),
          fetchMembers(teamId)
        ]);
      },
    };
  }, [teamId, updateTeam, updateDescription, inviteMember, removeMember, fetchTeam, fetchMembers]);

  return {
    // State
    team,
    members,
    loading: teamLoading,
    membersLoading,
    updating: state.updating,
    error: teamError,
    membersError,
    isEditingDescription: state.isEditingDescription,

    // Current user role - THIS WAS MISSING!
    currentUserRole,

    // Computed values
    ...computed,

    // Operations
    ...teamOperations,

    // UI operations
    startEditingDescription: () => setEditingDescription(true),
    stopEditingDescription: () => setEditingDescription(false),
  };
}
