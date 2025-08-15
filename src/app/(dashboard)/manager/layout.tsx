"use client";

import React, { useState } from 'react';
import PageLayout from '@/layouts/page/PageLayout';
import TaskListHeader from '@/components/TaskList/TaskListHeader';
import { useTheme } from '@/layouts/hooks/useTheme';
import { usePathname } from 'next/navigation';

interface ManagerLayoutProps {
  children: React.ReactNode;
}

function ManagerContent({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  const pathname = usePathname();
  const [searchValue, setSearchValue] = useState("");

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
  };

  const handleCreateTask = () => {
    // This will be handled by individual tab components
    console.log('Create task from manager header');
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
      {/* Shared Header for all Manager tabs */}
      <div 
        className="sticky top-0 z-30 shadow-sm border-b" 
        style={{ 
          backgroundColor: theme.background.primary,
          borderColor: theme.border.default,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          width: '100%'
        }}
      >
        <TaskListHeader
          searchValue={searchValue}
          onSearchChange={handleSearchChange}
          onCreateTask={handleCreateTask}
          onFilterClick={() => {/* Handle filter modal */}}
          onSortClick={() => {/* Handle sort modal */}}
          onGroupClick={() => {/* Handle group modal */}}
          onOptionsClick={() => {/* Handle options modal */}}
          showSearch={true}
          showFilters={true}
          showSort={true}
          showGroup={pathname === '/manager/projects'}
          showOptions={true}
          className="mb-0"
        />
      </div>

      {/* Tab Content */}
      <div className="h-[calc(100vh-228px)] overflow-hidden">
        {childrenWithProps}
      </div>
    </>
  );
};

export default function ManagerLayout({ children }: ManagerLayoutProps) {
  return (
    <PageLayout>
      <ManagerContent>
        {children}
      </ManagerContent>
    </PageLayout>
  );
};