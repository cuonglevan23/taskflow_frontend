"use client";

import React from 'react';
import { GroupedTaskList } from '@/components/TaskList';
import { TaskListItem } from '@/components/TaskList/types';

// Test data with exactly the same structure as in the image
const testTasks: TaskListItem[] = [
  {
    id: '1',
    name: 'f',
    description: 'Short task name',
    assignees: [],
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Tomorrow
    priority: 'medium',
    status: 'todo',
    project: '',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday (recently assigned)
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Schedule kickoff meeting',
    description: 'Project kickoff meeting',
    assignees: [
      { id: 'user1', name: 'John Doe', email: 'john@example.com' }
    ],
    dueDate: '2024-06-10',
    startDate: '2024-06-10',
    endDate: '2024-08-01',
    priority: 'high',
    status: 'in_progress',
    project: 'Cross-functional project',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Draft project brief',
    description: 'Create project brief',
    assignees: [
      { id: 'user2', name: 'Jane Smith', email: 'jane@example.com' }
    ],
    dueDate: '2024-02-10',
    startDate: '2024-02-10', 
    endDate: '2024-05-11',
    priority: 'medium',
    status: 'review',
    project: 'Cross-functional project',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Test task for later',
    description: 'Task without deadline',
    assignees: [],
    priority: 'low',
    status: 'todo',
    project: 'Personal tasks',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
    updatedAt: new Date().toISOString(),
  }
];

export default function TestGroupedTasksPage() {
  const handleTaskClick = (task: TaskListItem) => {
    console.log('✅ Task clicked:', task.name);
  };

  const handleTaskEdit = (task: TaskListItem) => {
    console.log('✏️ Task edited:', task);
    // In real app, this would update the database
    alert(`Task "${task.name}" has been updated!`);
  };

  const handleCreateTask = (taskData: any) => {
    console.log('➕ Create task:', taskData);
    alert(`Creating new task: ${taskData.name || 'New Task'}`);
  };

  const handleTaskDelete = (taskId: string) => {
    console.log('🗑️ Delete task:', taskId);
    if (confirm('Are you sure you want to delete this task?')) {
      alert(`Task ${taskId} deleted!`);
    }
  };

  const handleTaskStatusChange = (taskId: string, status: any) => {
    console.log('🔄 Status change:', taskId, '→', status);
    alert(`Task status changed to: ${status}`);
  };

  const handleTaskAssign = (taskId: string, assigneeId: string) => {
    console.log('👤 Assign task:', taskId, 'to', assigneeId);
    alert(`Task assigned to: ${assigneeId}`);
  };

  const handleBulkAction = (taskIds: string[], action: string) => {
    console.log('📦 Bulk action:', action, 'on', taskIds.length, 'tasks');
    alert(`Bulk ${action} on ${taskIds.length} tasks`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Enhanced Grouped Task List
          </h1>
          <p className="text-gray-600">
            Test page for Asana/ClickUp style task list with hover actions and inline editing
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <GroupedTaskList
            tasks={testTasks}
            actions={{
              onTaskClick: handleTaskClick,
              onTaskEdit: handleTaskEdit,
              onCreateTask: handleCreateTask,
              onTaskDelete: handleTaskDelete,
              onTaskStatusChange: handleTaskStatusChange,
              onTaskAssign: handleTaskAssign,
              onBulkAction: handleBulkAction,
            }}
            config={{
              showSearch: true,
              showFilters: true,
              enableGrouping: true,
              defaultGroupBy: 'assignmentDate', // Creates Asana-style sections
              showSelection: true,
            }}
          />
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-4">
            🎯 Test These Features:
          </h2>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <h3 className="font-medium mb-2">Hover Effects:</h3>
              <ul className="space-y-1">
                <li>• Hover over task rows → Left border turns blue</li>
                <li>• Action buttons appear on hover</li>
                <li>• Status dot shows when not hovering</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">Inline Editing:</h3>
              <ul className="space-y-1">
                <li>• Click on task name to edit</li>
                <li>• Click on due date to change</li>
                <li>• Click on collaborators to assign</li>
                <li>• Click on project to modify</li>
                <li>• Click on status badge to change</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">Quick Actions:</h3>
              <ul className="space-y-1">
                <li>• Edit button (blue) for task details</li>
                <li>• Assign button (green) for collaborators</li>
                <li>• More menu (⋯) for additional options</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">Sections:</h3>
              <ul className="space-y-1">
                <li>• Recently assigned (last 7 days)</li>
                <li>• Do today (due today)</li>
                <li>• Do next week (due within 7 days)</li>
                <li>• Do later (no due date or later)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}