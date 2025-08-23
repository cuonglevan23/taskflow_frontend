"use client";

import React from 'react';
import { useTeamContext } from './DynamicTeamProvider';

interface TeamLayoutClientProps {
  children: React.ReactNode;
}

function TeamLayoutClient({ children }: TeamLayoutClientProps) {
  const { loading } = useTeamContext();



  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading team...</div>
      </div>
    );
  }

  return (
    <>
      {/* No header - PageLayout handles navigation */}
      {/* Tab Content - let PageLayout handle all headers */}
      <div className="h-full">
        {children}
      </div>
    </>
  );
}

export default TeamLayoutClient;