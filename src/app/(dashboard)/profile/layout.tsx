"use client";

import React from "react";
import PageLayout from "@/layouts/page/PageLayout";
import { useAuth } from '@/components/auth/AuthProvider';
import { useProfile, useFriendship, useProfileTabs } from '@/hooks/profile';
import {
  ProfileHeader,
  FriendshipActions,
  ProfileTabs,
  ProfileSkeleton
} from '@/components/profile';
import { ChatManager } from '@/components/chat';


interface ProfileLayoutProps {
  children: React.ReactNode;
}

const ProfileLayout = ({ children }: ProfileLayoutProps) => {
  const { isLoading } = useAuth();

  // Use custom hooks for modular logic
  const {
    profileData,
    loading: profileLoading,
    isOwnProfile,
    userId
  } = useProfile();

  const {
    friendshipStatus,
    loading: friendshipLoading,
    handleFriendAction
  } = useFriendship(profileData, isOwnProfile || false);

  const {
    activeTab,
    tabs,
    handleTabChange
  } = useProfileTabs(profileData, isOwnProfile || false, userId);

  // Handle profile actions
  const handleEditProfile = () => {
    console.log("Edit profile");
  };

  const handleChangeCoverPhoto = () => {
    console.log("Change cover photo");
  };

  // Loading state
  if (isLoading || profileLoading || !profileData) {
    return (
      <PageLayout>
        <ProfileSkeleton />
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
        {/* Profile Header */}
        <ProfileHeader
          profileData={profileData}
          isOwnProfile={isOwnProfile || false}
          onEditProfile={handleEditProfile}
          onChangeCoverPhoto={handleChangeCoverPhoto}
          friendshipComponent={
            !isOwnProfile && (
              <FriendshipActions
                friendshipStatus={friendshipStatus}
                loading={friendshipLoading}
                onFriendAction={handleFriendAction}
              />
            )
          }
        />

        {/* Navigation Tabs */}
        <ProfileTabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />

        {/* Page Content */}
        <div className="flex-1 overflow-auto bg-gradient-to-b from-transparent to-black/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            {children}
          </div>
        </div>
      </div>

      {/* Chat Manager - Renders all open chat windows */}
      <ChatManager />


    </PageLayout>
  );
};

export default ProfileLayout;
