"use client";

import { useEffect, useMemo } from 'react';
import { useTeamContext } from '@/contexts/TeamContext';
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
      activeMembers: members.filter(m => m.isActive !== false),
      
      // Member roles
      owners: members.filter(m => m.role === 'OWNER'),
      admins: members.filter(m => m.role === 'ADMIN'),
      regularMembers: members.filter(m => m.role === 'MEMBER'),
      
      // Current user role (if available in members list)
      currentUserRole: members.find(m => m.isCurrent)?.role || 'MEMBER',
      
      // Permissions
      canEditTeam: currentTeam?.leaderId !== undefined, // Basic check
      canInviteMembers: true, // TODO: Add proper permission logic
      canRemoveMembers: true, // TODO: Add proper permission logic
    };
  }, [state.currentTeam, state.members]);

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

// Hook for member-specific operations
export function useTeamMember(teamId: number, memberId?: number) {
  const { members, removeMember } = useTeamContext();

  const member = useMemo(() => {
    if (!memberId) return null;
    return members.find(m => m.id === memberId.toString()) || null;
  }, [members, memberId]);

  const memberOperations = useMemo(() => {
    if (!teamId || !memberId) return {};

    return {
      remove: () => removeMember(teamId, memberId),
      
      // TODO: Add more member-specific operations
      // updateRole: (role: string) => updateMemberRole(teamId, memberId, role),
      // toggleActive: () => toggleMemberActive(teamId, memberId),
    };
  }, [teamId, memberId, removeMember]);

  return {
    member,
    ...memberOperations,
  };
}

// Hook for team creation (separate from main useTeam hook)
export function useTeamCreation() {
  // This can be expanded for team creation flows
  // For now, just expose the service method
  const createTeam = async (formData: { name: string; description?: string; memberEmails?: string[] }) => {
    const { teamsService } = await import('@/services/teams');
    return teamsService.createTeam(formData);
  };

  return {
    createTeam,
  };
}