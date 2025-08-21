"use client";

import React from "react";
import { useTeamContext } from "../components/DynamicTeamProvider";

export default function TeamTasksPage() {
  const { team, loading, error } = useTeamContext();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading team tasks...</div>
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
          {team.name} - Tasks
        </h1>
        
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-4">
            Team Tasks Feature
          </div>
          <div className="text-gray-500">
            Display and manage tasks assigned to team {team.name}
          </div>
        </div>
      </div>
    </div>
  );
}