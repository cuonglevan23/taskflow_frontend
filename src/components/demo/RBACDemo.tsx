/**
 * RBAC Demo Component
 * Component để test và demonstrate hệ thống Role-Based Access Control
 */

"use client";

import React from 'react';
import { useRBAC } from '@/hooks/useRBAC';
import {
  RBACGuard,
  AdminGuard,
  OwnerGuard,
  ManagerGuard,
  LeaderGuard,
  MemberGuard,
  ConditionalRoleRenderer,
} from '@/components/guards/RBACGuard';
import { UserRole, Permission } from '@/constants/auth';
import { Crown, Shield, Settings, Users, User, Eye } from 'lucide-react';

export default function RBACDemo() {
  const rbac = useRBAC();

  if (!rbac.isAuthenticated) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <h2 className="text-xl font-bold text-red-800 mb-2">❌ Not Authenticated</h2>
        <p className="text-red-600">Please login to test RBAC system.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">🔐 RBAC System Demo</h1>
        
        {/* User Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold text-blue-800 mb-2">Current User Info</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Name:</strong> {rbac.user?.name || 'N/A'}
            </div>
            <div>
              <strong>Email:</strong> {rbac.user?.email || 'N/A'}
            </div>
            <div>
              <strong>Role:</strong> {rbac.role || 'N/A'}
            </div>
            <div>
              <strong>Authenticated:</strong> {rbac.isAuthenticated ? '✅' : '❌'}
            </div>
          </div>
          
          <button
            onClick={() => rbac.debug()}
            className="mt-3 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
          >
            Debug RBAC Info
          </button>
        </div>

        {/* Role Checks */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Role Checks</h2>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className={`p-2 rounded ${rbac.isSuperAdmin ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-500'}`}>
              <Crown size={16} className="inline mr-1" />
              Super Admin: {rbac.isSuperAdmin ? '✅' : '❌'}
            </div>
            <div className={`p-2 rounded ${rbac.isAdmin ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-500'}`}>
              <Shield size={16} className="inline mr-1" />
              Admin: {rbac.isAdmin ? '✅' : '❌'}
            </div>
            <div className={`p-2 rounded ${rbac.isOwner ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-500'}`}>
              <Crown size={16} className="inline mr-1" />
              Owner: {rbac.isOwner ? '✅' : '❌'}
            </div>
            <div className={`p-2 rounded ${rbac.isProjectManager ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
              <Settings size={16} className="inline mr-1" />
              PM: {rbac.isProjectManager ? '✅' : '❌'}
            </div>
            <div className={`p-2 rounded ${rbac.isLeader ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-500'}`}>
              <Users size={16} className="inline mr-1" />
              Leader: {rbac.isLeader ? '✅' : '❌'}
            </div>
            <div className={`p-2 rounded ${rbac.isMember ? 'bg-gray-100 text-gray-800' : 'bg-gray-100 text-gray-500'}`}>
              <User size={16} className="inline mr-1" />
              Member: {rbac.isMember ? '✅' : '❌'}
            </div>
          </div>
        </div>

        {/* Permission Checks */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Permission Checks</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {[
              Permission.MANAGE_WORKSPACE,
              Permission.MANAGE_USERS,
              Permission.CREATE_PROJECT,
              Permission.MANAGE_TEAM,
              Permission.VIEW_REPORTS,
              Permission.MANAGE_BILLING,
              Permission.INVITE_USERS,
              Permission.MANAGE_SYSTEM,
            ].map(permission => (
              <div
                key={permission}
                className={`p-2 rounded ${rbac.can(permission) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
              >
                <Eye size={16} className="inline mr-1" />
                {permission}: {rbac.can(permission) ? '✅' : '❌'}
              </div>
            ))}
          </div>
        </div>

        {/* Guard Examples */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">Guard Examples</h2>
          
          {/* Admin Only */}
          <AdminGuard fallback={<div className="p-3 bg-red-100 text-red-800 rounded">❌ Admin only content</div>}>
            <div className="p-3 bg-blue-100 text-blue-800 rounded">
              ✅ <strong>Admin Guard:</strong> You can see this because you're an Admin or Super Admin!
            </div>
          </AdminGuard>

          {/* Owner Only */}
          <OwnerGuard fallback={<div className="p-3 bg-red-100 text-red-800 rounded">❌ Owner only content</div>}>
            <div className="p-3 bg-yellow-100 text-yellow-800 rounded">
              ✅ <strong>Owner Guard:</strong> You can see this because you're an Owner or higher!
            </div>
          </OwnerGuard>

          {/* Manager Only */}
          <ManagerGuard fallback={<div className="p-3 bg-red-100 text-red-800 rounded">❌ Manager+ only content</div>}>
            <div className="p-3 bg-green-100 text-green-800 rounded">
              ✅ <strong>Manager Guard:</strong> You can see this because you're a PM or higher!
            </div>
          </ManagerGuard>

          {/* Leader Only */}
          <LeaderGuard fallback={<div className="p-3 bg-red-100 text-red-800 rounded">❌ Leader+ only content</div>}>
            <div className="p-3 bg-orange-100 text-orange-800 rounded">
              ✅ <strong>Leader Guard:</strong> You can see this because you're a Leader or higher!
            </div>
          </LeaderGuard>

          {/* Member Only */}
          <MemberGuard>
            <div className="p-3 bg-gray-100 text-gray-800 rounded">
              ✅ <strong>Member Guard:</strong> Basic authenticated user content - everyone can see this!
            </div>
          </MemberGuard>

          {/* Permission-based Guard */}
          <RBACGuard 
            permissions={[Permission.CREATE_PROJECT]}
            fallback={<div className="p-3 bg-red-100 text-red-800 rounded">❌ No CREATE_PROJECT permission</div>}
          >
            <div className="p-3 bg-purple-100 text-purple-800 rounded">
              ✅ <strong>Permission Guard:</strong> You have CREATE_PROJECT permission!
            </div>
          </RBACGuard>

          {/* Complex Guard */}
          <RBACGuard 
            minimumRole={UserRole.PM}
            permissions={[Permission.MANAGE_TEAM, Permission.VIEW_REPORTS]}
            requireAllPermissions={true}
            fallback={<div className="p-3 bg-red-100 text-red-800 rounded">❌ Need PM+ role AND team management + reports permissions</div>}
          >
            <div className="p-3 bg-indigo-100 text-indigo-800 rounded">
              ✅ <strong>Complex Guard:</strong> You're PM+ with team management AND reports permissions!
            </div>
          </RBACGuard>

          {/* Conditional Role Renderer */}
          <div className="p-3 border border-gray-300 rounded">
            <strong>Conditional Role Renderer:</strong>
            <ConditionalRoleRenderer
              superAdmin={<span className="text-purple-800"> 👑 Super Admin View</span>}
              admin={<span className="text-blue-800"> 🛡️ Admin View</span>}
              owner={<span className="text-yellow-800"> 👑 Owner View</span>}
              projectManager={<span className="text-green-800"> ⚙️ PM View</span>}
              leader={<span className="text-orange-800"> 👥 Leader View</span>}
              member={<span className="text-gray-800"> 👤 Member View</span>}
              fallback={<span className="text-red-800"> ❌ Unknown Role</span>}
            />
          </div>
        </div>

        {/* Usage Examples */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Usage Examples</h3>
          <div className="text-sm text-gray-600 space-y-2">
            <p><strong>Basic Role Check:</strong> <code>rbac.isOwner</code></p>
            <p><strong>Permission Check:</strong> <code>rbac.can(Permission.CREATE_PROJECT)</code></p>
            <p><strong>Multiple Permissions:</strong> <code>rbac.canAll([Permission.MANAGE_USERS, Permission.INVITE_USERS])</code></p>
            <p><strong>Minimum Role:</strong> <code>rbac.hasMinRole(UserRole.PM)</code></p>
            <p><strong>Guard Component:</strong> <code>&lt;OwnerGuard&gt;Owner only content&lt;/OwnerGuard&gt;</code></p>
          </div>
        </div>
      </div>
    </div>
  );
}