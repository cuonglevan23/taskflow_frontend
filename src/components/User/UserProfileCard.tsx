"use client";

import React, { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui';
import { useTheme } from '@/layouts/hooks/useTheme';
import { User, Settings, Camera, Mail } from 'lucide-react';
import { ApiClient } from '@/lib/auth-backend';

/**
 * User Profile Card - Sử dụng Backend JWT Authentication
 * Loại bỏ dependency NextAuth và UserContext cũ
 */
export const UserProfileCard: React.FC = () => {
  const { theme } = useTheme();
  const { user, isLoading, logout, refreshAuth } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle profile update
  const handleUpdateProfile = async () => {
    try {
      setIsUpdating(true);
      setError(null);

      await ApiClient.updateUserProfile({ name });
      await refreshAuth(); // Refresh user data
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
      setError('Cập nhật hồ sơ thất bại');
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle avatar upload
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        setIsUpdating(true);
        setError(null);

        const formData = new FormData();
        formData.append('avatar', file);

        // Sử dụng API client mới để upload avatar
        await ApiClient.request('/api/users/me/avatar', {
          method: 'POST',
          body: formData,
        });

        await refreshAuth(); // Refresh user data
      } catch (error) {
        console.error('Failed to update avatar:', error);
        setError('Cập nhật avatar thất bại');
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
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
        <Button onClick={refreshAuth} className="mt-2">
          Thử lại
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
        <p style={{ color: theme.text.secondary }}>
          Không tìm thấy thông tin người dùng
        </p>
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
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
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
                style={{ backgroundColor: theme.background.muted }}
              >
                <User size={24} style={{ color: theme.text.secondary }} />
              </div>
            )}
            <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 p-1 rounded-full bg-blue-500 hover:bg-blue-600 cursor-pointer">
              <Camera size={12} className="text-white" />
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
                disabled={isUpdating}
              />
            </label>
          </div>

          <div>
            {isEditing ? (
              <div className="space-y-2">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="px-2 py-1 border rounded"
                  style={{
                    backgroundColor: theme.background.primary,
                    borderColor: theme.border.default,
                    color: theme.text.primary
                  }}
                />
                <div className="flex space-x-2">
                  <Button
                    onClick={handleUpdateProfile}
                    disabled={isUpdating}
                    size="sm"
                  >
                    {isUpdating ? 'Đang lưu...' : 'Lưu'}
                  </Button>
                  <Button
                    onClick={() => {
                      setIsEditing(false);
                      setName(user.name);
                    }}
                    variant="outline"
                    size="sm"
                  >
                    Hủy
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <h3
                  className="font-semibold text-lg"
                  style={{ color: theme.text.primary }}
                >
                  {user.name}
                </h3>
                <p
                  className="text-sm flex items-center"
                  style={{ color: theme.text.secondary }}
                >
                  <Mail size={14} className="mr-1" />
                  {user.email}
                </p>
              </div>
            )}
          </div>
        </div>

        <Button
          onClick={() => setIsEditing(!isEditing)}
          variant="outline"
          size="sm"
          disabled={isUpdating}
        >
          <Settings size={16} />
        </Button>
      </div>

      {/* User Info */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between">
          <span style={{ color: theme.text.secondary }}>Vai trò:</span>
          <span
            className="px-2 py-1 rounded text-xs"
            style={{
              backgroundColor: theme.background.muted,
              color: theme.text.primary
            }}
          >
            {user.role}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex space-x-2 pt-4 border-t" style={{ borderColor: theme.border.default }}>
        <Button onClick={refreshAuth} variant="outline" size="sm">
          Làm mới
        </Button>
        <Button onClick={handleLogout} variant="destructive" size="sm">
          Đăng xuất
        </Button>
      </div>
    </div>
  );
};

export default UserProfileCard;