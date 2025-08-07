"use client";

import React, { useState } from "react";
import { useTheme } from "@/layouts/hooks/useTheme";
import { SearchInput, AvatarGroup } from "@/components/ui";
import { Filter, ArrowUpDown, Grid3X3, Settings, Check, ArrowUpDown as SortIcon } from 'lucide-react';
import Dropdown, { DropdownItem, DropdownSeparator } from '@/components/ui/Dropdown/Dropdown';
import { type Portfolio } from "@/hooks";

// Portfolio Table Row Component
const PortfolioRow = ({ 
  portfolio, 
  onPortfolioClick 
}: { 
  portfolio: Portfolio;
  onPortfolioClick: (portfolio: Portfolio) => void;
}) => {
  const { theme } = useTheme();

  return (
    <tr 
      className="border-b hover:bg-opacity-50 cursor-pointer transition-colors"
      style={{ borderBottomColor: theme.border.default }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = theme.background.secondary;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
      onClick={() => onPortfolioClick(portfolio)}
    >
      {/* Portfolio Name */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div 
            className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: portfolio.color }}
          >
            <span className="text-white text-sm font-medium">
              {portfolio.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <div 
              className="font-medium"
              style={{ color: theme.text.primary }}
            >
              {portfolio.name}
            </div>
            <div 
              className="text-sm"
              style={{ color: theme.text.secondary }}
            >
              {portfolio.status === 'active' ? 'Joined' : portfolio.status}
            </div>
          </div>
        </div>
      </td>

      {/* Members */}
      <td className="px-6 py-4">
        <AvatarGroup
          users={generatePortfolioUsers(portfolio)}
          maxVisible={3}
          size="sm"
          overlap={true}
          showTooltip={true}
          onUserClick={(user) => {
            console.log('User clicked:', user.name);
          }}
        />
      </td>

      {/* Parent portfolios */}
      <td className="px-6 py-4">
        <span 
          className="text-sm"
          style={{ color: theme.text.secondary }}
        >
          {/* Empty for now - can be extended */}
          -
        </span>
      </td>

      {/* Last modified */}
      <td className="px-6 py-4 text-right">
        <span 
          className="text-sm"
          style={{ color: theme.text.secondary }}
        >
          {new Date(portfolio.updatedAt).toLocaleDateString()}
        </span>
      </td>
    </tr>
  );
};

// Header Filters Component - Reuse TaskListHeader pattern
const PortfolioFilters = () => {
  const { theme } = useTheme();

  return (
    <div className="flex items-center gap-2">
      {/* Owner Filter */}
      <Dropdown
        usePortal={true}
        trigger={
          <button 
            className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors border"
            style={{
              color: theme.text.secondary,
              backgroundColor: theme.background.primary,
              borderColor: theme.border.default,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.background.secondary;
              e.currentTarget.style.color = theme.text.primary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme.background.primary;
              e.currentTarget.style.color = theme.text.secondary;
            }}
          >
            <span>Owner</span>
            <SortIcon className="w-4 h-4" />
          </button>
        }
        placement="bottom-left"
      >
        <div className="p-2" style={{ backgroundColor: theme.background.primary }}>
          <DropdownItem onClick={() => console.log('Filter by Me')}>
            <Check className="w-4 h-4 text-blue-600" />
            Me
          </DropdownItem>
          <DropdownItem onClick={() => console.log('Filter by Others')}>
            <Check className="w-4 h-4 text-transparent" />
            Others
          </DropdownItem>
        </div>
      </Dropdown>

      {/* Members Filter */}
      <Dropdown
        usePortal={true}
        trigger={
          <button 
            className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors border"
            style={{
              color: theme.text.secondary,
              backgroundColor: theme.background.primary,
              borderColor: theme.border.default,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.background.secondary;
              e.currentTarget.style.color = theme.text.primary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme.background.primary;
              e.currentTarget.style.color = theme.text.secondary;
            }}
          >
            <span>Members</span>
            <SortIcon className="w-4 h-4" />
          </button>
        }
        placement="bottom-left"
      >
        <div className="p-2" style={{ backgroundColor: theme.background.primary }}>
          <DropdownItem onClick={() => console.log('All Members')}>
            All Members
          </DropdownItem>
          <DropdownItem onClick={() => console.log('Just Me')}>
            Just Me
          </DropdownItem>
        </div>
      </Dropdown>

      {/* Status Filter */}
      <Dropdown
        usePortal={true}
        trigger={
          <button 
            className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors border"
            style={{
              color: theme.text.secondary,
              backgroundColor: theme.background.primary,
              borderColor: theme.border.default,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.background.secondary;
              e.currentTarget.style.color = theme.text.primary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme.background.primary;
              e.currentTarget.style.color = theme.text.secondary;
            }}
          >
            <span>Status</span>
            <SortIcon className="w-4 h-4" />
          </button>
        }
        placement="bottom-left"
      >
        <div className="p-2" style={{ backgroundColor: theme.background.primary }}>
          <DropdownItem onClick={() => console.log('Filter by Active')}>
            <Check className="w-4 h-4 text-blue-600" />
            Active
          </DropdownItem>
          <DropdownItem onClick={() => console.log('Filter by Archived')}>
            <Check className="w-4 h-4 text-transparent" />
            Archived
          </DropdownItem>
          <DropdownItem onClick={() => console.log('Filter by Draft')}>
            <Check className="w-4 h-4 text-transparent" />
            Draft
          </DropdownItem>
        </div>
      </Dropdown>
    </div>
  );
};

// Table Header with Sorting
const TableHeader = () => {
  const { theme } = useTheme();
  const [sortField, setSortField] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const SortableHeader = ({ field, children }: { field: string; children: React.ReactNode }) => (
    <th 
      className="px-6 py-3 text-left cursor-pointer hover:bg-opacity-50 transition-colors"
      onClick={() => handleSort(field)}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = theme.background.secondary + '50';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      <div className="flex items-center gap-2">
        <span 
          className="text-xs font-medium uppercase tracking-wide"
          style={{ color: theme.text.secondary }}
        >
          {children}
        </span>
        {sortField === field && (
          <SortIcon 
            className={`w-4 h-4 transition-transform ${sortDirection === 'desc' ? 'rotate-180' : ''}`}
            style={{ color: theme.text.secondary }}
          />
        )}
      </div>
    </th>
  );

  return (
    <thead style={{ backgroundColor: theme.background.secondary }}>
      <tr style={{ borderBottomColor: theme.border.default }} className="border-b">
        <SortableHeader field="name">Name</SortableHeader>
        <SortableHeader field="members">Members</SortableHeader>
        <SortableHeader field="parent">Parent portfolios</SortableHeader>
        <SortableHeader field="modified">Last modified</SortableHeader>
      </tr>
    </thead>
  );
};

// Main Browse All View Component
interface PortfolioBrowseAllViewProps {
  portfolios: Portfolio[];
  onPortfolioClick: (portfolio: Portfolio) => void;
  loading?: boolean;
}

const PortfolioBrowseAllView = ({
  portfolios,
  onPortfolioClick,
  loading = false
}: PortfolioBrowseAllViewProps) => {
  const { theme } = useTheme();
  const [searchValue, setSearchValue] = useState("");

  // Filter portfolios based on search
  const filteredPortfolios = portfolios.filter(portfolio =>
    portfolio.name.toLowerCase().includes(searchValue.toLowerCase()) ||
    portfolio.description?.toLowerCase().includes(searchValue.toLowerCase())
  );

  return (
    <div 
      className="h-full flex flex-col"
      style={{ backgroundColor: theme.background.secondary }}
    >
      {/* Header with Search and Filters */}
      <div 
        className="p-6 border-b space-y-4"
        style={{ 
          backgroundColor: theme.background.primary,
          borderBottomColor: theme.border.default 
        }}
      >
        {/* Search Row - Full Width */}
        <div className="w-full">
          <SearchInput
            value={searchValue}
            onChange={setSearchValue}
            placeholder="Find a portfolio"
            size="md"
            variant="default"
            className="w-full"
            showShortcut={false}
          />
        </div>

        {/* Filters Row - Left Aligned */}
        <div className="flex items-center">
          <PortfolioFilters />
        </div>
      </div>

      {/* Table Container */}
      <div className="flex-1 overflow-auto">
        <table 
          className="w-full"
          style={{ backgroundColor: theme.background.primary }}
        >
          <TableHeader />
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span 
                      className="ml-3"
                      style={{ color: theme.text.secondary }}
                    >
                      Loading portfolios...
                    </span>
                  </div>
                </td>
              </tr>
            ) : filteredPortfolios.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center">
                  <div>
                    <h3 
                      className="text-lg font-medium mb-2"
                      style={{ color: theme.text.primary }}
                    >
                      No portfolios found
                    </h3>
                    <p 
                      className="text-sm"
                      style={{ color: theme.text.secondary }}
                    >
                      {searchValue ? 'Try adjusting your search terms' : 'Create your first portfolio to get started'}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredPortfolios.map((portfolio) => (
                <PortfolioRow
                  key={portfolio.id}
                  portfolio={portfolio}
                  onPortfolioClick={onPortfolioClick}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Helper function to generate users for portfolio
const generatePortfolioUsers = (portfolio: Portfolio) => {
  // Base owner user
  const users = [
    {
      id: `${portfolio.id}-owner`,
      name: "Văn Lê", // Portfolio owner
      src: undefined, // Will use initials
      initials: "VL",
      color: "#f59e0b", // Yellow color like in the image
    }
  ];

  // Add collaborators if any
  if (portfolio.collaborators && portfolio.collaborators.length > 0) {
    const collaboratorUsers = portfolio.collaborators.map((collaboratorId, index) => ({
      id: `${portfolio.id}-collaborator-${index}`,
      name: getCollaboratorName(collaboratorId),
      src: undefined,
      initials: getCollaboratorInitials(collaboratorId),
      color: generateColorFromString(collaboratorId),
    }));
    
    users.push(...collaboratorUsers);
  }

  // Add some demo users if portfolio has no collaborators (for demo purposes)
  if (!portfolio.collaborators || portfolio.collaborators.length === 0) {
    // Random demo users based on portfolio
    const demoUsers = [
      { id: `${portfolio.id}-demo-1`, name: "John Doe", initials: "JD", color: "#3b82f6" },
      { id: `${portfolio.id}-demo-2`, name: "Sarah Wilson", initials: "SW", color: "#10b981" },
      { id: `${portfolio.id}-demo-3`, name: "Mike Chen", initials: "MC", color: "#8b5cf6" },
    ];
    
    // Add 1-3 random demo users
    const numDemoUsers = Math.floor(Math.random() * 3) + 1;
    users.push(...demoUsers.slice(0, numDemoUsers));
  }

  return users;
};

// Helper functions
const getCollaboratorName = (collaboratorId: string): string => {
  // In real app, this would fetch from user database
  const names = [
    "Alice Johnson", "Bob Smith", "Carol Davis", "David Wilson",
    "Emma Brown", "Frank Miller", "Grace Lee", "Henry Taylor"
  ];
  const index = parseInt(collaboratorId.slice(-1)) || 0;
  return names[index % names.length];
};

const getCollaboratorInitials = (collaboratorId: string): string => {
  const name = getCollaboratorName(collaboratorId);
  return name.split(' ').map(part => part.charAt(0)).join('').toUpperCase();
};

const generateColorFromString = (str: string): string => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
    '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2'
  ];
  
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
};

export default PortfolioBrowseAllView;