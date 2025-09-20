// Custom hook for managing profile settings
import { useState, useCallback } from "react";

// Profile data interface
export interface ProfileData {
  fullName: string;
  pronouns: string;
  jobTitle: string;
  department: string;
  email: string;
  role: string;
  aboutMe: string;
  photo: File | null;
  photoUrl?: string;
}

// Role options
export const ROLE_OPTIONS = [
  { value: "Manager", label: "Manager" },
  { value: "Team Lead", label: "Team Lead" },
  { value: "Developer", label: "Developer" },
  { value: "Designer", label: "Designer" },
  { value: "Product Manager", label: "Product Manager" },
  { value: "QA Engineer", label: "QA Engineer" },
  { value: "DevOps Engineer", label: "DevOps Engineer" },
] as const;

// Default profile data
const DEFAULT_PROFILE_DATA: ProfileData = {
  fullName: "Văn Lê",
  pronouns: "",
  jobTitle: "",
  department: "",
  email: "cuongvanle101@gmail.com",
  role: "Manager",
  aboutMe: "I usually work from 9am-5pm PST. Feel free to assign me a task with a due date anytime. Also, I love dogs!",
  photo: null,
};

export function useProfileSettings() {
  const [profileData, setProfileData] = useState<ProfileData>(DEFAULT_PROFILE_DATA);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update a single field
  const updateField = useCallback(<K extends keyof ProfileData>(
    field: K,
    value: ProfileData[K]
  ) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value,
    }));
    setHasUnsavedChanges(true);
    setError(null);
  }, []);

  // Update multiple fields at once
  const updateProfile = useCallback((updates: Partial<ProfileData>) => {
    setProfileData(prev => ({
      ...prev,
      ...updates,
    }));
    setHasUnsavedChanges(true);
    setError(null);
  }, []);

  // Handle photo upload
  const uploadPhoto = useCallback(async (file: File) => {
    try {
      setUploading(true);
      setError(null);

      // Validate file
      if (!file.type.startsWith('image/')) {
        throw new Error('Please select a valid image file');
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        throw new Error('Image size must be less than 5MB');
      }

      // Here you would upload to your file service
      // const uploadedUrl = await FileService.uploadProfilePhoto(file);

      setProfileData(prev => ({
        ...prev,
        photo: file,
        // photoUrl: uploadedUrl,
      }));
      setHasUnsavedChanges(true);

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload photo';
      setError(errorMessage);
      console.error('Photo upload failed:', err);
      return false;
    } finally {
      setUploading(false);
    }
  }, []);

  // Remove photo
  const removePhoto = useCallback(() => {
    setProfileData(prev => ({
      ...prev,
      photo: null,
      photoUrl: undefined,
    }));
    setHasUnsavedChanges(true);
  }, []);

  // Save profile
  const saveProfile = useCallback(async () => {
    try {
      setSaving(true);
      setError(null);

      // Here you would call your profile API
      // await ProfileService.updateProfile(profileData);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setHasUnsavedChanges(false);
      console.log('Profile saved successfully:', profileData);

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save profile';
      setError(errorMessage);
      console.error('Failed to save profile:', err);
      return false;
    } finally {
      setSaving(false);
    }
  }, [profileData]);

  // Reset profile to original state
  const resetProfile = useCallback(() => {
    setProfileData(DEFAULT_PROFILE_DATA);
    setHasUnsavedChanges(false);
    setError(null);
  }, []);

  // Load profile from API
  const loadProfile = useCallback(async () => {
    try {
      setError(null);

      // Here you would fetch from your profile API
      // const profile = await ProfileService.getProfile();
      // setProfileData(profile);

      // For now, keep the default data
      setHasUnsavedChanges(false);

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load profile';
      setError(errorMessage);
      console.error('Failed to load profile:', err);
      return false;
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    profileData,
    uploading,
    saving,
    hasUnsavedChanges,
    error,
    updateField,
    updateProfile,
    uploadPhoto,
    removePhoto,
    saveProfile,
    resetProfile,
    loadProfile,
    clearError,
  };
}
