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

  
  const isLoading = !project || !tasks;

  const handleViewModeChange = (value: string) => {
    setViewMode(value as 'day' | 'week' | 'month' | 'quarter' | 'year');
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
  


  return (
    <div className="flex h-full w-full" style={{ width: "100%", minWidth: "100%", height: "100%", display: "flex" }}>


      {/* Main content */}
      <div className="flex-1 overflow-auto w-full" style={{ 
        width: "100%", 
        minWidth: "100%", 
        flex: 1, 
        display: "flex", 
        flexDirection: "column",
        height: "100%"
      }}>
        {/* Simple header */}
        <div className="flex justify-between items-center mb-6 w-full" style={{ width: "100%" }}>

          
      
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
              tasks={allTasks} 
              viewMode={viewMode}
     
            />
          )}
        </div>
      </div>
    </div>
  );
}
