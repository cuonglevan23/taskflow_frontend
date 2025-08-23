"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { DARK_THEME } from "@/constants/theme";
import { ACTION_ICONS } from "@/constants/icons";
import { MinimalTiptap } from '@/components/ui/shadcn-io/minimal-tiptap';
import { TeamProvider } from "@/contexts/TeamContext";
import { useTeam } from "@/hooks/useTeam";
import { 
  TeamHeader, 
  CuratedWork, 
  Members, 
  Goals,
  type WorkItem,
  type TeamMember 
} from "@/components/teams";

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
    try {
      const email = prompt('Enter member email:');
      if (email) {
        await addMember(email);
        console.log('Member invited successfully');
      }
    } catch (error) {
      console.error('Failed to invite member:', error);
    }
  };

  const handleMemberClick = (member: TeamMember) => {
    console.log('Member clicked:', member);
    // TODO: Show member profile or options
  };

  const handleRemoveMember = async (memberId: number) => {
    try {
      if (window.confirm('Are you sure you want to remove this member?')) {
        await kickMember(memberId);
        console.log('Member removed successfully');
      }
    } catch (error) {
      console.error('Failed to remove member:', error);
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
                  members={members.map(member => ({
                    id: member.id.toString(),
                    name: member.user?.name || member.userName || 'Unknown',
                    avatar: (member.user?.name || member.userName || 'U').substring(0, 2).toUpperCase(),
                    color: member.user?.color || '#6B7280',
                    email: member.user?.email || member.userEmail,
                    role: member.role
                  }))}
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
    </div>
  );
}

// Main exported component - TeamProvider now at layout level
export default function TeamOverviewPage() {
  return <TeamOverviewContent />;
}