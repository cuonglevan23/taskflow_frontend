"use client";

import React, { useState, ReactNode } from 'react';
import { useParams } from 'next/navigation';
import { Loader2, List, AlertCircle, Clock, Calendar as CalendarIcon, CalendarCheck, CalendarDays } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import SimpleGantt from '@/components/TimelineGantt/SimpleGantt';
import { useProject } from '../components/DynamicProjectProvider';
import { useProjectTasksContext } from '../context/ProjectTasksProvider';

const Alert = ({ children }: { children: ReactNode }) => (
  <div className="bg-muted/20 border border-border/50 p-4 rounded-lg shadow-sm">
    {children}
  </div>
);

const AlertTitle = ({ children }: { children: ReactNode }) => (
  <h5 className="font-medium mb-2 text-foreground flex items-center gap-2">{children}</h5>
);

const AlertDescription = ({ children }: { children: ReactNode }) => (
  <p className="text-sm text-muted-foreground">{children}</p>
);

export default function TimelinePage() {
  // Get params but don't use directly - needed for context providers
  useParams();
  
  const { project } = useProject();
  const { tasks } = useProjectTasksContext();
  
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month' | 'quarter' | 'year'>('week');
  const [sidebarFilter, setSidebarFilter] = useState<string>('all');
  
  const isLoading = !project || !tasks;

  const handleViewModeChange = (value: string) => {
    setViewMode(value as 'day' | 'week' | 'month' | 'quarter' | 'year');
  };

  const handleTaskClick = (taskId: string) => {
    // Just log the task click
    console.log('Task clicked:', taskId);
  };

  // Process tasks for different time categories
  const today = new Date();
  const nextWeekDate = new Date(today);
  nextWeekDate.setDate(today.getDate() + 7);
  
  // Format tasks for the Gantt chart and different time categories
  const formattedTasks = tasks ? tasks.map(task => ({
    id: String(task.id),
    title: task.title,
    startDate: task.startDate || new Date().toISOString(),
    endDate: task.deadline || 
             (task.startDate ? new Date(new Date(task.startDate).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString() : 
             new Date().toISOString()),
    priority: (task.priority || 'medium') as 'low' | 'medium' | 'high',
    status: task.status || 'TODO', // Use original status string
    description: task.description || `Task #${task.id} - ${task.title}`,
    assignee: task.assigneeId ? {
      id: String(task.assigneeId),
      name: task.assigneeName || 'Assignee',
      avatar: undefined
    } : undefined
  })) : [];
  

  
  // Combine real tasks with sample tasks if needed
  const allTasks = formattedTasks.length > 0 ? formattedTasks : [] ;
  
  // Filter tasks based on sidebar selection
  const filteredTasks = allTasks.filter(task => {
    const taskDate = new Date(task.startDate);
    
    switch (sidebarFilter) {
      case 'recently':
        // Tasks assigned in the last 3 days
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(today.getDate() - 3);
        return taskDate >= threeDaysAgo;
      case 'today':
        // Tasks for today
        return taskDate.toDateString() === today.toDateString();
      case 'next-week':
        // Tasks for the next week
        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 7);
        return taskDate > today && taskDate <= nextWeek;
      case 'later':
        // Tasks scheduled more than a week later
        const weekLater = new Date();
        weekLater.setDate(today.getDate() + 7);
        return taskDate > weekLater;
      default:
        return true; // Show all tasks
    }
  });

  return (
    <div className="flex h-full w-full" style={{ width: "100%", minWidth: "100%", height: "100%", display: "flex" }}>
      {/* Sidebar with task filters */}
      <div className="w-64 border-r border-border/40 bg-muted/5 flex-shrink-0 p-4" style={{ flexShrink: 0 }}>
        <div className="mb-6">
          <h2 className="font-medium text-sm text-muted-foreground uppercase tracking-wide mb-2">
            Time Filter
          </h2>
          <nav className="space-y-1">
            {[
              { id: 'all', label: 'All Tasks', icon: List },
              { id: 'recently', label: 'Recently Assigned', icon: Clock },
              { id: 'today', label: 'Do Today', icon: CalendarDays },
              { id: 'next-week', label: 'Do Next Week', icon: CalendarCheck },
              { id: 'later', label: 'Do Later', icon: CalendarIcon },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setSidebarFilter(item.id)}
                className={`flex items-center w-full px-3 py-2 text-sm rounded-md transition-colors ${
                  sidebarFilter === item.id
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'hover:bg-muted/20 text-muted-foreground'
                }`}
              >
                {React.createElement(item.icon, { size: 16, className: "mr-2" })}
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 p-6 overflow-auto w-full" style={{ 
        width: "100%", 
        minWidth: "100%", 
        flex: 1, 
        display: "flex", 
        flexDirection: "column",
        height: "100%"
      }}>
        {/* Simple header */}
        <div className="flex justify-between items-center mb-6 w-full" style={{ width: "100%" }}>
          {isLoading ? (
            <div className="flex items-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span className="text-sm text-muted-foreground">Loading...</span>
            </div>
          ) : (
            <h1 className="text-lg font-medium">
              {sidebarFilter === 'all' ? 'All Tasks' : 
              sidebarFilter === 'recently' ? 'Recently Assigned' : 
              sidebarFilter === 'today' ? 'Do Today' : 
              sidebarFilter === 'next-week' ? 'Do Next Week' : 'Do Later'}
            </h1>
          )}
          
      
        </div>
        
        {/* Timeline */}
        <div className="w-full" style={{ 
          width: "100%", 
          minWidth: "100%", 
          display: "flex", 
          flexDirection: "column",
          flex: 1,
          height: "100%"
        }}>
          {isLoading ? (
            <SimpleGantt tasks={[]} isLoading={true} />
          ) : formattedTasks.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No tasks found</AlertTitle>
              <AlertDescription>
                There are no tasks available for this time period.
              </AlertDescription>
            </Alert>
          ) : (
            <SimpleGantt 
              tasks={filteredTasks} 
              viewMode={viewMode}
              onTaskClick={handleTaskClick}
            />
          )}
        </div>
      </div>
    </div>
  );
}
