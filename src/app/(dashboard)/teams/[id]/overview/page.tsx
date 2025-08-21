"use client";

import React from "react";
import { useTeamContext } from "../components/DynamicTeamProvider";


export default function TeamOverviewPage() {
  const { team, loading, error } = useTeamContext();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading team overview...</div>
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

    </div>
  );
}