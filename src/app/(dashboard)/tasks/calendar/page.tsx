// Tasks Calendar Page
'use client';

import React from 'react';
import { SimpleCalendar } from '@/components/features/Calendar';

export default function TasksCalendarPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Tasks Calendar
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Calendar view of all your tasks and deadlines
        </p>
      </div>

      <SimpleCalendar />
    </div>
  );
}