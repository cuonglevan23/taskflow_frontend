"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Dropdown, { DropdownItem } from "@/components/ui/Dropdown/Dropdown";
import { RefreshCw, AlertCircle, Users, ChevronDown, UserMinus } from "lucide-react";
import { useProjectMembers } from "@/hooks/tasks/useProjectMembers";
import { useProject } from "../../components/DynamicProjectProvider";
import { useAuth } from "@/components/auth/AuthProvider";
import { useThemeContext } from "@/providers/ThemeProvider";
import { useLanguageContext } from "@/providers/LanguageProvider";
import UserAvatar from '@/components/ui/UserAvatar/UserAvatar';
import { toast } from 'react-hot-toast';

interface ProjectMembersProps {
  projectId: number;
}

const ProjectMembers: React.FC<ProjectMembersProps> = ({ projectId }) => {
  const { members, loading, error, refetch } = useProjectMembers(projectId);
  const { project } = useProject();
  const { user } = useAuth();
  const { theme, themeMode } = useThemeContext();
  const { messages, isLoading: languageLoading } = useLanguageContext();
  const [removingMember, setRemovingMember] = useState<number | null>(null);

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
  const membersMessages = messages?.projectOverview?.members || {};

  // Check if current user is the project owner
  const isProjectOwner = project?.currentUserRole === 'OWNER' || project?.ownerId?.toString() === user?.id;
  const currentUserId = parseInt(user?.id || '0');

  const handleRemoveMember = async (memberId: number, memberName: string) => {
    if (!isProjectOwner || memberId === currentUserId) return;

    const confirmMessage = membersMessages.removeMember?.replace('{name}', memberName) || `정말로 ${memberName}을(를) 이 프로젝트에서 제거하시겠습니까?`;
    if (!confirm(confirmMessage)) {
      return;
    }

    setRemovingMember(memberId);
    try {
      // TODO: Implement remove member API call
      // await projectMembersService.removeMemberFromProject(projectId, memberId);

      // For now, show success message and refetch
      const successMessage = membersMessages.memberRemoved?.replace('{name}', memberName) || `${memberName}이(가) 프로젝트에서 제거되었습니다`;
      toast.success(successMessage);
      await refetch();
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error(membersMessages.failedToRemove || '프로젝트에서 멤버를 제거하지 못했습니다');
    } finally {
      setRemovingMember(null);
    }
  };

  // Show loading state while language is loading
  if (languageLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-32 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (loading) {
    return (
      <Card
        className="w-full"
        style={{
          background: getThemeColor('background.secondary', '#ffffff'),
          border: `1px solid ${getThemeColor('border.default', '#e2e8f0')}`
        }}
      >
        <CardHeader>
          <CardTitle
            className="flex items-center gap-2"
            style={{ color: getThemeColor('text.primary', '#0f172a') }}
          >
            <RefreshCw
              className="h-4 w-4 animate-spin"
              style={{ color: getThemeColor('text.muted', '#64748b') }}
            />
            {membersMessages.loading || '프로젝트 멤버 로딩 중...'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse">
                <div
                  className="flex flex-col items-center p-4 rounded-lg border"
                  style={{
                    background: getThemeColor('background.primary', '#ffffff'),
                    borderColor: getThemeColor('border.default', '#e2e8f0')
                  }}
                >
                  <div
                    className="h-12 w-12 rounded-full mb-3"
                    style={{ background: getThemeColor('background.muted', '#f1f5f9') }}
                  ></div>
                  <div
                    className="h-4 rounded w-full mb-1"
                    style={{ background: getThemeColor('background.muted', '#f1f5f9') }}
                  ></div>
                  <div
                    className="h-3 rounded w-2/3"
                    style={{ background: getThemeColor('background.muted', '#f1f5f9') }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card
        className="w-full"
        style={{
          background: getThemeColor('background.secondary', '#ffffff'),
          border: `1px solid ${getThemeColor('border.default', '#e2e8f0')}`
        }}
      >
        <CardHeader>
          <CardTitle
            className="flex items-center gap-2"
            style={{ color: getThemeColor('status.error', '#ef4444') }}
          >
            <AlertCircle className="h-4 w-4" />
            {membersMessages.error || '멤버 로딩 오류'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p
            className="text-sm mb-4"
            style={{ color: getThemeColor('text.muted', '#64748b') }}
          >
            {error}
          </p>
          <Button
            onClick={refetch}
            variant="outline"
            size="sm"
            style={{
              borderColor: getThemeColor('border.default', '#e2e8f0'),
              color: getThemeColor('text.primary', '#0f172a')
            }}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            {membersMessages.tryAgain || '다시 시도'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!members || members.length === 0) {
    return (
      <Card
        className="w-full"
        style={{
          background: getThemeColor('background.secondary', '#ffffff'),
          border: `1px solid ${getThemeColor('border.default', '#e2e8f0')}`
        }}
      >
        <CardHeader>
          <CardTitle
            className="flex items-center gap-2"
            style={{ color: getThemeColor('text.primary', '#0f172a') }}
          >
            <Users
              className="h-4 w-4"
              style={{ color: getThemeColor('text.muted', '#64748b') }}
            />
            {membersMessages.title || '프로젝트 멤버'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Users
              className="h-12 w-12 mx-auto mb-2"
              style={{ color: getThemeColor('text.muted', '#9ca3af') }}
            />
            <p style={{ color: getThemeColor('text.muted', '#64748b') }}>
              {membersMessages.noMembers || '멤버가 없습니다'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className="w-full"
      style={{
        background: getThemeColor('background.secondary', '#ffffff'),
        border: `1px solid ${getThemeColor('border.default', '#e2e8f0')}`
      }}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle
          className="text-lg font-semibold flex items-center gap-2"
          style={{ color: getThemeColor('text.primary', '#0f172a') }}
        >
          <Users
            className="h-5 w-5"
            style={{ color: getThemeColor('text.muted', '#64748b') }}
          />
          {membersMessages.title || '프로젝트 멤버'}
        </CardTitle>
        <div className="flex items-center gap-2">
          <span
            className="text-sm"
            style={{ color: getThemeColor('text.muted', '#64748b') }}
          >
            {members.length} {members.length !== 1 ? (membersMessages.members || '명의 멤버') : (membersMessages.member || '명의 멤버')}
          </span>
          <Button
            onClick={refetch}
            variant="ghost"
            size="sm"
            style={{ color: getThemeColor('text.muted', '#64748b') }}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {members.map((member) => {
            const isCurrentUser = member.userId === currentUserId;
            const canRemoveMember = isProjectOwner && !isCurrentUser;
            const isBeingRemoved = removingMember === member.userId;

            return (
              <div
                key={member.userId}
                className="relative flex flex-col items-center p-4 rounded-lg border hover:shadow-md transition-all duration-200 hover:scale-105"
                style={{
                  background: getThemeColor('background.primary', '#ffffff'),
                  borderColor: getThemeColor('border.default', '#e2e8f0')
                }}
              >
                {/* Dropdown Menu - Only show for project owner and not for current user */}
                {canRemoveMember && (
                  <div className="absolute top-2 right-2">
                    <Dropdown
                      placement="bottom-right"
                      trigger={
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          style={{
                            color: getThemeColor('text.muted', '#64748b'),
                            ':hover': {
                              backgroundColor: getThemeColor('background.secondary', '#f8fafc')
                            }
                          }}
                          disabled={isBeingRemoved}
                        >
                          <ChevronDown className="h-3 w-3" />
                        </Button>
                      }
                    >
                      <DropdownItem
                        onClick={() => handleRemoveMember(member.userId, `${member.firstName} ${member.lastName}`)}
                        className="hover:bg-red-50"
                        style={{
                          color: getThemeColor('status.error', '#ef4444'),
                          ':hover': { color: '#dc2626' }
                        }}
                        disabled={isBeingRemoved}
                        icon={<UserMinus className="h-4 w-4" />}
                      >
                        {isBeingRemoved ? (membersMessages.removing || '제거 중...') : (membersMessages.removeFromProject || '프로젝트에서 제거')}
                      </DropdownItem>
                    </Dropdown>
                  </div>
                )}

                <div className="relative mb-3">
                  <UserAvatar
                    name={`${member.firstName} ${member.lastName}`}
                    email={member.email}
                    avatar={member.avatarUrl}
                    size="lg"
                  />
                  {/* Show owner badge */}
                  {member.userId === project?.ownerId && (
                    <div
                      className="absolute -bottom-1 -right-1 text-xs px-1.5 py-0.5 rounded-full font-medium"
                      style={{
                        backgroundColor: getThemeColor('status.warning', '#f59e0b'),
                        color: '#ffffff'
                      }}
                    >
                      {membersMessages.owner || 'Owner'}
                    </div>
                  )}
                </div>
                <div className="text-center w-full">
                  <p
                    className="font-medium text-sm truncate w-full"
                    style={{ color: getThemeColor('text.primary', '#0f172a') }}
                  >
                    {member.firstName} {member.lastName}
                    {isCurrentUser && (
                      <span
                        className="ml-1"
                        style={{ color: getThemeColor('status.info', '#3b82f6') }}
                      >
                        ({membersMessages.you || 'You'})
                      </span>
                    )}
                  </p>
                  <p
                    className="text-xs truncate w-full"
                    style={{ color: getThemeColor('text.muted', '#64748b') }}
                  >
                    @{member.username}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectMembers;
