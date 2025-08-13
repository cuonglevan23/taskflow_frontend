# TaskList Components

This directory contains task list components with both the original TaskList and enhanced GroupedTaskList for Asana/ClickUp style grouped views.

## Components

### Original Components
- `TaskList` - Main task list component
- `TaskSection` - Section component for grouping
- `TaskRow` - Individual task row
- `TaskTable` - Table view for tasks
- `TaskCard` - Card view for tasks

### Enhanced Components (New)
- `GroupedTaskList` - Enhanced task list with Asana/ClickUp style sections
- `EnhancedTaskSection` - Enhanced section with better styling and functionality
- `EnhancedTaskRow` - Enhanced task row with hover actions and inline editing

## Usage

### Basic GroupedTaskList (Recommended)

```tsx
import { GroupedTaskList } from '@/components/TaskList';

function MyTaskPage() {
  const handleTaskClick = (task) => {
    console.log('Task clicked:', task);
  };

  const handleTaskEdit = (task) => {
    console.log('Task edited:', task);
  };

  const handleCreateTask = (taskData) => {
    console.log('Create task:', taskData);
  };

  return (
    <GroupedTaskList
      tasks={tasks}
      actions={{
        onTaskClick: handleTaskClick,
        onTaskEdit: handleTaskEdit,
        onCreateTask: handleCreateTask,
        onTaskDelete: (taskId) => console.log('Delete:', taskId),
        onTaskStatusChange: (taskId, status) => console.log('Status change:', taskId, status),
        onTaskAssign: (taskId, assigneeId) => console.log('Assign:', taskId, assigneeId),
        onBulkAction: (taskIds, action) => console.log('Bulk action:', taskIds, action),
      }}
      config={{
        showSearch: true,
        showFilters: true,
        enableGrouping: true,
        defaultGroupBy: 'assignmentDate', // Creates Asana-style sections
        showSelection: true,
      }}
    />
  );
}
```

## Features

### Enhanced GroupedTaskList Features

#### 1. Asana/ClickUp Style Sections
- **Recently assigned** - Tasks created in the last 7 days
- **Do today** - Tasks due today
- **Do next week** - Tasks due in the next 7 days
- **Do later** - Tasks with no due date or due later than next week

#### 2. Enhanced Hover Actions
- **Quick Actions** - Edit, priority change, assign, and more options on hover
- **Inline Editing** - Click on task name, project, or status to edit inline
- **Actions Menu** - Dropdown with edit, duplicate, assign, and delete options

#### 3. Improved Styling
- **Visual Feedback** - Left border color changes on hover
- **Clean UI** - Better spacing and typography
- **Responsive** - Works on all screen sizes

#### 4. Advanced Functionality
- **Collapsible Sections** - Expand/collapse each section
- **Bulk Actions** - Select multiple tasks for bulk operations
- **Add Task Inline** - "Add task..." at the bottom of each section
- **Enhanced Calendar** - Rich date/time picker for task creation

## Task Data Structure

```tsx
interface TaskListItem {
  id: string;
  name: string;
  description?: string;
  assignees: TaskAssignee[];
  dueDate?: string;
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  hasStartTime?: boolean;
  hasEndTime?: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in_progress' | 'review' | 'done' | 'cancelled';
  tags?: string[];
  project?: string;
  createdAt: string;
  updatedAt: string;
}
```

## Migration from Original TaskList

Replace:
```tsx
import { TaskList } from '@/components/TaskList';

<TaskList tasks={tasks} actions={actions} />
```

With:
```tsx
import { GroupedTaskList } from '@/components/TaskList';

<GroupedTaskList tasks={tasks} actions={actions} />
```

The enhanced version provides all the same functionality plus the new features listed above.