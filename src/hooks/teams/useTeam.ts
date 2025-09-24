import { useEffect, useMemo } from 'react';
import { useTeamContext } from '@/contexts/TeamContext';
import { useAuth } from '@/components/auth/AuthProvider';
import type { TeamMember, TeamInvitationRequestDto } from '@/types/teams';

// Custom hook for team operations
export function useTeam(teamId?: number) {
  const {
    state,
    fetchTeam,
    updateTeam,
    updateDescription,
    fetchMembers,
    inviteMember,
    removeMember,
    setEditingDescription,
  } = useTeamContext();

  const { user } = useAuth();

  // Auto-fetch team and members when teamId changes
  useEffect(() => {
    if (teamId) {
      fetchTeam(teamId);
      fetchMembers(teamId);
    }
  }, [teamId, fetchTeam, fetchMembers]);

  // Computed values
  const computed = useMemo(() => {
    const { currentTeam, members } = state;

    return {
      // Team info
      teamName: currentTeam?.name || '',
      teamDescription: currentTeam?.description || '',

      // Member stats
      memberCount: members.length,
      activeMembers: members.filter(m => m.status === 'ACTIVE'),

      // Member roles
      owners: members.filter(m => m.role === 'OWNER'),
      admins: members.filter(m => m.role === 'ADMIN'),
      regularMembers: members.filter(m => m.role === 'MEMBER'),

      // Current user role (if available in members list)
      currentUserRole: (() => {
        if (!user) return 'MEMBER';

        // Try to find by userId first, then by email
        const currentUserMember = members.find(m =>
          (m.userId && m.userId.toString() === user.id) ||
          (m.email && m.email === user.email)
        );

        return currentUserMember?.role || 'MEMBER';
      })(),

      // Permissions
      canEditTeam: currentTeam?.leaderId !== undefined, // Basic check
      canInviteMembers: true, // TODO: Add proper permission logic
      canRemoveMembers: true, // TODO: Add proper permission logic
    };
  }, [state.currentTeam, state.members, user]);

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
    team: state.currentTeam,
    members: state.members,
    loading: state.loading,
    membersLoading: state.membersLoading,
    updating: state.updating,
    error: state.error,
    membersError: state.membersError,
    isEditingDescription: state.isEditingDescription,

    // Computed values
    ...computed,

    // Operations
    ...teamOperations,

    // UI operations
    startEditingDescription: () => setEditingDescription(true),
    stopEditingDescription: () => setEditingDescription(false),
  };
}
