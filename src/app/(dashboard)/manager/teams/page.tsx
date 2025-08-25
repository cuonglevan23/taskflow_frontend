"use client";

import React, { useState } from "react";
import { useOptimizedSession } from '@/hooks/useOptimizedSession'; // Tối ưu session
import { useTheme } from '@/layouts/hooks/useTheme';
import { Users, Plus, MoreHorizontal, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui';
import { useTeams } from '@/hooks/teams/useTeams';
import type { Team } from '@/types/teams';

interface TeamsPageProps {
  searchValue?: string;
}

// Mock data for teams
const mockTeams = [
  {
    id: '1',
    name: 'Development Team',
    description: 'Frontend and backend developers',
    memberCount: 12,
    lead: 'John Smith',
    projects: ['Website Redesign', 'Mobile App'],
    status: 'active',
    avatar: 'DT'
  },
  {
    id: '2',
    name: 'Design Team',
    description: 'UI/UX designers and graphic artists',
    memberCount: 6,
    lead: 'Sarah Johnson',
    projects: ['Website Redesign', 'Marketing Campaign'],
    status: 'active',
    avatar: 'DS'
  },
  {
    id: '3',
    name: 'Marketing Team',
    description: 'Digital marketing and content creation',
    memberCount: 8,
    lead: 'Mike Wilson',
    projects: ['Marketing Campaign'],
    status: 'active',
    avatar: 'MK'
  },
  {
    id: '4',
    name: 'QA Team',
    description: 'Quality assurance and testing',
    memberCount: 4,
    lead: 'Lisa Chen',
    projects: ['Mobile App', 'Database Migration'],
    status: 'active',
    avatar: 'QA'
  },
  {
    id: '5',
    name: 'DevOps Team',
    description: 'Infrastructure and deployment',
    memberCount: 3,
    lead: 'David Brown',
    projects: ['Database Migration'],
    status: 'inactive',
    avatar: 'DO'
  }
];

const TeamsPage = ({ searchValue = "" }: TeamsPageProps) => {
  const { data: session, status } = useOptimizedSession(); // Sử dụng session tối ưu
  const { theme } = useTheme();
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  
  // Use SWR for automatic caching and real-time sync
  const { teams, totalElements, isLoading, error, revalidate } = useTeams();

  // Authentication check
  if (status === 'unauthenticated') {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Users size={48} className="mx-auto mb-4 text-gray-400" />
          <p style={{ color: theme.text.secondary }}>
            Please log in to view teams
          </p>
        </div>
      </div>
    );
  }

  // Filter teams based on search
  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchValue.toLowerCase()) ||
    (team.description?.toLowerCase() || '').includes(searchValue.toLowerCase())
  );

  const handleTeamSelect = (teamId: string) => {
    setSelectedTeams(prev =>
      prev.includes(teamId)
        ? prev.filter(id => id !== teamId)
        : [...prev, teamId]
    );
  };

  const handleCreateTeam = () => {
    console.log('Create new team');
  };

  // Calculate stats from real teams data
  const totalMembers = teams.length; // For now, use team count as member estimate
  const activeTeams = teams.length; // All teams are considered active

  // Manual refresh function for error retry
  const handleRefresh = () => {
    revalidate();
  };

  return (
    <div className="h-full overflow-y-auto p-6">
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
              <p style={{ color: theme.text.secondary }} className="text-sm">Total Teams</p>
              <p style={{ color: theme.text.primary }} className="text-2xl font-bold">
                {mockTeams.length}
              </p>
            </div>
            <Users size={24} style={{ color: theme.text.secondary }} />
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
              <p style={{ color: theme.text.secondary }} className="text-sm">Active Teams</p>
              <p style={{ color: theme.text.primary }} className="text-2xl font-bold">
                {isLoading ? '...' : activeTeams}
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
              <p style={{ color: theme.text.secondary }} className="text-sm">Total Members</p>
              <p style={{ color: theme.text.primary }} className="text-2xl font-bold">
                {isLoading ? '...' : Math.min(teams.length, 5)}
              </p>
            </div>
            <UserPlus size={24} style={{ color: theme.text.secondary }} />
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
              <p style={{ color: theme.text.secondary }} className="text-sm">My Teams</p>
              <p style={{ color: theme.text.primary }} className="text-2xl font-bold">
                {isLoading ? '...' : teams.length}
              </p>
            </div>
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          </div>
        </div>
      </div>

      {/* Teams Grid */}
      <div 
        className="rounded-lg border overflow-hidden"
        style={{ 
          backgroundColor: theme.background.secondary,
          borderColor: theme.border.default 
        }}
      >
        {/* Header */}
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
              Teams ({filteredTeams.length})
            </h2>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleCreateTeam}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center gap-2"
              >
                <Plus size={16} />
                New Team
              </Button>
            </div>
          </div>
        </div>

        {/* Teams Grid */}
        <div className="p-6">
          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p style={{ color: theme.text.secondary }}>Loading teams...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <div className="text-red-500 mb-4">⚠️</div>
              <p style={{ color: theme.text.secondary }}>
                {error?.message || 'Failed to load teams'}
              </p>
              <button
                onClick={handleRefresh}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Teams Grid */}
          {!isLoading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTeams.map((team) => (
                <div 
                  key={team.id}
                  className="p-6 rounded-lg border hover:shadow-lg transition-shadow cursor-pointer"
                  style={{ 
                    backgroundColor: theme.background.primary,
                    borderColor: theme.border.default 
                  }}
                  onClick={() => console.log('Team clicked:', team.name)}
                >
                  {/* Team Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: '#3B82F6' }}
                      >
                        {team.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 
                          className="font-semibold text-lg"
                          style={{ color: theme.text.primary }}
                        >
                          {team.name}
                        </h3>
                        <p 
                          className="text-sm"
                          style={{ color: theme.text.secondary }}
                        >
                          {team.description || 'No description provided'}
                        </p>
                      </div>
                    </div>
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <MoreHorizontal size={16} style={{ color: theme.text.secondary }} />
                    </button>
                  </div>

                  {/* Team Stats */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between">
                      <span 
                        className="text-sm"
                        style={{ color: theme.text.secondary }}
                      >
                        Team ID
                      </span>
                      <span 
                        className="text-sm font-medium"
                        style={{ color: theme.text.primary }}
                      >
                        #{team.id}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span 
                        className="text-sm"
                        style={{ color: theme.text.secondary }}
                      >
                        Created
                      </span>
                      <span 
                        className="text-sm font-medium"
                        style={{ color: theme.text.primary }}
                      >
                        {new Date(team.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span 
                        className="text-sm"
                        style={{ color: theme.text.secondary }}
                      >
                        Status
                      </span>
                      <span 
                        className="px-2 py-1 rounded-full text-xs font-medium"
                        style={{ 
                          backgroundColor: '#10B98120',
                          color: '#10B981'
                        }}
                      >
                        Active
                      </span>
                    </div>
                  </div>

                  {/* Team Info */}
                  <div>
                    <p 
                      className="text-sm font-medium mb-2"
                      style={{ color: theme.text.secondary }}
                    >
                      Organization
                    </p>
                    <span 
                      className="px-2 py-1 rounded text-xs"
                      style={{ 
                        backgroundColor: `${theme.button?.primary?.background || '#3B82F6'}20`,
                        color: theme.button?.primary?.background || '#3B82F6'
                      }}
                    >
                      {team.organizationId ? `Org ${team.organizationId}` : 'Personal Team'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && filteredTeams.length === 0 && (
            <div className="text-center py-12">
              <Users size={48} className="mx-auto mb-4 text-gray-400" />
              <p style={{ color: theme.text.secondary }}>
                {searchValue ? 'No teams found matching your search.' : 'No teams found.'}
              </p>
              {!searchValue && (
                <button
                  onClick={handleCreateTeam}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Your First Team
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamsPage;