# TaskList Component

A comprehensive, reusable task list component built for enterprise applications. This component provides a clean, modern interface for displaying and managing tasks with support for filtering, sorting, grouping, and bulk operations.

## Features

✅ **Responsive Design** - Works on all screen sizes with adaptive layouts  
✅ **Multiple View Modes** - Table view for desktop, card view for mobile  
✅ **Task Grouping** - Group by status, priority, assignee, or project  
✅ **Search & Filtering** - Real-time search and advanced filtering options  
✅ **Sorting** - Sort by any column with visual indicators  
✅ **Bulk Operations** - Select multiple tasks for batch actions  
✅ **Theme Support** - Works with light/dark themes automatically  
✅ **TypeScript** - Fully typed for better development experience  
✅ **Accessibility** - WCAG compliant with keyboard navigation  
✅ **Performance** - Optimized for large datasets with virtual scrolling  

## Quick Start

```tsx
import { TaskList, TaskListItem, TaskListActions } from '@/components/TaskList';

const tasks: TaskListItem[] = [
  {
    id: '1',
    name: 'Complete project proposal',
    assignees: [{ id: '1', name: 'John Doe', email: 'john@example.com' }],
    dueDate: '2024-01-15',
    priority: 'high',
    status: 'todo',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  }
];

const actions: TaskListActions = {
  onTaskClick: (task) => console.log('Task clicked:', task),
  onCreateTask: () => console.log('Create new task'),
  // ... other actions
};

export default function MyTaskPage() {
  return (
    <TaskList
      tasks={tasks}
      actions={actions}
      config={{
        showSearch: true,
        showFilters: true,
        enableGrouping: true,
        defaultGroupBy: 'status'
      }}
    />
  );
}
```

## Components Architecture

```
TaskList/
├── index.ts              # Clean exports
├── types.ts              # TypeScript interfaces
├── utils.ts              # Utility functions
├── TaskList.tsx          # Main component
├── TaskListHeader.tsx    # Search, filters, actions
├── TaskTable.tsx         # Desktop table view
├── TaskSection.tsx       # Grouped sections
├── TaskRow.tsx           # Individual task row
├── TaskCard.tsx          # Mobile card view
└── README.md            # This documentation
```

## Component Props

### TaskList

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `tasks` | `TaskListItem[]` | `[]` | Array of tasks to display |
| `config` | `TaskListConfig` | `{}` | Configuration options |
| `actions` | `TaskListActions` | `{}` | Event handlers |
| `loading` | `boolean` | `false` | Show loading state |
| `error` | `string` | `undefined` | Error message to display |
| `className` | `string` | `''` | Additional CSS classes |

### TaskListConfig

```tsx
interface TaskListConfig {
  showSearch?: boolean;           // Enable search functionality
  showFilters?: boolean;          // Show filter buttons
  showSort?: boolean;             // Enable column sorting
  enableGrouping?: boolean;       // Group tasks by criteria
  defaultGroupBy?: TaskGroupBy;   // Default grouping option
  columns?: TaskTableColumn[];    // Custom column configuration
}
```

### TaskListActions

```tsx
interface TaskListActions {
  onTaskClick?: (task: TaskListItem) => void;
  onTaskEdit?: (task: TaskListItem) => void;
  onTaskDelete?: (taskId: string) => void;
  onTaskStatusChange?: (taskId: string, status: TaskStatus) => void;
  onTaskAssign?: (taskId: string, assigneeId: string) => void;
  onCreateTask?: () => void;
  onBulkAction?: (taskIds: string[], action: string) => void;
}
```

## Data Types

### TaskListItem

```tsx
interface TaskListItem {
  id: string;
  name: string;
  description?: string;
  assignees: TaskAssignee[];
  dueDate?: string;              // ISO date string
  priority: TaskPriority;        // 'low' | 'medium' | 'high' | 'urgent'
  status: TaskStatus;            // 'todo' | 'in_progress' | 'review' | 'done' | 'cancelled'
  tags?: string[];
  project?: string;
  createdAt: string;             // ISO date string
  updatedAt: string;             // ISO date string
}
```

### TaskAssignee

```tsx
interface TaskAssignee {
  id: string;
  name: string;
  avatar?: string;
  email?: string;
}
```

## Usage Examples

### Basic Implementation

```tsx
import { TaskList } from '@/components/TaskList';

export default function BasicTaskList() {
  const [tasks, setTasks] = useState([]);
  
  return (
    <TaskList
      tasks={tasks}
      actions={{
        onCreateTask: () => {
          // Open create task modal
        }
      }}
    />
  );
}
```

### Advanced Configuration

```tsx
import { TaskList, TaskListConfig, TaskListActions } from '@/components/TaskList';

export default function AdvancedTaskList() {
  const config: TaskListConfig = {
    showSearch: true,
    showFilters: true,
    showSort: true,
    enableGrouping: true,
    defaultGroupBy: 'priority',
    columns: [
      { key: 'name', label: 'Task Name', sortable: true },
      { key: 'assignees', label: 'Assignees', sortable: false },
      { key: 'dueDate', label: 'Due Date', sortable: true },
      { key: 'status', label: 'Status', sortable: true },
    ]
  };

  const actions: TaskListActions = {
    onTaskClick: (task) => {
      router.push(`/tasks/${task.id}`);
    },
    onTaskStatusChange: async (taskId, status) => {
      await updateTask(taskId, { status });
      refreshTasks();
    },
    onBulkAction: async (taskIds, action) => {
      if (action === 'delete') {
        await deleteTasks(taskIds);
      }
      refreshTasks();
    }
  };

  return (
    <TaskList
      tasks={tasks}
      config={config}
      actions={actions}
      loading={loading}
      error={error}
    />
  );
}
```

### Custom Styling

```tsx
// The component uses theme context automatically
// But you can override with custom classes
<TaskList
  tasks={tasks}
  className="my-custom-task-list"
  // Theme colors are applied automatically via useTheme hook
/>
```

## Utilities

The component includes several utility functions:

```tsx
import { 
  formatDate, 
  getPriorityConfig, 
  getStatusConfig,
  groupTasks,
  sortTasks,
  filterTasks 
} from '@/components/TaskList';

// Format date for display
const displayDate = formatDate('2024-01-15'); // "Jan 15" or "Today"

// Get priority styling
const priorityConfig = getPriorityConfig('high'); 
// { label: 'High', color: 'bg-orange-100 text-orange-800', order: 3 }

// Group tasks by status
const groupedTasks = groupTasks(tasks, 'status');
```

## State Management Integration

### With React Query

```tsx
import { useQuery, useMutation } from '@tanstack/react-query';

export default function TaskListWithQuery() {
  const { data: tasks, isLoading, error } = useQuery({
    queryKey: ['tasks'],
    queryFn: fetchTasks
  });

  const updateTaskMutation = useMutation({
    mutationFn: updateTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    }
  });

  return (
    <TaskList
      tasks={tasks || []}
      loading={isLoading}
      error={error?.message}
      actions={{
        onTaskStatusChange: (taskId, status) => {
          updateTaskMutation.mutate({ taskId, status });
        }
      }}
    />
  );
}
```

### With Redux Toolkit

```tsx
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { updateTaskStatus, createTask } from '@/store/slices/tasksSlice';

export default function TaskListWithRedux() {
  const dispatch = useAppDispatch();
  const { tasks, loading, error } = useAppSelector(state => state.tasks);

  return (
    <TaskList
      tasks={tasks}
      loading={loading}
      error={error}
      actions={{
        onTaskStatusChange: (taskId, status) => {
          dispatch(updateTaskStatus({ taskId, status }));
        },
        onCreateTask: () => {
          dispatch(createTask());
        }
      }}
    />
  );
}
```

## Performance Considerations

- **Memoization**: Components use React.memo for optimal re-rendering
- **Virtual Scrolling**: Large lists are virtualized automatically
- **Debounced Search**: Search input is debounced to prevent excessive API calls
- **Optimized Sorting**: Sorting algorithms are optimized for large datasets

## Testing

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskList } from '@/components/TaskList';

describe('TaskList', () => {
  const mockTasks = [
    {
      id: '1',
      name: 'Test task',
      assignees: [],
      priority: 'medium',
      status: 'todo',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    }
  ];

  it('renders tasks correctly', () => {
    render(<TaskList tasks={mockTasks} />);
    expect(screen.getByText('Test task')).toBeInTheDocument();
  });

  it('handles task click', () => {
    const onTaskClick = jest.fn();
    render(
      <TaskList 
        tasks={mockTasks} 
        actions={{ onTaskClick }} 
      />
    );
    
    fireEvent.click(screen.getByText('Test task'));
    expect(onTaskClick).toHaveBeenCalledWith(mockTasks[0]);
  });
});
```

## Migration Guide

### From Old Implementation

1. **Replace imports**:
   ```tsx
   // Old
   import { Task } from '@/types/task';
   
   // New
   import { TaskListItem } from '@/components/TaskList';
   ```

2. **Update data structure**:
   ```tsx
   // Old format
   const oldTask = {
     name: "Task",
     assignee: ["John Doe"],
     priority: "High",
     status: "On track"
   };
   
   // New format
   const newTask: TaskListItem = {
     id: "1",
     name: "Task",
     assignees: [{ id: "1", name: "John Doe", email: "john@example.com" }],
     priority: "high",
     status: "todo",
     createdAt: "2024-01-01T00:00:00Z",
     updatedAt: "2024-01-01T00:00:00Z"
   };
   ```

3. **Replace component usage**:
   ```tsx
   // Old
   <ProjectListPage />
   
   // New
   <TaskList tasks={tasks} actions={actions} />
   ```

## Contributing

When contributing to this component:

1. **Follow TypeScript best practices**
2. **Add proper JSDoc comments**
3. **Include unit tests for new features**
4. **Update this README for new props/features**
5. **Follow the existing code structure**

## Changelog

### Version 1.0.0
- Initial implementation
- Basic task display with responsive design  
- Search, filter, and sort functionality
- Task grouping by status and priority
- Bulk operations support
- Theme integration
- TypeScript support