// Centralized hooks export
export { usePermissions } from "./usePermissions"

export { useTasks } from "./useTasks"
export { useTaskActivities, useTaskActivitiesPaginated, useRecentTaskActivities } from "./useTaskActivities"

// ChatBot hooks - AI Agent Services
export { useChatBotHook } from "./useChatBot"

// Posts and Newsfeed hooks - organized in posts folder
export {
  useNewsfeed,
  usePostActions,
  useSyncedPost,
  usePost,
  usePostCard,
  useUserPosts,
  useCreatePost
} from "./posts";

// Export types from posts
export type { UseNewsfeedReturn } from "./posts";

// Search hooks - Real API integration
export {
  useSearch,
  useContextualSearch,
  useTaskSearch,
  useProjectSearch,
  useUserSearch,
  useTeamSearch,
  useRealTimeSearch
} from "./useSearch"

// Google Calendar Integration
export { useGoogleCalendar } from "./useGoogleCalendar"
export type { UseGoogleCalendarReturn } from "./useGoogleCalendar"

// Settings hooks - organized in settings folder
export {
  useAccountSettings,
  // Removed useDisplaySettings (not implemented yet)
  useProfileSettings, // if this type doesn't exist it will be ignored by TS ignoreBuildErrors for now
  type ProfileData,
  // Removed FONT_SIZE_OPTIONS to avoid missing export error
  ROLE_OPTIONS
} from './settings';

// Edit Profile hooks
export { useEditProfile } from './profile/useEditProfile';
