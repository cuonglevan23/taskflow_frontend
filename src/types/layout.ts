import { ReactNode } from 'react';
import { UserRole, Permission } from '@/constants/auth';

// Base user interface for layout
export interface LayoutUser {
  id: string;
  role: UserRole;
  permissions: Permission[];
  name: string;
  email: string;
  avatar?: string;
  workspace?: {
    id: string;
    name: string;
    logo?: string;
  };
}

// Navigation item interface
export interface NavigationItem {
  key: string;
  title: string;
  href: string;
  icon?: string;
  isActive?: boolean;
  badge?: string | number;
  children?: NavigationItem[];
  requiredPermissions?: Permission[];
  requiredRoles?: UserRole[];
  isVisible?: boolean;
  order?: number;
}

// Navigation group interface
export interface NavigationGroup {
  id: string;
  title: string;
  icon?: string;
  items: NavigationItem[];
  order: number;
  isCollapsible?: boolean;
  isExpanded?: boolean;
  requiredRoles: UserRole[];
}

// Header notification interface
export interface HeaderNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  timestamp: Date;
  actionUrl?: string;
  actionText?: string;
}

// User menu item interface
export interface UserMenuItem {
  key: string;
  title: string;
  href?: string;
  icon?: string;
  onClick?: () => void;
  isDivider?: boolean;
  requiredRoles?: UserRole[];
}

// Search result interface
export interface SearchResult {
  id: string;
  title: string;
  description?: string;
  type: 'project' | 'task' | 'user' | 'team' | 'document';
  url: string;
  icon?: string;
  metadata?: Record<string, unknown>;
}

// Breadcrumb interface
export interface BreadcrumbItem {
  title: string;
  href?: string;
  isActive?: boolean;
  icon?: string;
}

// Quick action interface
export interface QuickAction {
  id: string;
  title: string;
  description?: string;
  icon: string;
  href?: string;
  onClick?: () => void;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
  requiredPermissions?: Permission[];
  requiredRoles?: UserRole[];
}

// Layout context interface
export interface LayoutContext {
  user: LayoutUser | null;
  navigation: NavigationGroup[];
  notifications: HeaderNotification[];
  unreadNotificationCount: number;
  breadcrumbs: BreadcrumbItem[];
  quickActions: QuickAction[];
  isLoading: boolean;
  isSidebarOpen: boolean;
  isUserMenuOpen: boolean;
  searchQuery: string;
  searchResults: SearchResult[];
  currentPath: string;
}

// Layout actions interface
export interface LayoutActions {
  setSidebarOpen: (open: boolean) => void;
  setUserMenuOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  toggleUserMenu: () => void;
  setSearchQuery: (query: string) => void;
  performSearch: (query: string) => Promise<SearchResult[]>;
  markNotificationAsRead: (notificationId: string) => void;
  markAllNotificationsAsRead: () => void;
  refreshNotifications: () => Promise<void>;
  updateBreadcrumbs: (breadcrumbs: BreadcrumbItem[]) => void;
  signOut: () => void;
}

// Main private layout props interface
export interface PrivateLayoutProps {
  children: ReactNode;
  user?: LayoutUser | null;
  customNavigation?: NavigationGroup[];
  showBreadcrumbs?: boolean;
  showQuickActions?: boolean;
  enableSearch?: boolean;
  enableNotifications?: boolean;
  sidebarVariant?: 'default' | 'compact' | 'minimal';
  headerVariant?: 'default' | 'compact';
  className?: string;
  onNavigate?: (href: string) => void;
}

// Header component props
export interface PrivateHeaderProps {
  user: LayoutUser;
  notifications: HeaderNotification[];
  unreadCount: number;
  searchQuery: string;
  searchResults: SearchResult[];
  isUserMenuOpen: boolean;
  onSearchChange: (query: string) => void;
  onUserMenuToggle: () => void;
  onSidebarToggle: () => void;
  onNotificationClick: (notification: HeaderNotification) => void;
  onSignOut: () => void;
  variant?: 'default' | 'compact';
  enableSearch?: boolean;
  enableNotifications?: boolean;
}

// Sidebar component props
export interface PrivateSidebarProps {
  user: LayoutUser;
  navigation: NavigationGroup[];
  currentPath: string;
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (href: string) => void;
  variant?: 'default' | 'compact' | 'minimal';
}

// Sidebar group component props
export interface SidebarGroupProps {
  group: NavigationGroup;
  currentPath: string;
  onNavigate?: (href: string) => void;
  variant?: 'default' | 'compact' | 'minimal';
}

// Sidebar item component props
export interface SidebarItemProps {
  item: NavigationItem;
  currentPath: string;
  level?: number;
  onNavigate?: (href: string) => void;
  variant?: 'default' | 'compact' | 'minimal';
}

// Main content area props
export interface PrivateMainProps {
  children: ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  quickActions?: QuickAction[];
  showBreadcrumbs?: boolean;
  showQuickActions?: boolean;
  className?: string;
}

// Breadcrumb component props
export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  maxItems?: number;
  className?: string;
}

// Quick actions component props
export interface QuickActionsProps {
  actions: QuickAction[];
  maxActions?: number;
  layout?: 'horizontal' | 'grid';
  className?: string;
}

// Search component props
export interface SearchProps {
  query: string;
  results: SearchResult[];
  isLoading?: boolean;
  placeholder?: string;
  onQueryChange: (query: string) => void;
  onResultClick: (result: SearchResult) => void;
  className?: string;
}

// Notification component props
export interface NotificationProps {
  notifications: HeaderNotification[];
  unreadCount: number;
  onNotificationClick: (notification: HeaderNotification) => void;
  onMarkAllAsRead: () => void;
  onRefresh: () => void;
  maxVisible?: number;
  className?: string;
}

// User menu component props
export interface UserMenuProps {
  user: LayoutUser;
  menuItems: UserMenuItem[];
  isOpen: boolean;
  onClose: () => void;
  onItemClick: (item: UserMenuItem) => void;
  className?: string;
}

// Layout configuration interface
export interface LayoutConfig {
  brand: {
    name: string;
    logo?: string;
    logoUrl?: string;
  };
  navigation: {
    enableGrouping: boolean;
    enableCollapse: boolean;
    showIcons: boolean;
    showBadges: boolean;
  };
  header: {
    enableSearch: boolean;
    enableNotifications: boolean;
    showUserInfo: boolean;
    enableQuickActions: boolean;
  };
  sidebar: {
    defaultWidth: number;
    compactWidth: number;
    enableResize: boolean;
    enableCollapse: boolean;
    position: 'left' | 'right';
  };
  theme: {
    primaryColor: string;
    accentColor: string;
    sidebarBg: string;
    headerBg: string;
  };
}

// Layout hook return interface
export interface UsePrivateLayoutReturn {
  context: LayoutContext;
  actions: LayoutActions;
  config: LayoutConfig;
}

// All interfaces are already exported above, no need to re-export 