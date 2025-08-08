// Tasks Board Page
'use client';

import React from 'react';
import { KanbanBoard } from '@/components/features/KanbanBoard';

export default function TasksBoardPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Tasks Board
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Kanban board view of all your tasks
        </p>
      </div>

        <KanbanBoard
            tasks={[]}
            tasksByAssignmentDate={{}}
        />
    </div>
  );
}