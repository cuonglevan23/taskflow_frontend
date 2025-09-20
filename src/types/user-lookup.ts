// User Lookup Types - Based on USER_LOOKUP_API_DOCUMENTATION.md

export interface UserLookupDto {
  userId: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  avatarUrl: string | null;
  exists: boolean;
  isOnline: boolean;
}

export interface BulkLookupResponse {
  existingUsers: UserLookupDto[];
  nonExistentEmails: string[];
  totalRequested: number;
  foundCount: number;
  notFoundCount: number;
}

export interface EmailValidationResponse {
  email: string;
  exists: boolean;
  available: boolean;
  message: string;
}

export interface UserSearchResult extends UserLookupDto {}

export interface SingleLookupResult {
  exists: boolean;
  user?: UserLookupDto;
  email?: string;
}

// For UI Components
export interface UserChipProps {
  user: UserLookupDto;
  onRemove?: (user: UserLookupDto) => void;
}

export interface EmailInviteChipProps {
  email: string;
  onRemove?: (email: string) => void;
}

export interface InviteInputProps {
  onUserSelect: (user: UserLookupDto) => void;
  onEmailAdd: (email: string) => void;
  placeholder?: string;
}

export interface SearchDropdownProps {
  onSelect: (user: UserLookupDto) => void;
  placeholder?: string;
  limit?: number;
}
