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

// Main navigation configuration
export const navigationConfig: NavigationConfig = {
  sections: [
    // Main section (no title, always visible)
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
          label: "My tasks",
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
    
    // Insights section
    {
      id: "insights",
      title: "Insights",
      collapsible: true,
      defaultExpanded: true,
      items: [
        {
          id: "reporting",
          label: "Reporting",
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
        {
          id: "goals",
          label: "Goals",
          href: "/goals",
          icon: <Target size={ICON_SIZE} className={ICON_CLASS} />,
          activePattern: "/goals",
        },
      ],
    },

    // Projects section
    {
      id: "projects",
      title: "Projects",
      collapsible: true,
      defaultExpanded: true,
      items: [
        {
          id: "cross-functional",
          label: "Cross-functional project plan",
          href: "/project/list",
          icon: <Folder size={ICON_SIZE} className={ICON_CLASS} />,
          activePattern: "/project",
        },
        {
          id: "marketing",
          label: "Marketing Campaign",
          href: "/projects/marketing",
          icon: <Folder size={ICON_SIZE} className={ICON_CLASS} />,
          activePattern: "/projects/marketing",
        },
        {
          id: "website-redesign",
          label: "Website Redesign",
          href: "/projects/website",
          icon: <Folder size={ICON_SIZE} className={ICON_CLASS} />,
          activePattern: "/projects/website",
        },
      ],
    },

    // Team & Collaboration section
    {
      id: "collaboration",
      title: "Team & Collaboration",
      collapsible: true,
      defaultExpanded: false,
      items: [
        {
          id: "members",
          label: "Members",
          href: "/owner/Members",
          icon: <Users size={ICON_SIZE} className={ICON_CLASS} />,
          activePattern: "/owner/Members",
          permission: "admin", // Only admins can see this
        },
        {
          id: "messages",
          label: "Messages",
          href: "/messages",
          icon: <MessageSquare size={ICON_SIZE} className={ICON_CLASS} />,
          activePattern: "/messages",
          badge: {
            count: 3,
            color: "success",
          },
        },
        {
          id: "calendar",
          label: "Calendar",
          href: "/calendar",
          icon: <Calendar size={ICON_SIZE} className={ICON_CLASS} />,
          activePattern: "/calendar",
        },
      ],
    },

    // Tools section
    {
      id: "tools",
      title: "Tools",
      collapsible: true,
      defaultExpanded: false,
      items: [
        {
          id: "search",
          label: "Search",
          href: "/search",
          icon: <Search size={ICON_SIZE} className={ICON_CLASS} />,
          activePattern: "/search",
        },
        {
          id: "archive",
          label: "Archive",
          href: "/archive",
          icon: <Archive size={ICON_SIZE} className={ICON_CLASS} />,
          activePattern: "/archive",
        },
        {
          id: "starred",
          label: "Starred",
          href: "/starred",
          icon: <Star size={ICON_SIZE} className={ICON_CLASS} />,
          activePattern: "/starred",
        },
        {
          id: "recent",
          label: "Recent",
          href: "/recent",
          icon: <Clock size={ICON_SIZE} className={ICON_CLASS} />,
          activePattern: "/recent",
        },
      ],
    },

    // Settings section
    {
      id: "settings",
      title: "Settings",
      collapsible: true,
      defaultExpanded: false,
      items: [
        {
          id: "workspace-settings",
          label: "Workspace Settings",
          href: "/settings/workspace",
          icon: <Settings size={ICON_SIZE} className={ICON_CLASS} />,
          activePattern: "/settings",
          permission: "admin",
        },
        {
          id: "notifications",
          label: "Notifications",
          href: "/settings/notifications",
          icon: <Bell size={ICON_SIZE} className={ICON_CLASS} />,
          activePattern: "/settings/notifications",
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
      items: section.items.filter(item => 
        !item.permission || userPermissions.includes(item.permission)
      ),
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