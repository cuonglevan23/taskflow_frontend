// ===========================================
// UI Components Index - Centralized Exports
// ===========================================

// Avatar Components
export { default as Avatar } from './Avatar/Avatar';
export { default as AvatarGroup } from './Avatar/AvatarGroup';

// Button Components - All button related functionality
export * from './Button';

// Card Components
export { default as BaseCard } from './BaseCard/BaseCard';
export * from './BaseCard';

// Input & Search Components
export { default as SearchInput } from './SearchInput/SearchInput';
export * from './SearchInput';

// Search Dropdown Components
export * from './SearchDropdown';

// Empty State Components
export { default as EmptySearchState } from './EmptySearchState';
export * from './EmptySearchState';

// Detail Panel Components
export { default as DetailPanel } from './DetailPanel';
export * from './DetailPanel';

// ===========================================
// Common UI Utilities & Helpers
// ===========================================

// Re-export utility functions if any
export { cn } from '@/lib/utils';

// ===========================================
// Types - Re-export all UI related types
// ===========================================
export type {
  // Button types
  ButtonProps,
  ButtonVariant,
  ButtonSize,
  ButtonShape,
  ButtonState,
  
  // Other UI types from types/ui
  BaseProps,
  InputProps,
  ModalProps,
  LoadingState,
  ErrorState,
  PaginationProps,
  TableColumn,
  TableProps
} from '@/types/ui';