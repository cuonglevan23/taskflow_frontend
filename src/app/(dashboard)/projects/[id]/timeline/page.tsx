"use client";

import React, { useState, ReactNode } from 'react';
import { useParams } from 'next/navigation';
import { AlertCircle } from "lucide-react";
import SimpleGantt from '@/components/TimelineGantt/SimpleGantt';
import { useProject } from '../components/DynamicProjectProvider';
import { useProjectTasksContext } from '../context/ProjectTasksProvider';
import { useThemeContext } from "@/providers/ThemeProvider";
import { useLanguageContext } from "@/providers/LanguageProvider";

const Alert = ({ children }: { children: ReactNode }) => {
  const { theme } = useThemeContext();
  return (
    <div
      className="border p-4 rounded-lg shadow-sm"
      style={{
        backgroundColor: theme.background.secondary,
        borderColor: theme.border.default
      }}
    >
      {children}
    </div>
  );
};

const AlertTitle = ({ children }: { children: ReactNode }) => {
  const { theme } = useThemeContext();
  return (
    <h5
      className="font-medium mb-2 flex items-center gap-2"
      style={{ color: theme.text.primary }}
    >
      {children}
    </h5>
  );
};

const AlertDescription = ({ children }: { children: ReactNode }) => {
  const { theme } = useThemeContext();
  return (
    <p
      className="text-sm"
      style={{ color: theme.text.secondary }}
    >
      {children}
    </p>
  );
};

export default function TimelinePage() {
  // Get params but don't use directly - needed for context providers
  useParams();
  
  const { project } = useProject();
  const { tasks } = useProjectTasksContext();
  const { theme } = useThemeContext();
  const { messages } = useLanguageContext();

  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month' | 'quarter' | 'year'>('week');

  
  const isLoading = !project || !tasks;

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
    description: task.description || `${messages?.common?.task || 'Task'} #${task.id} - ${task.title}`,
    assignee: task.assigneeId ? {
      id: String(task.assigneeId),
      name: task.assigneeName || (messages?.common?.assignee || 'Assignee'),
      avatar: undefined
    } : undefined
  })) : [];
  

  
  // Combine real tasks with sample tasks if needed
  const allTasks = formattedTasks.length > 0 ? formattedTasks : [];



  return (
    <div
      className="flex h-full w-full"
      style={{
        width: "100%",
        minWidth: "100%",
        height: "100%",
        display: "flex",
        backgroundColor: theme.background.primary
      }}
    >


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
              <AlertTitle>{messages?.common?.noTasksFound || "No tasks found"}</AlertTitle>
              <AlertDescription>
                {messages?.common?.noTasksAvailable || "There are no tasks available for this time period."}
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
