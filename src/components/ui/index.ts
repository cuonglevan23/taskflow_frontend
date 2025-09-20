// ===========================================
// UI Components Index - Centralized Exports
// ===========================================

// Timeline Components - Reusable timeline with dots
export { default as Timeline } from './Timeline';
export * from './Timeline';

// Shadcn/UI Components - Primary UI library components
export { Button, buttonVariants } from './button';
export type { ButtonProps } from './button';

// User Avatar Components - Backend integrated avatars
export * from './UserAvatar';
export * from './UserAvatarGroup';

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

// Dropdown Components
export * from './Dropdown';

// Collaborator Selector Components
export * from './CollaboratorSelector';

// Icon Components
export * from './Icon';

// Input Components
export * from './Input';

// Portal Components
export * from './Portal';

// Server Status Components
export * from './ServerStatus';

// Progress Components
export { default as ProgressBar } from './ProgressBar';

// Notification Provider
export { default as NotificationProvider } from './NotificationProvider';

// Modal Components
export * from './modal';

// Additional UI Components
export * from './alert-dialog';
export * from './badge';
export * from './card';
export * from './collapsible';
export * from './input';
export * from './progress';
export * from './scroll-area';
export * from './select';
export * from './separator';
export * from './skeleton';
export * from './textarea';
export * from './toggle';

// ===========================================
// Common UI Utilities & Helpers
// ===========================================
export { cn } from '@/lib/utils';
