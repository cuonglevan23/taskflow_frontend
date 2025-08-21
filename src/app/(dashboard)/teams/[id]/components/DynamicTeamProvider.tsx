"use client";

import React, { createContext, useContext } from "react";
import { useTeam } from "@/hooks/teams/useTeams";
import type { TeamResponseDto } from "@/types/teams";

interface TeamContextType {
  team: TeamResponseDto | null;
  teamId: string;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

const TeamContext = createContext<TeamContextType | null>(null);

interface DynamicTeamProviderProps {
  children: React.ReactNode;
  teamId: string;
}

export function DynamicTeamProvider({ children, teamId }: DynamicTeamProviderProps) {
  const { data: team, isLoading: loading, error, mutate: refetch } = useTeam(parseInt(teamId));

  const contextValue: TeamContextType = {
    team: team || null,
    teamId,
    loading,
    error: error ? (error instanceof Error ? error.message : 'Failed to fetch team') : null,
    refetch,
  };

  return (
    <TeamContext.Provider value={contextValue}>
      {children}
    </TeamContext.Provider>
  );
}

export const useTeamContext = (): TeamContextType => {
  const context = useContext(TeamContext);
  if (!context) {
    throw new Error("useTeamContext must be used within a DynamicTeamProvider");
  }
  return context;
};