// Edit Profile Service - Profile management API integration
// Uses BaseApiClient for HTTP requests with proper error handling

import { BaseApiClient } from '@/lib/baseApiClient';
import {
  UserProfileInfoDto,
  UpdateUserProfileInfoRequestDto,
  AvatarUploadResponse
} from '@/types/editProfile';

export class EditProfileService {
  /**
   * Get current user profile information
   * GET /api/profile/info
   */
  static async getProfileInfo(): Promise<UserProfileInfoDto> {
    try {
      return await BaseApiClient.get<UserProfileInfoDto>('/api/profile/info');
    } catch (error) {
      console.error('Failed to get profile info:', error);
      throw error;
    }
  }

  /**
   * Update user profile information (name, job title, department, about me)
   * PUT /api/profile/info
   */
  static async updateProfileInfo(profileData: UpdateUserProfileInfoRequestDto): Promise<UserProfileInfoDto> {
    try {
      return await BaseApiClient.put<UserProfileInfoDto>('/api/profile/info', profileData);
    } catch (error) {
      console.error('Failed to update profile info:', error);
      throw error;
    }
  }

  /**
   * Update user avatar
   * POST /api/profile/avatar
   */
  static async updateAvatar(avatarFile: File): Promise<AvatarUploadResponse> {
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('avatar', avatarFile);

      return await BaseApiClient.postFormData<AvatarUploadResponse>('/api/profile/avatar', formData);
    } catch (error) {
      console.error('Failed to update avatar:', error);
      throw error;
    }
  }

  /**
   * Update both profile info and avatar in sequence
   * Convenience method to update everything at once
   */
  static async updateFullProfile(
    profileData: UpdateUserProfileInfoRequestDto,
    avatarFile?: File | null
  ): Promise<UserProfileInfoDto> {
    try {
      // First update profile info
      let updatedProfile = await this.updateProfileInfo(profileData);

      // Then update avatar if provided
      if (avatarFile) {
        updatedProfile = await this.updateAvatar(avatarFile);
      }

      return updatedProfile;
    } catch (error) {
      console.error('Failed to update full profile:', error);
      throw error;
    }
  }

  /**
   * Validate profile data before submission
   */
  static validateProfileData(data: UpdateUserProfileInfoRequestDto): { isValid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {};

    // Validate first name
    if (!data.firstName?.trim()) {
      errors.firstName = 'First name is required';
    } else if (data.firstName.trim().length < 2) {
      errors.firstName = 'First name must be at least 2 characters';
    } else if (data.firstName.trim().length > 50) {
      errors.firstName = 'First name must be less than 50 characters';
    }

    // Validate last name
    if (!data.lastName?.trim()) {
      errors.lastName = 'Last name is required';
    } else if (data.lastName.trim().length < 2) {
      errors.lastName = 'Last name must be at least 2 characters';
    } else if (data.lastName.trim().length > 50) {
      errors.lastName = 'Last name must be less than 50 characters';
    }

    // Validate job title (optional but if provided, check length)
    if (data.jobTitle && data.jobTitle.trim().length > 100) {
      errors.jobTitle = 'Job title must be less than 100 characters';
    }

    // Validate department (optional but if provided, check length)
    if (data.department && data.department.trim().length > 100) {
      errors.department = 'Department must be less than 100 characters';
    }

    // Validate about me (optional but if provided, check length)
    if (data.aboutMe && data.aboutMe.trim().length > 500) {
      errors.aboutMe = 'About me must be less than 500 characters';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Validate avatar file before upload
   */
  static validateAvatarFile(file: File): { isValid: boolean; error?: string } {
    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: 'Image size must be less than 5MB'
      };
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: 'Only JPEG, PNG, GIF and WebP images are allowed'
      };
    }

    return { isValid: true };
  }
}

export default EditProfileService;
