"use client";

import React, { useState } from "react";
import { useTheme } from '@/layouts/hooks/useTheme';
import { User, Plus, MoreHorizontal, Mail, Phone, Calendar, Shield } from 'lucide-react';
import { Button } from '@/components/ui';

interface UsersPageProps {
  searchValue?: string;
}

// Mock data for users
const mockUsers = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@company.com',
    role: 'Admin',
    department: 'Development',
    status: 'active',
    lastLogin: '2024-01-15T10:30:00Z',
    joinDate: '2023-01-15',
    avatar: 'JS',
    phone: '+1 (555) 123-4567',
    projects: 3
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@company.com',
    role: 'Manager',
    department: 'Design',
    status: 'active',
    lastLogin: '2024-01-15T09:15:00Z',
    joinDate: '2023-03-20',
    avatar: 'SJ',
    phone: '+1 (555) 234-5678',
    projects: 2
  },
  {
    id: '3',
    name: 'Mike Wilson',
    email: 'mike.wilson@company.com',
    role: 'User',
    department: 'Marketing',
    status: 'active',
    lastLogin: '2024-01-14T16:45:00Z',
    joinDate: '2023-06-10',
    avatar: 'MW',
    phone: '+1 (555) 345-6789',
    projects: 1
  },
  {
    id: '4',
    name: 'Lisa Chen',
    email: 'lisa.chen@company.com',
    role: 'User',
    department: 'QA',
    status: 'active',
    lastLogin: '2024-01-15T11:20:00Z',
    joinDate: '2023-08-05',
    avatar: 'LC',
    phone: '+1 (555) 456-7890',
    projects: 2
  },
  {
    id: '5',
    name: 'David Brown',
    email: 'david.brown@company.com',
    role: 'User',
    department: 'DevOps',
    status: 'inactive',
    lastLogin: '2024-01-10T14:30:00Z',
    joinDate: '2023-02-28',
    avatar: 'DB',
    phone: '+1 (555) 567-8901',
    projects: 1
  },
  {
    id: '6',
    name: 'Emily Davis',
    email: 'emily.davis@company.com',
    role: 'Manager',
    department: 'HR',
    status: 'active',
    lastLogin: '2024-01-15T08:00:00Z',
    joinDate: '2022-11-15',
    avatar: 'ED',
    phone: '+1 (555) 678-9012',
    projects: 0
  }
];

const UsersPage = ({ searchValue = "" }: UsersPageProps) => {
  const { theme } = useTheme();
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Filter users based on search
  const filteredUsers = mockUsers.filter(user =>
    user.name.toLowerCase().includes(searchValue.toLowerCase()) ||
    user.email.toLowerCase().includes(searchValue.toLowerCase()) ||
    user.department.toLowerCase().includes(searchValue.toLowerCase()) ||
    user.role.toLowerCase().includes(searchValue.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10B981';
      case 'inactive': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Admin': return '#EF4444';
      case 'Manager': return '#F59E0B';
      case 'User': return '#3B82F6';
      default: return '#6B7280';
    }
  };

  const handleUserSelect = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCreateUser = () => {
    console.log('Create new user');
  };

  const formatLastLogin = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  const totalUsers = mockUsers.length;
  const activeUsers = mockUsers.filter(user => user.status === 'active').length;
  const adminUsers = mockUsers.filter(user => user.role === 'Admin').length;
  const managerUsers = mockUsers.filter(user => user.role === 'Manager').length;

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
              <p style={{ color: theme.text.secondary }} className="text-sm">Total Users</p>
              <p style={{ color: theme.text.primary }} className="text-2xl font-bold">
                {totalUsers}
              </p>
            </div>
            <User size={24} style={{ color: theme.text.secondary }} />
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
              <p style={{ color: theme.text.secondary }} className="text-sm">Active Users</p>
              <p style={{ color: theme.text.primary }} className="text-2xl font-bold">
                {activeUsers}
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
              <p style={{ color: theme.text.secondary }} className="text-sm">Admins</p>
              <p style={{ color: theme.text.primary }} className="text-2xl font-bold">
                {adminUsers}
              </p>
            </div>
            <Shield size={24} style={{ color: theme.text.secondary }} />
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
              <p style={{ color: theme.text.secondary }} className="text-sm">Managers</p>
              <p style={{ color: theme.text.primary }} className="text-2xl font-bold">
                {managerUsers}
              </p>
            </div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          </div>
        </div>
      </div>

      {/* Users Table */}
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
              Users ({filteredUsers.length})
            </h2>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleCreateUser}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center gap-2"
              >
                <Plus size={16} />
                New User
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
                        setSelectedUsers(filteredUsers.map(u => u.id));
                      } else {
                        setSelectedUsers([]);
                      }
                    }}
                  />
                </th>
                <th 
                  className="text-left py-3 px-6 text-sm font-medium"
                  style={{ color: theme.text.secondary }}
                >
                  User
                </th>
                <th 
                  className="text-left py-3 px-6 text-sm font-medium"
                  style={{ color: theme.text.secondary }}
                >
                  Role
                </th>
                <th 
                  className="text-left py-3 px-6 text-sm font-medium"
                  style={{ color: theme.text.secondary }}
                >
                  Department
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
                  Last Login
                </th>
                <th 
                  className="text-left py-3 px-6 text-sm font-medium"
                  style={{ color: theme.text.secondary }}
                >
                  Projects
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
              {filteredUsers.map((user) => (
                <tr 
                  key={user.id}
                  className="border-b hover:bg-opacity-50"
                  style={{ 
                    borderColor: theme.border.default,
                    backgroundColor: selectedUsers.includes(user.id) 
                      ? `${theme.accent.primary}20` 
                      : 'transparent'
                  }}
                >
                  <td className="py-4 px-6">
                    <input
                      type="checkbox"
                      className="rounded"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => handleUserSelect(user.id)}
                    />
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium"
                        style={{ backgroundColor: '#3B82F6' }}
                      >
                        {user.avatar}
                      </div>
                      <div>
                        <div 
                          className="font-medium"
                          style={{ color: theme.text.primary }}
                        >
                          {user.name}
                        </div>
                        <div 
                          className="text-sm flex items-center gap-1"
                          style={{ color: theme.text.secondary }}
                        >
                          <Mail size={12} />
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span 
                      className="px-2 py-1 rounded-full text-xs font-medium"
                      style={{ 
                        backgroundColor: `${getRoleColor(user.role)}20`,
                        color: getRoleColor(user.role)
                      }}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span 
                      className="text-sm"
                      style={{ color: theme.text.primary }}
                    >
                      {user.department}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span 
                      className="px-2 py-1 rounded-full text-xs font-medium capitalize"
                      style={{ 
                        backgroundColor: `${getStatusColor(user.status)}20`,
                        color: getStatusColor(user.status)
                      }}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span 
                      className="text-sm"
                      style={{ color: theme.text.primary }}
                    >
                      {formatLastLogin(user.lastLogin)}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span 
                      className="text-sm"
                      style={{ color: theme.text.primary }}
                    >
                      {user.projects}
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

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <User size={48} className="mx-auto mb-4 text-gray-400" />
            <p style={{ color: theme.text.secondary }}>
              {searchValue ? 'No users found matching your search.' : 'No users found.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersPage;