import { useMemo, useCallback } from 'react';
import { useMyProjects } from '@/hooks/projects/useProjects';
import { useMyTeams } from '@/hooks/teams/useTeams';
import { useMyTasksSummary } from '@/hooks/tasks';
import { NAVIGATION_SECTIONS } from '@/config/navigation';
import type { NavigationSection } from '@/config/navigation';
import React from 'react';
import { GrProjects } from "react-icons/gr";
import { Users } from 'lucide-react';

export function useSidebarNavigation() {
  // Get cached global data (no API calls)
  const { data: projectsData } = useMyProjects();
  const { teams } = useMyTeams();

  // Extract arrays with null safety - handle SWR response structure
  const projects = useMemo(() => {
    if (!projectsData) return [];
    return Array.isArray(projectsData) ? projectsData : (projectsData.projects || []);
  }, [projectsData]);

  // Use same SWR data source as task mutations
  const { tasks } = useMyTasksSummary({
    page: 0,
    size: 1000,
    sortBy: 'startDate',
    sortDir: 'desc'
  });

  // Calculate pending tasks count from shared data source
  const pendingTasksCount = useMemo(() => {
    if (!tasks || !Array.isArray(tasks)) {
      return 0;
    }

    const pendingTasks = tasks.filter(task => {
      const isPending = !task.completed &&
        task.status !== 'completed' &&
        task.status !== 'DONE';
      return isPending;
    });

    return pendingTasks.length;
  }, [tasks]);

  // Return ALL navigation sections
  const navigationSections = useMemo(() => {
    return NAVIGATION_SECTIONS.map(section => {
      // Update My Tasks with real task count
      if (section.id === "main") {
        return {
          ...section,
          items: section.items.map(item => {
            if (item.id === "my-tasks") {
              return {
                ...item,
                badge: {
                  count: pendingTasksCount,
                  color: "default" as const,
                }
              };
            }
            return item;
          })
        };
      }

      // Process Projects section with dynamic data
      if (section.id === "projects") {
        return {
          ...section,
          title: "Projects",
          items: [
            ...section.items.filter(item => !item.dynamic),
            ...projects.slice(0, 5).map(project => ({
              id: `project-${project.id}`,
              label: project.name,
              href: `/projects/${project.id}`,
              icon: React.createElement(GrProjects, { size: 20, className: "text-gray-300" }),
            }))
          ]
        };
      }

      // Process Teams section with real SWR data
      if (section.id === "teams") {
        return {
          ...section,
          items: [
            ...section.items.filter(item => !item.dynamic),
            ...teams.slice(0, 5).map(team => ({
              id: `team-${team.id}`,
              label: team.name,
              href: `/teams/${team.id}`,
              icon: React.createElement(Users, { size: 20, className: "text-gray-300" }),
            }))
          ]
        };
      }

      return section;
    });
  }, [pendingTasksCount, projects, teams]);

  // Check if item is active (memoized with useCallback)
  const checkItemActive = useCallback((item: any, pathname: string) => {
    if (!item.href || !pathname) return false;

    // Exact match
    if (item.href === pathname) return true;

    // Parent path match (e.g., /projects matches /projects/123)
    if (pathname.startsWith(item.href) && item.href !== '/') {
      return true;
    }

    return false;
  }, []);


  return {
    navigationSections,
    rbac: { user: null }, // Simplified rbac object
    checkItemActive,
  };
}

/**
 * Hook for sidebar state management
 */
export function useSidebarState(navigationSections: NavigationSection[]) {
  const [expandedSections, setExpandedSections] = React.useState<string[]>(() => {
    // Default expand main navigation sections
    return navigationSections
      .filter(section => section.defaultExpanded !== false)
      .map(section => section.id);
  });

  const toggleSection = useCallback((sectionId: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  }, []);

  return {
    expandedSections,
    toggleSection,
  };
}

/**
 * Hook for sidebar display logic
 */
export function useSidebarDisplay(isCollapsed: boolean) {
  const sidebarWidth = useMemo(() => {
    return isCollapsed ? "w-16" : "w-64";
  }, [isCollapsed]);

  const showLabels = useMemo(() => {
    return !isCollapsed;
  }, [isCollapsed]);

  return {
    sidebarWidth,
    showLabels,
  };
}