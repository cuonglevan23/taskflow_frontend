// Centralized hooks export
export { useRBAC } from "./useRBAC"
export { usePermissions } from "./usePermissions"

export { useTasks } from "./useTasks"
export { useTaskActivities, useTaskActivitiesPaginated, useRecentTaskActivities } from "./useTaskActivities"

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


