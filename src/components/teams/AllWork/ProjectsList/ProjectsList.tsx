"use client";

import React from "react";
import { Button, UserAvatarGroup } from "@/components/ui";
import { DARK_THEME } from "@/constants/theme";
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
  }>; // Optional since backend doesn't provide members
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

// Mock project data matching the screenshot
const mockProjects: Project[] = [
  {
    id: '1',
    name: 'd',
    status: 'Joined',
    members: [
      { id: '1', name: 'User 1', initials: 'lc', color: '#ff6b6b' },
      { id: '2', name: 'User 2', initials: 'cu', color: '#4ecdc4' }
    ],
    color: '#6b7280',
    icon: 'folder'
  },
  {
    id: '2', 
    name: 'd',
    status: 'Joined',
    members: [
      { id: '3', name: 'User 3', initials: 'cu', color: '#ff6b6b' },
      { id: '4', name: 'User 4', initials: 'cu', color: '#ffd93d' }
    ],
    color: '#8b5cf6',
    icon: 'folder'
  },
  {
    id: '3',
    name: 'de', 
    status: 'Joined',
    members: [
      { id: '5', name: 'User 5', initials: 'cu', color: '#ff6b6b' }
    ],
    color: '#6b7280',
    icon: 'folder'
  },
  {
    id: '4',
    name: 'demo',
    status: 'Joined', 
    members: [
      { id: '6', name: 'User 6', initials: 'cu', color: '#ff6b6b' },
      { id: '7', name: 'User 7', initials: 'lc', color: '#4ecdc4' },
      { id: '8', name: 'User 8', initials: 'cu', color: '#ffd93d' },
      { id: '9', name: 'User 9', initials: 'cv', color: '#9ca3af' }
    ],
    color: '#6b7280',
    icon: 'folder'
  },
  {
    id: '5',
    name: 'demo project',
    status: 'Complete',
    members: [
      { id: '10', name: 'User 10', initials: 'lc', color: '#ff6b6b' },
      { id: '11', name: 'User 11', initials: 'cu', color: '#ffd93d' }
    ],
    color: '#10b981',
    icon: 'folder'
  },
  {
    id: '6',
    name: 'test task',
    status: 'Joined',
    members: [
      { id: '12', name: 'User 12', initials: 'cu', color: '#ff6b6b' }
    ],
    color: '#ec4899',
    icon: 'folder'
  }
];

export default function ProjectsList({ 
  projects = mockProjects, 
  loading = false, 
  onNewProject, 
  onProjectClick, 
  onRefresh 
}: ProjectsListProps) {
  return (
    <div 
      className="rounded-lg border p-6"
      style={{ 
        backgroundColor: DARK_THEME.background.secondary,
        borderColor: DARK_THEME.border.default 
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 
          className="text-lg font-semibold"
          style={{ color: DARK_THEME.text.primary }}
        >
          Projects
        </h2>
        <Button
          variant="secondary"
          size="sm"
          onClick={onNewProject}
          className="bg-gray-800 hover:bg-gray-700 text-white border-gray-600 px-4 py-2 rounded-md font-medium"
        >
          New project
        </Button>
      </div>

      {/* Table Header */}
      <div 
        className="grid grid-cols-12 pb-2 mb-4 border-b"
        style={{ borderColor: DARK_THEME.border.default }}
      >
        <div 
          className="col-span-6 text-sm font-medium"
          style={{ color: DARK_THEME.text.secondary }}
        >
          Name
        </div>
        <div 
          className="col-span-4 text-sm font-medium"
          style={{ color: DARK_THEME.text.secondary }}
        >
          Members
        </div>
        <div 
          className="col-span-2 text-sm font-medium flex items-center justify-end gap-1"
          style={{ color: DARK_THEME.text.secondary }}
        >
          <span>A to Z</span>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <path d="M6 3l3 3H3l3-3z"/>
          </svg>
        </div>
      </div>

      {/* Projects List */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-400">Loading team projects...</div>
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-gray-400 mb-4">No projects found for this team</div>
            <Button
              variant="secondary"
              size="sm"
              onClick={onNewProject}
              className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600 px-4 py-2 rounded-md font-medium"
            >
              Create your first project
            </Button>
          </div>
        ) : (
          projects.map((project) => (
          <div
            key={project.id}
            className="grid grid-cols-12 items-center p-3 rounded-lg cursor-pointer transition-colors hover:bg-opacity-50"
            style={{ backgroundColor: 'transparent' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = DARK_THEME.background.weakHover;
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
                  style={{ color: DARK_THEME.text.primary }}
                >
                  {project.name}
                </span>
                <div className="flex items-center gap-2">
                  <span 
                    className="text-xs"
                    style={{ color: DARK_THEME.text.muted }}
                  >
                    {project.status}
                  </span>
                  {project.status === 'Complete' && (
                    <div className="flex items-center">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="#10b981">
                        <path d="M10 3L4.5 8.5 2 6" stroke="#10b981" strokeWidth="1.5" fill="none"/>
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Members Column */}
            <div className="col-span-4 flex items-center">
              <UserAvatarGroup
                users={project.members || []}
                max={4}
                size="sm"
              />
            </div>

            {/* Action Column */}
            <div className="col-span-2 flex items-center justify-end">
              <Button
                variant="ghost"
                size="sm"
                className="w-6 h-6 p-0 rounded-full hover:bg-gray-700"
              >
                <span 
                  className="text-sm"
                  style={{ color: DARK_THEME.text.muted }}
                >
                  •••
                </span>
              </Button>
            </div>
          </div>
          ))
        )}
      </div>
    </div>
  );
}