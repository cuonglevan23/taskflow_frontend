"use client";

import React from "react";
import { Button, UserAvatarGroup } from "@/components/ui";
import { useThemeContext } from "@/providers/ThemeProvider";
import { useLanguageContext } from "@/providers/LanguageProvider";
import { NAVIGATION_ICONS } from "@/constants/icons";

export interface Project {
  id: string;
  name: string;
  status: 'Joined' | 'Complete';
  members?: Array<{
    id: string;
    name: string;
    initials: string;
    color: string;
  }>;
  color: string;
  icon?: string;
}

export interface ProjectsListProps {
  projects?: Project[];
  loading?: boolean;
  onNewProject: () => void;
  onProjectClick: (projectId: string) => void;
  onRefresh?: () => void;
}

export default function ProjectsList({
  projects = [],
  loading = false,
  onNewProject,
  onProjectClick,
  onRefresh
}: ProjectsListProps) {
  const { theme } = useThemeContext();
  const { messages } = useLanguageContext();

  // Helper function to get translated text
  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = messages;
    for (const k of keys) {
      value = value?.[k];
    }
    return typeof value === 'string' ? value : key;
  };

  // Helper function to get status color and icon
  const getStatusDisplay = (status: string) => {
    const isComplete = status === 'Complete';
    return {
      color: isComplete ? theme.status.success : theme.text.muted,
      showIcon: isComplete
    };
  };

  return (
    <div
      className="rounded-lg border p-6"
      style={{
        backgroundColor: theme.background.secondary,
        borderColor: theme.border.default
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2
          className="text-lg font-semibold"
          style={{ color: theme.text.primary }}
        >
          {t('sidebar.sections.projects')}
        </h2>
        <Button
          variant="secondary"
          size="sm"
          onClick={onNewProject}
          className="px-4 py-2 rounded-md font-medium transition-colors"
          style={{
            backgroundColor: theme.background.secondary,
            color: theme.text.primary,
            borderColor: theme.border.default,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = theme.background.weakHover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = theme.background.secondary;
          }}
        >
          {t('cards.projects.createProject')}
        </Button>
      </div>

      {/* Table Header */}
      <div
        className="grid grid-cols-12 pb-2 mb-4 border-b"
        style={{ borderColor: theme.border.default }}
      >
        <div
          className="col-span-6 text-sm font-medium"
          style={{ color: theme.text.secondary }}
        >
          {t('taskList.headers.name')}
        </div>
        <div
          className="col-span-4 text-sm font-medium"
          style={{ color: theme.text.secondary }}
        >
          {t('projectOverview.members.title')}
        </div>
        <div
          className="col-span-2 text-sm font-medium flex items-center justify-end gap-1"
          style={{ color: theme.text.secondary }}
        >
          <span>{t('common.sort.aToZ')}</span>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <path d="M6 3l3 3H3l3-3z"/>
          </svg>
        </div>
      </div>

      {/* Projects List */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div style={{ color: theme.text.muted }}>
              {t('cards.projects.loading')}
            </div>
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div style={{ color: theme.text.muted }} className="mb-4">
              {t('cards.projects.noProjects')}
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={onNewProject}
              className="px-4 py-2 rounded-md font-medium transition-colors"
              style={{
                backgroundColor: theme.status.info,
                color: theme.text.inverse,
                borderColor: theme.status.info,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.background.weakHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = theme.status.info;
              }}
            >
              {t('cards.projects.createProjects')}
            </Button>
          </div>
        ) : (
          projects.map((project) => {
            const statusDisplay = getStatusDisplay(project.status);

            return (
              <div
                key={project.id}
                className="grid grid-cols-12 items-center p-3 rounded-lg cursor-pointer transition-colors"
                style={{ backgroundColor: 'transparent' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.background.weakHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
                onClick={() => onProjectClick(project.id)}
              >
                {/* Name Column */}
                <div className="col-span-6 flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-medium"
                    style={{ backgroundColor: project.color }}
                  >
                    {React.createElement(NAVIGATION_ICONS.projects, { size: 16 })}
                  </div>
                  <div className="flex flex-col">
                    <span
                      className="text-sm font-medium"
                      style={{ color: theme.text.primary }}
                    >
                      {project.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span
                        className="text-xs"
                        style={{ color: statusDisplay.color }}
                      >
                        {t(`common.status.${project.status.toLowerCase()}`)}
                      </span>
                      {statusDisplay.showIcon && (
                        <div className="flex items-center">
                          <svg width="12" height="12" viewBox="0 0 12 12" fill={theme.status.success}>
                            <path d="M10 3L4.5 8.5 2 6" stroke={theme.status.success} strokeWidth="1.5" fill="none"/>
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Members Column */}
                <div className="col-span-4 flex items-center">
                  <UserAvatarGroup
                    users={project.members?.map(member => ({
                      ...member,
                      email: `${member.name.toLowerCase().replace(' ', '.')}@company.com`
                    })) || []}
                    max={4}
                    size="sm"
                  />
                </div>

                {/* Action Column */}
                <div className="col-span-2 flex items-center justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-6 h-6 p-0 rounded-full transition-colors"
                    style={{
                      color: theme.text.muted
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = theme.background.weakHover;
                      e.currentTarget.style.color = theme.text.primary;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = theme.text.muted;
                    }}
                  >
                    <span className="text-sm">•••</span>
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
