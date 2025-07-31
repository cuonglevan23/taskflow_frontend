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
import { useDisclosure } from "@/layouts/hooks/ui/useDisclosure";

interface PrivateHeaderProps {
  user: User;
  onSidebarToggle: () => void;
  onSidebarCollapseToggle: () => void;
  isSidebarCollapsed: boolean;
}

export default function PrivateHeader({
  user,
  onSidebarToggle,
  onSidebarCollapseToggle,
  isSidebarCollapsed,
}: PrivateHeaderProps) {
  // Use useDisclosure for dropdowns
  const notificationDropdown = useDisclosure(false);
  const userDropdown = useDisclosure(false);

  const handleSearch = (query: string) => {
    // Handle search logic here
    console.log("Searching for:", query);
  };

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
        d="M15 17h5l-3.5-3.5a.5.5 0 010-.7l3.5-3.5H15m0 8v-8"
      />
    </svg>
  );

  const QuestionIcon = () => (
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

  const MenuIcon = () => (
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
        d="M4 6h16M4 12h16M4 18h16"
      />
    </svg>
  );

  const SidebarCollapseIcon = () => (
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
        d={
          isSidebarCollapsed
            ? "M13 5l7 7-7 7M6 5l7 7-7 7"
            : "M11 19l-7-7 7-7M18 19l-7-7 7-7"
        }
      />
    </svg>
  );

  return (
    <header className="h-12 bg-gray-800 flex items-center justify-between px-4 border-b border-gray-700">
      {/* Left Section */}
      <div className="flex items-center space-x-4 flex-1">
        {/* Mobile Sidebar Toggle */}
        <button
          onClick={onSidebarToggle}
          className="lg:hidden p-1 rounded text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
        >
          <MenuIcon />
        </button>

        {/* Desktop Sidebar Collapse Toggle */}
        <button
          onClick={onSidebarCollapseToggle}
          className="hidden lg:flex p-1 rounded text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
          title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <SidebarCollapseIcon />
        </button>

        {/* Logo */}
        <Link href="/dashboard" className="flex items-center space-x-2">
          <Image
            src="/logo-white.svg"
            alt="Logo"
            width={120}
            height={32}
            className="h-8 w-auto"
          />
        </Link>
      </div>

      {/* Center Section - Search Panel */}
      <div className="hidden md:flex items-center flex-1 justify-center max-w-2xl mx-4">
        <SearchPanel onSearch={handleSearch} />
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-3 flex-1 justify-end">
        {/* Help */}
        <button className="p-1.5 rounded text-gray-300 hover:text-white hover:bg-gray-700 transition-colors">
          <QuestionIcon />
        </button>

        {/* Notifications */}
        <Dropdown
          trigger={
            <button className="p-1.5 rounded text-gray-300 hover:text-white hover:bg-gray-700 transition-colors relative">
              <BellIcon />
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-bold">
                3
              </span>
            </button>
          }
          placement="bottom-right"
        >
          <div className="p-3 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
          </div>
          <DropdownItem>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium text-sm">New task assigned</p>
                <p className="text-xs text-gray-500">
                  Cross-functional project plan
                </p>
                <p className="text-xs text-gray-400">2 minutes ago</p>
              </div>
            </div>
          </DropdownItem>
          <DropdownItem>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium text-sm">Project completed</p>
                <p className="text-xs text-gray-500">Marketing Campaign</p>
                <p className="text-xs text-gray-400">1 hour ago</p>
              </div>
            </div>
          </DropdownItem>
        </Dropdown>

        {/* User Menu */}
        <Dropdown
          trigger={
            <button className="flex items-center space-x-2 p-1 rounded hover:bg-gray-700 transition-colors">
              <Avatar
                name={user.name}
                src={user.avatar}
                size="sm"
                className="ring-2 ring-gray-600"
              />
              <svg
                className="h-3 w-3 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          }
          placement="bottom-right"
        >
          <div className="p-3 border-b border-gray-200">
            <p className="font-semibold text-gray-900">{user.name}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>

          <DropdownItem>My Profile Settings</DropdownItem>
          <DropdownItem>My Display Picture</DropdownItem>
          <DropdownItem>My Notification Settings</DropdownItem>

          <DropdownSeparator />

          <DropdownItem>Switch Teams</DropdownItem>
          <DropdownItem>Create Team</DropdownItem>

          <DropdownSeparator />

          <DropdownItem>Admin Console</DropdownItem>
          <DropdownItem>Invite Members</DropdownItem>

          <DropdownSeparator />

          <DropdownItem>Log out</DropdownItem>
        </Dropdown>
      </div>
    </header>
  );
}
