"use client";

import React, { useState } from 'react';
import PageLayout from '@/layouts/page/PageLayout';
import TaskListHeader from '@/components/TaskList/TaskListHeader';
import { useTheme } from '@/layouts/hooks/useTheme';
import { usePathname } from 'next/navigation';
import { Clock } from 'lucide-react';
import { useTasksContext } from '@/contexts';
import { useTaskStats } from '@/hooks/useTasks';
import { TaskManagementProvider } from './context/TaskManagementContext';
import { Button } from '@/components/ui';

interface MyTaskLayoutProps {
  children: React.ReactNode;
}

const MyTaskContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme } = useTheme();
  const pathname = usePathname();
  const { tasks } = useTasksContext();
  const { stats: taskStats } = useTaskStats();
  const [searchValue, setSearchValue] = useState("");
  const [calendarView, setCalendarView] = useState<'dayGridMonth' | 'dayGridWeek'>('dayGridMonth');

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
  };

  const handleCreateTask = () => {
    // This will be handled by individual tab components
    console.log('Create task from header');
  };

  const handleCalendarViewChange = () => {
    console.log('Current view:', calendarView);
    const newView = calendarView === 'dayGridMonth' ? 'dayGridWeek' : 'dayGridMonth';
    console.log('Changing view from', calendarView, 'to', newView);
    setCalendarView(newView);
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
      {/* Shared Header for all MyTask tabs */}
      <div 
        className="sticky top-0 z-30 shadow-sm border-b" 
        style={{ 
          backgroundColor: theme.background.primary,
          borderColor: theme.border.default,
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
                style={{ color: theme.text.secondary }}
              >
                No date ({tasks.filter(t => !t.dueDateISO).length})
              </span>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  console.log('Button clicked! Current pathname:', pathname);
                  handleCalendarViewChange();
                }}
                leftIcon={<Clock className="w-4 h-4" />}
              >
                {calendarView === 'dayGridMonth' ? 'Month' : 'Week'}
              </Button>
              
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

      {/* Tab Content */}
      <div className="h-[calc(100vh-228px)] overflow-hidden">
        {childrenWithProps}
      </div>
    </>
  );
};

const MyTaskLayout: React.FC<MyTaskLayoutProps> = ({ children }) => {
  return (
    <TaskManagementProvider>
      <PageLayout>
        <MyTaskContent>
          {children}
        </MyTaskContent>
      </PageLayout>
    </TaskManagementProvider>
  );
};

export default MyTaskLayout;