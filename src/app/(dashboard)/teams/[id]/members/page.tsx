"use client";

import React, { useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import { useOptimizedSession } from '@/hooks/useOptimizedSession'; // Tối ưu session
import { DARK_THEME } from "@/constants/theme";
import { MembersHeader, MembersTable } from "@/components/teams";
import { useTeam } from "@/hooks/useTeam";
import { transformTeamMemberForMembersTable, type MembersTableData } from "@/types/shared-teams";

const TeamMembersPage = React.memo(() => {
  const params = useParams();
  const { data: session } = useOptimizedSession(); // Sử dụng session tối ưu
  const teamId = useMemo(() => {
    const id = params.id as string;
    return parseInt(id, 10);
  }, [params.id]);
  
  // Use TeamContext for real data with automatic fetching
  const {
    team,
    members,
    membersLoading,
    membersError,
    refresh
  } = useTeam(teamId);

  // Memoized handlers to prevent unnecessary re-renders
  const handleAddMember = useCallback(() => {
    // TODO: Open add member modal or navigate to invite page
  }, []);

  const handleSendFeedback = useCallback(() => {
    // TODO: Open feedback form or modal
  }, []);

  const handleSearch = useCallback(() => {
    // TODO: Open search functionality
  }, []);

  // Transform members data to match the expected format
  const transformedMembers: MembersTableData[] = useMemo(() => {
    if (!members || !team || !session?.user) return [];
    
    return members.map(transformTeamMemberForMembersTable);
  }, [members, team, session?.user]);

  // Debug logs
  console.log('Team data:', team);
  console.log('Original members:', members);
  console.log('Current user role from team:', team?.currentUserRole);
  console.log('Transformed members:', transformedMembers);
  console.log('Loading state:', membersLoading);

  // Handle loading and error states
  if (membersError) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: DARK_THEME.background.primary }}
      >
        <div className="text-center">
          <p className="text-red-400 mb-4">Error loading team members: {membersError}</p>
          <button 
            onClick={refresh}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen"
      style={{ backgroundColor: DARK_THEME.background.primary }}
    >
      {/* Page Header */}
      <MembersHeader
        onAddMember={handleAddMember}
        onSendFeedback={handleSendFeedback}
        onSearch={handleSearch}
      />

      {/* Members Table */}
      <div className="px-6 pb-6">
        <div 
          className="rounded-lg border overflow-hidden"
          style={{ 
            backgroundColor: DARK_THEME.background.secondary,
            borderColor: DARK_THEME.border.default 
          }}
        >
          {membersLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-400">Loading team members...</div>
            </div>
          ) : (
            <MembersTable
              members={transformedMembers}
              onAddMember={handleAddMember}
            />
          )}
        </div>
      </div>
    </div>
  );
});

TeamMembersPage.displayName = 'TeamMembersPage';

export default TeamMembersPage;