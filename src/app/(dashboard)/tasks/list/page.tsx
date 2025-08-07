// Tasks List Page
'use client';

import React from 'react';
import { TaskList } from '@/components/TaskList';

export default function TasksListPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          All Tasks
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage and organize all your tasks
        </p>
      </div>

      <TaskList />
    </div>
  );
}