import { ReactNode } from 'react';
import { User } from '@/types/auth';
import { UserRole, Permission } from '@/constants/auth';

// Base layout props
export interface BaseLayoutProps {
  children: ReactNode;
  className?: string;
}

// Public layout specific props
export interface PublicLayoutProps extends BaseLayoutProps {
  showHeader?: boolean;
  showFooter?: boolean;
  headerVariant?: 'default' | 'transparent';
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

// Private layout props
export interface PrivateLayoutProps extends BaseLayoutProps {
  user?: User | null;
  customNavigation?: NavigationGroup[];
  showBreadcrumbs?: boolean;
  showQuickActions?: boolean;
  enableSearch?: boolean;
  enableNotifications?: boolean;
  sidebarVariant?: 'default' | 'compact' | 'minimal';
  headerVariant?: 'default' | 'compact';
  onNavigate?: (href: string) => void;
}

// Layout context interface
export interface LayoutContextValue {
  user: User | null;
  navigation: NavigationGroup[];
  notifications: HeaderNotification[];
  unreadNotificationCount: number;
  breadcrumbs: BreadcrumbItem[];
  quickActions: QuickAction[];
  isLoading: boolean;
  isSidebarOpen: boolean;
  isSidebarCollapsed: boolean;
  isUserMenuOpen: boolean;
  searchQuery: string;
  searchResults: SearchResult[];
  currentPath: string;
}

// Layout actions interface
export interface LayoutActions {
  setSidebarOpen: (open: boolean) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setUserMenuOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  toggleSidebarCollapse: () => void;
  toggleUserMenu: () => void;
  setSearchQuery: (query: string) => void;
  performSearch: (query: string) => Promise<SearchResult[]>;
  markNotificationAsRead: (notificationId: string) => void;
  markAllNotificationsAsRead: () => void;
  refreshNotifications: () => Promise<void>;
  updateBreadcrumbs: (breadcrumbs: BreadcrumbItem[]) => void;
  signOut: () => void;
} 