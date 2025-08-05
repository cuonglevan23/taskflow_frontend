"use client";

import { usePathname } from "next/navigation";
import React, { ReactNode } from "react";
import {
  ACTION_ICONS,
  LAYOUT_ICONS,
  USER_ICONS,
  FILE_ICONS,
  HEADER_ICONS,
  PROJECT_ICONS,
  COMMUNICATION_ICONS,
} from "@/constants/icons";
import { useTheme } from "@/layouts/hooks/useTheme";
import { useDisclosure } from "@/layouts/hooks/ui/useDisclosure";
import Dropdown, {
  DropdownItem,
  DropdownSeparator,
} from "@/components/ui/Dropdown/Dropdown";

export interface NavigationItem {
  label: string;
  href: string;
  icon?: ReactNode;
}

export interface HeaderAction {
  label: string;
  icon?: ReactNode;
  onClick?: () => void;
  variant?: "default" | "primary" | "ghost";
}

export interface PageHeaderInfo {
  avatar?: ReactNode;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  customContent?: ReactNode;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: ReactNode;
}

export interface HeaderSection {
  id: string;
  content: ReactNode;
  position?: "top" | "middle" | "bottom";
  className?: string;
}

export interface PageNavigationConfig {
  title: string;
  navItems: NavigationItem[];
  actions: HeaderAction[];
  headerInfo?: PageHeaderInfo;
  showTabsPlus?: boolean;
  headerSections?: HeaderSection[];
}

export const usePageNavigation = (): PageNavigationConfig | null => {
  const pathname = usePathname();
  const teamSettingsDropdown = useDisclosure(false);

  // MyTask Navigation
  if (pathname.startsWith("/mytask")) {
    return {
      title: "My tasks",
      navItems: [
        {
          label: "List",
          href: "/mytask/list",
          icon: <LAYOUT_ICONS.list className="w-4 h-4" />,
        },
        {
          label: "Board",
          href: "/mytask/board",
          icon: <LAYOUT_ICONS.board className="w-4 h-4" />,
        },
        {
          label: "Calendar",
          href: "/mytask/calendar",
          icon: <LAYOUT_ICONS.calendar className="w-4 h-4" />,
        },
        {
          label: "Dashboard",
          href: "/mytask/dashboard",
          icon: <LAYOUT_ICONS.timeline className="w-4 h-4" />,
        },
        {
          label: "File",
          href: "/owner/project/file",
          icon: <FILE_ICONS.document className="w-4 h-4" />,
        },
      ],
      actions: [],
      headerInfo: {
        avatar: (
          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
            <USER_ICONS.user className="w-6 h-6" />
          </div>
        ),
      },
      showTabsPlus: false,
    };
  }

  // Project Navigation
  if (pathname.startsWith("/project")) {
    return {
      title: "My Project",
      navItems: [
        {
          label: "Overview",
          href: "/project",
          icon: <LAYOUT_ICONS.grid className="w-4 h-4" />,
        },
        {
          label: "List",
          href: "/project/list",
          icon: <LAYOUT_ICONS.list className="w-4 h-4" />,
        },
        {
          label: "Board",
          href: "/project/board",
          icon: <LAYOUT_ICONS.board className="w-4 h-4" />,
        },
        {
          label: "Calendar",
          href: "/project/calendar",
          icon: <LAYOUT_ICONS.calendar className="w-4 h-4" />,
        },
        {
          label: "Dashboard",
          href: "/project/dashboard",
          icon: <LAYOUT_ICONS.timeline className="w-4 h-4" />,
        },
        {
          label: "File",
          href: "/project/file",
          icon: <FILE_ICONS.document className="w-4 h-4" />,
        },
      ],
      actions: [],
      headerInfo: {
        avatar: (
          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
            <USER_ICONS.user className="w-6 h-6" />
          </div>
        ),
      },
      showTabsPlus: false,
    };
  }

  // Owner/Members Navigation
  if (pathname.startsWith("/owner")) {
    return {
      title: "My Project",
      navItems: [
        {
          label: "Overview",
          href: "/owner/project",
          icon: <LAYOUT_ICONS.grid className="w-4 h-4" />,
        },
        {
          label: "Members",
          href: "/owner/Members/allMembers",
          icon: <LAYOUT_ICONS.list className="w-4 h-4" />,
        },
      ],
      actions: [],
      headerInfo: {
        avatar: (
          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
            <USER_ICONS.user className="w-6 h-6" />
          </div>
        ),
      },
      showTabsPlus: false,
    };
  }

  // Inbox Navigation
  if (pathname.startsWith("/inbox")) {
    return {
      title: "Inbox",
      navItems: [
        {
          label: "Activity",
          href: "/inbox",
        },
        {
          label: "Bookmarks",
          href: "/inbox/bookmarks",
        },
        {
          label: "Archive",
          href: "/inbox/archive",
        },
      ],
      actions: [],
      showTabsPlus: false,
    };
  }

  // Teams Navigation
  if (pathname.startsWith("/teams")) {
    return {
      title: "",
      navItems: [
        {
          label: "Overview",
          href: "/teams",
          icon: <LAYOUT_ICONS.grid className="w-4 h-4" />,
        },
        {
          label: "All work",
          href: "/teams/all-work",
          icon: <LAYOUT_ICONS.list className="w-4 h-4" />,
        },
        {
          label: "Messages",
          href: "/teams/messages",
          icon: <COMMUNICATION_ICONS.message className="w-4 h-4" />,
        },
        {
          label: "Calendar",
          href: "/teams/calendar",
          icon: <LAYOUT_ICONS.calendar className="w-4 h-4" />,
        },
        {
          label: "Knowledge",
          href: "/teams/knowledge",
          icon: <FILE_ICONS.document className="w-4 h-4" />,
        },
      ],
      actions: [],
      headerInfo: {
        customContent: (
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-sm"
              style={{ backgroundColor: "#8B5CF6" }}
            >
              L
            </div>
            <h1 className="text-2xl font-semibold text-white">
              LÊ's first team
            </h1>
            <Dropdown
              trigger={
                <ACTION_ICONS.down className="w-4 h-4 text-gray-300 hover:text-white cursor-pointer transition-colors" />
              }
              placement="bottom-left"
              contentClassName="min-w-72 !bg-gray-800 !border-gray-700 !shadow-2xl"
            >
              <div className="p-4 border-b border-gray-700">
                <h3 className="text-lg font-semibold text-white">Edit team settings</h3>
              </div>
              
              <DropdownItem 
                className="!text-white hover:!bg-gray-700 hover:!text-white !mx-2 !my-1"
                onClick={() => console.log("Set color")}
              >
                <div className="flex items-center justify-between w-full text-white">
                  <div className="flex items-center text-white">
                    <div 
                      className="w-4 h-4 rounded mr-3"
                      style={{ backgroundColor: "#8B5CF6" }}
                    />
                    <span className="text-white">Set color</span>
                  </div>
                  <ACTION_ICONS.right className="w-4 h-4 text-gray-400" />
                </div>
              </DropdownItem>

              <DropdownItem 
                className="!text-white hover:!bg-gray-700 hover:!text-white !mx-2 !my-1"
                onClick={() => console.log("Copy team link")}
              >
                <span className="text-white">Copy team link</span>
              </DropdownItem>

              <DropdownItem 
                className="!text-white hover:!bg-gray-700 hover:!text-white !mx-2 !my-1"
                onClick={() => console.log("Send a message via email")}
              >
                <span className="text-white">Send a message via email</span>
              </DropdownItem>

              <DropdownItem 
                className="!text-white hover:!bg-gray-700 hover:!text-white !mx-2 !my-1"
                onClick={() => console.log("Upgrade team")}
              >
                <span className="text-white">Upgrade team</span>
              </DropdownItem>

              <DropdownSeparator className="!border-gray-700 !mx-2" />

              <DropdownItem 
                className="!text-red-400 hover:!bg-red-900/20 hover:!text-red-400 !mx-2 !my-1"
                onClick={() => console.log("Delete team")}
              >
                <span className="text-red-400">Delete LÊ's first team</span>
              </DropdownItem>
            </Dropdown>
            <PROJECT_ICONS.star className="w-5 h-5 text-gray-300 hover:text-yellow-400 cursor-pointer transition-colors" />
          </div>
        ),
      },
      showTabsPlus: true,
    };
  }

  return null;
};
