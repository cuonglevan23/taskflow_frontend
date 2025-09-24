import React, { useMemo } from 'react';
import Image from 'next/image';
import Button from '@/components/ui/Button/Button';
import UserAvatar from '@/components/ui/UserAvatar/UserAvatar';
import { useThemeContext } from "@/providers/ThemeProvider";
import { useLanguageContext } from "@/providers/LanguageProvider";
import { Camera, Edit3, Check } from 'lucide-react';
import { ProfileData } from '@/types/profile';
import { ChatIcon } from '@/components/chat';
import { useChatContext } from '@/contexts/ChatContext';

interface ProfileHeaderProps {
  profileData: ProfileData;
  isOwnProfile: boolean;
  onEditProfile?: () => void;
  onChangeCoverPhoto?: () => void;
  friendshipComponent?: React.ReactNode;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profileData,
  isOwnProfile,
  onEditProfile,
  onChangeCoverPhoto,
  friendshipComponent
}) => {
  const { openChatWindow } = useChatContext();
  const { theme } = useThemeContext();
  const { messages } = useLanguageContext();

  // Generate avatar background for Facebook-like effect
  const avatarBackgroundUrl = useMemo(() => {
    if (profileData?.avatarUrl) {
      return profileData.avatarUrl;
    }
    const fullName = `${profileData.firstName} ${profileData.lastName}`;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&size=400&background=6366f1&color=ffffff&format=png`;
  }, [profileData?.avatarUrl, profileData?.firstName, profileData?.lastName]);

  const handleChatClick = () => {
    if (!isOwnProfile) {
      openChatWindow({
        id: profileData.id,
        name: `${profileData.firstName} ${profileData.lastName}`,
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        email: profileData.email,
        avatarUrl: profileData.avatarUrl || undefined,
        isOnline: profileData.isOnline || false
      });
    }
  };

  // Format last seen date based on current language
  const formatLastSeen = (lastSeen: string) => {
    const date = new Date(lastSeen);
    // Use appropriate locale based on current language
    const locale = messages.chat?.lastSeen ? 'vi-VN' : 'en-US';
    return date.toLocaleString(locale);
  };

  // Get online status text based on language and context
  const getOnlineStatusText = () => {
    if (isOwnProfile) {
      return profileData.isOnline
        ? `${messages.you || 'You'} ${profileData.onlineStatus || messages.chat?.status?.online || 'online'}`
        : `${messages.you || 'You'} ${messages.chat?.status?.offline || 'offline'}`;
    } else {
      return profileData.isOnline
        ? (profileData.onlineStatus || messages.chat?.status?.online || 'Online')
        : (messages.chat?.status?.offline || 'Offline');
    }
  };

  return (
    <div className="relative">
      {/* Facebook-style Cover Photo with Avatar Background */}
      <div className="h-48 sm:h-56 md:h-64 lg:h-72 w-full relative overflow-hidden">
        {/* Avatar Background Layer (Facebook-like effect) */}
        <div className="absolute inset-0 z-0">
          <Image
            src={avatarBackgroundUrl}
            alt="Avatar background"
            fill
            className="object-cover scale-110 blur-2xl opacity-60"
            style={{
              filter: 'blur(20px) brightness(0.7) saturate(1.2)',
            }}
          />
          {/* Gradient overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/50"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-blue-800/30"></div>
        </div>

        {/* Cover Photo Layer */}
        {profileData.coverImageUrl ? (
          <div className="absolute inset-0 z-10">
            <Image
              src={profileData.coverImageUrl}
              alt="Cover photo"
              fill
              className="object-cover"
              priority
            />
          </div>
        ) : (
          /* Fallback gradient when no cover photo */
          <div className="absolute inset-0 z-10 bg-gradient-to-br from-blue-600/40 via-purple-600/40 to-blue-800/40"></div>
        )}
      </div>

      {/* Profile Info */}
      <div
        className="relative px-4 sm:px-6 pb-4 sm:pb-6"
        style={{ backgroundColor: theme.background.primary }}
      >
        <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-end sm:justify-between -mt-12 sm:-mt-16 relative z-10">
          {/* Avatar and Basic Info */}
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6">
            {/* Enhanced Avatar with Facebook-like styling */}
            <div className="relative self-center sm:self-auto">
              <div className="relative">
                {/* Avatar glow effect */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400/20 to-purple-600/20 blur-xl scale-110 animate-pulse"></div>

                <UserAvatar
                  name={`${profileData.firstName} ${profileData.lastName}`}
                  avatar={profileData.avatarUrl || undefined}
                  size="2xl"
                  variant="circle"
                  className="profile-avatar-responsive shadow-2xl border-4 ring-4 ring-white/20 transition-all duration-300 hover:scale-105 hover:ring-white/30 relative z-10"
                  style={{ borderColor: theme.background.primary }}
                  fallbackColor={theme.status.info}
                />

                {/* Online Status Indicator */}
                <div className="absolute bottom-2 right-2 z-20">
                  <div
                    className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full border-3 sm:border-4 transition-all duration-300 ${
                      profileData.isOnline 
                        ? 'shadow-lg' 
                        : 'shadow-lg'
                    }`}
                    style={{
                      backgroundColor: profileData.isOnline ? theme.status.success : theme.text.muted,
                      borderColor: theme.background.primary,
                      boxShadow: profileData.isOnline ? `0 0 20px ${theme.status.success}30` : undefined
                    }}
                    title={getOnlineStatusText()}
                  >
                    {/* Inner dot với animation khi online */}
                    <div
                      className={`w-full h-full rounded-full ${
                        profileData.isOnline ? 'animate-pulse' : ''
                      }`}
                      style={{
                        backgroundColor: profileData.isOnline ? theme.status.success : theme.text.muted
                      }}
                    />
                  </div>

                  {/* Last seen indicator cho offline users */}
                  {!profileData.isOnline && profileData.lastSeen && (
                    <div
                      className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                      style={{
                        backgroundColor: `${theme.background.secondary}ee`,
                        color: theme.text.primary
                      }}
                    >
                      {formatLastSeen(profileData.lastSeen)}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1 text-center sm:text-left sm:mb-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-8">
                <h1
                  className="text-2xl sm:text-3xl lg:text-4xl font-bold"
                  style={{ color: theme.text.primary }}
                >
                  {profileData.firstName} {profileData.lastName}
                </h1>

                {/* Premium Badge next to name */}
                {profileData.isPremium && (
                  <div
                    className="flex items-center justify-center w-5 h-5 rounded-full shadow-md border border-white"
                    style={{ backgroundColor: theme.status.info }}
                    title={messages.premium || 'Premium'}
                  >
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>

              {/* Email */}
              {profileData.email && (
                <p
                  className="text-sm sm:text-base mb-2"
                  style={{ color: theme.text.secondary }}
                >
                  {profileData.email}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-center sm:justify-end gap-2 sm:gap-3 mt-2 sm:mt-0">
            {isOwnProfile ? (
              // Show edit profile button for own profile
              <Button
                variant="primary"
                size="sm"
                className="text-xs sm:text-sm px-3 sm:px-4 py-2 transition-colors duration-200"
                onClick={onEditProfile}
              >
                <Edit3 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                {messages.profile?.editPost || messages.userMenu?.profile || 'Edit profile'}
              </Button>
            ) : (
              // Show friendship actions and chat button for other users
              <div className="flex items-center gap-2">
                {friendshipComponent}
                <ChatIcon
                  user={{
                    id: profileData.id,
                    name: `${profileData.firstName} ${profileData.lastName}`,
                    firstName: profileData.firstName,
                    lastName: profileData.lastName,
                    email: profileData.email,
                    avatarUrl: profileData.avatarUrl || undefined,
                    isOnline: profileData.isOnline || false
                  }}
                  onClick={handleChatClick}
                  isOnline={profileData.isOnline || false}
                  size="md"
                  variant="button"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
