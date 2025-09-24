"use client";

import React, { useCallback, useMemo, useState } from "react";
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
import { SettingsContainer } from '@/components/settings';


interface ProfileLayoutProps {
  children: React.ReactNode;
}

const ProfileLayout = React.memo(({ children }: ProfileLayoutProps) => {
  const { isLoading } = useAuth();
  const [showSettingsModal, setShowSettingsModal] = useState(false);

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

  // Memoize handlers to prevent unnecessary re-renders
  const handleEditProfile = useCallback(() => {
    setShowSettingsModal(true);
  }, []);

  const handleChangeCoverPhoto = useCallback(() => {
    // Handle cover photo change
  }, []);

  // Memoize friendship component to prevent re-renders when tab changes
  const friendshipComponent = useMemo(() => {
    if (isOwnProfile) return null;

    return (
      <FriendshipActions
        friendshipStatus={friendshipStatus}
        loading={friendshipLoading}
        onFriendAction={handleFriendAction}
      />
    );
  }, [isOwnProfile, friendshipStatus, friendshipLoading, handleFriendAction]);

  // Memoize loading state check
  const isPageLoading = useMemo(() => {
    return isLoading || profileLoading || !profileData;
  }, [isLoading, profileLoading, profileData]);

  // Loading state
  if (isPageLoading) {
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
          profileData={profileData!}
          isOwnProfile={isOwnProfile || false}
          onEditProfile={handleEditProfile}
          onChangeCoverPhoto={handleChangeCoverPhoto}
          friendshipComponent={friendshipComponent}
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

      {/* Settings Modal */}
      {showSettingsModal && (
        <SettingsContainer
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
        />
      )}
    </PageLayout>
  );
});

ProfileLayout.displayName = 'ProfileLayout';

export default ProfileLayout;
