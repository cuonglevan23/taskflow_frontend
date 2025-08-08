"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User } from "@/types/auth";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

import { useDisclosure } from "@/layouts/hooks/ui/useDisclosure";
import {
  navigationConfig,
  getVisibleSections,
  isItemActive,
  badgeColors,
  NavigationSection,
  NavigationItem,
} from "@/config/navigation";
import {
  Plus,
  ChevronDown,
  ChevronRight,
  Folder,
} from "lucide-react";

// Import global context hooks for data synchronization
import { useProjectsContext, useTasksContext } from "@/contexts";
import { GrProjects } from "react-icons/gr";
import { usePermissions } from "@/hooks/usePermissions";

// Using types from navigation config

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
  const router = useRouter();

  // Global context data for synchronization with home cards
  const { projects } = useProjectsContext();
  const { taskStats } = useTasksContext();

  // Get user permissions from usePermissions hook
  const { user: currentUser, role, can, is } = usePermissions();

  // Create role-based permissions array for navigation filtering
  const userPermissions = [
    // Always include basic permissions
    "basic",
    
    // Role-based permissions
    ...(is.owner ? ["project_management", "team_management", "user_management"] : []),
    ...(is.projectManager ? ["project_management", "team_management", "user_management"] : []),
    ...(is.leader ? ["team_management"] : []),
    
    // Legacy admin permission for backward compatibility
    ...(is.owner ? ["admin"] : []),
  ];

  // Get visible sections based on permissions and merge with dynamic data
  const baseSections = getVisibleSections(userPermissions);
  
  // Create dynamic sections with real data
  const sections = baseSections.map(section => {
    // Update My Tasks with real task count
    if (section.id === "main") {
      return {
        ...section,
        items: section.items.map(item => {
          if (item.id === "my-tasks") {
            return {
              ...item,
              badge: {
                count: taskStats.pending || 0,
                color: "default" as const,
              }
            };
          }
          return item;
        })
      };
    }
    
    // Replace static projects section with dynamic projects from global context
    if (section.id === "projects") {
      // For now, show all projects for all roles (since Project model doesn't have members/managerId yet)
      // TODO: Update Project model to include members, managerId, teamId for proper role-based filtering
      let filteredProjects = projects;
      
      // Simple role-based filtering based on available data
      if (is.member || is.leader) {
        // Member & Leader: Show active projects (they participate in)
        filteredProjects = projects.filter(project => project.status === 'active');
      } else if (is.projectManager) {
        // PM: Show active and completed projects they can manage
        filteredProjects = projects.filter(project => 
          project.status === 'active' || project.status === 'completed'
        );
      }
      // Owner: All projects (no filter needed)
      
      return {
        ...section,
        items: filteredProjects.slice(0, 5).map(project => ({
          id: `project-${project.id}`,
          label: project.name,
          href: `/projects/${project.id}`,
          icon: <GrProjects size={20} className="text-gray-300" />,
          activePattern: `/projects/${project.id}`,
        }))
      };
    }
    
    return section;
  });

  // Use useDisclosure for teams section
  const teamsDisclosure = useDisclosure(false);

  // Initialize expanded sections with default expanded ones
  const [expandedSections, setExpandedSections] = useState<string[]>(() => {
    return sections
      .filter(section => section.defaultExpanded)
      .map(section => section.id);
  });

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((s) => s !== sectionId)
        : [...prev, sectionId]
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
          "fixed top-12 left-0 h-[calc(100vh-3rem)] bg-gray-800 border-r border-gray-700 z-50 transform transition-all duration-300 ease-in-out flex flex-col",
          sidebarWidth,
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >


        {/* Fixed Main Navigation Section */}
        <div className="p-3 border-b border-gray-700">
          {sections
            .filter(section => section.id === "main")
            .map((section) => (
              <div key={section.id}>
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
                          isItemActive(item, pathname)
                            ? "bg-orange-600 text-white"
                            : "text-gray-300 hover:bg-gray-700 hover:text-white"
                        )}
                        title={isCollapsed ? item.label : undefined}
                        target={item.external ? "_blank" : undefined}
                        rel={item.external ? "noopener noreferrer" : undefined}
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
                        {item.badge && showLabels && (
                          <span className={cn(
                            "text-xs px-1.5 py-0.5 rounded-full",
                            badgeColors[item.badge.color || "default"]
                          )}>
                            {item.badge.text || item.badge.count}
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
        </div>

        {/* Scrollable Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 min-h-0">
          {sections
            .filter(section => section.id !== "main")
            .map((section) => (
              <div key={section.id} className="mb-4">
                {section.title && showLabels && (
                  <button
                    onClick={() =>
                      section.collapsible && toggleSection(section.id)
                    }
                    className="flex items-center justify-between w-full text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2 py-1 hover:text-gray-300 transition-colors"
                  >
                    <span>{section.title}</span>
                    {section.collapsible &&
                      (expandedSections.includes(section.id) ? (
                        <ChevronDown size={16} />
                      ) : (
                        <ChevronRight size={16} />
                      ))}
                  </button>
                )}

                {(!section.title ||
                  !section.collapsible ||
                  expandedSections.includes(section.id)) && (
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
                            isItemActive(item, pathname)
                              ? "bg-orange-600 text-white"
                              : "text-gray-300 hover:bg-gray-700 hover:text-white"
                          )}
                          title={isCollapsed ? item.label : undefined}
                          target={item.external ? "_blank" : undefined}
                          rel={item.external ? "noopener noreferrer" : undefined}
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
                          {item.badge && showLabels && (
                            <span className={cn(
                              "text-xs px-1.5 py-0.5 rounded-full",
                              badgeColors[item.badge.color || "default"]
                            )}>
                              {item.badge.text || item.badge.count}
                            </span>
                          )}
                        </Link>
                      </li>
                    ))}

                    {/* Add create buttons for projects section */}
                    {section.id === "projects" && showLabels && (
                      <li>
                        <button
                          onClick={() => router.push("/create-project")}
                          className="flex items-center space-x-3 px-2 py-1.5 rounded text-sm font-medium text-gray-400 hover:text-gray-300 hover:bg-gray-700 transition-colors w-full"
                        >
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
