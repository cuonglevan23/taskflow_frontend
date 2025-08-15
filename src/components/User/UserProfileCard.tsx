"use client";

import React, { useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui';
import { useTheme } from '@/layouts/hooks/useTheme';
import { User, Settings, Camera, Mail } from 'lucide-react';

/**
 * Example component demonstrating UserContext usage
 * Shows how to access user data, permissions, and actions
 */
export const UserProfileCard: React.FC = () => {
  const { theme } = useTheme();
  const {
    user,
    isLoading,
    error,
    updateProfile,
    updatePreferences,
    updateAvatar,
    canAccessManager,
    canAccessAdmin,
    hasRole,
    refreshUser,
  } = useUser();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');

  // Handle profile update
  const handleUpdateProfile = async () => {
    try {
      await updateProfile({ name });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  // Handle preference update
  const handleToggleNotifications = async () => {
    try {
      const currentValue = user?.preferences?.emailNotifications ?? true;
      await updatePreferences({ emailNotifications: !currentValue });
    } catch (error) {
      console.error('Failed to update preferences:', error);
    }
  };

  // Handle avatar upload
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        await updateAvatar(file);
      } catch (error) {
        console.error('Failed to update avatar:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div 
        className="p-6 rounded-lg border"
        style={{ 
          backgroundColor: theme.background.secondary,
          borderColor: theme.border.default 
        }}
      >
        <div className="animate-pulse">
          <div className="w-16 h-16 bg-gray-300 rounded-full mb-4"></div>
          <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className="p-6 rounded-lg border border-red-200"
        style={{ backgroundColor: theme.background.secondary }}
      >
        <p className="text-red-600">Error: {error}</p>
        <Button onClick={refreshUser} className="mt-2">
          Retry
        </Button>
      </div>
    );
  }

  if (!user) {
    return (
      <div 
        className="p-6 rounded-lg border"
        style={{ 
          backgroundColor: theme.background.secondary,
          borderColor: theme.border.default 
        }}
      >
        <p style={{ color: theme.text.secondary }}>No user data available</p>
      </div>
    );
  }

  return (
    <div 
      className="p-6 rounded-lg border"
      style={{ 
        backgroundColor: theme.background.secondary,
        borderColor: theme.border.default 
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 
          className="text-lg font-semibold"
          style={{ color: theme.text.primary }}
        >
          User Profile
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsEditing(!isEditing)}
          icon={<Settings className="w-4 h-4" />}
        />
      </div>

      {/* Avatar Section */}
      <div className="flex items-center mb-6">
        <div className="relative">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ backgroundColor: theme.background.tertiary }}
            >
              <User className="w-8 h-8" style={{ color: theme.text.secondary }} />
            </div>
          )}
          
          {isEditing && (
            <label className="absolute bottom-0 right-0 p-1 rounded-full bg-blue-500 cursor-pointer">
              <Camera className="w-3 h-3 text-white" />
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </label>
          )}
        </div>

        <div className="ml-4 flex-1">
          {isEditing ? (
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 rounded border"
              style={{
                backgroundColor: theme.background.primary,
                borderColor: theme.border.default,
                color: theme.text.primary,
              }}
            />
          ) : (
            <h4 
              className="text-xl font-medium"
              style={{ color: theme.text.primary }}
            >
              {user.name}
            </h4>
          )}
          
          <div className="flex items-center mt-1">
            <Mail className="w-4 h-4 mr-2" style={{ color: theme.text.secondary }} />
            <span style={{ color: theme.text.secondary }}>{user.email}</span>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label 
            className="block text-sm font-medium mb-1"
            style={{ color: theme.text.secondary }}
          >
            Role
          </label>
          <span 
            className="px-2 py-1 rounded text-xs font-medium"
            style={{ 
              backgroundColor: `${theme.button.primary.background}20`,
              color: theme.button.primary.background 
            }}
          >
            {user.role}
          </span>
        </div>

        <div>
          <label 
            className="block text-sm font-medium mb-1"
            style={{ color: theme.text.secondary }}
          >
            Permissions
          </label>
          <div className="space-y-1">
            {canAccessManager && (
              <span className="block text-xs text-green-600">Manager Access</span>
            )}
            {canAccessAdmin && (
              <span className="block text-xs text-purple-600">Admin Access</span>
            )}
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="mb-6">
        <label 
          className="block text-sm font-medium mb-2"
          style={{ color: theme.text.secondary }}
        >
          Preferences
        </label>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={user.preferences?.emailNotifications ?? true}
              onChange={handleToggleNotifications}
              className="mr-2"
            />
            <span style={{ color: theme.text.primary }}>Email Notifications</span>
          </label>
          
          <div className="text-sm" style={{ color: theme.text.secondary }}>
            Theme: {user.preferences?.theme || 'dark'} | 
            View: {user.preferences?.defaultView || 'list'}
          </div>
        </div>
      </div>

      {/* Actions */}
      {isEditing && (
        <div className="flex gap-2">
          <Button onClick={handleUpdateProfile}>
            Save Changes
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => {
              setIsEditing(false);
              setName(user.name);
            }}
          >
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
};

export default UserProfileCard;