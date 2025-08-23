"use client";

import React, { useState } from 'react';
import PageLayout from '@/layouts/page/PageLayout';
import { TaskListHeader } from '@/components/TaskList';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/layouts/hooks/useTheme';
import { DynamicProjectProvider } from './components/DynamicProjectProvider';
import { ProjectTasksProvider } from './context/ProjectTasksProvider';

interface ProjectLayoutProps {
  children: React.ReactNode;
}

function ProjectContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { theme } = useTheme();
  const [searchValue, setSearchValue] = useState("");

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
  };

  const handleCreateTask = () => {
    // This will be handled by individual tab components
    console.log('Create task from project header');
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

  // Only show TaskListHeader for task-related pages (board, list, timeline)
  const showTaskHeader = pathname?.includes('/board') || 
                         pathname?.includes('/list') || 
                         pathname?.includes('/timeline');

  return (
    <>
      {showTaskHeader && (
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
            showSort={pathname?.includes('/list') || pathname?.includes('/board')}
            showGroup={pathname?.includes('/list')}
            showOptions={true}
            className="mb-0"
          />
        </div>
      )}

      {/* Tab Content */}
      <div className={showTaskHeader ? "h-[calc(100vh-228px)] overflow-y-auto" : "h-full"}>
        {childrenWithProps}
      </div>
    </>
  );
}

export default function ProjectLayout({ children }: ProjectLayoutProps) {
  return (
    <PageLayout>
      <DynamicProjectProvider>
        <ProjectTasksProvider>
          <ProjectContent>
            {children}
          </ProjectContent>
        </ProjectTasksProvider>
      </DynamicProjectProvider>
    </PageLayout>
  );
}