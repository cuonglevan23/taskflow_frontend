"use client";

import React, { useState } from 'react';
import PageLayout from '@/layouts/page/PageLayout';
import TaskListHeader from '@/components/TaskList/TaskListHeader';
import { usePathname } from 'next/navigation';
import { useThemeContext } from '@/providers/ThemeProvider';
import { useLanguageContext } from '@/providers/LanguageProvider';
import { Clock } from 'lucide-react';
import { useTasksContext } from '@/contexts';
import { useMyTasksSummary, useMyTasksStats } from '@/hooks/tasks';

import { Button } from '@/components/ui';

interface MyTaskLayoutProps {
  children: React.ReactNode;
}

function MyTaskContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { theme } = useThemeContext();
  const { messages } = useLanguageContext();
  const { tasks } = useMyTasksSummary({ page: 0, size: 1000 }); // Use SWR hook for actual data
  const { stats: taskStats } = useMyTasksStats();
  const [searchValue, setSearchValue] = useState("");

  // Helper function to get translated text
  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = messages;
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
  };

  const handleCreateTask = () => {
    // This will be handled by individual tab components
    console.log('Create task from header');
  };

  // Safe props passing - avoid unsafe cloning
  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      // Check if component accepts searchValue prop
      const childType = child.type as any;
      const hasSearchValueProp = childType?.propTypes?.searchValue || 
                                childType?.defaultProps?.hasOwnProperty?.('searchValue');
      
      if (hasSearchValueProp) {
        try {
          return React.cloneElement(child, { searchValue });
        } catch (error) {
          console.warn('Failed to clone element with searchValue:', error);
          return child;
        }
      }
    }
    return child;
  });

  return (
    <>
      {/* Shared Header for all MyTask tabs - Hide for notes page */}
      {pathname !== '/my-tasks/notes' && (
        <div
          className="sticky top-0 z-30 shadow-sm border-b"
          style={{
            backgroundColor: theme.background.primary,
            borderColor: theme.border.default,
            boxShadow: `0 2px 8px ${theme.dropdown?.shadow || 'rgba(0, 0, 0, 0.15)'}`,
            width: '100%'
          }}
        >

        </div>
      )}

      {/* Dashboard-specific header for dashboard tab */}
      {pathname === '/my-tasks/dashboard' && (
        <div
          className="border-b"
          style={{
            backgroundColor: theme.background.primary,
            borderColor: theme.border.default
          }}
        >
          <div className="flex items-center justify-between py-4 px-6">
            <div className="flex items-center gap-4">
              <h1
                className="text-2xl font-semibold"
                style={{ color: theme.text.primary }}
              >
                {t('navigation.myTasks.dashboard') || 'Dashboard'}
              </h1>


            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div
        className="flex-1 overflow-hidden"
        style={{ backgroundColor: theme.background.primary }}
      >
        {childrenWithProps}
      </div>
    </>
  );
}

export default function MyTaskLayout({ children }: MyTaskLayoutProps) {
  return (
    <PageLayout>
      <MyTaskContent>
        {children}
      </MyTaskContent>
    </PageLayout>
  );
};
