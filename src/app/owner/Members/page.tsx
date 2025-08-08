"use client";

import React, { useState, useEffect } from "react";
import { Mail, Shield, Clock, MoreVertical, Users } from "lucide-react";
import { useTheme } from "@/layouts/hooks/useTheme";
import { User } from "@/types/user";
import AddUserModal from "./components/AddUserModal";
import EditUserModal from "./components/EditUserModal";
import UserActionsDropdown from "./components/UserActionsDropdown";

interface MembersPageProps {
  searchValue?: string;
  selectedRole?: string;
  selectedStatus?: string;
  onSearchChange?: (value: string) => void;
  onRoleChange?: (role: string) => void;
  onStatusChange?: (status: string) => void;
}

export default function UserManagementPage({
  searchValue = "",
  selectedRole = "all",
  selectedStatus = "all"
}: MembersPageProps) {
  const { theme } = useTheme();

  // Listen for header button clicks
  useEffect(() => {
    const handleOpenAddModal = () => setIsAddUserModalOpen(true);
    
    window.addEventListener('openAddMemberModal', handleOpenAddModal);
    
    return () => {
      window.removeEventListener('openAddMemberModal', handleOpenAddModal);
    };
  }, []);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([
    {
      id: 1,
      username: "Nguyen Van A",
      email: "nguyen.vana@company.com",
      roleId: 1,
      organizationId: 1,
      status: "active",
      createdAt: "2024-01-01T10:00:00Z",
      updatedAt: "2024-01-15T14:30:00Z",
    },
    {
      id: 2,
      username: "Tran Thi B",
      email: "tran.thib@company.com",
      roleId: 2,
      organizationId: 1,
      status: "active",
      createdAt: "2024-01-02T10:00:00Z",
      updatedAt: "2024-01-15T09:15:00Z",
    },
    {
      id: 3,
      username: "Nguyen Van C",
      email: "nguyen.vanc@company.com",
      roleId: 3,
      organizationId: 1,
      status: "active",
      createdAt: "2024-01-03T10:00:00Z",
      updatedAt: "2024-01-15T14:30:00Z",
    },
    {
      id: 4,
      username: "Nguyen Van D",
      email: "nguyen.vand@company.com",
      roleId: 4,
      organizationId: 1,
      status: "active",
      createdAt: "2024-01-04T10:00:00Z",
      updatedAt: "2024-01-15T14:30:00Z",
    }
  ]);

  const handleAddUser = (userData: {
    name: string;
    email: string;
    role: string;
    department?: string;
  }) => {
    const newUser: User = {
      id: users.length + 1,
      username: userData.username,
      email: userData.email,
      roleId: userData.roleId,
      organizationId: userData.organizationId,
      status: userData.status,
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt,
    };

    setUsers(prev => [...prev, newUser]);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsEditUserModalOpen(true);
  };

  const handleUpdateUser = (userData: {
    id: string;
    name: string;
    email: string;
    role: string;
    department?: string;
  }) => {
    setUsers(prev => prev.map(user =>
      user.id === userData.id
        ? { ...user, ...userData }
        : user
    ));
  };

  const handleDeleteUser = (userId: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      setUsers(prev => prev.filter(user => user.id !== userId));
    }
  };

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchValue.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchValue.toLowerCase());
    const matchesRole = selectedRole === 'all' || 
                       (selectedRole === 'admin' && user.roleId === 1) ||
                       (selectedRole === 'member' && user.roleId !== 1);
    const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleName = (roleId: number) => {
    switch (roleId) {
      case 1: return 'Admin';
      case 2: return 'Owner';
      case 3: return 'Project Manager';
      case 4: return 'Leader';
      default: return 'Member';
    }
  };

  const getRoleColor = (roleId: number) => {
    switch (roleId) {
      case 1: return 'bg-red-500';
      case 2: return 'bg-purple-500';
      case 3: return 'bg-blue-500';
      case 4: return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="p-6 overflow-y-auto" style={{ backgroundColor: theme.background.primary }}>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-lg border" style={{ 
          backgroundColor: theme.background.secondary,
          borderColor: theme.border.default 
        }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm" style={{ color: theme.text.secondary }}>Total Members</p>
              <p className="text-2xl font-bold" style={{ color: theme.text.primary }}>{users.length}</p>
              <p className="text-xs text-green-500">+2 new this month</p>
            </div>
            <div className="p-2 rounded-lg bg-blue-100">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="p-4 rounded-lg border" style={{ 
          backgroundColor: theme.background.secondary,
          borderColor: theme.border.default 
        }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm" style={{ color: theme.text.secondary }}>Active</p>
              <p className="text-2xl font-bold" style={{ color: theme.text.primary }}>
                {users.filter(u => u.status === 'active').length}
              </p>
              <p className="text-xs text-green-500">
                {Math.round((users.filter(u => u.status === 'active').length / users.length) * 100)}% of total
              </p>
            </div>
            <div className="p-2 rounded-lg bg-green-100">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="p-4 rounded-lg border" style={{ 
          backgroundColor: theme.background.secondary,
          borderColor: theme.border.default 
        }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm" style={{ color: theme.text.secondary }}>Admins</p>
              <p className="text-2xl font-bold" style={{ color: theme.text.primary }}>
                {users.filter(u => u.roleId === 1).length}
              </p>
              <p className="text-xs text-purple-500">High privilege</p>
            </div>
            <div className="p-2 rounded-lg bg-purple-100">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="p-4 rounded-lg border" style={{ 
          backgroundColor: theme.background.secondary,
          borderColor: theme.border.default 
        }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm" style={{ color: theme.text.secondary }}>Recent Activity</p>
              <p className="text-2xl font-bold" style={{ color: theme.text.primary }}>3</p>
              <p className="text-xs text-orange-500">Last 24 hours</p>
            </div>
            <div className="p-2 rounded-lg bg-orange-100">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Members Table */}
      <div className="rounded-lg border overflow-hidden" style={{ 
        backgroundColor: theme.background.secondary,
        borderColor: theme.border.default 
      }}>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            {/* Table Head */}
            <thead style={{ backgroundColor: theme.background.primary }}>
              <tr>
                <th className="text-left p-4 font-medium" style={{ color: theme.text.secondary }}>
                  Member
                </th>
                <th className="text-left p-4 font-medium" style={{ color: theme.text.secondary }}>
                  Email
                </th>
                <th className="text-left p-4 font-medium" style={{ color: theme.text.secondary }}>
                  Role
                </th>
                <th className="text-left p-4 font-medium" style={{ color: theme.text.secondary }}>
                  Status
                </th>
                <th className="text-left p-4 font-medium" style={{ color: theme.text.secondary }}>
                  Last Updated
                </th>
                <th className="text-center p-4 font-medium" style={{ color: theme.text.secondary }}>
                  Actions
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center" style={{ color: theme.text.secondary }}>
                    <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No members found matching your criteria</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, index) => (
                  <tr
                    key={user.id}
                    className="border-t transition-colors hover:bg-opacity-50"
                    style={{ 
                      borderColor: theme.border.default,
                      backgroundColor: index % 2 === 0 ? 'transparent' : theme.background.primary + '20'
                    }}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold" style={{ color: theme.text.primary }}>
                            {user.username}
                          </p>
                          <p className="text-xs" style={{ color: theme.text.secondary }}>
                            ID: {user.id}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" style={{ color: theme.text.secondary }} />
                        <span style={{ color: theme.text.primary }}>{user.email}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`text-xs px-3 py-1 rounded-full font-medium text-white ${getRoleColor(user.roleId)}`}>
                        {getRoleName(user.roleId)}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`text-xs px-3 py-1 rounded-full font-medium text-white ${
                        user.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                      }`}>
                        {user.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4" style={{ color: theme.text.secondary }}>
                      {new Date(user.updatedAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center">
                        <UserActionsDropdown
                          user={user}
                          onEdit={handleEditUser}
                          onDelete={handleDeleteUser}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Pagination Info */}
        {filteredUsers.length > 0 && (
          <div className="p-4 border-t flex items-center justify-between" style={{ 
            borderColor: theme.border.default,
            backgroundColor: theme.background.primary 
          }}>
            <p className="text-sm" style={{ color: theme.text.secondary }}>
              Showing {filteredUsers.length} of {users.length} members
            </p>
            <div className="text-sm" style={{ color: theme.text.secondary }}>
              {searchValue && `Filtered by: "${searchValue}"`}
              {selectedRole !== 'all' && ` • Role: ${selectedRole}`}
              {selectedStatus !== 'all' && ` • Status: ${selectedStatus}`}
            </div>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      <AddUserModal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        onSubmit={handleAddUser}
      />

      {/* Edit User Modal */}
      <EditUserModal
        isOpen={isEditUserModalOpen}
        onClose={() => {
          setIsEditUserModalOpen(false);
          setSelectedUser(null);
        }}
        onSubmit={handleUpdateUser}
        user={selectedUser}
      />
    </div>
  );
}
