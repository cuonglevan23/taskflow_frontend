"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from 'next/navigation';
import { useTheme } from '@/layouts/hooks/useTheme';
import { FolderOpen, Plus, MoreHorizontal, AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui';

interface ProjectsPageProps {
  searchValue?: string;
}

// Mock data for projects
const mockProjects = [
  {
    id: '1',
    name: 'Website Redesign',
    description: 'Complete overhaul of company website',
    status: 'active',
    progress: 75,
    teamMembers: 8,
    dueDate: '2024-02-15',
    priority: 'high'
  },
  {
    id: '2',
    name: 'Mobile App Development',
    description: 'iOS and Android mobile application',
    status: 'active',
    progress: 45,
    teamMembers: 12,
    dueDate: '2024-03-30',
    priority: 'high'
  },
  {
    id: '3',
    name: 'Database Migration',
    description: 'Migrate legacy database to new system',
    status: 'planning',
    progress: 15,
    teamMembers: 5,
    dueDate: '2024-04-20',
    priority: 'medium'
  },
  {
    id: '4',
    name: 'Marketing Campaign',
    description: 'Q2 marketing campaign launch',
    status: 'completed',
    progress: 100,
    teamMembers: 6,
    dueDate: '2024-01-31',
    priority: 'low'
  }
];

const ProjectsPage = ({ searchValue = "" }: ProjectsPageProps) => {
  const { theme } = useTheme();
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const searchParams = useSearchParams();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Handle URL error parameters
  useEffect(() => {
    const error = searchParams.get('error');
    if (error === 'project_not_accessible') {
      setErrorMessage('� Project not accessible: The project you requested cannot be accessed or does not exist.');
    }
    
    // Clear error after 5 seconds
    if (error) {
      const timer = setTimeout(() => setErrorMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  // Filter projects based on search
  const filteredProjects = mockProjects.filter(project =>
    project.name.toLowerCase().includes(searchValue.toLowerCase()) ||
    project.description.toLowerCase().includes(searchValue.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10B981';
      case 'planning': return '#F59E0B';
      case 'completed': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
  };

  const handleProjectSelect = (projectId: string) => {
    setSelectedProjects(prev =>
      prev.includes(projectId)
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  const handleCreateProject = () => {
    console.log('Create new project');
  };

  return (
    <div className="h-full overflow-y-auto p-6">
      {/* Error Notification */}
      {errorMessage && (
        <div 
          className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between text-red-800"
        >
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 mr-3" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-red-600 hover:text-red-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div 
          className="p-4 rounded-lg border"
          style={{ 
            backgroundColor: theme.background.secondary,
            borderColor: theme.border.default 
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p style={{ color: theme.text.secondary }} className="text-sm">Total Projects</p>
              <p style={{ color: theme.text.primary }} className="text-2xl font-bold">
                {mockProjects.length}
              </p>
            </div>
            <FolderOpen size={24} style={{ color: theme.text.secondary }} />
          </div>
        </div>

        <div 
          className="p-4 rounded-lg border"
          style={{ 
            backgroundColor: theme.background.secondary,
            borderColor: theme.border.default 
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p style={{ color: theme.text.secondary }} className="text-sm">Active</p>
              <p style={{ color: theme.text.primary }} className="text-2xl font-bold">
                {mockProjects.filter(p => p.status === 'active').length}
              </p>
            </div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
        </div>

        <div 
          className="p-4 rounded-lg border"
          style={{ 
            backgroundColor: theme.background.secondary,
            borderColor: theme.border.default 
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p style={{ color: theme.text.secondary }} className="text-sm">Planning</p>
              <p style={{ color: theme.text.primary }} className="text-2xl font-bold">
                {mockProjects.filter(p => p.status === 'planning').length}
              </p>
            </div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          </div>
        </div>

        <div 
          className="p-4 rounded-lg border"
          style={{ 
            backgroundColor: theme.background.secondary,
            borderColor: theme.border.default 
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p style={{ color: theme.text.secondary }} className="text-sm">Completed</p>
              <p style={{ color: theme.text.primary }} className="text-2xl font-bold">
                {mockProjects.filter(p => p.status === 'completed').length}
              </p>
            </div>
            <div className="w-3 h-3 rounded-full bg-gray-500"></div>
          </div>
        </div>
      </div>

      {/* Projects Table */}
      <div 
        className="rounded-lg border overflow-hidden"
        style={{ 
          backgroundColor: theme.background.secondary,
          borderColor: theme.border.default 
        }}
      >
        {/* Table Header */}
        <div 
          className="px-6 py-4 border-b"
          style={{ 
            backgroundColor: theme.background.primary,
            borderColor: theme.border.default 
          }}
        >
          <div className="flex items-center justify-between">
            <h2 
              className="text-lg font-semibold"
              style={{ color: theme.text.primary }}
            >
              Projects ({filteredProjects.length})
            </h2>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleCreateProject}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center gap-2"
              >
                <Plus size={16} />
                New Project
              </Button>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr 
                className="border-b"
                style={{ borderColor: theme.border.default }}
              >
                <th className="text-left py-3 px-6">
                  <input
                    type="checkbox"
                    className="rounded"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedProjects(filteredProjects.map(p => p.id));
                      } else {
                        setSelectedProjects([]);
                      }
                    }}
                  />
                </th>
                <th 
                  className="text-left py-3 px-6 text-sm font-medium"
                  style={{ color: theme.text.secondary }}
                >
                  Project Name
                </th>
                <th 
                  className="text-left py-3 px-6 text-sm font-medium"
                  style={{ color: theme.text.secondary }}
                >
                  Status
                </th>
                <th 
                  className="text-left py-3 px-6 text-sm font-medium"
                  style={{ color: theme.text.secondary }}
                >
                  Progress
                </th>
                <th 
                  className="text-left py-3 px-6 text-sm font-medium"
                  style={{ color: theme.text.secondary }}
                >
                  Team
                </th>
                <th 
                  className="text-left py-3 px-6 text-sm font-medium"
                  style={{ color: theme.text.secondary }}
                >
                  Due Date
                </th>
                <th 
                  className="text-left py-3 px-6 text-sm font-medium"
                  style={{ color: theme.text.secondary }}
                >
                  Priority
                </th>
                <th 
                  className="text-left py-3 px-6 text-sm font-medium"
                  style={{ color: theme.text.secondary }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((project) => (
                <tr 
                  key={project.id}
                  className="border-b hover:bg-opacity-50"
                  style={{ 
                    borderColor: theme.border.default,
                    backgroundColor: selectedProjects.includes(project.id) 
                      ? `${theme.accent.primary}20` 
                      : 'transparent'
                  }}
                >
                  <td className="py-4 px-6">
                    <input
                      type="checkbox"
                      className="rounded"
                      checked={selectedProjects.includes(project.id)}
                      onChange={() => handleProjectSelect(project.id)}
                    />
                  </td>
                  <td className="py-4 px-6">
                    <div>
                      <div 
                        className="font-medium"
                        style={{ color: theme.text.primary }}
                      >
                        {project.name}
                      </div>
                      <div 
                        className="text-sm"
                        style={{ color: theme.text.secondary }}
                      >
                        {project.description}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span 
                      className="px-2 py-1 rounded-full text-xs font-medium capitalize"
                      style={{ 
                        backgroundColor: `${getStatusColor(project.status)}20`,
                        color: getStatusColor(project.status)
                      }}
                    >
                      {project.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <div 
                        className="flex-1 bg-gray-200 rounded-full h-2"
                        style={{ backgroundColor: `${theme.text.secondary}20` }}
                      >
                        <div 
                          className="h-2 rounded-full"
                          style={{ 
                            width: `${project.progress}%`,
                            backgroundColor: getStatusColor(project.status)
                          }}
                        ></div>
                      </div>
                      <span 
                        className="text-sm font-medium"
                        style={{ color: theme.text.primary }}
                      >
                        {project.progress}%
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span 
                      className="text-sm"
                      style={{ color: theme.text.primary }}
                    >
                      {project.teamMembers} members
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span 
                      className="text-sm"
                      style={{ color: theme.text.primary }}
                    >
                      {new Date(project.dueDate).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span 
                      className="px-2 py-1 rounded-full text-xs font-medium capitalize"
                      style={{ 
                        backgroundColor: `${getPriorityColor(project.priority)}20`,
                        color: getPriorityColor(project.priority)
                      }}
                    >
                      {project.priority}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <MoreHorizontal size={16} style={{ color: theme.text.secondary }} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <FolderOpen size={48} className="mx-auto mb-4 text-gray-400" />
            <p style={{ color: theme.text.secondary }}>
              {searchValue ? 'No projects found matching your search.' : 'No projects found.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsPage;