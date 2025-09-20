// User Lookup Components Index
// Export all user lookup related components

// Basic Components
export { UserChip } from './UserChip';
export { EmailInviteChip } from './EmailInviteChip';

// Search & Input Components
export { UserSearchDropdown } from './UserSearchDropdown';
export { InviteInput } from './InviteInput';
export { UserValidationInput } from './UserValidationInput';
export { UserEmailLookup } from './UserEmailLookup'; // ✅ NEW: Combined email/user lookup

// Advanced Components
export { BulkUserLookup } from './BulkUserLookup';
export { UserLookupPanel } from './UserLookupPanel';

// Re-export types for convenience
export type {
  UserLookupDto,
  BulkLookupResponse,
  EmailValidationResponse,
  SingleLookupResult
} from '@/types/user-lookup';

// Re-export hooks
export {
  useUserLookup,
  useUserSearch,
  useBulkUserLookup,
  useEmailValidation,
  useInviteInput,
  useUserSelection
} from '@/hooks/lookup';
