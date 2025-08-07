// Role Demo Page
'use client';

import React from 'react';
import { RoleBasedUIExamples } from '@/components/examples/RoleBasedUIExamples';
import { DevRoleSwitcher } from '@/components/dev/DevRoleSwitcher';
import { TokenInspector } from '@/components/dev/TokenInspector';

export default function RoleDemoPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Role-Based Access Control Demo
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Test different user roles and see how the UI changes based on permissions.
            Use the role switcher in the bottom-right corner to change roles.
          </p>
        </div>

        <RoleBasedUIExamples />
      </div>

      {/* Development Tools */}
      <DevRoleSwitcher />
      <TokenInspector />
    </div>
  );
}