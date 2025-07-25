"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User } from "@/types/auth";
import { cn } from "@/lib/utils";
<<<<<<< HEAD
import { useDisclosure } from "@/layouts/hooks";
=======
import { useDisclosure } from "@/layouts/hooks/ui/useDisclosure";
>>>>>>> origin/master
import Dropdown, {
  DropdownItem,
  DropdownSeparator,
} from "@/components/ui/Dropdown/Dropdown";
import {
  TaskIcon,
  ProjectIcon,
  MessageIcon,
  TeamIcon,
  PortfolioIcon,
  GoalIcon,
  InviteIcon,
} from "@/components/ui/Icon/Icon";
import {
  Home,
  CheckSquare,
  Inbox,
  BarChart3,
  Briefcase,
  Target,
  Plus,
  ChevronDown,
  ChevronRight,
  Users,
  Folder,
} from "lucide-react";

interface SidebarItem {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  count?: number;
  isActive?: boolean;
}

interface SidebarSection {
  title?: string;
  items: SidebarItem[];
  collapsible?: boolean;
}

interface PrivateSidebarProps {
  user: User;
  isOpen: boolean;
  isCollapsed: boolean;
  onClose: () => void;
  onToggleCollapse: () => void;
}

export default function PrivateSidebar({
  user,
  isOpen,
  isCollapsed,
  onClose,
  onToggleCollapse,
}: PrivateSidebarProps) {
  const pathname = usePathname();
  const [expandedSections, setExpandedSections] = useState<string[]>([
    "insights",
    "projects",
  ]);

  // Use useDisclosure for teams section
  const teamsDisclosure = useDisclosure(false);

  const sections: SidebarSection[] = [
    {
      items: [
        {
          id: "home",
          label: "Home",
          href: "/dashboard",
          icon: <Home size={20} className="text-gray-300" />,
        },
        {
          id: "my-tasks",
          label: "My tasks",
          href: "/tasks",
          icon: <CheckSquare size={20} className="text-gray-300" />,
          count: 2,
        },
        {
          id: "inbox",
          label: "Inbox",
          href: "/inbox",
          icon: <Inbox size={20} className="text-gray-300" />,
        },
      ],
    },
    {
      title: "Insights",
      collapsible: true,
      items: [
        {
          id: "reporting",
          label: "Reporting",
          href: "/reporting",
          icon: <BarChart3 size={20} className="text-gray-300" />,
        },
        {
          id: "portfolios",
          label: "Portfolios",
          href: "/portfolios",
          icon: <Briefcase size={20} className="text-gray-300" />,
        },
        {
          id: "goals",
          label: "Goals",
          href: "/goals",
          icon: <Target size={20} className="text-gray-300" />,
        },
      ],
    },
    {
      title: "Projects",
      collapsible: true,
      items: [
        {
          id: "cross-functional",
          label: "Cross-functional project plan",
          href: "/projects/cross-functional",
          icon: <Folder size={20} className="text-gray-300" />,
        },
        {
          id: "marketing",
          label: "Marketing Campaign",
          href: "/projects/marketing",
          icon: <Folder size={20} className="text-gray-300" />,
        },
        {
          id: "website-redesign",
          label: "Website Redesign",
          href: "/projects/website",
          icon: <Folder size={20} className="text-gray-300" />,
        },
      ],
    },
  ];

  const toggleSection = (sectionTitle: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionTitle)
        ? prev.filter((s) => s !== sectionTitle)
        : [...prev, sectionTitle]
    );
  };

  const sidebarWidth = isCollapsed ? "w-16" : "w-64";
  const showLabels = !isCollapsed;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed top-12 left-0 h-[calc(100vh-3rem)] bg-gray-800 border-r border-gray-700 z-50 transform transition-all duration-300 ease-in-out",
          sidebarWidth,
          isOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0 lg:static lg:z-auto"
        )}
      >
        {/* Create Button */}
        <div className="p-3 border-b border-gray-700">
          <Dropdown
            trigger={
              <button
                className={cn(
                  "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg font-semibold transition-all duration-200 w-full flex items-center shadow-lg hover:shadow-xl transform hover:scale-[1.02] hover:-translate-y-0.5",
                  isCollapsed ? "p-3 justify-center" : "px-4 py-3 space-x-3"
                )}
                title={isCollapsed ? "Create new" : undefined}
              >
                <div className="relative">
                  <Plus size={20} strokeWidth={2.5} />
                </div>
                {showLabels && <span className="text-sm">Create</span>}
              </button>
            }
            placement="bottom-left"
          >
            <div className="min-w-[280px] bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden">
              {/* Header */}
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900">
                  Create new
                </h3>
              </div>

              {/* Main Items */}
              <div className="py-2">
                <DropdownItem>
                  <div className="flex items-center space-x-4 px-2 py-2 group">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                      <TaskIcon size="sm" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        Task
                      </div>
                      <div className="text-xs text-gray-500">
                        Assign work to team members
                      </div>
                    </div>
                  </div>
                </DropdownItem>

                <DropdownItem>
                  <div className="flex items-center space-x-4 px-2 py-2 group">
                    <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition-colors">
                      <ProjectIcon size="sm" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        Project
                      </div>
                      <div className="text-xs text-gray-500">
                        Plan and organize work
                      </div>
                    </div>
                  </div>
                </DropdownItem>

                <DropdownItem>
                  <div className="flex items-center space-x-4 px-2 py-2 group">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                      <MessageIcon size="sm" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        Message
                      </div>
                      <div className="text-xs text-gray-500">
                        Send updates to your team
                      </div>
                    </div>
                  </div>
                </DropdownItem>

                <DropdownItem>
                  <div className="flex items-center space-x-4 px-2 py-2 group">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                      <TeamIcon size="sm" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        Team
                      </div>
                      <div className="text-xs text-gray-500">
                        Bring people together
                      </div>
                    </div>
                  </div>
                </DropdownItem>

                <DropdownItem>
                  <div className="flex items-center space-x-4 px-2 py-2 group">
                    <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                      <PortfolioIcon size="sm" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        Portfolio
                      </div>
                      <div className="text-xs text-gray-500">
                        Track multiple projects
                      </div>
                    </div>
                  </div>
                </DropdownItem>

                <DropdownItem>
                  <div className="flex items-center space-x-4 px-2 py-2 group">
                    <div className="w-8 h-8 rounded-lg bg-yellow-100 flex items-center justify-center group-hover:bg-yellow-200 transition-colors">
                      <GoalIcon size="sm" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        Goal
                      </div>
                      <div className="text-xs text-gray-500">
                        Set objectives and track progress
                      </div>
                    </div>
                  </div>
                </DropdownItem>
              </div>

              <DropdownSeparator />

              {/* Invite Section */}
              <div className="py-2">
                <DropdownItem>
                  <div className="flex items-center space-x-4 px-2 py-2 group">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                      <InviteIcon size="sm" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        Invite
                      </div>
                      <div className="text-xs text-gray-500">
                        Add people to your workspace
                      </div>
                    </div>
                  </div>
                </DropdownItem>
              </div>
            </div>
          </Dropdown>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 h-[calc(100%-140px)]">
          {sections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="mb-4">
              {section.title && showLabels && (
                <button
                  onClick={() =>
                    section.collapsible &&
                    section.title &&
                    toggleSection(section.title)
                  }
                  className="flex items-center justify-between w-full text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2 py-1 hover:text-gray-300 transition-colors"
                >
                  <span>{section.title}</span>
                  {section.collapsible &&
                    (expandedSections.includes(section.title) ? (
                      <ChevronDown size={16} />
                    ) : (
                      <ChevronRight size={16} />
                    ))}
                </button>
              )}

              {(!section.title ||
                !section.collapsible ||
                (section.title &&
                  expandedSections.includes(section.title))) && (
                <ul className="space-y-1">
                  {section.items.map((item) => (
                    <li key={item.id}>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center rounded text-sm font-medium transition-colors group",
                          isCollapsed
                            ? "p-2 justify-center"
                            : "px-2 py-1.5 justify-between",
                          pathname === item.href
                            ? "bg-orange-600 text-white"
                            : "text-gray-300 hover:bg-gray-700 hover:text-white"
                        )}
                        title={isCollapsed ? item.label : undefined}
                      >
                        <div
                          className={cn(
                            "flex items-center min-w-0",
                            isCollapsed ? "justify-center" : "space-x-3"
                          )}
                        >
                          <span className="flex-shrink-0">{item.icon}</span>
                          {showLabels && (
                            <span className="truncate">{item.label}</span>
                          )}
                        </div>
                        {item.count && showLabels && (
                          <span className="bg-gray-600 text-gray-300 text-xs px-1.5 py-0.5 rounded-full">
                            {item.count}
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}

                  {/* Add create buttons for projects section */}
                  {section.title === "Projects" && showLabels && (
                    <li>
                      <button className="flex items-center space-x-3 px-2 py-1.5 rounded text-sm font-medium text-gray-400 hover:text-gray-300 hover:bg-gray-700 transition-colors w-full">
                        <Plus size={16} />
                        <span>Create project</span>
                      </button>
                    </li>
                  )}
                </ul>
              )}
            </div>
          ))}

          {/* Teams Section */}
          <div className="mt-6 pt-4 border-t border-gray-700">
            {showLabels && (
              <button
                onClick={teamsDisclosure.onToggle}
                className="flex items-center justify-between w-full text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2 py-1 hover:text-gray-300 transition-colors"
              >
                <span>Teams</span>
                {teamsDisclosure.isOpen ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronRight size={16} />
                )}
              </button>
            )}

            {(teamsDisclosure.isOpen || !showLabels) && (
              <div className="space-y-1">
                <Link
                  href="/teams/engineering"
                  className={cn(
                    "flex items-center rounded text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors",
                    isCollapsed ? "p-2 justify-center" : "space-x-3 px-2 py-1.5"
                  )}
                  title={isCollapsed ? "LÊ's first team" : undefined}
                >
                  <div className="h-4 w-4 bg-blue-500 rounded-full flex-shrink-0"></div>
                  {showLabels && (
                    <span className="truncate">LÊ&apos;s first team</span>
                  )}
                </Link>
                {showLabels && (
                  <>
                    <button className="flex items-center space-x-3 px-2 py-1.5 rounded text-sm text-gray-400 hover:text-gray-300 hover:bg-gray-700 transition-colors w-full">
                      <Plus size={16} />
                      <span>Create team</span>
                    </button>
                    <button className="w-full text-left px-2 py-1.5 text-sm text-gray-400 hover:text-gray-300 transition-colors">
                      Browse teams
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-gray-700 bg-gray-800">
          {showLabels ? (
            <div className="text-xs text-gray-400 space-y-1">
              <div className="flex items-center justify-between">
                <span>Trial: 11d left</span>
                <button className="text-orange-400 hover:text-orange-300 text-xs">
                  Upgrade
                </button>
              </div>
              <button className="text-orange-400 hover:text-orange-300 text-xs">
                Add billing info →
              </button>
            </div>
          ) : (
            <div className="flex justify-center">
              <button className="text-orange-400 hover:text-orange-300 text-xs p-1">
                ⚡
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
