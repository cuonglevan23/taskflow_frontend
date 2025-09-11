'use client';

import React from 'react';
import {
  User,
  Calendar,
  Users,
  FolderOpen,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight
} from 'lucide-react';
import {
  SearchEntity,
  SearchResponse,
  SearchTask,
  SearchProject,
  SearchUser,
  SearchTeam
} from '@/types/search';
import { cn } from '@/lib/utils';

interface SearchResultsProps {
  results: SearchResponse['data'] | null;
  loading: boolean;
  error: string | null;
  query: string;
  onResultSelect: (item: any, type: SearchEntity) => void;
  onLoadMore: (entity: SearchEntity) => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  loading,
  error,
  query,
  onResultSelect,
  onLoadMore
}) => {
  if (loading) {
    return (
      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600">Searching...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-red-200 rounded-lg shadow-lg z-50 p-6">
        <div className="flex items-center text-red-600">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (!results) {
    return null;
  }

  const hasResults = Object.values(results).some(entityResult =>
    entityResult && entityResult.content && entityResult.content.length > 0
  );

  if (!hasResults) {
    return (
      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-6">
        <div className="text-center text-gray-500">
          <div className="text-lg mb-2">No results found</div>
          <div className="text-sm">
            Try adjusting your search terms or filters
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
      <div className="p-2">
        {/* Tasks Results */}
        {results.tasks && results.tasks.content.length > 0 && (
          <SearchEntitySection
            title="Tasks"
            icon={<CheckCircle2 className="h-4 w-4" />}
            items={results.tasks.content}
            totalCount={results.tasks.totalElements}
            hasMore={results.tasks.hasNext}
            onItemSelect={(item) => onResultSelect(item, 'tasks')}
            onLoadMore={() => onLoadMore('tasks')}
            renderItem={(task: SearchTask) => (
              <TaskResultItem key={task.id} task={task} query={query} />
            )}
          />
        )}

        {/* Projects Results */}
        {results.projects && results.projects.content.length > 0 && (
          <SearchEntitySection
            title="Projects"
            icon={<FolderOpen className="h-4 w-4" />}
            items={results.projects.content}
            totalCount={results.projects.totalElements}
            hasMore={results.projects.hasNext}
            onItemSelect={(item) => onResultSelect(item, 'projects')}
            onLoadMore={() => onLoadMore('projects')}
            renderItem={(project: SearchProject) => (
              <ProjectResultItem key={project.id} project={project} query={query} />
            )}
          />
        )}

        {/* Users Results */}
        {results.users && results.users.content.length > 0 && (
          <SearchEntitySection
            title="Users"
            icon={<User className="h-4 w-4" />}
            items={results.users.content}
            totalCount={results.users.totalElements}
            hasMore={results.users.hasNext}
            onItemSelect={(item) => onResultSelect(item, 'users')}
            onLoadMore={() => onLoadMore('users')}
            renderItem={(user: SearchUser) => (
              <UserResultItem key={user.id} user={user} query={query} />
            )}
          />
        )}

        {/* Teams Results */}
        {results.teams && results.teams.content.length > 0 && (
          <SearchEntitySection
            title="Teams"
            icon={<Users className="h-4 w-4" />}
            items={results.teams.content}
            totalCount={results.teams.totalElements}
            hasMore={results.teams.hasNext}
            onItemSelect={(item) => onResultSelect(item, 'teams')}
            onLoadMore={() => onLoadMore('teams')}
            renderItem={(team: SearchTeam) => (
              <TeamResultItem key={team.id} team={team} query={query} />
            )}
          />
        )}
      </div>
    </div>
  );
};

// Entity section component
interface SearchEntitySectionProps {
  title: string;
  icon: React.ReactNode;
  items: any[];
  totalCount: number;
  hasMore: boolean;
  onItemSelect: (item: any) => void;
  onLoadMore: () => void;
  renderItem: (item: any) => React.ReactNode;
}

const SearchEntitySection: React.FC<SearchEntitySectionProps> = ({
  title,
  icon,
  items,
  totalCount,
  hasMore,
  onItemSelect,
  onLoadMore,
  renderItem
}) => (
  <div className="mb-4 last:mb-0">
    <div className="flex items-center justify-between mb-2 px-2">
      <div className="flex items-center text-sm font-medium text-gray-700">
        {icon}
        <span className="ml-2">{title}</span>
        <span className="ml-1 text-gray-500">({totalCount})</span>
      </div>
    </div>

    <div className="space-y-1">
      {items.map((item, index) => (
        <div
          key={item.id || index}
          onClick={() => onItemSelect(item)}
          className="p-2 rounded-md hover:bg-gray-50 cursor-pointer transition-colors"
        >
          {renderItem(item)}
        </div>
      ))}
    </div>

    {hasMore && (
      <button
        onClick={onLoadMore}
        className="w-full mt-2 py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors flex items-center justify-center"
      >
        Load more {title.toLowerCase()}
        <ArrowRight className="h-3 w-3 ml-1" />
      </button>
    )}
  </div>
);

// Task result item
const TaskResultItem: React.FC<{ task: SearchTask; query: string }> = ({ task, query }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'TODO': return 'text-gray-600 bg-gray-100';
      case 'IN_PROGRESS': return 'text-blue-600 bg-blue-100';
      case 'COMPLETED': return 'text-green-600 bg-green-100';
      case 'CANCELLED': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'LOW': return 'text-gray-600';
      case 'MEDIUM': return 'text-yellow-600';
      case 'HIGH': return 'text-orange-600';
      case 'URGENT': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="flex items-start justify-between">
      <div className="flex-1 min-w-0">
        <div className="flex items-center mb-1">
          <h4 className="text-sm font-medium text-gray-900 truncate">
            <HighlightText text={task.title} highlight={query} />
          </h4>
          <span className={cn(
            "ml-2 px-2 py-0.5 text-xs rounded-full",
            getStatusColor(task.status)
          )}>
            {task.status.replace('_', ' ')}
          </span>
        </div>

        {task.description && (
          <p className="text-xs text-gray-600 mb-1 line-clamp-2">
            <HighlightText text={task.description} highlight={query} />
          </p>
        )}

        <div className="flex items-center text-xs text-gray-500 space-x-3">
          <span>Assigned to: {task.assigneeName}</span>
          {task.dueDate && (
            <span className="flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              {new Date(task.dueDate).toLocaleDateString()}
            </span>
          )}
          <span className={getPriorityColor(task.priority)}>
            {task.priority}
          </span>
        </div>
      </div>
    </div>
  );
};

// Project result item
const ProjectResultItem: React.FC<{ project: SearchProject; query: string }> = ({ project, query }) => (
  <div className="flex items-start justify-between">
    <div className="flex-1 min-w-0">
      <div className="flex items-center mb-1">
        <h4 className="text-sm font-medium text-gray-900 truncate">
          <HighlightText text={project.name} highlight={query} />
        </h4>
        <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-600 rounded-full">
          {project.status}
        </span>
      </div>

      {project.description && (
        <p className="text-xs text-gray-600 mb-1 line-clamp-2">
          <HighlightText text={project.description} highlight={query} />
        </p>
      )}

      <div className="flex items-center text-xs text-gray-500 space-x-3">
        <span>Owner: {project.ownerName}</span>
        <span>{project.memberCount} members</span>
        <span>{project.completionPercentage}% complete</span>
      </div>
    </div>
  </div>
);

// User result item
const UserResultItem: React.FC<{ user: SearchUser; query: string }> = ({ user, query }) => (
  <div className="flex items-center space-x-3">
    <div className="flex-shrink-0">
      {user.avatar ? (
        <img
          src={user.avatar}
          alt={user.fullName}
          className="h-8 w-8 rounded-full"
        />
      ) : (
        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
          <User className="h-4 w-4 text-gray-500" />
        </div>
      )}
    </div>

    <div className="flex-1 min-w-0">
      <div className="flex items-center mb-1">
        <h4 className="text-sm font-medium text-gray-900 truncate">
          <HighlightText text={user.fullName} highlight={query} />
        </h4>
        {user.isActive && (
          <span className="ml-2 h-2 w-2 bg-green-400 rounded-full"></span>
        )}
      </div>

      <div className="text-xs text-gray-600">
        <HighlightText text={user.email} highlight={query} />
      </div>

      <div className="text-xs text-gray-500">
        {user.jobTitle} • {user.department}
      </div>
    </div>
  </div>
);

// Team result item
const TeamResultItem: React.FC<{ team: SearchTeam; query: string }> = ({ team, query }) => (
  <div className="flex items-start justify-between">
    <div className="flex-1 min-w-0">
      <div className="flex items-center mb-1">
        <h4 className="text-sm font-medium text-gray-900 truncate">
          <HighlightText text={team.name} highlight={query} />
        </h4>
        <span className="ml-2 px-2 py-0.5 text-xs bg-purple-100 text-purple-600 rounded-full">
          {team.type}
        </span>
      </div>

      {team.description && (
        <p className="text-xs text-gray-600 mb-1 line-clamp-2">
          <HighlightText text={team.description} highlight={query} />
        </p>
      )}

      <div className="flex items-center text-xs text-gray-500 space-x-3">
        <span className="flex items-center">
          <Users className="h-3 w-3 mr-1" />
          {team.memberCount} members
        </span>
        <span>{team.department}</span>
        <span>Score: {team.performanceScore}%</span>
      </div>
    </div>
  </div>
);

// Highlight text component
const HighlightText: React.FC<{ text: string; highlight: string }> = ({ text, highlight }) => {
  if (!highlight.trim()) {
    return <>{text}</>;
  }

  const regex = new RegExp(`(${highlight})`, 'gi');
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, index) =>
        regex.test(part) ? (
          <mark key={index} className="bg-yellow-200 text-yellow-900 px-0.5 rounded">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
};

export default SearchResults;
