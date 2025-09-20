"use client";

import React from "react";
import { useEditProfile } from "@/hooks/profile/useEditProfile";
import { useThemeContext } from "@/providers/ThemeProvider";
import { useLanguageContext } from "@/providers/LanguageProvider";
import { Upload, Mic } from "lucide-react";
import { Button } from "@/components/ui";
import { ProfileFormData } from "@/types/editProfile";

export default function ProfileSettingsTab() {
  const { theme } = useThemeContext();
  const { messages } = useLanguageContext();

  // Helper function to get translated text
  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = messages;
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

  const {
    profile,
    status,
    validationErrors,
    loadProfile,
    updateFullProfile,
    updateAvatar,
    clearError,
    clearValidationErrors,
    isLoading,
    isUploading,
    isSuccess,
    hasError,
    hasValidationErrors
  } = useEditProfile();

  // Local form state
  const [formData, setFormData] = React.useState<ProfileFormData>({
    firstName: "",
    lastName: "",
    jobTitle: "",
    department: "",
    aboutMe: "",
    avatar: null
  });

  // Load profile data on mount
  React.useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // Update form data when profile loads
  React.useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        jobTitle: profile.jobTitle || "",
        department: profile.department || "",
        aboutMe: profile.aboutMe || "",
        avatar: null
      });
    }
  }, [profile]);

  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear validation error for this field
    if (validationErrors[field]) {
      clearValidationErrors();
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, avatar: file }));
      // Immediately upload avatar
      await updateAvatar(file);
    }
  };

  const handleSaveProfile = async () => {
    const success = await updateFullProfile(formData);
    if (success) {
      // Reset avatar in form data after successful save
      setFormData(prev => ({ ...prev, avatar: null }));
    }
  };

  // ...existing code for loading state...
  if (isLoading && !profile) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="space-y-2">
            <div className="h-6 bg-gray-300 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gray-300 rounded-full"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-300 rounded w-24"></div>
              <div className="h-3 bg-gray-200 rounded w-32"></div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-300 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-300 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h3
          className="text-lg font-semibold mb-4"
          style={{ color: theme.text.primary }}
        >
          {t('profile.title')}
        </h3>
        <p
          className="text-sm mb-6"
          style={{ color: theme.text.secondary }}
        >
          {t('profile.description')}
        </p>
      </div>

      {/* Success Message */}
      {isSuccess && (
        <div
          className="p-3 rounded-lg border"
          style={{
            backgroundColor: theme.status?.success || '#f0fdf4',
            borderColor: theme.border?.default || '#22c55e',
            color: theme.text?.primary || '#15803d'
          }}
        >
          <p className="text-sm font-medium">✓ {t('profile.updateSuccess')}</p>
        </div>
      )}

      {/* Error Message */}
      {hasError && (
        <div
          className="p-3 rounded-lg border"
          style={{
            backgroundColor: theme.status?.error || '#fef2f2',
            borderColor: theme.border?.default || '#fca5a5',
            color: theme.text?.primary || '#dc2626'
          }}
        >
          <div className="flex items-start justify-between">
            <p className="text-sm font-medium">{status.error}</p>
            <button
              onClick={clearError}
              className="text-sm opacity-70 hover:opacity-100"
              style={{ color: theme.text?.primary }}
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Profile Photo Section */}
      <div>
        <label
          className="block text-sm font-medium mb-3"
          style={{ color: theme.text.primary }}
        >
          {t('profile.avatar')}
        </label>
        <div className="flex items-center space-x-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center border-2 border-dashed"
            style={{
              backgroundColor: theme.background.secondary,
              borderColor: theme.border.default
            }}
          >
            {profile?.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt="Profile"
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : formData.avatar ? (
              <img
                src={URL.createObjectURL(formData.avatar)}
                alt="Profile"
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <Upload className="w-6 h-6" style={{ color: theme.text.secondary }} />
            )}
          </div>
          <div className="flex space-x-2">
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={isUploading}
              />
              <Button
                variant="outline"
                size="sm"
                disabled={isUploading}
                className="border hover:bg-gray-50 pointer-events-none"
                style={{
                  backgroundColor: theme.background.primary,
                  borderColor: theme.border.default,
                  color: theme.text.primary,
                }}
              >
                {isUploading ? t('profile.uploading') : t('profile.uploadPhoto')}
              </Button>
            </div>
            {(profile?.avatarUrl || formData.avatar) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFormData(prev => ({ ...prev, avatar: null }))}
                style={{ color: theme.text.secondary }}
              >
                {t('profile.remove')}
              </Button>
            )}
          </div>
        </div>
        {validationErrors.avatar && (
          <p className="text-sm mt-1" style={{ color: theme.status?.error || '#ef4444' }}>
            {validationErrors.avatar}
          </p>
        )}
      </div>

      {/* Personal Information */}
      <div className="space-y-4">
        <h4
          className="font-medium text-base"
          style={{ color: theme.text.primary }}
        >
          {t('profile.personalInfo')}
        </h4>

        {/* First Name */}
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: theme.text.primary }}
          >
            {t('profile.firstName')} *
          </label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => handleInputChange("firstName", e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
            style={{
              backgroundColor: theme.background.primary,
              borderColor: validationErrors.firstName ? (theme.status?.error || '#ef4444') : theme.border.default,
              color: theme.text.primary,
            }}
          />
          {validationErrors.firstName && (
            <p className="text-sm mt-1" style={{ color: theme.status?.error || '#ef4444' }}>
              {validationErrors.firstName}
            </p>
          )}
        </div>

        {/* Last Name */}
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: theme.text.primary }}
          >
            {t('profile.lastName')} *
          </label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => handleInputChange("lastName", e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
            style={{
              backgroundColor: theme.background.primary,
              borderColor: validationErrors.lastName ? (theme.status?.error || '#ef4444') : theme.border.default,
              color: theme.text.primary,
            }}
          />
          {validationErrors.lastName && (
            <p className="text-sm mt-1" style={{ color: theme.status?.error || '#ef4444' }}>
              {validationErrors.lastName}
            </p>
          )}
        </div>

        {/* Job Title */}
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: theme.text.primary }}
          >
            {t('profile.jobTitle')}
          </label>
          <input
            type="text"
            placeholder={t('profile.jobTitlePlaceholder')}
            value={formData.jobTitle}
            onChange={(e) => handleInputChange("jobTitle", e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
            style={{
              backgroundColor: theme.background.primary,
              borderColor: validationErrors.jobTitle ? (theme.status?.error || '#ef4444') : theme.border.default,
              color: theme.text.primary,
            }}
          />
          {validationErrors.jobTitle && (
            <p className="text-sm mt-1" style={{ color: theme.status?.error || '#ef4444' }}>
              {validationErrors.jobTitle}
            </p>
          )}
        </div>

        {/* Department */}
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: theme.text.primary }}
          >
            {t('profile.department')}
          </label>
          <input
            type="text"
            placeholder={t('profile.departmentPlaceholder')}
            value={formData.department}
            onChange={(e) => handleInputChange("department", e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
            style={{
              backgroundColor: theme.background.primary,
              borderColor: validationErrors.department ? (theme.status?.error || '#ef4444') : theme.border.default,
              color: theme.text.primary,
            }}
          />
          {validationErrors.department && (
            <p className="text-sm mt-1" style={{ color: theme.status?.error || '#ef4444' }}>
              {validationErrors.department}
            </p>
          )}
        </div>
      </div>

      {/* About Me */}
      <div>
        <label
          className="block text-sm font-medium mb-2"
          style={{ color: theme.text.primary }}
        >
          {t('profile.aboutMe')}
        </label>
        <div className="relative">
          <textarea
            value={formData.aboutMe}
            onChange={(e) => handleInputChange("aboutMe", e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border rounded-lg resize-none"
            style={{
              backgroundColor: theme.background.primary,
              borderColor: validationErrors.aboutMe ? (theme.status?.error || '#ef4444') : theme.border.default,
              color: theme.text.primary,
            }}
            placeholder={t('profile.aboutMePlaceholder')}
          />
          <Button
            variant="ghost"
            size="sm"
            className="absolute bottom-2 right-2"
            style={{ color: theme.text.secondary }}
          >
            <Mic className="w-4 h-4" />
          </Button>
        </div>
        {validationErrors.aboutMe && (
          <p className="text-sm mt-1" style={{ color: theme.status?.error || '#ef4444' }}>
            {validationErrors.aboutMe}
          </p>
        )}
      </div>

      {/* Loading Indicator */}
      {(isLoading || isUploading) && (
        <div
          className="flex items-center space-x-2 p-3 rounded-lg"
          style={{
            backgroundColor: theme.background.secondary || '#f9fafb',
            color: theme.text.secondary || '#6b7280'
          }}
        >
          <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
               style={{ borderColor: '#3b82f6', borderTopColor: 'transparent' }}>
          </div>
          <span className="text-sm">
            {isUploading ? t('profile.uploadingAvatar') : t('profile.savingProfile')}
          </span>
        </div>
      )}

      {/* Save Button */}
      <div className="pt-4 border-t" style={{ borderColor: theme.border.default }}>
        <div className="flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={() => {
              // Reset form to profile data
              if (profile) {
                setFormData({
                  firstName: profile.firstName || "",
                  lastName: profile.lastName || "",
                  jobTitle: profile.jobTitle || "",
                  department: profile.department || "",
                  aboutMe: profile.aboutMe || "",
                  avatar: null
                });
              }
              clearValidationErrors();
            }}
            disabled={isLoading || isUploading}
            className="border hover:bg-gray-50"
            style={{
              backgroundColor: theme.background.primary,
              borderColor: theme.border.default,
              color: theme.text.primary,
            }}
          >
            {t('profile.cancel')}
          </Button>
          <Button
            onClick={handleSaveProfile}
            disabled={isLoading || isUploading || hasValidationErrors}
            variant="default"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? t('profile.saving') : t('profile.saveChanges')}
          </Button>
        </div>
      </div>
    </div>
  );
}
