// Custom hook for managing edit profile functionality
import { useState, useCallback } from "react";
import EditProfileService from "@/services/profile/editProfileService";
import {
  UserProfileInfoDto,
  UpdateUserProfileInfoRequestDto,
  ProfileFormData,
  ProfileValidationErrors,
  ProfileUpdateStatus
} from "@/types/editProfile";

export function useEditProfile() {
  const [profile, setProfile] = useState<UserProfileInfoDto | null>(null);
  const [status, setStatus] = useState<ProfileUpdateStatus>({
    loading: false,
    uploading: false,
    success: false,
    error: null
  });
  const [validationErrors, setValidationErrors] = useState<ProfileValidationErrors>({});

  // Load profile information
  const loadProfile = useCallback(async () => {
    try {
      setStatus(prev => ({ ...prev, loading: true, error: null }));
      const profileData = await EditProfileService.getProfileInfo();
      setProfile(profileData);
      return profileData;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load profile';
      setStatus(prev => ({ ...prev, error: errorMessage }));
      console.error('Failed to load profile:', error);
      return null;
    } finally {
      setStatus(prev => ({ ...prev, loading: false }));
    }
  }, []);

  // Update profile information only
  const updateProfileInfo = useCallback(async (profileData: UpdateUserProfileInfoRequestDto) => {
    try {
      // Validate data first
      const validation = EditProfileService.validateProfileData(profileData);
      if (!validation.isValid) {
        setValidationErrors(validation.errors);
        return false;
      }

      setValidationErrors({});
      setStatus(prev => ({ ...prev, loading: true, error: null, success: false }));

      const updatedProfile = await EditProfileService.updateProfileInfo(profileData);
      setProfile(updatedProfile);
      setStatus(prev => ({ ...prev, success: true }));

      // Clear success message after 3 seconds
      setTimeout(() => {
        setStatus(prev => ({ ...prev, success: false }));
      }, 3000);

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
      setStatus(prev => ({ ...prev, error: errorMessage }));
      console.error('Failed to update profile:', error);
      return false;
    } finally {
      setStatus(prev => ({ ...prev, loading: false }));
    }
  }, []);

  // Update avatar only
  const updateAvatar = useCallback(async (avatarFile: File) => {
    try {
      // Validate avatar file first
      const validation = EditProfileService.validateAvatarFile(avatarFile);
      if (!validation.isValid) {
        setStatus(prev => ({ ...prev, error: validation.error || 'Invalid file' }));
        return false;
      }

      setStatus(prev => ({ ...prev, uploading: true, error: null, success: false }));

      const updatedProfile = await EditProfileService.updateAvatar(avatarFile);
      setProfile(updatedProfile);
      setStatus(prev => ({ ...prev, success: true }));

      // Clear success message after 3 seconds
      setTimeout(() => {
        setStatus(prev => ({ ...prev, success: false }));
      }, 3000);

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update avatar';
      setStatus(prev => ({ ...prev, error: errorMessage }));
      console.error('Failed to update avatar:', error);
      return false;
    } finally {
      setStatus(prev => ({ ...prev, uploading: false }));
    }
  }, []);

  // Update both profile info and avatar
  const updateFullProfile = useCallback(async (formData: ProfileFormData) => {
    try {
      const profileData: UpdateUserProfileInfoRequestDto = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        jobTitle: formData.jobTitle,
        department: formData.department,
        aboutMe: formData.aboutMe
      };

      // Validate profile data
      const validation = EditProfileService.validateProfileData(profileData);
      if (!validation.isValid) {
        setValidationErrors(validation.errors);
        return false;
      }

      // Validate avatar if provided
      if (formData.avatar) {
        const avatarValidation = EditProfileService.validateAvatarFile(formData.avatar);
        if (!avatarValidation.isValid) {
          setValidationErrors(prev => ({
            ...prev,
            avatar: avatarValidation.error || 'Invalid file'
          }));
          return false;
        }
      }

      setValidationErrors({});
      setStatus(prev => ({
        ...prev,
        loading: true,
        uploading: !!formData.avatar,
        error: null,
        success: false
      }));

      const updatedProfile = await EditProfileService.updateFullProfile(profileData, formData.avatar);
      setProfile(updatedProfile);
      setStatus(prev => ({ ...prev, success: true }));

      // Clear success message after 3 seconds
      setTimeout(() => {
        setStatus(prev => ({ ...prev, success: false }));
      }, 3000);

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
      setStatus(prev => ({ ...prev, error: errorMessage }));
      console.error('Failed to update full profile:', error);
      return false;
    } finally {
      setStatus(prev => ({ ...prev, loading: false, uploading: false }));
    }
  }, []);

  // Clear errors
  const clearError = useCallback(() => {
    setStatus(prev => ({ ...prev, error: null }));
  }, []);

  // Clear validation errors
  const clearValidationErrors = useCallback(() => {
    setValidationErrors({});
  }, []);

  // Reset all state
  const reset = useCallback(() => {
    setProfile(null);
    setStatus({
      loading: false,
      uploading: false,
      success: false,
      error: null
    });
    setValidationErrors({});
  }, []);

  return {
    // State
    profile,
    status,
    validationErrors,

    // Actions
    loadProfile,
    updateProfileInfo,
    updateAvatar,
    updateFullProfile,
    clearError,
    clearValidationErrors,
    reset,

    // Computed values
    isLoading: status.loading,
    isUploading: status.uploading,
    isSuccess: status.success,
    hasError: !!status.error,
    hasValidationErrors: Object.keys(validationErrors).length > 0
  };
}
