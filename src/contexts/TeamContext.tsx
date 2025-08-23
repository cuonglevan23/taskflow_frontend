"use client";

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { teamsService } from '@/services/teams';
import { useTeam as useSWRTeam, useMyTeams } from '@/hooks/teams/useTeams';
import { useSWRConfig } from 'swr';
import type { Team, TeamMember, UpdateTeamRequestDto, TeamInvitationRequestDto } from '@/types/teams';

// Team Context State
interface TeamState {
  // Current team data
  currentTeam: Team | null;
  members: TeamMember[];
  
  // Loading states
  loading: boolean;
  membersLoading: boolean;
  updating: boolean;
  
  // Error states
  error: string | null;
  membersError: string | null;
  
  // UI states
  isEditingDescription: boolean;
}

// Team Context Actions
type TeamAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_MEMBERS_LOADING'; payload: boolean }
  | { type: 'SET_UPDATING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_MEMBERS_ERROR'; payload: string | null }
  | { type: 'SET_TEAM'; payload: Team }
  | { type: 'SET_MEMBERS'; payload: TeamMember[] }
  | { type: 'ADD_MEMBER'; payload: TeamMember }
  | { type: 'UPDATE_MEMBER'; payload: { id: string; updates: Partial<TeamMember> } }
  | { type: 'REMOVE_MEMBER'; payload: string }
  | { type: 'UPDATE_TEAM'; payload: Partial<Team> }
  | { type: 'SET_EDITING_DESCRIPTION'; payload: boolean };

// Team Context Value
interface TeamContextValue {
  // State
  state: TeamState;
  
  // Team operations
  fetchTeam: (teamId: number) => Promise<void>;
  updateTeam: (teamId: number, updates: UpdateTeamRequestDto) => Promise<void>;
  updateDescription: (teamId: number, description: string) => Promise<void>;
  
  // Member operations
  fetchMembers: (teamId: number) => Promise<void>;
  inviteMember: (teamId: number, invitation: TeamInvitationRequestDto) => Promise<void>;
  removeMember: (teamId: number, memberId: number) => Promise<void>;
  
  // UI operations
  setEditingDescription: (editing: boolean) => void;
}

// Initial state
const initialState: TeamState = {
  currentTeam: null,
  members: [],
  loading: false,
  membersLoading: false,
  updating: false,
  error: null,
  membersError: null,
  isEditingDescription: false,
};

// Reducer
function teamReducer(state: TeamState, action: TeamAction): TeamState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_MEMBERS_LOADING':
      return { ...state, membersLoading: action.payload };
    case 'SET_UPDATING':
      return { ...state, updating: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_MEMBERS_ERROR':
      return { ...state, membersError: action.payload };
    case 'SET_TEAM':
      return { ...state, currentTeam: action.payload, error: null };
    case 'SET_MEMBERS':
      return { ...state, members: action.payload, membersError: null };
    case 'ADD_MEMBER':
      return { ...state, members: [...state.members, action.payload] };
    case 'UPDATE_MEMBER':
      return {
        ...state,
        members: state.members.map(member =>
          member.id === action.payload.id
            ? { ...member, ...action.payload.updates }
            : member
        )
      };
    case 'REMOVE_MEMBER':
      return {
        ...state,
        members: state.members.filter(member => member.id !== action.payload)
      };
    case 'UPDATE_TEAM':
      return {
        ...state,
        currentTeam: state.currentTeam
          ? { ...state.currentTeam, ...action.payload }
          : null
      };
    case 'SET_EDITING_DESCRIPTION':
      return { ...state, isEditingDescription: action.payload };
    default:
      return state;
  }
}

// Context
const TeamContext = createContext<TeamContextValue | undefined>(undefined);

// Provider Props
interface TeamProviderProps {
  children: React.ReactNode;
}

// Team Provider Component with SWR Integration
export function TeamProvider({ children }: TeamProviderProps) {
  const [state, dispatch] = useReducer(teamReducer, initialState);
  const { mutate } = useSWRConfig();

  // Fetch team data - now uses SWR cache
  const fetchTeam = useCallback(async (teamId: number) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      // Use SWR mutate to trigger fetch with cache
      const team = await mutate(`teams-detail-${teamId}`, () => teamsService.getTeam(teamId));
      dispatch({ type: 'SET_TEAM', payload: team });
    } catch (error) {
      console.error('Failed to fetch team:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load team data' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [mutate]);

  // Update team
  const updateTeam = useCallback(async (teamId: number, updates: UpdateTeamRequestDto) => {
    try {
      dispatch({ type: 'SET_UPDATING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const updatedTeam = await teamsService.updateTeam(teamId, updates);
      dispatch({ type: 'SET_TEAM', payload: updatedTeam });
    } catch (error) {
      console.error('Failed to update team:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update team' });
      throw error;
    } finally {
      dispatch({ type: 'SET_UPDATING', payload: false });
    }
  }, []);

  // Update team description (convenience method)
  const updateDescription = useCallback(async (teamId: number, description: string) => {
    try {
      await updateTeam(teamId, { description });
      dispatch({ type: 'SET_EDITING_DESCRIPTION', payload: false });
    } catch (error) {
      console.error('Failed to update description:', error);
      throw error;
    }
  }, [updateTeam]);

  // Fetch team members - now uses SWR cache
  const fetchMembers = useCallback(async (teamId: number) => {
    try {
      dispatch({ type: 'SET_MEMBERS_LOADING', payload: true });
      dispatch({ type: 'SET_MEMBERS_ERROR', payload: null });
      
      // Use SWR mutate to trigger fetch with cache - consistent key format
      const members = await mutate(`teams-members-${teamId}`, () => teamsService.getTeamMembers(teamId));
      dispatch({ type: 'SET_MEMBERS', payload: members });
    } catch (error) {
      console.error('Failed to fetch members:', error);
      dispatch({ type: 'SET_MEMBERS_ERROR', payload: 'Failed to load team members' });
    } finally {
      dispatch({ type: 'SET_MEMBERS_LOADING', payload: false });
    }
  }, [mutate]);

  // Invite member
  const inviteMember = useCallback(async (teamId: number, invitation: TeamInvitationRequestDto) => {
    try {
      await teamsService.inviteMemberByEmail(teamId, invitation);
      
      // Refresh members list
      await fetchMembers(teamId);
    } catch (error) {
      console.error('Failed to invite member:', error);
      throw error;
    }
  }, [fetchMembers]);

  // Remove member
  const removeMember = useCallback(async (teamId: number, memberId: number) => {
    try {
      await teamsService.removeMember(teamId, memberId);
      dispatch({ type: 'REMOVE_MEMBER', payload: memberId.toString() });
    } catch (error) {
      console.error('Failed to remove member:', error);
      throw error;
    }
  }, []);

  // Set editing description
  const setEditingDescription = useCallback((editing: boolean) => {
    dispatch({ type: 'SET_EDITING_DESCRIPTION', payload: editing });
  }, []);

  const value: TeamContextValue = {
    state,
    fetchTeam,
    updateTeam,
    updateDescription,
    fetchMembers,
    inviteMember,
    removeMember,
    setEditingDescription,
  };

  return (
    <TeamContext.Provider value={value}>
      {children}
    </TeamContext.Provider>
  );
}

// Hook to use team context
export function useTeamContext() {
  const context = useContext(TeamContext);
  if (context === undefined) {
    throw new Error('useTeamContext must be used within a TeamProvider');
  }
  return context;
}