import { ReactNode } from "react";
import {
  Home,
  CheckSquare,
  Inbox,
  BarChart3,
  Briefcase,
  Target,
  Folder,
  Users,
  Settings,
  Calendar,
  MessageSquare,
  Bell,
  Search,
  Archive,
  Star,
  Clock,
  CreditCard,
  Building,
  User,
  Wrench,
} from "lucide-react";

export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon: ReactNode;
  badge?: {
    count?: number;
    color?: "default" | "primary" | "success" | "warning" | "error";
    text?: string;
  };
  activePattern: string; // Pattern to match for active state
  permission?: string; // Permission required to view this item
  external?: boolean; // Whether this is an external link
}

export interface NavigationSection {
  id: string;
  title?: string;
  items: NavigationItem[];
  collapsible?: boolean;
  defaultExpanded?: boolean;
  permission?: string; // Permission required to view this section
}

export interface NavigationConfig {
  sections: NavigationSection[];
}

// Icon size for consistency
const ICON_SIZE = 20;
const ICON_CLASS = "text-gray-300";

// Main navigation configuration - Role-based menu structure
export const navigationConfig: NavigationConfig = {
  sections: [
    // Main section (always visible for all roles)
    {
      id: "main",
      items: [
        {
          id: "home",
          label: "Home",
          href: "/home",
          icon: <Home size={ICON_SIZE} className={ICON_CLASS} />,
          activePattern: "/home",
        },
        {
          id: "my-tasks",
          label: "My Task",
          href: "/my-tasks/list",
          icon: <CheckSquare size={ICON_SIZE} className={ICON_CLASS} />,
          activePattern: "/my-tasks",
          badge: {
            count: 2,
            color: "default",
          },
        },
        {
          id: "inbox",
          label: "Inbox",
          href: "/inbox",
          icon: <Inbox size={ICON_SIZE} className={ICON_CLASS} />,
          activePattern: "/inbox",
          badge: {
            count: 5,
            color: "primary",
          },
        },
      ],
    },
    
    // Insights section (contains Goals, Reports, Portfolios)
    {
      id: "insights",
      title: "Insights",
      collapsible: true,
      defaultExpanded: true,
      items: [
        {
          id: "goals",
          label: "Goals",
          href: "/goals",
          icon: <Target size={ICON_SIZE} className={ICON_CLASS} />,
          activePattern: "/goals",
        },
        {
          id: "reports",
          label: "Reports",
          href: "/reporting",
          icon: <BarChart3 size={ICON_SIZE} className={ICON_CLASS} />,
          activePattern: "/reporting",
        },
        {
          id: "portfolios",
          label: "Portfolios",
          href: "/portfolios",
          icon: <Briefcase size={ICON_SIZE} className={ICON_CLASS} />,
          activePattern: "/portfolios",
        },
      ],
    },

    // Projects section (contains actual projects - scope varies by role)
    {
      id: "projects",
      title: "Projects",
      collapsible: true,
      defaultExpanded: true,
      items: [
        // Dummy item to prevent section from being filtered out
        // Real projects will be loaded dynamically by PrivateSidebar
        {
          id: "projects-placeholder",
          label: "Loading...",
          href: "/projects",
          icon: <Folder size={ICON_SIZE} className={ICON_CLASS} />,
          activePattern: "/projects",
        },
      ],
    },

    // Managements section (contains Project, Team and User Management)
    {
      id: "managements",
      title: "Managements",
      collapsible: true,
      defaultExpanded: true,
      items: [
        {
          id: "projects-management",
          label: "Project Management",
          href: "/projects-management",
          icon: <Folder size={ICON_SIZE} className={ICON_CLASS} />,
          activePattern: "/projects-management",
          permission: "project_management", // Custom permission for projects management (Owner only)
        },
        {
          id: "team-management",
          label: "Team Management",
          href: "/team-management",
          icon: <Users size={ICON_SIZE} className={ICON_CLASS} />,
          activePattern: "/team-management",
          permission: "team_management", // Custom permission for team management
        },
        {
          id: "user-management",
          label: "User Management",
          href: "/user-management",
          icon: <User size={ICON_SIZE} className={ICON_CLASS} />,
          activePattern: "/user-management",
          permission: "user_management", // Custom permission for user management
        },
      ],
    },




  ],
};

// Helper functions for navigation management
export const getActiveSection = (pathname: string): string | null => {
  for (const section of navigationConfig.sections) {
    for (const item of section.items) {
      if (pathname.includes(item.activePattern)) {
        return section.id;
      }
    }
  }
  return null;
};

export const getActiveItem = (pathname: string): string | null => {
  for (const section of navigationConfig.sections) {
    for (const item of section.items) {
      if (pathname.includes(item.activePattern)) {
        return item.id;
      }
    }
  }
  return null;
};

export const isItemActive = (item: NavigationItem, pathname: string): boolean => {
  return pathname.includes(item.activePattern);
};

export const getVisibleSections = (userPermissions: string[] = []): NavigationSection[] => {
  return navigationConfig.sections
    .filter(section => !section.permission || userPermissions.includes(section.permission))
    .map(section => ({
      ...section,
      items: section.items.filter(item => {
        // If no permission required, show item
        if (!item.permission) return true;
        
        // Check if user has the required permission
        return userPermissions.includes(item.permission);
      }),
    }))
    .filter(section => section.items.length > 0);
};

// Badge color mapping
export const badgeColors = {
  default: "bg-gray-600 text-gray-300",
  primary: "bg-blue-600 text-white",
  success: "bg-green-600 text-white", 
  warning: "bg-yellow-600 text-white",
  error: "bg-red-600 text-white",
};