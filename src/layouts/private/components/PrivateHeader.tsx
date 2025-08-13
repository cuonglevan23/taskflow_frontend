"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { User } from "@/types/auth";
import Avatar from "@/components/ui/Avatar/Avatar";
import Dropdown, {
  DropdownItem,
  DropdownSeparator,
} from "@/components/ui/Dropdown/Dropdown";
import SearchPanel from "./SearchPanel";
import UserMenu from "./UserMenu";
import { useDisclosure } from "@/layouts/hooks/ui/useDisclosure";
import { GiHamburgerMenu } from "react-icons/gi";
import { HiChevronDoubleLeft, HiChevronDoubleRight } from "react-icons/hi";
import {
  CheckSquare,
  Folder,
  MessageSquare,
  Briefcase,
  Target,
  Users,
} from "lucide-react";
import CreateProjectModal from "@/components/modals/CreateProjectModal";
import { InviteModal } from "@/components/modals";

interface PrivateHeaderProps {
  user: User;
  onSidebarToggle: () => void;
  onSidebarCollapseToggle: () => void;
  isSidebarCollapsed: boolean;
  onLogout?: () => void;
}

export default function PrivateHeader({
  user,
  onSidebarToggle,
  onSidebarCollapseToggle,
  isSidebarCollapsed,
  onLogout,
}: PrivateHeaderProps) {
  // Use useDisclosure for dropdowns and modals
  const notificationDropdown = useDisclosure(false);
  const userDropdown = useDisclosure(false);
  const createProjectModal = useDisclosure(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const inviteModal = useDisclosure(false);
  const handleSearch = (query: string) => {
    // Handle search logic here
    console.log("Searching for:", query);
  };

  const PlusIcon = () => (
    <svg
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 4v16m8-8H4"
      />
    </svg>
  );

  const BellIcon = () => (
    <svg
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
      />
    </svg>
  );

  const HelpIcon = () => (
    <svg
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );

  return (
    <header className="h-12 bg-gray-800 flex items-center justify-between px-4 border-b border-gray-700">
      {/* Left Section - Menu and Create */}
      <div className="flex items-center space-x-2">
        {/* Sidebar Toggle */}
        <button
          onClick={onSidebarToggle}
          className="lg:hidden p-1.5 rounded text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
        >
          <GiHamburgerMenu className="h-5 w-5" />
        </button>

        {/* Desktop Sidebar Toggle */}
        <button
          onClick={onSidebarToggle}
          className="hidden lg:flex p-1.5 rounded text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
          title="Toggle sidebar"
        >
          <GiHamburgerMenu className="h-5 w-5" />
        </button>

        {/* Create Button */}
        <Dropdown
          trigger={
            <button className="flex items-center space-x-1.5 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-full transition-colors text-sm font-medium">
              <PlusIcon />
              <span>Create</span>
            </button>
          }
          placement="right"
          usePortal={false}
          contentClassName="w-48"
          isOpen={isCreateOpen}
          onOpenChange={setIsCreateOpen}
        >
          <div className="py-2">
            <DropdownItem
              icon={<CheckSquare className="w-4 h-4" />}
              onClick={() => setIsCreateOpen(false)}
            >
              Task
            </DropdownItem>

            <DropdownItem
              icon={<Folder className="w-4 h-4" />}
              onClick={() => {
                setIsCreateOpen(false);
                createProjectModal.onOpen();
              }}
            >
              Project
            </DropdownItem>

            <DropdownItem
              icon={<MessageSquare className="w-4 h-4" />}
              onClick={() => setIsCreateOpen(false)}
            >
              Message
            </DropdownItem>

            <DropdownItem
              icon={<Briefcase className="w-4 h-4" />}
              onClick={() => setIsCreateOpen(false)}
            >
              Portfolio
            </DropdownItem>

            <DropdownItem
              icon={<Target className="w-4 h-4" />}
              onClick={() => setIsCreateOpen(false)}
            >
              Goal
            </DropdownItem>

            <DropdownSeparator />

            <DropdownItem
              icon={<Users className="w-4 h-4" />}
              onClick={() => {
                setIsCreateOpen(false);
                inviteModal.onOpen();
              }}
            >
              Invite
            </DropdownItem>
          </div>
        </Dropdown>
      </div>

      {/* Center Section - Search Panel */}
      <div className="flex-1 flex items-center justify-center mx-4">
        <SearchPanel onSearch={handleSearch} className="w-full max-w-2xl" />
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-3">
        {/* Current Role Indicator */}
        <div className="hidden md:flex items-center space-x-2">
          <span className="text-xs text-gray-400">Role:</span>
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-600 text-white">
            {user.role?.toUpperCase() || "UNKNOWN"}
          </span>
        </div>

        {/* Help */}
        <button className="p-1.5 rounded text-gray-300 hover:text-white hover:bg-gray-700 transition-colors">
          <HelpIcon />
        </button>

        {/* Notifications */}
        <div className="relative">
          <Dropdown
            trigger={
              <button className="p-1.5 rounded text-gray-300 hover:text-white hover:bg-gray-700 transition-colors relative">
                <BellIcon />
                <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>
            }
            placement="bottom-right"
            usePortal={false}
            contentClassName="w-80 max-w-sm"
          >
            <div className="p-4 border-b" style={{ borderColor: "#374151" }}>
              <h3 className="font-semibold text-white text-sm">
                Notifications
              </h3>
            </div>
            <div className="max-h-64 overflow-y-auto">
              <DropdownItem>
                <div className="flex items-start space-x-3 py-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm text-gray-200">
                      New task assigned
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      Cross-functional project plan
                    </p>
                    <p className="text-xs text-gray-500 mt-1">2 minutes ago</p>
                  </div>
                </div>
              </DropdownItem>
              <DropdownItem>
                <div className="flex items-start space-x-3 py-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm text-gray-200">
                      Project completed
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      Marketing Campaign
                    </p>
                    <p className="text-xs text-gray-500 mt-1">1 hour ago</p>
                  </div>
                </div>
              </DropdownItem>
              <DropdownItem>
                <div className="flex items-start space-x-3 py-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm text-gray-200">
                      Meeting reminder
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      Team standup in 15 minutes
                    </p>
                    <p className="text-xs text-gray-500 mt-1">5 minutes ago</p>
                  </div>
                </div>
              </DropdownItem>
            </div>
            <div className="p-3 border-t" style={{ borderColor: "#374151" }}>
              <button className="w-full text-center text-sm text-blue-400 hover:text-blue-300 transition-colors">
                View all notifications
              </button>
            </div>
          </Dropdown>
        </div>

        {/* User Menu */}
        <UserMenu
          user={user}
          onProfileSettings={() => console.log("Profile Settings")}
          onDisplayPicture={() => console.log("Display Picture")}
          onNotificationSettings={() => console.log("Notification Settings")}
          onSwitchTeams={() => console.log("Switch Teams")}
          onCreateTeam={() => console.log("Create Team")}
          onAdminConsole={() => console.log("Admin Console")}
          onInviteMembers={() => console.log("Invite Members")}
          onLogout={onLogout}
        />
      </div>

      {/* Modals */}
      <CreateProjectModal
        isOpen={createProjectModal.isOpen}
        onClose={createProjectModal.onClose}
      />
      <InviteModal
        isOpen={inviteModal.isOpen}
        onClose={inviteModal.onClose}
      />
      </header>
  );
}
