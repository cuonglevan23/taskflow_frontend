"use client";

import React from "react";
import { Button, UserAvatar } from "@/components/ui";
import { useThemeContext } from "@/providers/ThemeProvider";
import { useLanguageContext } from "@/providers/LanguageProvider";

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
  const { theme } = useThemeContext();
  const { messages } = useLanguageContext();

  // Helper function to get translated text
  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = messages;
    for (const k of keys) {
      value = value?.[k];
    }
    return typeof value === 'string' ? value : key;
  };

  // Helper function to get role badge colors based on theme
  const getRoleBadgeStyle = (role: string) => {
    const baseClasses = "text-sm px-2 py-1 rounded-full";

    switch (role) {
      case 'OWNER':
        return {
          className: baseClasses,
          style: {
            backgroundColor: theme.status.info + '33', // 20% opacity
            color: theme.status.info
          }
        };
      case 'ADMIN':
      case 'LEADER':
        return {
          className: baseClasses,
          style: {
            backgroundColor: theme.status.warning + '33', // 20% opacity
            color: theme.status.warning
          }
        };
      default:
        return {
          className: baseClasses,
          style: {
            backgroundColor: theme.background.secondary,
            color: theme.text.muted
          }
        };
    }
  };

  return (
    <div className="w-full">
      {/* Table Header */}
      <div 
        className="grid grid-cols-12 border-b"
        style={{ 
          backgroundColor: theme.background.secondary,
          borderColor: theme.border.default,
          color: theme.text.secondary
        }}
      >
        <div 
          className="col-span-3 text-sm font-medium p-4 border-r"
          style={{ borderColor: theme.border.default }}
        >
          {t('common.member')}
        </div>
        <div 
          className="col-span-2 text-sm font-medium p-4 border-r"
          style={{ borderColor: theme.border.default }}
        >
          {t('profile.jobTitle')}
        </div>
        <div 
          className="col-span-2 text-sm font-medium p-4 border-r"
          style={{ borderColor: theme.border.default }}
        >
          {t('profile.department')}
        </div>
        <div 
          className="col-span-2 text-sm font-medium p-4 border-r"
          style={{ borderColor: theme.border.default }}
        >
          {t('common.role')}
        </div>
        <div 
          className="col-span-2 text-sm font-medium p-4 border-r"
          style={{ borderColor: theme.border.default }}
        >
          {t('common.joined')}
        </div>
        <div className="col-span-1 text-sm font-medium p-4">{t('common.actions')}</div>
      </div>

      {/* Table Body */}
      <div style={{ backgroundColor: theme.background.primary }}>
        {members.map((member) => {
          const initials = getInitials(member.name);
          const joinedDate = member.joinedAt ? new Date(member.joinedAt).toLocaleDateString() : t('common.notAvailable');
          const roleBadge = getRoleBadgeStyle(member.role);

          return (
            <div
              key={member.id}
              className="grid grid-cols-12 border-b transition-colors"
              style={{
                borderColor: theme.border.default
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.background.weakHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              {/* Member Column */}
              <div 
                className="col-span-3 p-4 flex items-center space-x-3 border-r"
                style={{ borderColor: theme.border.default }}
              >
                <UserAvatar 
                  name={member.name} 
                  avatar={member.avatar} 
                  size="sm"
                />
                <div>
                  <p style={{ color: theme.text.primary }} className="font-medium">
                    {member.name}
                  </p>
                  {member.email && (
                    <p style={{ color: theme.text.secondary }} className="text-xs">
                      {member.email}
                    </p>
                  )}
                </div>
              </div>

              {/* Job Title Column */}
              <div 
                className="col-span-2 p-4 flex items-center border-r"
                style={{ borderColor: theme.border.default }}
              >
                <p style={{ color: theme.text.secondary }} className="text-sm">
                  {member.jobTitle || t('common.notAvailable')}
                </p>
              </div>

              {/* Department Column */}
              <div 
                className="col-span-2 p-4 flex items-center border-r"
                style={{ borderColor: theme.border.default }}
              >
                <p style={{ color: theme.text.secondary }} className="text-sm">
                  {member.department || t('common.notAvailable')}
                </p>
              </div>

              {/* Role Column */}
              <div 
                className="col-span-2 p-4 flex items-center border-r"
                style={{ borderColor: theme.border.default }}
              >
                <span 
                  className={roleBadge.className}
                  style={roleBadge.style}
                >
                  {member.role}
                </span>
              </div>

              {/* Joined Column */}
              <div 
                className="col-span-2 p-4 flex items-center border-r"
                style={{ borderColor: theme.border.default }}
              >
                <p style={{ color: theme.text.secondary }} className="text-sm">
                  {joinedDate}
                </p>
              </div>

              {/* Action Column */}
              <div className="col-span-1 flex items-center justify-center p-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onMemberAction?.(member)}
                  className="w-8 h-8 p-0 rounded-full transition-colors"
                  style={{
                    color: theme.text.muted
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme.background.weakHover;
                    e.currentTarget.style.color = theme.text.primary;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = theme.text.muted;
                  }}
                >
                  <span className="text-lg font-light">⋯</span>
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}