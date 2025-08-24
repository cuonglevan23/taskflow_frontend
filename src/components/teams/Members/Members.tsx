"use client";

import React from "react";
import { BaseCard, Avatar } from "@/components/ui";
import { ACTION_ICONS } from "@/constants/icons";

export interface TeamMember {
  id: string;
  name: string;
  avatar?: string;
  avatarUrl?: string;
  color?: string;
  email?: string;
  role?: string;
}

interface MembersProps {
  members?: TeamMember[];
  totalCount?: number;
  onViewAll?: () => void;
  onAddMember?: () => void;
  onMemberClick?: (member: TeamMember) => void;
}

const defaultMembers: TeamMember[] = [
  { id: "1", name: "C2", avatar: "C2", color: "#FF6B6B" },
  { id: "2", name: "LC", avatar: "LC", color: "#9C88FF" },
  { id: "3", name: "CU", avatar: "CU", color: "#FFD93D" },
];

const Members = ({ 
  members = defaultMembers, 
  totalCount = 3,
  onViewAll, 
  onAddMember,
  onMemberClick 
}: MembersProps) => {
  
  const handleViewAll = () => {
    onViewAll?.();
  };

  return (
    <BaseCard
      title="Members"
      showMoreButton={{
        label: `View all ${totalCount}`,
        onClick: handleViewAll
      }}
    >
      <div className="flex items-center gap-3 flex-wrap">
        {/* Member Avatars */}
        {members.map((member) => (
          <Avatar
            key={`${member.id}-${member.name}`}
            name={member.name}
            src={member.avatarUrl}
            size="md"
            style={{ backgroundColor: member.color }}
            className="cursor-pointer hover:scale-105 transition-transform"
            onClick={() => onMemberClick?.(member)}
          />
        ))}
        
        {/* Add Member Button */}
        <div 
          className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer hover:scale-105 transition-transform border-2 border-dashed"
          style={{ 
            backgroundColor: 'transparent',
            borderColor: '#6B7280',
            color: '#6B7280'
          }}
          onClick={onAddMember}
        >
          <ACTION_ICONS.create className="w-4 h-4" />
        </div>
      </div>
    </BaseCard>
  );
};

export default Members;