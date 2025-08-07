"use client";

import React from "react";
import SimpleCalendar from "@/components/features/Calendar/SimpleCalendar";

// Simple Teams Calendar Page
export default function CalendarPage() {
  const handleTaskClick = (task: any) => {
    console.log('Task clicked:', task);
  };

  const handleTaskDrop = (task: any, newDate: Date) => {
    console.log('Task dropped:', task.title, 'to', newDate.toDateString());
  };

  const handleDateClick = (date: Date) => {
    console.log('Date clicked:', date.toDateString());
  };

  const handleCreateTask = () => {
    console.log('Create new task');
    // Open create task modal
  };

  return (
    <div className="h-full w-full">
      <SimpleCalendar 
        onTaskClick={handleTaskClick}
        onTaskDrop={handleTaskDrop}
        onDateClick={handleDateClick}
        userRole="member"
        showCreateButton={true}
        showImportExport={false}
        showSettings={false}
        showFilters={false}
        simpleHeader={true}
      />
    </div>
  );
}