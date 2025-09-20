// Types for Edit Profile API

// User Profile Info DTO - Response from GET and PUT endpoints
export interface UserProfileInfoDto {
  userId: number;
  firstName: string;
  lastName: string;
  jobTitle: string;
  department: string;
  aboutMe: string;
  avatarUrl: string;
  email: string;
  fullName: string;
  isOnline: boolean;
}

// Update User Profile Info Request DTO - Request body for PUT endpoint
export interface UpdateUserProfileInfoRequestDto {
  firstName: string;
  lastName: string;
  jobTitle: string;
  department: string;
  aboutMe: string;
}

// Avatar upload response type
export interface AvatarUploadResponse extends UserProfileInfoDto {}

// Form data type for profile updates
export interface ProfileFormData {
  firstName: string;
  lastName: string;
  jobTitle: string;
  department: string;
  aboutMe: string;
  avatar?: File | null;
}

// Profile validation errors
export interface ProfileValidationErrors {
  firstName?: string;
  lastName?: string;
  jobTitle?: string;
  department?: string;
  aboutMe?: string;
  avatar?: string;
}

// Profile update status
export interface ProfileUpdateStatus {
  loading: boolean;
  uploading: boolean;
  success: boolean;
  error: string | null;
}
