"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { ACTION_ICONS } from "@/constants/icons";
import { THEME_COLORS } from "@/constants/theme";
import { useTheme } from "@/layouts/hooks/useTheme";
import PrivateLayout from "@/layouts/private/PrivateLayout";
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
  const baseClasses =
    "px-3 py-1.5 text-sm rounded-md flex items-center gap-2 transition-colors";

  const variantClasses = {
    default: "text-gray-600 hover:text-gray-900 hover:bg-gray-100",
    primary: "text-blue-600 hover:text-blue-700 hover:bg-blue-50",
    ghost: "text-gray-600 hover:text-gray-900 hover:bg-gray-100",
  };

  const classes = clsx(
    baseClasses,
    variantClasses[action.variant || "default"],
    !action.label && "p-1.5" // For icon-only buttons
  );

  return (
    <button className={classes} onClick={action.onClick}>
      {action.icon}
      {action.label && <span>{action.label}</span>}
    </button>
  );
};

const Breadcrumbs = ({ breadcrumbs }: { breadcrumbs: BreadcrumbItem[] }) => {
  return (
    <nav className="flex items-center space-x-1 text-sm text-gray-500 mb-2">
      {breadcrumbs.map((item, index) => (
        <div key={index} className="flex items-center">
          {index > 0 && <ACTION_ICONS.right className="w-4 h-4 mx-1" />}
          {item.icon && <span className="mr-1">{item.icon}</span>}
          {item.href ? (
            <Link href={item.href} className="hover:text-gray-700">
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-900 font-medium">{item.label}</span>
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
  const config = usePageNavigation();
  const { theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!config) {
    // Fallback for pages without navigation config
    return <PrivateLayout>{children}</PrivateLayout>;
  }

  const {
    title,
    navItems,
    actions,
    headerInfo,
    showTabsPlus,
    headerSections = [],
  } = config;

  // Determine navigation style based on page type - only after mount to prevent hydration mismatch
  const isInboxStyle = mounted && pathname.startsWith("/inbox");
  const isMyTaskStyle = mounted && (pathname.startsWith("/mytask") || pathname.startsWith("/project") || pathname.startsWith("/owner") || pathname.startsWith("/portfolios") || pathname.startsWith("/reporting") || pathname.startsWith("/goals"));
  const isTeamsStyle = mounted && pathname.startsWith("/teams");

  // Prevent hydration mismatch by not rendering sticky styles until mounted
  if (!mounted) {
    return (
      <PrivateLayout>
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
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <div>{children}</div>
        </div>
      </PrivateLayout>
    );
  }

  return (
    <PrivateLayout>
      <div
        style={{
          backgroundColor: theme.background.primary,
        }}
      >
        {/* Sticky Header */}
        <div 
          className="sticky top-0 z-50"
          style={{ 
            backgroundColor: isMyTaskStyle || isTeamsStyle ? theme.header.background : theme.background.primary,
            borderBottom: `1px solid ${theme.border.default}`
          }}
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
              "flex flex-col border-b",
              isInboxStyle ? "gap-4 pb-4 px-6" : "gap-2 px-6"
            )}
            style={{ borderColor: theme.border.default }}
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
                <h1
                  data-page-title
                  className={clsx(
                    "font-semibold",
                    isInboxStyle ? "text-2xl" : isMyTaskStyle || isTeamsStyle ? "text-2xl" : "text-lg font-bold"
                  )}
                  style={{ 
                    color: isMyTaskStyle || isTeamsStyle ? theme.header.text : theme.text.primary 
                  }}
                >
                  {title}
                </h1>
                {headerInfo?.subtitle && (
                  <span 
                    className="text-sm"
                    style={{ 
                      color: isMyTaskStyle || isTeamsStyle ? theme.sidebar.textMuted : theme.text.secondary 
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

            {/* Custom Header Content */}
            {headerInfo?.customContent && (
              <div className="py-2">{headerInfo.customContent}</div>
            )}

            {/* Middle Header Sections */}
            <HeaderSectionRenderer sections={headerSections} position="middle" />

            {/* Navigation Tabs */}
            <div>
              <ul
                className={clsx(
                  "flex items-center",
                  isInboxStyle ? "gap-6 border-b -mb-4" : isMyTaskStyle ? "gap-1 -mb-px" : "gap-5"
                )}
                style={isInboxStyle ? { borderColor: theme.border.default } : {}}
              >
                {navItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={clsx(
                        "flex items-center gap-2 transition-all duration-200 group",
                        // Inbox style
                        isInboxStyle &&
                          "inline-block pb-4 border-b-2 font-medium text-sm",
                        // MyTask style - modern tabs
                        isMyTaskStyle && 
                          "px-4 py-3 rounded-t-lg border-b-2 font-medium text-sm relative",
                        // Inbox active state
                        isInboxStyle &&
                          pathname === item.href &&
                          "border-orange-500 text-orange-600",
                        isInboxStyle &&
                          pathname !== item.href &&
                          "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
                        // MyTask active state - consistent with teams theme
                        isMyTaskStyle &&
                          pathname === item.href &&
                          "border-orange-500 text-white font-semibold",
                        isMyTaskStyle &&
                          pathname !== item.href &&
                          "border-transparent text-gray-300 hover:text-orange-400 hover:border-orange-500",
                        // Teams active state
                        isTeamsStyle &&
                          pathname === item.href &&
                          "border-orange-500 text-white font-semibold border-b-2",
                        isTeamsStyle &&
                          pathname !== item.href &&
                          "border-transparent text-gray-300 hover:text-white hover:border-gray-300"
                      )}
                      style={
                        isMyTaskStyle && pathname === item.href
                          ? {
                              marginBottom: '-1px',
                            }
                          : {}
                      }
                    >
                      {item.icon && (
                        <span 
                          className={clsx(
                            "flex-shrink-0 transition-colors duration-200",
                            isMyTaskStyle && pathname === item.href && "text-orange-500",
                            isMyTaskStyle && pathname !== item.href && "text-gray-400 group-hover:text-orange-400"
                          )}
                        >
                          {item.icon}
                        </span>
                      )}
                      <span className="font-medium whitespace-nowrap">{item.label}</span>
                    </Link>
                  </li>
                ))}

                {/* Plus button for inbox style */}
                {isInboxStyle && showTabsPlus && (
                  <li className="ml-auto">
                    <button
                      className="p-1.5 rounded-md transition-colors"
                      style={{
                        color: theme.text.secondary,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = theme.text.primary;
                        e.currentTarget.style.backgroundColor =
                          theme.background.secondary;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = theme.text.secondary;
                        e.currentTarget.style.backgroundColor = "transparent";
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
        </div>

        {/* Content */}
        <div>
          {children}
        </div>
      </div>
    </PrivateLayout>
  );
};

export default PageLayout;
