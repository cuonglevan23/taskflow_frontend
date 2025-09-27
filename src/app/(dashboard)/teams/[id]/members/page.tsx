"use client";

import React, { useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import { useAuth } from '@/components/auth/AuthProvider'; // Use new auth system
import { useThemeContext } from "@/providers/ThemeProvider";
import { useLanguageContext } from "@/providers/LanguageProvider";
import { MembersHeader, MembersTable } from "@/components/teams";
import { useTeam } from "@/hooks/teams/useTeam";
import { transformTeamMemberForMembersTable, type MembersTableData } from "@/types/shared-teams";

const TeamMembersPage = React.memo(() => {
  const params = useParams();
  const { user, isLoading: authLoading } = useAuth(); // Use new auth system
  const { theme } = useThemeContext();
  const { messages } = useLanguageContext();

  const teamId = useMemo(() => {
    const id = params.id as string;
    return parseInt(id, 10);
  }, [params.id]);
  
  // Helper function to get translated text
  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = messages;
    for (const k of keys) {
      value = value?.[k];
    }
    return typeof value === 'string' ? value : key;
  };

  // Use TeamContext for real data with automatic fetching
  const {
    team,
    members,
    membersLoading,
    membersError,
    refresh,
    currentUserRole,
    kickMember
  } = useTeam(teamId);

  // Memoized handlers to prevent unnecessary re-renders
  const handleAddMember = useCallback(() => {
    // TODO: Open add member modal or navigate to invite page
  }, []);

  const handleDeleteMember = useCallback(async (member: any) => {
    try {
      // Log để debug
      console.log('Attempting to delete member:', member);

      // Kiểm tra có ID không
      const memberId = member.userId || member.id;
      if (!memberId) {
        console.error('Member ID is required for deletion. Member data:', member);
        // TODO: Show error notification to user
        return;
      }

      console.log('Using member ID for deletion:', memberId);

      if (kickMember) {
        await kickMember(memberId);
        console.log('Member deleted successfully');
      }

      // Refresh the members list after deletion
      if (refresh) {
        await refresh();
      }
    } catch (error) {
      console.error('Failed to delete member:', error);
      // TODO: Show error notification to user
    }
  }, [kickMember, refresh]);

  const handleSendFeedback = useCallback(() => {
    // TODO: Open feedback form or modal
  }, []);

  const handleSearch = useCallback(() => {
    // TODO: Open search functionality
  }, []);

  // Transform members data to match the expected format
  const transformedMembers: MembersTableData[] = useMemo(() => {
    if (!members || !team || !user) return [];

    return members.map(transformTeamMemberForMembersTable);
  }, [members, team, user]);


  // Handle loading and error states
  if (membersError) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: theme.background.primary }}
      >
        <div className="text-center">
          <p
            className="mb-4"
            style={{ color: theme.status.error }}
          >
            {t('teams.members.error.loading')}: {membersError}
          </p>
          <button
            onClick={refresh}
            className="px-4 py-2 rounded transition-colors"
            style={{
              backgroundColor: theme.status.info,
              color: theme.text.inverse
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.background.weakHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme.status.info;
            }}
          >
            {t('common.actions.retry')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen"
      style={{ backgroundColor: theme.background.primary }}
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
            backgroundColor: theme.background.secondary,
            borderColor: theme.border.default
          }}
        >
          {membersLoading ? (
            <div className="flex items-center justify-center py-12">
              <div style={{ color: theme.text.muted }}>
                {t('teams.members.loading')}
              </div>
            </div>
          ) : (
            <MembersTable
              members={transformedMembers}
              onAddMember={handleAddMember}
              onDeleteMember={handleDeleteMember}
              currentUserRole={currentUserRole}
              currentUserEmail={user?.email}
            />
          )}
        </div>
      </div>
    </div>
  );
});

TeamMembersPage.displayName = 'TeamMembersPage';

export default TeamMembersPage;