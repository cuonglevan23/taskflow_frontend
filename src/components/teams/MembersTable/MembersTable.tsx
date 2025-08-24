"use client";

import React from "react";
import { Button, UserAvatar } from "@/components/ui";
import { DARK_THEME } from "@/constants/theme";

// Helper function to get initials from name
const getInitials = (name: string): string => {
  if (!name) return 'U';
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

// TeamMember interface for the table
export interface TeamMember {
  id: number;
  userId?: number;
  name: string;
  email?: string;
  role: string; // Allow any role string from backend
  status: 'ACTIVE' | 'PENDING' | 'INACTIVE';
  joinedAt?: string;
  department?: string;
  aboutMe?: string;
  jobTitle?: string;
  avatar?: string;
}

export interface MembersTableProps {
  members: TeamMember[];
  onAddMember: () => void;
  onMemberAction?: (member: TeamMember) => void;
}

export default function MembersTable({ 
  members, 
  onAddMember, 
  onMemberAction 
}: MembersTableProps) {
  return (
    <div className="w-full">
      {/* Table Header */}
      <div 
        className="grid grid-cols-12 border-b"
        style={{ 
          backgroundColor: DARK_THEME.background.secondary,
          borderColor: DARK_THEME.border.default,
          color: DARK_THEME.text.secondary 
        }}
      >
        <div 
          className="col-span-3 text-sm font-medium p-4 border-r"
          style={{ borderColor: DARK_THEME.border.default }}
        >
          Member
        </div>
        <div 
          className="col-span-2 text-sm font-medium p-4 border-r"
          style={{ borderColor: DARK_THEME.border.default }}
        >
          Job Title
        </div>
        <div 
          className="col-span-2 text-sm font-medium p-4 border-r"
          style={{ borderColor: DARK_THEME.border.default }}
        >
          Department
        </div>
        <div 
          className="col-span-2 text-sm font-medium p-4 border-r"
          style={{ borderColor: DARK_THEME.border.default }}
        >
          Role
        </div>
        <div 
          className="col-span-2 text-sm font-medium p-4 border-r"
          style={{ borderColor: DARK_THEME.border.default }}
        >
          Joined
        </div>
        <div className="col-span-1 text-sm font-medium p-4">Actions</div>
      </div>

      {/* Table Body */}
      <div style={{ backgroundColor: DARK_THEME.background.primary }}>
        {members.map((member) => {
          const initials = getInitials(member.name);
          const joinedDate = member.joinedAt ? new Date(member.joinedAt).toLocaleDateString() : 'N/A';
          
          return (
            <div
              key={member.id}
              className="grid grid-cols-12 border-b hover:bg-opacity-10 hover:bg-gray-500 transition-colors"
              style={{ borderColor: DARK_THEME.border.default }}
            >
              {/* Member Column */}
              <div 
                className="col-span-3 p-4 flex items-center space-x-3 border-r"
                style={{ borderColor: DARK_THEME.border.default }}
              >
                <UserAvatar 
                  name={member.name} 
                  avatar={member.avatar} 
                  size="sm"
                />
                <div>
                  <p style={{ color: DARK_THEME.text.primary }} className="font-medium">
                    {member.name}
                  </p>
                  {member.email && (
                    <p style={{ color: DARK_THEME.text.secondary }} className="text-xs">
                      {member.email}
                    </p>
                  )}
                </div>
              </div>

              {/* Job Title Column */}
              <div 
                className="col-span-2 p-4 flex items-center border-r"
                style={{ borderColor: DARK_THEME.border.default }}
              >
                <p style={{ color: DARK_THEME.text.secondary }} className="text-sm">
                  {member.jobTitle || 'N/A'}
                </p>
              </div>

              {/* Department Column */}
              <div 
                className="col-span-2 p-4 flex items-center border-r"
                style={{ borderColor: DARK_THEME.border.default }}
              >
                <p style={{ color: DARK_THEME.text.secondary }} className="text-sm">
                  {member.department || 'N/A'}
                </p>
              </div>

              {/* Role Column */}
              <div 
                className="col-span-2 p-4 flex items-center border-r"
                style={{ borderColor: DARK_THEME.border.default }}
              >
                <span 
                  className={`text-sm px-2 py-1 rounded-full ${
                    member.role === 'OWNER' ? 'bg-blue-500 bg-opacity-20 text-blue-400' : 
                    member.role === 'ADMIN' || member.role === 'LEADER' ? 'bg-purple-500 bg-opacity-20 text-purple-400' :
                    'bg-gray-500 bg-opacity-20 text-gray-400'
                  }`}
                >
                  {member.role}
                </span>
              </div>

              {/* Joined Column */}
              <div 
                className="col-span-2 p-4 flex items-center border-r"
                style={{ borderColor: DARK_THEME.border.default }}
              >
                <p style={{ color: DARK_THEME.text.secondary }} className="text-sm">
                  {joinedDate}
                </p>
              </div>

              {/* Action Column */}
              <div className="col-span-1 flex items-center justify-center p-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onMemberAction?.(member)}
                  className="w-8 h-8 p-0 rounded-full hover:bg-gray-700"
                >
                  <span className="text-lg font-light" style={{ color: DARK_THEME.text.muted }}>⋯</span>
                </Button>
              </div>
            </div>
          );
        })}
      </div>

     
    </div>
  );
}