'use client';

import React, { useState } from 'react';
import { X, Calendar, Users, Tag, Filter } from 'lucide-react';
import { SearchEntity, SearchFilters, TaskStatus, TaskPriority, ProjectStatus, Department, TeamType } from '@/types/search';
import { cn } from '@/lib/utils';

interface SearchFiltersPanelProps {
  entities: SearchEntity[];
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  onClose: () => void;
}

const SearchFiltersPanel: React.FC<SearchFiltersPanelProps> = ({
  entities,
  filters,
  onFiltersChange,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<SearchEntity>(entities[0] || 'tasks');

  const handleFilterUpdate = (entity: SearchEntity, key: string, value: any) => {
    const newFilters = {
      ...filters,
      [entity]: {
        ...filters[entity],
        [key]: value
      }
    };
    onFiltersChange(newFilters);
  };

  const clearFiltersForEntity = (entity: SearchEntity) => {
    const newFilters = { ...filters };
    delete newFilters[entity];
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    onFiltersChange({});
  };

  const getActiveFilterCount = () => {
    return Object.values(filters).reduce((count, entityFilters) => {
      if (entityFilters) {
        return count + Object.keys(entityFilters).length;
      }
      return count;
    }, 0);
  };

  return (
    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center">
          <Filter className="h-4 w-4 mr-2 text-gray-600" />
          <h3 className="text-sm font-medium text-gray-900">Search Filters</h3>
          {getActiveFilterCount() > 0 && (
            <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-600 rounded-full">
              {getActiveFilterCount()}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {getActiveFilterCount() > 0 && (
            <button
              onClick={clearAllFilters}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Clear all
            </button>
          )}
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {entities.map(entity => (
          <button
            key={entity}
            onClick={() => setActiveTab(entity)}
            className={cn(
              "flex-1 px-4 py-2 text-sm font-medium capitalize",
              activeTab === entity
                ? "border-b-2 border-blue-500 bg-blue-50 text-blue-600"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            )}
          >
            {entity}
            {filters[entity] && Object.keys(filters[entity]).length > 0 && (
              <span className="ml-1 w-2 h-2 bg-blue-500 rounded-full inline-block"></span>
            )}
          </button>
        ))}
      </div>

      {/* Filter Content */}
      <div className="p-4 max-h-64 overflow-y-auto">
        {activeTab === 'tasks' && (
          <TaskFilters
            filters={filters.tasks || {}}
            onChange={(key, value) => handleFilterUpdate('tasks', key, value)}
            onClear={() => clearFiltersForEntity('tasks')}
          />
        )}

        {activeTab === 'projects' && (
          <ProjectFilters
            filters={filters.projects || {}}
            onChange={(key, value) => handleFilterUpdate('projects', key, value)}
            onClear={() => clearFiltersForEntity('projects')}
          />
        )}

        {activeTab === 'users' && (
          <UserFilters
            filters={filters.users || {}}
            onChange={(key, value) => handleFilterUpdate('users', key, value)}
            onClear={() => clearFiltersForEntity('users')}
          />
        )}

        {activeTab === 'teams' && (
          <TeamFilters
            filters={filters.teams || {}}
            onChange={(key, value) => handleFilterUpdate('teams', key, value)}
            onClear={() => clearFiltersForEntity('teams')}
          />
        )}
      </div>
    </div>
  );
};

// Task Filters Component
const TaskFilters: React.FC<{
  filters: any;
  onChange: (key: string, value: any) => void;
  onClear: () => void;
}> = ({ filters, onChange, onClear }) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <h4 className="text-sm font-medium text-gray-900">Task Filters</h4>
      {Object.keys(filters).length > 0 && (
        <button onClick={onClear} className="text-xs text-gray-500 hover:text-gray-700">
          Clear
        </button>
      )}
    </div>

    {/* Status Filter */}
    <MultiSelectFilter
      label="Status"
      icon={<Tag className="h-3 w-3" />}
      options={[
        { value: TaskStatus.TODO, label: 'To Do', color: 'gray' },
        { value: TaskStatus.IN_PROGRESS, label: 'In Progress', color: 'blue' },
        { value: TaskStatus.COMPLETED, label: 'Completed', color: 'green' },
        { value: TaskStatus.CANCELLED, label: 'Cancelled', color: 'red' }
      ]}
      value={filters.status || []}
      onChange={(value) => onChange('status', value)}
    />

    {/* Priority Filter */}
    <MultiSelectFilter
      label="Priority"
      icon={<Tag className="h-3 w-3" />}
      options={[
        { value: TaskPriority.LOW, label: 'Low', color: 'gray' },
        { value: TaskPriority.MEDIUM, label: 'Medium', color: 'yellow' },
        { value: TaskPriority.HIGH, label: 'High', color: 'orange' },
        { value: TaskPriority.URGENT, label: 'Urgent', color: 'red' }
      ]}
      value={filters.priority || []}
      onChange={(value) => onChange('priority', value)}
    />

    {/* Due Date Range Filter */}
    <DateRangeFilter
      label="Due Date"
      value={filters.dueDateRange}
      onChange={(value) => onChange('dueDateRange', value)}
    />
  </div>
);

// Project Filters Component
const ProjectFilters: React.FC<{
  filters: any;
  onChange: (key: string, value: any) => void;
  onClear: () => void;
}> = ({ filters, onChange, onClear }) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <h4 className="text-sm font-medium text-gray-900">Project Filters</h4>
      {Object.keys(filters).length > 0 && (
        <button onClick={onClear} className="text-xs text-gray-500 hover:text-gray-700">
          Clear
        </button>
      )}
    </div>

    {/* Status Filter */}
    <MultiSelectFilter
      label="Status"
      icon={<Tag className="h-3 w-3" />}
      options={[
        { value: ProjectStatus.ACTIVE, label: 'Active', color: 'green' },
        { value: ProjectStatus.COMPLETED, label: 'Completed', color: 'blue' },
        { value: ProjectStatus.ARCHIVED, label: 'Archived', color: 'gray' }
      ]}
      value={filters.status || []}
      onChange={(value) => onChange('status', value)}
    />
  </div>
);

// User Filters Component
const UserFilters: React.FC<{
  filters: any;
  onChange: (key: string, value: any) => void;
  onClear: () => void;
}> = ({ filters, onChange, onClear }) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <h4 className="text-sm font-medium text-gray-900">User Filters</h4>
      {Object.keys(filters).length > 0 && (
        <button onClick={onClear} className="text-xs text-gray-500 hover:text-gray-700">
          Clear
        </button>
      )}
    </div>

    {/* Department Filter */}
    <MultiSelectFilter
      label="Department"
      icon={<Users className="h-3 w-3" />}
      options={[
        { value: Department.ENGINEERING, label: 'Engineering', color: 'blue' },
        { value: Department.DESIGN, label: 'Design', color: 'purple' },
        { value: Department.MARKETING, label: 'Marketing', color: 'green' },
        { value: Department.SALES, label: 'Sales', color: 'orange' },
        { value: Department.HR, label: 'HR', color: 'pink' }
      ]}
      value={filters.departments || []}
      onChange={(value) => onChange('departments', value)}
    />

    {/* Active Status */}
    <div>
      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={filters.isActive || false}
          onChange={(e) => onChange('isActive', e.target.checked)}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <span className="text-sm text-gray-700">Show only active users</span>
      </label>
    </div>
  </div>
);

// Team Filters Component
const TeamFilters: React.FC<{
  filters: any;
  onChange: (key: string, value: any) => void;
  onClear: () => void;
}> = ({ filters, onChange, onClear }) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <h4 className="text-sm font-medium text-gray-900">Team Filters</h4>
      {Object.keys(filters).length > 0 && (
        <button onClick={onClear} className="text-xs text-gray-500 hover:text-gray-700">
          Clear
        </button>
      )}
    </div>

    {/* Team Type Filter */}
    <MultiSelectFilter
      label="Team Type"
      icon={<Users className="h-3 w-3" />}
      options={[
        { value: TeamType.DEVELOPMENT, label: 'Development', color: 'blue' },
        { value: TeamType.DESIGN, label: 'Design', color: 'purple' },
        { value: TeamType.MARKETING, label: 'Marketing', color: 'green' },
        { value: TeamType.SALES, label: 'Sales', color: 'orange' }
      ]}
      value={filters.types || []}
      onChange={(value) => onChange('types', value)}
    />

    {/* Exclude My Teams */}
    <div>
      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={filters.excludeMyTeams || false}
          onChange={(e) => onChange('excludeMyTeams', e.target.checked)}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <span className="text-sm text-gray-700">Exclude my teams</span>
      </label>
    </div>
  </div>
);

// Multi-Select Filter Component
interface MultiSelectFilterProps {
  label: string;
  icon?: React.ReactNode;
  options: Array<{ value: string; label: string; color: string }>;
  value: string[];
  onChange: (value: string[]) => void;
}

const MultiSelectFilter: React.FC<MultiSelectFilterProps> = ({
  label,
  icon,
  options,
  value,
  onChange
}) => {
  const toggleOption = (optionValue: string) => {
    const newValue = value.includes(optionValue)
      ? value.filter(v => v !== optionValue)
      : [...value, optionValue];
    onChange(newValue);
  };

  const getColorClasses = (color: string, isSelected: boolean) => {
    const colors = {
      gray: isSelected ? 'bg-gray-100 text-gray-800 border-gray-300' : 'border-gray-200 hover:bg-gray-50',
      blue: isSelected ? 'bg-blue-100 text-blue-800 border-blue-300' : 'border-gray-200 hover:bg-blue-50',
      green: isSelected ? 'bg-green-100 text-green-800 border-green-300' : 'border-gray-200 hover:bg-green-50',
      yellow: isSelected ? 'bg-yellow-100 text-yellow-800 border-yellow-300' : 'border-gray-200 hover:bg-yellow-50',
      orange: isSelected ? 'bg-orange-100 text-orange-800 border-orange-300' : 'border-gray-200 hover:bg-orange-50',
      red: isSelected ? 'bg-red-100 text-red-800 border-red-300' : 'border-gray-200 hover:bg-red-50',
      purple: isSelected ? 'bg-purple-100 text-purple-800 border-purple-300' : 'border-gray-200 hover:bg-purple-50',
      pink: isSelected ? 'bg-pink-100 text-pink-800 border-pink-300' : 'border-gray-200 hover:bg-pink-50'
    };
    return colors[color as keyof typeof colors] || colors.gray;
  };

  return (
    <div>
      <div className="flex items-center mb-2">
        {icon}
        <label className="text-xs font-medium text-gray-700 ml-1">{label}</label>
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map(option => {
          const isSelected = value.includes(option.value);
          return (
            <button
              key={option.value}
              onClick={() => toggleOption(option.value)}
              className={cn(
                "px-2 py-1 text-xs border rounded-md transition-colors",
                getColorClasses(option.color, isSelected)
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// Date Range Filter Component
const DateRangeFilter: React.FC<{
  label: string;
  value?: { from: string; to: string };
  onChange: (value: { from: string; to: string } | undefined) => void;
}> = ({ label, value, onChange }) => {
  const handleFromChange = (from: string) => {
    onChange(value ? { ...value, from } : { from, to: '' });
  };

  const handleToChange = (to: string) => {
    onChange(value ? { ...value, to } : { from: '', to });
  };

  const clearDateRange = () => {
    onChange(undefined);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <Calendar className="h-3 w-3" />
          <label className="text-xs font-medium text-gray-700 ml-1">{label}</label>
        </div>
        {value && (
          <button
            onClick={clearDateRange}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            Clear
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs text-gray-500 mb-1">From</label>
          <input
            type="date"
            value={value?.from || ''}
            onChange={(e) => handleFromChange(e.target.value)}
            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">To</label>
          <input
            type="date"
            value={value?.to || ''}
            onChange={(e) => handleToChange(e.target.value)}
            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  );
};

export default SearchFiltersPanel;
