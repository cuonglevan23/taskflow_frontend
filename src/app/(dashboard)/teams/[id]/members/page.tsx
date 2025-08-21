"use client";

import React from "react";
import { useTeamContext } from "../components/DynamicTeamProvider";
import { TeamMembers } from "../../components/TeamMembers";

export default function TeamMembersPage() {
  const { team, loading, error } = useTeamContext();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading team members...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Team not found</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          {team.name} - Members
        </h1>
        
        <TeamMembers team={team} expanded={true} />
      </div>
    </div>
  );
}