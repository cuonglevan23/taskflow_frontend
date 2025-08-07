// Role-based Navigation Component
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { usePermissions } from '@/hooks/usePermissions';
import { RoleGuard } from '@/components/auth/RoleGuard';

interface NavigationItem {
  label: string;
  href: string;
  icon?: string;
  roles?: string[];
  minimumRole?: string;
  resource?: string;
  action?: string;
}

const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    label: 'Dashboard',
    href: '/home',
    icon: '🏠',
  },
  {
    label: 'My Tasks',
    href: '/my-tasks',
    icon: '✅',
  },
  {
    label: 'Projects',
    href: '/projects',
    icon: '📁',
  },
  {
    label: 'Teams',
    href: '/teams',
    icon: '👥',
    minimumRole: 'leader',
  },
  {
    label: 'Portfolios',
    href: '/portfolios',
    icon: '📊',
    minimumRole: 'project_manager',
  },
  {
    label: 'Goals',
    href: '/goals',
    icon: '🎯',
    minimumRole: 'leader',
  },
  {
    label: 'Reporting',
    href: '/reporting',
    icon: '📈',
    resource: 'reports',
    action: 'read',
  },
  {
    label: 'Role Demo',
    href: '/role-demo',
    icon: '🔧',
  },
  {
    label: 'Admin Panel',
    href: '/admin',
    icon: '⚙️',
    roles: ['admin'],
  },
  {
    label: 'User Management',
    href: '/admin/users',
    icon: '👤',
    resource: 'users',
    action: 'manage',
  },
];

export const RoleBasedNavigation: React.FC = () => {
  const pathname = usePathname();
  const { user } = usePermissions();

  if (!user) return null;

  return (
    <nav className="space-y-1">
      {NAVIGATION_ITEMS.map((item) => (
        <RoleGuard
          key={item.href}
          roles={item.roles as any}
          minimumRole={item.minimumRole as any}
          resource={item.resource}
          action={item.action}
        >
          <Link
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              pathname === item.href || pathname.startsWith(item.href + '/')
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </Link>
        </RoleGuard>
      ))}
    </nav>
  );
};