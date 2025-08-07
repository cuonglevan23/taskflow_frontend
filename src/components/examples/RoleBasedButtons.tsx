// Role-based Button Examples
'use client';

import React from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { Button } from '@/components/ui';
import { RoleGuard } from '@/components/auth/RoleGuard';

export const RoleBasedButtons: React.FC = () => {
  const { can, is } = usePermissions();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Action Buttons</h3>
      
      <div className="flex flex-wrap gap-2">
        {/* Create Project Button */}
        <Button
          disabled={!can.createProjects}
          className={can.createProjects ? 'bg-green-600 hover:bg-green-700' : ''}
        >
          ➕ Create Project
          {!can.createProjects && ' (No Permission)'}
        </Button>

        {/* Assign Tasks Button */}
        <Button
          disabled={!can.assignTasks}
          className={can.assignTasks ? 'bg-blue-600 hover:bg-blue-700' : ''}
        >
          👤 Assign Tasks
          {!can.assignTasks && ' (No Permission)'}
        </Button>

        {/* Delete Project Button */}
        <Button
          disabled={!can.deleteProjects}
          variant={can.deleteProjects ? 'destructive' : 'secondary'}
        >
          🗑️ Delete Project
          {!can.deleteProjects && ' (No Permission)'}
        </Button>

        {/* Export Reports Button */}
        <Button
          disabled={!can.exportReports}
          className={can.exportReports ? 'bg-purple-600 hover:bg-purple-700' : ''}
        >
          📊 Export Reports
          {!can.exportReports && ' (No Permission)'}
        </Button>

        {/* Manage Users Button - Only show if has permission */}
        <RoleGuard resource="users" action="manage">
          <Button className="bg-orange-600 hover:bg-orange-700">
            👥 Manage Users
          </Button>
        </RoleGuard>

        {/* Admin Only Button */}
        <RoleGuard roles="admin">
          <Button className="bg-red-600 hover:bg-red-700">
            🔧 Admin Tools
          </Button>
        </RoleGuard>

        {/* Owner/Admin Button */}
        <RoleGuard roles={['admin', 'owner']}>
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            💼 Executive Dashboard
          </Button>
        </RoleGuard>

        {/* Manager and Above */}
        <RoleGuard minimumRole="project_manager">
          <Button className="bg-teal-600 hover:bg-teal-700">
            📈 Management Reports
          </Button>
        </RoleGuard>
      </div>

      {/* Role Status */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h4 className="font-medium mb-2">Current Role Status:</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
          <div className={`p-2 rounded ${is.admin ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600'}`}>
            Admin: {is.admin ? '✅' : '❌'}
          </div>
          <div className={`p-2 rounded ${is.owner ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-600'}`}>
            Owner: {is.owner ? '✅' : '❌'}
          </div>
          <div className={`p-2 rounded ${is.projectManager ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}>
            PM: {is.projectManager ? '✅' : '❌'}
          </div>
          <div className={`p-2 rounded ${is.leader ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
            Leader: {is.leader ? '✅' : '❌'}
          </div>
        </div>
      </div>
    </div>
  );
};