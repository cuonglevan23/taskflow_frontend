"use client";

import Link from "next/link";
import { User } from "@/types/auth";
import { NavigationGroup } from "../../types";

interface PrivateSidebarProps {
  user: User;
  navigation: NavigationGroup[];
  currentPath: string;
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (href: string) => void;
  variant?: "default" | "compact" | "minimal";
}

export default function PrivateSidebar({
  user,
  navigation,
  currentPath,
  isOpen,
  onClose,
}: PrivateSidebarProps) {
  return (
    <div
      className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } transition-transform duration-300 ease-in-out lg:translate-x-0`}
    >
      {/* Logo */}
      <div className="flex items-center justify-center h-16 border-b bg-gray-50">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center">
            <span className="text-white font-bold text-sm">TM</span>
          </div>
          <span className="font-bold text-xl text-gray-900">TaskManager</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-6 px-4 space-y-6 h-[calc(100vh-4rem)] overflow-y-auto">
        {navigation.map((group) => (
          <div key={group.id}>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              {group.title}
            </h3>
            <ul className="space-y-1">
              {group.items.map((item) => {
                const isActive =
                  currentPath === item.href ||
                  currentPath.startsWith(item.href + "/");
                return (
                  <li key={item.key}>
                    <Link
                      href={item.href}
                      className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-blue-100 text-blue-700 border-r-2 border-blue-700"
                          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                    >
                      <span className="mr-3">📁</span>
                      {item.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </div>
  );
}
