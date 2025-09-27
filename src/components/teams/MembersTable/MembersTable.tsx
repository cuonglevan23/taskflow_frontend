"use client";

import React, { useState } from "react";
import { Button, UserAvatar } from "@/components/ui";
import { useThemeContext } from "@/providers/ThemeProvider";
import { useLanguageContext } from "@/providers/LanguageProvider";
import toast from "react-hot-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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
  userId?: number; // User ID for backend operations like deletion
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
  onDeleteMember?: (member: TeamMember) => void; // Add delete member handler
  currentUserRole?: string; // Add prop to determine if actions should be shown
  currentUserEmail?: string; // Add current user email to prevent self-deletion
}

export default function MembersTable({ 
  members, 
  onAddMember, 
  onMemberAction,
  onDeleteMember,
  currentUserRole,
  currentUserEmail
}: MembersTableProps) {
  const { theme } = useThemeContext();
  const { messages } = useLanguageContext();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

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

  // Check if current user has permission to perform member actions
  // OWNER and ADMIN should be able to delete members
  // LEADER might also have permission depending on your business logic
  const showActions = currentUserRole === 'OWNER' || currentUserRole === 'ADMIN' || currentUserRole === 'LEADER';


  return (
    <div className="w-full">
      {/* Table Header */}
      <div 
        className={`grid border-b ${showActions ? 'grid-cols-12' : 'grid-cols-11'}`}
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
          {t('common.jobTitle')}
        </div>
        <div 
          className="col-span-2 text-sm font-medium p-4 border-r"
          style={{ borderColor: theme.border.default }}
        >
          {t('common.department')}
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
        {showActions && (
          <div className="col-span-1 text-sm font-medium p-4">{t('common.actions')}</div>
        )}
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
              className={`grid border-b transition-colors ${showActions ? 'grid-cols-12' : 'grid-cols-11'}`}
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
                className={`col-span-2 p-4 flex items-center ${showActions ? 'border-r' : ''}`}
                style={{ borderColor: theme.border.default }}
              >
                <p style={{ color: theme.text.secondary }} className="text-sm">
                  {joinedDate}
                </p>
              </div>

              {/* Action Column */}
              {showActions && (
                <div className="col-span-1 flex items-center justify-center p-4">
                  {(() => {
                    // Check if this member is the current user
                    const isCurrentUser = member.email === currentUserEmail;

                    if (isCurrentUser) {
                      // Show disabled button for current user
                      return (
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled
                          className="w-8 h-8 p-0 rounded-full transition-colors opacity-50 cursor-not-allowed"
                          style={{
                            color: theme.text.muted
                          }}
                        >
                          <span className="text-lg font-light">⋯</span>
                        </Button>
                      );
                    }

                    // Show delete button directly without dropdown
                    return (
                      <AlertDialog open={dialogOpen && selectedMember?.id === member.id} onOpenChange={(open) => {
                        if (!open) {
                          setDialogOpen(false);
                          setSelectedMember(null);
                        }
                      }}>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-8 h-8 p-0 rounded-full transition-colors"
                            style={{
                              color: theme.status.error
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = theme.background.weakHover;
                              e.currentTarget.style.color = theme.status.error;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                              e.currentTarget.style.color = theme.status.error;
                            }}
                            onClick={() => {
                              setSelectedMember(member);
                              setDialogOpen(true);
                            }}
                          >
                            Remove Member
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent
                          style={{
                            backgroundColor: theme.background.primary,
                            borderColor: theme.border.default,
                            color: theme.text.primary
                          }}
                        >
                          <AlertDialogHeader>
                            <AlertDialogTitle style={{ color: theme.text.primary }}>
                              {t('common.confirmDelete')}
                            </AlertDialogTitle>
                            <AlertDialogDescription style={{ color: theme.text.secondary }}>
                              {`Are you sure you want to remove ${member.name} from this team? This action cannot be undone.`}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel
                              onClick={() => {
                                setDialogOpen(false);
                                setSelectedMember(null);
                              }}
                              style={{
                                backgroundColor: theme.background.secondary,
                                borderColor: theme.border.default,
                                color: theme.text.primary
                              }}
                            >
                              {t('common.cancel')}
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={async () => {
                                setDialogOpen(false);

                                // Show loading toast
                                const loadingToast = toast.loading(`Removing ${member.name} from team...`);

                                try {
                                  await onDeleteMember?.(member);
                                  // Success toast
                                  toast.success(`Successfully removed ${member.name} from the team`, {
                                    id: loadingToast,
                                  });
                                } catch (error) {
                                  console.error('Error in delete action:', error);
                                  // Error toast
                                  const errorMessage = error instanceof Error ? error.message : 'Failed to remove member from team';
                                  toast.error(errorMessage, {
                                    id: loadingToast,
                                  });
                                } finally {
                                  setSelectedMember(null);
                                }
                              }}
                              style={{
                                backgroundColor: theme.status.error,
                                color: 'white'
                              }}
                            >
                              {t('common.delete')}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    );
                  })()}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}