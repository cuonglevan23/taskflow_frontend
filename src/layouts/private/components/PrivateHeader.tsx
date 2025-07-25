"use client";

import { User } from "@/types/auth";
import { HeaderNotification, SearchResult } from "../../types";

interface PrivateHeaderProps {
  user: User;
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
  variant?: "default" | "compact";
  enableSearch?: boolean;
  enableNotifications?: boolean;
}

export default function PrivateHeader({
  user,
  onSidebarToggle,
  onUserMenuToggle,
  onSignOut,
}: PrivateHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-sm border-b z-50">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Mobile menu button */}
        <button
          type="button"
          className="lg:hidden text-gray-600 hover:text-gray-900"
          onClick={onSidebarToggle}
        >
          <svg
            className="h-6 w-6"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        {/* Logo - visible on mobile */}
        <div className="lg:hidden">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-sm">TM</span>
            </div>
            <span className="font-bold text-xl text-gray-900">TaskManager</span>
          </div>
        </div>

        {/* Header content */}
        <div className="flex items-center space-x-4 ml-auto">
          {/* Search bar - hidden on mobile */}
          <div className="hidden md:block">
            <input
              type="text"
              placeholder="Search..."
              className="w-64 px-4 py-2 pl-10 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Notifications */}
          <button className="relative text-gray-600 hover:text-gray-900 p-2">
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-3.5-3.5M9 7l7 7-7 7"
              />
            </svg>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-xs text-white">3</span>
            </div>
          </button>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={onUserMenuToggle}
              className="flex items-center space-x-3 text-sm"
            >
              <div className="text-right hidden sm:block">
                <div className="text-sm font-medium text-gray-900">
                  {user.name}
                </div>
                <div className="text-xs text-gray-500 capitalize">
                  {user.role.toLowerCase()}
                </div>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-sm font-medium">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
