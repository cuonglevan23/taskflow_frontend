"use client";

import React, { useState } from 'react';
import PageLayout from '@/layouts/page/PageLayout';
import { useTheme } from '@/layouts/hooks/useTheme';
import { usePathname } from 'next/navigation';
import { Users, UserPlus, Filter, Search, Download, Settings } from 'lucide-react';
import { Button } from '@/components/ui';

interface MembersLayoutProps {
  children: React.ReactNode;
}

const MembersContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme } = useTheme();
  const pathname = usePathname();
  const [searchValue, setSearchValue] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
  };

  const handleAddMember = () => {
    // This will be handled by the page component
    const event = new CustomEvent('openAddMemberModal');
    window.dispatchEvent(event);
  };

  const handleExport = () => {
    console.log('Export members data');
  };

  const handleFilter = () => {
    console.log('Open filter modal');
  };

  const handleSettings = () => {
    console.log('Open members settings');
  };

  // Clone children with props
  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child) && typeof child.type !== 'string') {
      try {
        return React.cloneElement(child, { 
          searchValue,
          selectedRole,
          selectedStatus,
          onSearchChange: handleSearchChange,
          onRoleChange: setSelectedRole,
          onStatusChange: setSelectedStatus
        } as any);
      } catch (error) {
        console.warn('Failed to clone element:', error);
        return child;
      }
    }
    return child;
  });

  return (
    <>
      {/* Shared Header for all Members tabs */}
      <div 
        className="sticky top-0 z-30 shadow-sm border-b" 
        style={{ 
          backgroundColor: theme.background.primary,
          borderColor: theme.border.default,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          width: '100%'
        }}
      >
        <div className="flex items-center justify-between py-4 px-6">
          {/* Left side - Title and Stats */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" style={{ color: theme.text.primary }} />
              <h1 className="text-xl font-semibold" style={{ color: theme.text.primary }}>
                Members Management
              </h1>
            </div>
            
            {/* Quick Stats */}
            <div className="hidden md:flex items-center gap-4 ml-6">
              <div className="text-sm" style={{ color: theme.text.secondary }}>
                <span className="font-medium">Total: </span>
                <span className="text-blue-600 font-semibold">24</span>
              </div>
              <div className="text-sm" style={{ color: theme.text.secondary }}>
                <span className="font-medium">Active: </span>
                <span className="text-green-600 font-semibold">22</span>
              </div>
              <div className="text-sm" style={{ color: theme.text.secondary }}>
                <span className="font-medium">Pending: </span>
                <span className="text-orange-600 font-semibold">2</span>
              </div>
            </div>
          </div>
          
          {/* Right side - Search and Actions */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" 
                style={{ color: theme.text.secondary }} />
              <input
                type="text"
                placeholder="Search members..."
                value={searchValue}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 pr-4 py-2 w-64 rounded-lg border text-sm"
                style={{ 
                  backgroundColor: theme.background.secondary,
                  borderColor: theme.border.default,
                  color: theme.text.primary
                }}
              />
            </div>

            {/* Role Filter */}
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-3 py-2 rounded-lg border text-sm"
              style={{ 
                backgroundColor: theme.background.secondary,
                borderColor: theme.border.default,
                color: theme.text.primary
              }}
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="owner">Owner</option>
              <option value="project_manager">Project Manager</option>
              <option value="leader">Leader</option>
              <option value="member">Member</option>
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 rounded-lg border text-sm"
              style={{ 
                backgroundColor: theme.background.secondary,
                borderColor: theme.border.default,
                color: theme.text.primary
              }}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>

            {/* Action Buttons */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFilter}
              leftIcon={<Filter className="w-4 h-4" />}
            >
              Filter
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExport}
              leftIcon={<Download className="w-4 h-4" />}
            >
              Export
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSettings}
              leftIcon={<Settings className="w-4 h-4" />}
            >
              Settings
            </Button>

            {/* Add Member Button */}
            <Button
              variant="primary"
              size="sm"
              onClick={handleAddMember}
              leftIcon={<UserPlus className="w-4 h-4" />}
            >
              Invite Member
            </Button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="h-[calc(100vh-228px)] overflow-hidden">
        {childrenWithProps}
      </div>
    </>
  );
};

const MembersLayout: React.FC<MembersLayoutProps> = ({ children }) => {
  return (
    <PageLayout>
      <MembersContent>
        {children}
      </MembersContent>
    </PageLayout>
  );
};

export default MembersLayout;