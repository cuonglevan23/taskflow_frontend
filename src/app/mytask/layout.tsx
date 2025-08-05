"use client";

import React, { useState } from 'react';
import PageLayout from '@/layouts/page/PageLayout';
import { TaskManagementProvider, useTaskManagementContext } from './context/TaskManagementContext';
import TaskListHeader from '@/components/TaskList/TaskListHeader';
import { useTheme } from '@/layouts/hooks/useTheme';
import { usePathname } from 'next/navigation';
import { Clock } from 'lucide-react';

interface MyTaskLayoutProps {
  children: React.ReactNode;
}

const MyTaskContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme } = useTheme();
  const pathname = usePathname();
  const taskManagement = useTaskManagementContext();
  const [searchValue, setSearchValue] = useState("");

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
  };

  const handleCreateTask = () => {
    // This will be handled by individual tab components
    console.log('Create task from header');
  };

  const handleCalendarViewChange = () => {
    console.log('Current view:', taskManagement.calendarView);
    const newView = taskManagement.calendarView === 'dayGridMonth' ? 'dayGridWeek' : 'dayGridMonth';
    console.log('Changing view from', taskManagement.calendarView, 'to', newView);
    taskManagement.setCalendarView(newView);
  };

  // Clone children with search value prop
  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child) && typeof child.type !== 'string') {
      // Only clone component elements, not DOM elements
      try {
        return React.cloneElement(child, { searchValue });
      } catch (error) {
        console.warn('Failed to clone element:', error);
        return child;
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
        {pathname === '/mytask/calendar' ? (
          <div className="flex items-center justify-between py-4 px-6">
            {/* Left side - Empty */}
            <div />
            
            {/* Right side - Calendar Controls */}
            <div className="flex items-center gap-2">
              <span 
                className="text-sm px-3 py-1 inline-flex items-center whitespace-nowrap" 
                style={{ color: theme.text.secondary }}
              >
                No date ({taskManagement.tasks.filter(t => !t.dueDate && !t.startDate).length})
              </span>
              
              <button 
                onClick={() => {
                  console.log('Button clicked! Current pathname:', pathname);
                  handleCalendarViewChange();
                }}
                className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors"
                style={{
                  color: theme.text.secondary,
                  backgroundColor: 'transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.background.secondary;
                  e.currentTarget.style.color = theme.text.primary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = theme.text.secondary;
                }}
              >
                <Clock className="w-4 h-4" />
                <span>{taskManagement.calendarView === 'dayGridMonth' ? 'Month' : 'Week'}</span>
              </button>
              
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
            showSort={pathname !== '/mytask/calendar'}
            showGroup={pathname === '/mytask/list'}
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
    <PageLayout>
      <TaskManagementProvider>
        <MyTaskContent>
          {children}
        </MyTaskContent>
      </TaskManagementProvider>
    </PageLayout>
  );
};

export default MyTaskLayout;