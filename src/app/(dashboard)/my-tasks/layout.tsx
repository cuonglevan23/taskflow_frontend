"use client";

import React, { useState } from 'react';
import PageLayout from '@/layouts/page/PageLayout';
import TaskListHeader from '@/components/TaskList/TaskListHeader';
import { usePathname } from 'next/navigation';
import { DARK_THEME } from '@/constants/theme';
import { Clock } from 'lucide-react';
import { useTasksContext } from '@/contexts';
import { useMyTasksSummary, useMyTasksStats } from '@/hooks/tasks';

import { Button } from '@/components/ui';

interface MyTaskLayoutProps {
  children: React.ReactNode;
}

function MyTaskContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { tasks } = useMyTasksSummary({ page: 0, size: 1000 }); // Use SWR hook for actual data
  const { stats: taskStats } = useMyTasksStats();
  const [searchValue, setSearchValue] = useState("");
  // Removed calendarView state since Week button is removed - always use Month view

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
  };

  const handleCreateTask = () => {
    // This will be handled by individual tab components
    console.log('Create task from header');
  };

  // Removed calendar view change handler since Week button is removed

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
            backgroundColor: DARK_THEME.background.primary,
            borderColor: DARK_THEME.border.default,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
            width: '100%'
          }}
        >
          {/* Calendar-specific header */}
          {pathname === '/my-tasks/calendar' ? (
            <div className="flex items-center justify-between py-4 px-6">
              {/* Left side - Empty */}
              <div />

              {/* Right side - Calendar Controls */}
              <div className="flex items-center gap-2">
                <span
                  className="text-sm px-3 py-1 inline-flex items-center whitespace-nowrap"
                  style={{ color: DARK_THEME.text.secondary }}
                >
                  No date ({tasks?.filter(t => !t.dueDateISO).length || 0})
                </span>



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
                  showSort={false}
                  showGroup={false}
                  showOptions={true}
                  className="mb-0 !py-0 !px-0"
                  hideLeftSide={true}
                />
              </div>
            </div>
          ) : (
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
              showSort={pathname !== '/my-tasks/calendar'}
              showGroup={pathname === '/my-tasks/list'}
              showOptions={true}
              className="mb-0"
            />
          )}
        </div>
      )}

      {/* Tab Content - Adjust height for notes page */}
      <div
        className={pathname === '/my-tasks/notes' ? "h-screen overflow-y-auto w-full" : "h-[calc(100vh-228px)] overflow-y-auto w-full"}
        style={{ width: "100%", minWidth: "100%" }}
      >
        {childrenWithProps}
      </div>
    </>
  );
};

export default function MyTaskLayout({ children }: MyTaskLayoutProps) {
  return (
    <PageLayout>
      <MyTaskContent>
        {children}
      </MyTaskContent>
    </PageLayout>
  );
};
