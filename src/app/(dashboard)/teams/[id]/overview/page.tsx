"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { DARK_THEME } from "@/constants/theme";
import { ACTION_ICONS } from "@/constants/icons";
import { MinimalTiptap } from '@/components/ui/shadcn-io/minimal-tiptap';
import { TeamProvider } from "@/contexts/TeamContext";
import { useTeam } from "@/hooks/useTeam";
import InviteModal, { type InviteFormData } from "@/components/modals/InviteModal";
import TeamMemberService from "@/services/teamMemberService";
import { 
  TeamHeader, 
  CuratedWork, 
  Members, 
  Goals,
  type WorkItem,
  type TeamMember 
} from "@/components/teams";
import { transformTeamMemberForMembersView } from "@/types/shared-teams";

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
    updateTeamInfo,
    saveDescription,
    addMember,
    kickMember,
    startEditingDescription,
    stopEditingDescription,
  } = useTeam(teamId);

  // Local state for description editing
  const [editingDescription, setEditingDescription] = useState("");
  
  // State for invite modal
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  // Event Handlers
  const handleDescriptionChange = async (description: string) => {
    try {
      await saveDescription(description);
      console.log('Description updated successfully');
    } catch (error) {
      console.error('Failed to update description:', error);
    }
  };

  const handleStartEditingDescription = () => {
    setEditingDescription(teamDescription);
    startEditingDescription();
  };

  const handleSaveDescription = async () => {
    await handleDescriptionChange(editingDescription);
  };

  const handleCancelEditingDescription = () => {
    setEditingDescription("");
    stopEditingDescription();
  };

  const handleCreateWork = () => {
    console.log('Create work clicked');
    // TODO: Open create work modal
  };

  const handleViewAllWork = () => {
    console.log('View all work clicked');
    // TODO: Navigate to all work page
  };

  const handleWorkItemClick = (item: WorkItem) => {
    console.log('Work item clicked:', item);
    // TODO: Open item details or navigate
  };

  const handleAddSection = () => {
    console.log('Add section clicked');
    // TODO: Add new section functionality
  };

  const handleViewAllMembers = () => {
    console.log('View all members clicked');
    // TODO: Navigate to members page
  };

  const handleAddMember = async () => {
    setIsInviteModalOpen(true);
  };

  const handleInviteSubmit = async (data: InviteFormData) => {
    try {
      // Parse emails from the form data
      const emailList = data.emails
        .split(',')
        .map(email => email.trim())
        .filter(email => email.length > 0);

      if (emailList.length === 0) {
        console.error('No valid emails to invite');
        return;
      }

      console.log(`🔄 Inviting ${emailList.length} member(s) to team ${teamId}...`);

      // Use the TeamMemberService to invite multiple members
      const result = await TeamMemberService.inviteMultipleMembers(teamId, emailList);

      // Show results summary
      if (result.successful.length > 0) {
        console.log(`✅ Successfully invited ${result.successful.length} member(s)`);
        result.successful.forEach(({ email, data }) => {
          console.log(`  - ${email}: ${data.firstName} ${data.lastName} (ID: ${data.id})`);
        });
      }
      
      if (result.failed.length > 0) {
        console.error(`❌ Failed to invite ${result.failed.length} member(s):`);
        result.failed.forEach(({ email, error }) => {
          console.error(`  - ${email}: ${error}`);
        });
        // TODO: Show error notification to user with specific errors
      }

      // Close modal if at least one invitation was successful
      if (result.successful.length > 0) {
        setIsInviteModalOpen(false);
        // TODO: Refresh members list or update local state
        // You might want to trigger a refetch of team members here
      }

      // Show summary notification
      if (result.successful.length === emailList.length) {
        console.log('🎉 All invitations sent successfully!');
        // TODO: Show success toast
      } else if (result.successful.length > 0) {
        console.log(`⚠️ ${result.successful.length}/${emailList.length} invitations sent successfully`);
        // TODO: Show partial success toast
      } else {
        console.error('💥 All invitations failed');
        // Check if it's because backend is not implemented
        const hasNotImplementedError = result.failed.some(f => 
          f.error.includes('not yet available') || f.error.includes('not implemented')
        );
        
        if (hasNotImplementedError) {
          console.error('🚧 Backend team invitation API is not implemented yet');
          // TODO: Show "feature coming soon" message
        } else {
          // TODO: Show error toast
        }
      }
      
    } catch (error) {
      console.error('Failed to process invitations:', error);
      
      // Check if it's a "not implemented" error
      const errorMessage = error instanceof Error ? error.message : '';
      if (errorMessage.includes('not yet available') || errorMessage.includes('not implemented')) {
        console.error('🚧 Team invitation feature is not ready yet');
        // TODO: Show "feature coming soon" notification
      } else {
        // TODO: Show error toast/notification
      }
    }
  };

  const handleCloseInviteModal = () => {
    setIsInviteModalOpen(false);
  };

  const handleMemberClick = (member: TeamMember) => {
    console.log('Member clicked:', member);
    // TODO: Show member profile or options
  };

  const handleRemoveMember = async (memberId: number) => {
    try {
      if (window.confirm('Are you sure you want to remove this member?')) {
        console.log(`🔄 Removing member ${memberId} from team ${teamId}...`);
        
        await TeamMemberService.removeMember({
          teamId: teamId,
          memberId: memberId
        });
        
        console.log(`✅ Successfully removed member ${memberId}`);
        // TODO: Refresh members list or update local state
      }
    } catch (error) {
      console.error('Failed to remove member:', error);
      // TODO: Show error toast/notification
    }
  };

  const handleCreateGoal = () => {
    console.log('Create goal clicked');
    // TODO: Open create goal modal
  };

  return (
    <div 
      className="min-h-screen"
      style={{ backgroundColor: DARK_THEME.background.primary }}
    >
      {/* Team Header with Cover Image */}
      <TeamHeader 
        teamId={teamId}
        teamName={teamName || "Loading..."}
        description={teamDescription || "Click to add team description..."}
        onDescriptionChange={handleDescriptionChange}
        onCreateWork={handleCreateWork}
      />

      {/* Main Content */}
      <div className="pb-8">
        {/* Main Container with proper spacing */}
        <div className="flex flex-col px-8 lg:px-16 xl:px-24 gap-4 max-w-7xl mx-auto">
          {/* Team Info Section - Full Width at Top */}
          <div className="flex flex-col items-start  gap-4 px-6">
            {/* Team Avatar - Large với positioning để overlap cover */}
            <div className="rounded-full flex items-center justify-center border-4 border-white shadow-lg bg-green-200 w-30 min-w-[120px] h-30 -mb-16 relative -top-16 -left-1 overflow-hidden">
              <span className="text-3xl font-bold text-gray-800">
                {getTeamInitials(teamName || 'Team')}
              </span>
            </div>
            
            {/* Team Info - phía dưới avatar */}
            <div className="flex flex-col items-start gap-2">
              <h1 className="text-2xl font-semibold text-white">
                {loading ? 'Loading...' : teamName || 'Team Name'}
              </h1>
              
              {/* Editable Description */}
              {!isEditingDescription ? (
                <div
                  className="text-sm cursor-pointer rounded px-2 py-1 -mx-2 transition-colors min-h-[40px] flex items-center text-gray-400 hover:text-gray-300"
                  onClick={handleStartEditingDescription}
                >
                  {teamDescription || "Click to add team description..."}
                </div>
              ) : (
                <div className="w-full">
                  <div className="box-border border border-transparent flex-grow w-full -my-1 mx-1">
                    <textarea
                      value={editingDescription}
                      onChange={(e) => setEditingDescription(e.target.value)}
                      onBlur={handleSaveDescription}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.shiftKey) {
                          return;
                        }
                        if (e.key === 'Enter') {
                          handleSaveDescription();
                        }
                        if (e.key === 'Escape') {
                          handleCancelEditingDescription();
                        }
                      }}
                      placeholder="Add team description..."
                      className="resize-none outline-none bg-transparent text-gray-300 p-2 w-full max-w-2xl h-13 box-border border-none m-0"
                      autoFocus
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Content Row: CuratedWork | Right Sidebar */}
          <div className="p-6">
            <div className="flex flex-col lg:flex-row items-start justify-center gap-4">
              {/* Left Content - CuratedWork */}
              <div className="flex-1 max-w-3xl">
                <div 
                  className="flex flex-col rounded-lg gap-2 p-4"
                  style={{ backgroundColor: '#252628' }}
                >
                  <CuratedWork 
                    onViewAllWork={handleViewAllWork}
                    onItemClick={handleWorkItemClick}
                    onAddSection={handleAddSection}
                  />
                </div>
              </div>

              {/* Right Sidebar - Aligned with CuratedWork */}
              <div className="w-full lg:w-80 flex flex-col gap-4">
                <Members 
                  members={members.map(transformTeamMemberForMembersView)}
                  totalCount={memberCount}
                  onViewAll={handleViewAllMembers}
                  onAddMember={handleAddMember}
                  onMemberClick={handleMemberClick}
                />
                
                <Goals 
                  hasGoals={false}
                  onCreateGoal={handleCreateGoal}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      <InviteModal
        isOpen={isInviteModalOpen}
        onClose={handleCloseInviteModal}
        onSubmit={handleInviteSubmit}
        showProjectSelection={false}
        modalTitle={`Invite people to ${teamName || 'team'}`}
        requireSameDomain={false}
      />
    </div>
  );
}

// Main exported component - TeamProvider now at layout level
export default function TeamOverviewPage() {
  return <TeamOverviewContent />;
}