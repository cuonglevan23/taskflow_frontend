"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";
import { ACTION_ICONS } from "@/constants/icons";
import { useThemeContext } from '@/providers/ThemeProvider';
import { useLanguageContext } from '@/providers/LanguageProvider';
import TitleDropdown from "./components/TitleDropdown";
import { useMyProjects } from '@/hooks/projects/useProjects';
import { useMyTeams } from '@/hooks/teams/useTeams';
import { useDeleteProject } from '@/hooks/projects/useProjects';
import {
  usePageNavigation,
  HeaderAction,
  HeaderSection,
  BreadcrumbItem,
} from "./hooks/usePageNavigation";

interface PageLayoutProps {
  children: React.ReactNode;
}

const ActionButton = ({ action }: { action: HeaderAction }) => {
  const { theme } = useThemeContext();

  const baseClasses =
    "px-3 py-1.5 text-sm rounded-md flex items-center gap-2 transition-colors";

  // Use theme-based styles instead of hard-coded colors
  const getVariantStyle = (variant: string = "default") => {
    switch (variant) {
      case "primary":
        return {
          color: theme.status.info,
          backgroundColor: 'transparent',
        };
      case "ghost":
        return {
          color: theme.text.muted,
          backgroundColor: 'transparent',
        };
      default:
        return {
          color: theme.text.secondary,
          backgroundColor: 'transparent',
        };
    }
  };

  return (
    <button
      className={clsx(baseClasses, !action.label && "p-1.5")}
      style={getVariantStyle(action.variant)}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = theme.background.weakHover;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
      onClick={action.onClick}
    >
      {action.icon}
      {action.label && <span>{action.label}</span>}
    </button>
  );
};

const Breadcrumbs = ({ breadcrumbs }: { breadcrumbs: BreadcrumbItem[] }) => {
  const { theme } = useThemeContext();

  return (
    <nav className="flex items-center space-x-1 text-sm mb-2" style={{ color: theme.text.muted }}>
      {breadcrumbs.map((item, index) => (
        <div key={index} className="flex items-center">
          {index > 0 && <ACTION_ICONS.right className="w-4 h-4 mx-1" style={{ color: theme.text.muted }} />}
          {item.icon && <span className="mr-1">{item.icon}</span>}
          {item.href ? (
            <Link
              href={item.href}
              className="hover:opacity-80 transition-opacity"
              style={{ color: theme.text.secondary }}
            >
              {item.label}
            </Link>
          ) : (
            <span className="font-medium" style={{ color: theme.text.primary }}>
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
};

const HeaderSectionRenderer = ({
  sections,
  position,
}: {
  sections: HeaderSection[];
  position: "top" | "middle" | "bottom";
}) => {
  const filteredSections = sections.filter(
    (section) => (section.position || "middle") === position
  );

  if (filteredSections.length === 0) return null;

  return (
    <div className="space-y-4">
      {filteredSections.map((section) => (
        <div key={section.id} className={section.className}>
          {section.content}
        </div>
      ))}
    </div>
  );
};

const PageLayout = ({ children }: PageLayoutProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const config = usePageNavigation();
  const [mounted, setMounted] = React.useState(false);
  const { theme } = useThemeContext();
  const { messages } = useLanguageContext();

  // Helper function to get translated text
  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = messages;
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

  // Hook for deleting projects
  const { trigger: deleteProject, isMutating: isDeletingProject } = useDeleteProject();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!config) {
    // Fallback for pages without navigation config - no PrivateLayout wrapper
    return <>{children}</>;
  }

  const {
    title,
    navItems,
    actions,
    headerInfo,
    showTabsPlus,
    headerSections = [],
  } = config;

  // 🔥 MOVED: Lấy data thực tế từ API giống như sidebar (moved after title is available)
  const { data: projectsData } = useMyProjects();
  const { teams } = useMyTeams();

  // Handler for project deletion
  const handleProjectDelete = React.useCallback(async () => {
    const id = pathname.split('/')[2];
    const projectId = parseInt(id);

    if (!projectId || isNaN(projectId)) {
      console.error('Invalid project ID for deletion:', id);
      return;
    }

    try {
      console.log(`🗑️ PageLayout: Starting delete for project ${projectId}`);
      await deleteProject(projectId);
      console.log(`✅ PageLayout: Successfully deleted project ${projectId}`);

      // Redirect to home page after successful deletion
      router.push('/home');
    } catch (error: any) {
      console.error('❌ PageLayout: Failed to delete project:', error);
      // Error will be shown by the AlertDialog through the error thrown by the hook
      throw error;
    }
  }, [pathname, deleteProject, router]);

  // 🔥 MOVED: Function để lấy tên thực tế của entity (moved after title is available)
  const getRealEntityName = React.useCallback(() => {
    const pathParts = pathname.split('/');
    const entityType = pathParts[1]; // 'teams' or 'projects'
    const entityId = pathParts[2];

    if (!entityId) return title; // fallback to config title

    if (entityType === 'projects' && projectsData) {
      // 🔥 FIXED: Add proper type checking and explicit typing
      const projects = Array.isArray(projectsData)
        ? projectsData
        : (projectsData as any)?.projects || [];
      const project = projects.find((p: any) => p.id.toString() === entityId);
      return project?.name || title;
    }

    if (entityType === 'teams' && teams) {
      const team = teams.find((t: any) => t.id.toString() === entityId);
      return team?.name || title;
    }

    return title; // fallback
  }, [pathname, title, projectsData, teams]);

  // 🔥 MOVED: Get real title for teams/projects pages (moved after title is available)
  const displayTitle = (pathname.startsWith("/teams/") || pathname.startsWith("/projects/"))
    ? getRealEntityName()
    : title;

  if (!mounted) {
    // Prevent hydration mismatch by not rendering sticky styles until mounted
    return (
      <div style={{ backgroundColor: theme.background.primary }}>
        <div className="flex-shrink-0">
          <div className="flex flex-col border-b gap-2 px-6" style={{ borderColor: theme.border.default }}>
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-bold" style={{ color: theme.text.primary }}>
                {title}
              </h1>
            </div>
            <div>
              <ul className="flex items-center gap-5">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="flex items-center gap-1">
                      {item.icon}
                      <span className="font-medium" style={{ color: theme.text.primary }}>
                        {item.label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div>{children}</div>
      </div>
    );
  }

  // Skip header on dashboard detail pages
  const isDashboardDetailPage = mounted && pathname?.match(/\/reporting\/dashboards\/[^/]+$/);
  if (isDashboardDetailPage) {
    return (
      <div style={{ backgroundColor: theme.background.primary }}>
        {children}
      </div>
    );
  }

  const isInboxStyle = mounted && pathname.startsWith("/inbox");
  const isMyTaskStyle = mounted && (pathname.startsWith("/my-tasks") || pathname.startsWith("/project") || pathname.startsWith("/owner") || pathname.startsWith("/portfolios") || pathname.startsWith("/reporting") || pathname.startsWith("/goals") || pathname.startsWith("/manager"));
  const isTeamsStyle = mounted && pathname.startsWith("/teams");

  return (
    <div style={{ backgroundColor: theme.background.primary }}>
      {/* Sticky Header - Adjust for fixed main header */}
      <div
        className="sticky  z-30"
        style={{ backgroundColor: theme.background.primary }}
      >
        {/* Top Header Sections */}
        {headerSections.length > 0 && (
          <div className="p-6 pb-0">
            <HeaderSectionRenderer sections={headerSections} position="top" />
          </div>
        )}

        {/* Header */}
        <div
          className={clsx(
            "flex flex-col",
            isInboxStyle ? "gap-4 pb-4 px-6" : "gap-2 px-6"
          )}
        >
          {/* Breadcrumbs */}
          {headerInfo?.breadcrumbs && (
            <Breadcrumbs breadcrumbs={headerInfo.breadcrumbs} />
          )}

          {/* Title and Actions Row */}
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              {headerInfo?.avatar && (
                <div className="flex items-center">
                  {headerInfo.avatar}
                </div>
              )}

              {/* Use TitleDropdown for teams and projects, regular title for others */}
              {(pathname.startsWith("/teams/") || pathname.startsWith("/projects/")) ? (
                <TitleDropdown
                  type={pathname.startsWith("/teams/") ? "team" : "project"}
                  currentTitle={displayTitle}
                  currentId={pathname.split('/')[2]}
                  onEdit={() => {
                    const id = pathname.split('/')[2];
                    const type = pathname.startsWith("/teams/") ? "teams" : "projects";
                    router.push(`/${type}/${id}/edit`);
                  }}
                />
              ) : (
                <h1
                  data-page-title
                  className={clsx(
                    "font-semibold",
                    isInboxStyle ? "text-2xl" : isMyTaskStyle || isTeamsStyle ? "text-2xl" : "text-lg font-bold"
                  )}
                  style={{
                    color: isMyTaskStyle || isTeamsStyle ? theme.text.primary : theme.text.primary
                  }}
                >
                  {displayTitle}
                </h1>
              )}

              {headerInfo?.subtitle && (
                <span
                  className="text-sm"
                  style={{
                    color: isMyTaskStyle || isTeamsStyle ? theme.text.secondary : theme.text.secondary
                  }}
                >
                  {headerInfo.subtitle}
                </span>
              )}
            </div>

            {/* Actions */}
            {actions.length > 0 && (
              <div className="flex items-center gap-2">
                {actions.map((action, index) => (
                  <ActionButton key={index} action={action} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Custom Header Content */}
        {headerInfo?.customContent && (
          <div className="py-2">{headerInfo.customContent}</div>
        )}

        {/* Middle Header Sections */}
        <HeaderSectionRenderer sections={headerSections} position="middle" />

        {/* Navigation Tabs */}
        <div
          className="border-b"
          style={{ borderColor: theme.border.default }}
        >
          <ul
            className={clsx(
              "flex items-center",
              isInboxStyle ? "gap-1 -mb-px" : isMyTaskStyle || isTeamsStyle ? "gap-1 -mb-px" : "gap-5"
            )}
          >
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={clsx(
                    "flex items-center gap-2 transition-all duration-200 group",
                    // Inbox style
                    isInboxStyle &&
                      "px-4 py-3 border-b-2 font-medium text-sm",
                    // MyTask style
                    isMyTaskStyle &&
                      "px-4 py-3 rounded-t-lg border-b-2 font-medium text-sm relative",
                    // Teams style
                    isTeamsStyle &&
                      "px-4 py-3 rounded-t-lg border-b-2 font-medium text-sm relative"
                  )}
                  style={{
                    // Active state
                    ...(pathname === item.href ? {
                      borderBottomColor: theme.status.warning,
                      color: theme.text.primary,
                      fontWeight: '600',
                      marginBottom: isMyTaskStyle || isTeamsStyle ? '-1px' : '0'
                    } : {
                      borderBottomColor: 'transparent',
                      color: theme.text.muted
                    })
                  }}
                  onMouseEnter={(e) => {
                    if (pathname !== item.href) {
                      e.currentTarget.style.color = theme.status.warning;
                      e.currentTarget.style.borderBottomColor = theme.status.warning;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (pathname !== item.href) {
                      e.currentTarget.style.color = theme.text.muted;
                      e.currentTarget.style.borderBottomColor = 'transparent';
                    }
                  }}
                >
                  {item.icon && (
                    <span className="flex-shrink-0 transition-colors duration-200">
                      {item.icon}
                    </span>
                  )}
                  <span className="font-medium whitespace-nowrap">{item.label}</span>
                </Link>
              </li>
            ))}

            {/* Plus button for inbox and teams style */}
            {(isInboxStyle || isTeamsStyle) && showTabsPlus && (
              <li className="ml-auto">
                <button
                  className="p-1.5 rounded-md transition-colors"
                  style={{ color: theme.text.secondary }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme.background.weakHover;
                    e.currentTarget.style.color = theme.text.primary;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = theme.text.secondary;
                  }}
                >
                  <ACTION_ICONS.create className="w-4 h-4" />
                </button>
              </li>
            )}
          </ul>
        </div>

        {/* Bottom Header Sections */}
        <HeaderSectionRenderer sections={headerSections} position="bottom" />
      </div>

      {/* Content */}
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
};

export default PageLayout;
