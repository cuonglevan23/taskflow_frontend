"use client";

import React, { useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { useThemeContext } from "@/providers/ThemeProvider";
import { useLanguageContext } from "@/providers/LanguageProvider";
import { useTeam } from "@/hooks/teams/useTeam";
import InviteModal, { type InviteFormData } from "@/components/modals/InviteModal";
import { teamsService } from "@/services/teams/teamsService";
import {
  TeamHeader,
  Members,
  type WorkItem,
  type TeamMember 
} from "@/components/teams";
import { transformTeamMemberForMembersView } from "@/types/shared-teams";
// ✅ ENHANCED: Use professional notification system and error handling
import { useNotify } from "@/components/ui/NotificationProvider";
import { useApiErrorHandler } from "@/hooks/error/useApiErrorHandler";

// Types for better type safety
interface InviteResult {
  successful: string[];
  failed: Array<{ email: string; error: string }>;
}

// Helper function to get team initials
const getTeamInitials = (teamName: string): string => {
  if (!teamName) return 'T';
  return teamName
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

// Team Overview Content Component
function TeamOverviewContent() {
  const params = useParams();
  const teamId = parseInt(params.id as string);

  const { theme, isLoading: themeLoading } = useThemeContext();
  const { messages } = useLanguageContext();

  // ✅ ENHANCED: Professional notification and error handling
  const notify = useNotify();
  const { handleApiError } = useApiErrorHandler();

  // Safe theme color access with fallbacks
  const getThemeColor = (colorPath: string, fallback: string = '') => {
    if (!theme) return fallback;
    const keys = colorPath.split('.');
    let value: any = theme;
    for (const key of keys) {
      value = value?.[key];
      if (!value) return fallback;
    }
    return value;
  };

  // Get translated messages from config/i18n/messages
  const teamMessages = messages?.teams || {};

  // Use team hook for all team operations
  const {
    team,
    members,
    loading,
    error,
    teamName,
    teamDescription,
    isEditingDescription,
    memberCount,
    saveDescription,
    kickMember,
    startEditingDescription,
    stopEditingDescription,
    refetch: refetchTeam, // Get refetch function from hook
  } = useTeam(teamId);

  // Local state for description editing
  const [editingDescription, setEditingDescription] = useState("");
  
  // State for invite modal and operations
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [isRemoving, setIsRemoving] = useState<number | null>(null);

  // Helper function to parse emails from different formats
  const parseEmailsFromInviteData = useCallback((data: InviteFormData): string[] => {
    let emailList: string[] = [];

    // Priority order: emailInvites > selectedUsers > emails string
    if (data.emailInvites?.length) {
      emailList = data.emailInvites;
    } else if (data.selectedUsers?.length) {
      emailList = data.selectedUsers
        .map(user => user.email)
        .filter(Boolean);
    } else if (data.emails?.trim()) {
      emailList = data.emails
        .split(',')
        .map(email => email.trim())
        .filter(Boolean);
    }

    return emailList;
  }, []);

  // Helper function for user-friendly notifications
  const showNotification = useCallback((message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    switch (type) {
      case 'success':
        notify.success(teamMessages.success || 'Thành công', message);
        break;
      case 'error':
        notify.error(teamMessages.error || 'Lỗi', message);
        break;
      case 'warning':
        notify.warning(teamMessages.warning || 'Cảnh báo', message);
        break;
    }
  }, [notify, teamMessages]);

  // Process member invitations with proper error handling
  const processInvitations = useCallback(async (emailList: string[]): Promise<InviteResult> => {
    const results: InviteResult = { successful: [], failed: [] };

    for (const email of emailList) {
      try {
        await teamsService.addMemberByEmail(teamId, { email });
        results.successful.push(email);
        console.log(`✅ Successfully added member: ${email}`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : (teamMessages.unknownError || 'Lỗi không xác định');
        results.failed.push({ email, error: errorMessage });
        console.error(`❌ Failed to add member ${email}:`, errorMessage);
      }
    }

    return results;
  }, [teamId, teamMessages]);

  // Event Handlers with proper async handling
  const handleDescriptionChange = useCallback(async (description: string) => {
    try {
      if (saveDescription) {
        await saveDescription(description);
        notify.success(
          teamMessages.descriptionUpdated || 'Đã cập nhật mô tả',
          teamMessages.descriptionUpdatedMessage || 'Mô tả nhóm đã được cập nhật thành công'
        );
      }
    } catch (error) {
      handleApiError(error, 'description update');
    }
  }, [saveDescription, notify, handleApiError, teamMessages]);

  const handleStartEditingDescription = useCallback(() => {
    setEditingDescription(teamDescription || '');
    startEditingDescription();
  }, [teamDescription, startEditingDescription]);

  const handleSaveDescription = useCallback(async () => {
    await handleDescriptionChange(editingDescription);
    stopEditingDescription();
  }, [editingDescription, handleDescriptionChange, stopEditingDescription]);

  const handleCancelEditingDescription = useCallback(() => {
    setEditingDescription("");
    stopEditingDescription();
  }, [stopEditingDescription]);

  // Work-related handlers
  const handleCreateWork = useCallback(() => {
    console.log('Create work clicked');
    // TODO: Open create work modal
  }, []);

  const handleViewAllWork = useCallback(() => {
    console.log('View all work clicked');
    // TODO: Navigate to all work page
  }, []);

  const handleWorkItemClick = useCallback((item: WorkItem) => {
    console.log('Work item clicked:', item);
    // TODO: Open item details or navigate
  }, []);

  const handleAddSection = useCallback(() => {
    console.log('Add section clicked');
    // TODO: Add new section functionality
  }, []);

  // Member-related handlers
  const handleViewAllMembers = useCallback(() => {
    console.log('View all members clicked');
    // TODO: Navigate to members page
  }, []);

  const handleAddMember = useCallback(() => {
    setIsInviteModalOpen(true);
  }, []);

  // Enhanced invite submit with proper error handling
  const handleInviteSubmit = useCallback(async (data: InviteFormData) => {
    if (isInviting) return; // Prevent double submission

    try {
      setIsInviting(true);
      console.log('📥 Processing invite data:', data);

      const emailList = parseEmailsFromInviteData(data);

      if (emailList.length === 0) {
        notify.warning(
          teamMessages.invalidInput || 'Đầu vào không hợp lệ',
          teamMessages.enterValidEmail || 'Vui lòng nhập ít nhất một địa chỉ email hợp lệ hoặc chọn người dùng'
        );
        return;
      }

      console.log(`🔄 Adding ${emailList.length} member(s) to team ${teamId}...`);

      const results = await processInvitations(emailList);

      // Handle notification based on results
      if (results.successful.length > 0 && results.failed.length === 0) {
        // All successful
        const successMessage = results.successful.length === 1
          ? teamMessages.memberAddedSuccess?.replace('{email}', results.successful[0]) || `Đã thêm thành viên ${results.successful[0]} thành công`
          : teamMessages.membersAddedSuccess?.replace('{count}', results.successful.length.toString()) || `Đã thêm ${results.successful.length} thành viên thành công`;

        showNotification(successMessage, 'success');
      } else if (results.successful.length > 0 && results.failed.length > 0) {
        // Partial success
        const partialMessage = teamMessages.partialSuccess?.replace('{successful}', results.successful.length.toString()).replace('{failed}', results.failed.length.toString()) ||
          `Đã thêm ${results.successful.length} thành viên thành công, ${results.failed.length} thất bại`;
        showNotification(partialMessage, 'warning');
      } else {
        // All failed
        const failureMessage = teamMessages.allMembersFailed || 'Không thể thêm thành viên nào';
        showNotification(failureMessage, 'error');
      }

      // Close modal and refresh team data
      setIsInviteModalOpen(false);
      if (refetchTeam) {
        await refetchTeam(); // Refresh team data to show new members
      }

    } catch (error) {
      console.error('❌ Invite submission error:', error);
      handleApiError(error, 'member invitation');
    } finally {
      setIsInviting(false);
    }
  }, [isInviting, parseEmailsFromInviteData, notify, teamMessages, teamId, processInvitations, showNotification, refetchTeam, handleApiError]);

  const handleRemoveMember = useCallback(async (member: TeamMember) => {
    if (isRemoving) return; // Prevent multiple removals

    const confirmMessage = teamMessages.confirmRemoveMember?.replace('{name}', member.name) ||
      `Bạn có chắc chắn muốn xóa ${member.name} khỏi nhóm này không?`;

    if (!confirm(confirmMessage)) return;

    try {
      setIsRemoving(member.id);
      if (kickMember) {
        await kickMember(member.id);

        const successMessage = teamMessages.memberRemovedSuccess?.replace('{name}', member.name) ||
          `Đã xóa ${member.name} khỏi nhóm thành công`;
        showNotification(successMessage, 'success');

        if (refetchTeam) {
          await refetchTeam(); // Refresh team data
        }
      }
    } catch (error) {
      console.error('❌ Remove member error:', error);
      handleApiError(error, 'member removal');
    } finally {
      setIsRemoving(null);
    }
  }, [isRemoving, kickMember, showNotification, refetchTeam, handleApiError, teamMessages]);

  // Goals-related handlers
  const handleViewAllGoals = useCallback(() => {
    console.log('View all goals clicked');
    // TODO: Navigate to goals page
  }, []);

  const handleCreateGoal = useCallback(() => {
    console.log('Create goal clicked');
    // TODO: Open create goal modal
  }, []);

  // Show loading state while theme is loading
  if (themeLoading) {
    return (
      <div className="min-h-screen animate-pulse">
        <div className="h-full bg-gray-200"></div>
      </div>
    );
  }

  // Main loading state
  if (loading) {
    return (
      <div
        className="min-h-screen p-4"
        style={{ backgroundColor: getThemeColor('background.primary', '#ffffff') }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div
                className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4"
                style={{ borderColor: getThemeColor('status.info', '#3b82f6') }}
              ></div>
              <div
                style={{ color: getThemeColor('text.muted', '#64748b') }}
              >
                {teamMessages.loading || 'Đang tải thông tin nhóm...'}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        className="min-h-screen p-4"
        style={{ backgroundColor: getThemeColor('background.primary', '#ffffff') }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div
                className="text-6xl mb-4"
                style={{ color: getThemeColor('status.error', '#ef4444') }}
              >
                ⚠️
              </div>
              <div
                className="text-lg mb-2"
                style={{ color: getThemeColor('status.error', '#ef4444') }}
              >
                {teamMessages.errorLoading || 'Không thể tải thông tin nhóm'}
              </div>
              <div
                className="text-sm"
                style={{ color: getThemeColor('text.muted', '#64748b') }}
              >
                {error}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div
        className="min-h-screen p-4"
        style={{ backgroundColor: getThemeColor('background.primary', '#ffffff') }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div
                style={{ color: getThemeColor('text.muted', '#64748b') }}
              >
                {teamMessages.teamNotFound || 'Không tìm thấy nhóm'}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Transform team members for the Members component
  const transformedMembers = members?.map(transformTeamMemberForMembersView) || [];

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: getThemeColor('background.primary', '#ffffff') }}
    >
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Team Header */}
        <TeamHeader
          teamName={teamName}
          teamDescription={teamDescription}
          memberCount={memberCount}
          isEditingDescription={isEditingDescription}
          editingDescription={editingDescription}
          onDescriptionChange={setEditingDescription}
          onStartEditingDescription={handleStartEditingDescription}
          onSaveDescription={handleSaveDescription}
          onCancelEditingDescription={handleCancelEditingDescription}
          teamInitials={getTeamInitials(teamName)}
        />

        {/* Main Content Grid */}
        <div className="max-w-7xl mx-auto p-6 space-y-8">

            <Members
              members={transformedMembers}
              memberCount={memberCount}
              onViewAllMembers={handleViewAllMembers}
              onAddMember={handleAddMember}
              onRemoveMember={handleRemoveMember}
              isRemoving={isRemoving}
            />

        </div>

        {/* Invite Modal */}
        <InviteModal
          isOpen={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
          onSubmit={handleInviteSubmit}
          isLoading={isInviting}
          title={teamMessages.inviteMembers || 'Mời thành viên'}
          type="team"
        />
      </div>
    </div>
  );
}

// Main component export
export default function TeamOverview() {
  return <TeamOverviewContent />;
}