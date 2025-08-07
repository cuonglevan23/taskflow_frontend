// Role-based UI Examples
'use client';

import React from 'react';
import { 
  RoleGuard, 
  AdminOnly, 
  OwnerOnly, 
  ManagerAndAbove, 
  LeaderAndAbove,
  CanCreateProjects,
  CanManageUsers,
  CanAssignTasks 
} from '@/components/auth/RoleGuard';
import { usePermissions } from '@/hooks/usePermissions';
import { Button } from '@/components/ui';
import { getRoleDisplayName, getRoleColor } from '@/utils/roleUtils';
import { JWTTokenDemo } from './JWTTokenDemo';

export const RoleBasedUIExamples: React.FC = () => {
  const { user, role, can, is } = usePermissions();

  if (!user) {
    return <div>Please log in to see role-based examples</div>;
  }

  return (
    <div className="space-y-8 p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Role-Based UI Examples</h2>
        
        {/* Current User Info */}
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h3 className="font-semibold mb-2">Current User</h3>
          <div className="flex items-center gap-3">
            <div 
              className="px-3 py-1 rounded-full text-white text-sm font-medium"
              style={{ backgroundColor: getRoleColor(role) }}
            >
              {getRoleDisplayName(role)}
            </div>
            <span className="text-gray-600 dark:text-gray-300">{user.name}</span>
            <span className="text-gray-500 dark:text-gray-400">({user.email})</span>
          </div>
        </div>

        {/* Role-based Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <AdminOnly fallback={<Button disabled>Admin Only (Hidden)</Button>}>
            <Button className="bg-red-600 hover:bg-red-700">
              🔧 Admin Panel
            </Button>
          </AdminOnly>

          <OwnerOnly fallback={<Button disabled>Owner Only (Hidden)</Button>}>
            <Button className="bg-purple-600 hover:bg-purple-700">
              💼 Owner Dashboard
            </Button>
          </OwnerOnly>

          <ManagerAndAbove fallback={<Button disabled>Manager+ Only (Hidden)</Button>}>
            <Button className="bg-blue-600 hover:bg-blue-700">
              📊 Management Tools
            </Button>
          </ManagerAndAbove>

          <LeaderAndAbove fallback={<Button disabled>Leader+ Only (Hidden)</Button>}>
            <Button className="bg-green-600 hover:bg-green-700">
              👥 Team Management
            </Button>
          </LeaderAndAbove>

          <CanCreateProjects fallback={<Button disabled>No Create Permission</Button>}>
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              ➕ Create Project
            </Button>
          </CanCreateProjects>

          <CanManageUsers fallback={<Button disabled>No User Management</Button>}>
            <Button className="bg-orange-600 hover:bg-orange-700">
              👤 Manage Users
            </Button>
          </CanManageUsers>
        </div>

        {/* Permission Matrix */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Permission Matrix</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              { label: 'Create Projects', check: can.createProjects },
              { label: 'Manage Users', check: can.manageUsers },
              { label: 'Assign Tasks', check: can.assignTasks },
              { label: 'Delete Projects', check: can.deleteProjects },
              { label: 'View Reports', check: can.viewReports },
              { label: 'Export Reports', check: can.exportReports },
              { label: 'Manage Settings', check: can.manageSettings },
              { label: 'Manage Billing', check: can.manageBilling },
            ].map(({ label, check }) => (
              <div 
                key={label}
                className={`p-3 rounded-lg border ${
                  check 
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                    : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={check ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                    {check ? '✅' : '❌'}
                  </span>
                  <span className="text-sm font-medium">{label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Role Checks */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Role Checks</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: 'Is Admin', check: is.admin },
              { label: 'Is Owner', check: is.owner },
              { label: 'Is Project Manager', check: is.projectManager },
              { label: 'Is Leader', check: is.leader },
              { label: 'Is Member', check: is.member },
              { label: 'At Least Owner', check: is.atLeastOwner },
              { label: 'At Least PM', check: is.atLeastProjectManager },
              { label: 'At Least Leader', check: is.atLeastLeader },
            ].map(({ label, check }) => (
              <div 
                key={label}
                className={`p-2 rounded border text-center ${
                  check 
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200' 
                    : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400'
                }`}
              >
                <span className="text-sm font-medium">{label}</span>
                <div className="text-xs mt-1">{check ? '✅ True' : '❌ False'}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Conditional Content */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Conditional Content</h3>
          <div className="space-y-4">
            <RoleGuard roles={['admin', 'owner']} fallback={
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-yellow-800 dark:text-yellow-200">
                  🔒 This content is only visible to Admins and Owners
                </p>
              </div>
            }>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-green-800 dark:text-green-200">
                  🎉 Welcome Admin/Owner! You can see this exclusive content.
                </p>
              </div>
            </RoleGuard>

            <RoleGuard minimumRole="project_manager" fallback={
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-yellow-800 dark:text-yellow-200">
                  🔒 This content requires Project Manager level or higher
                </p>
              </div>
            }>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-blue-800 dark:text-blue-200">
                  📊 Management Dashboard - Available to PM, Owner, and Admin
                </p>
              </div>
            </RoleGuard>

            <RoleGuard resource="tasks" action="assign" fallback={
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-yellow-800 dark:text-yellow-200">
                  🔒 You don't have permission to assign tasks
                </p>
              </div>
            }>
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                <p className="text-purple-800 dark:text-purple-200">
                  ✅ Task Assignment Panel - You can assign tasks to team members
                </p>
              </div>
            </RoleGuard>
          </div>
        </div>

        {/* JWT Token Demo */}
        <JWTTokenDemo />
      </div>
    </div>
  );
};