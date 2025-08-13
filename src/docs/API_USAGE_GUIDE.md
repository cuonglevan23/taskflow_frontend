# 📚 API Usage Guide - Hướng dẫn sử dụng API

## 🎯 Tổng quan

Hướng dẫn này sẽ giúp bạn sử dụng kiến trúc API mới đã được tối ưu hóa với:
- ✅ Centralized API client với interceptors
- ✅ Reusable authentication middleware  
- ✅ Consolidated transform functions
- ✅ Clean barrel exports
- ✅ Type-safe operations

---

## 📁 Cấu trúc thư mục

```
src/
├── lib/
│   ├── api.ts              # Centralized API client
│   ├── transforms.ts       # Data transformation utilities
│   └── middleware/
│       ├── auth.ts         # Authentication middleware
│       └── index.ts        # Middleware exports
├── services/
│   ├── tasks/
│   │   ├── tasksService.ts # Tasks operations
│   │   └── index.ts        # Tasks exports
│   ├── users/
│   │   ├── usersService.ts # Users operations  
│   │   └── index.ts        # Users exports
│   ├── teams/
│   │   ├── teamsService.ts # Teams operations
│   │   └── index.ts        # Teams exports
│   └── index.ts            # Main services export
└── hooks/
    └── tasks/
        └── useMyTasksShared.ts # Optimized shared hook
```

---

## 🚀 1. Sử dụng Services (Recommended)

### Import Services
```typescript
// ✅ Recommended: Import từ main barrel
import { tasksService, usersService, teamsService } from '@/services';

// ✅ Alternative: Import specific service
import { tasksService } from '@/services/tasks';
import { usersService } from '@/services/users';
import { teamsService } from '@/services/teams';
```

### Tasks Service Examples

#### 📋 Get My Tasks
```typescript
import { tasksService } from '@/services';

const fetchMyTasks = async () => {
  try {
    const result = await tasksService.getMyTasksSummary({
      page: 0,
      size: 20,
      sortBy: 'startDate',
      sortDir: 'desc'
    });
    
    console.log('Tasks:', result.tasks);
    console.log('Total:', result.totalElements);
    console.log('Pages:', result.totalPages);
    
    return result;
  } catch (error) {
    console.error('Failed to fetch tasks:', error);
    throw error;
  }
};
```

#### ➕ Create Task
```typescript
const createNewTask = async () => {
  try {
    const newTask = await tasksService.createTask({
      title: 'New Task',
      description: 'Task description',
      status: 'TODO',
      priority: 'MEDIUM',
      startDate: '2024-01-15',
      deadline: '2024-01-20',
      assignedToIds: []
    });
    
    console.log('Created task:', newTask);
    return newTask;
  } catch (error) {
    console.error('Failed to create task:', error);
    throw error;
  }
};
```

#### ✏️ Update Task
```typescript
const updateExistingTask = async (taskId: string) => {
  try {
    const updatedTask = await tasksService.updateTask(taskId, {
      title: 'Updated Title',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      deadline: '2024-01-25'
    });
    
    console.log('Updated task:', updatedTask);
    return updatedTask;
  } catch (error) {
    console.error('Failed to update task:', error);
    throw error;
  }
};
```

#### 🗑️ Delete Task
```typescript
const removeTask = async (taskId: string) => {
  try {
    await tasksService.deleteTask(taskId);
    console.log('Task deleted successfully');
  } catch (error) {
    console.error('Failed to delete task:', error);
    throw error;
  }
};
```

#### 📊 Get Task Statistics
```typescript
const getTaskStats = async () => {
  try {
    const stats = await tasksService.getMyTasksStats();
    console.log('Task statistics:', stats);
    return stats;
  } catch (error) {
    console.error('Failed to fetch stats:', error);
    throw error;
  }
};
```

---

## 🎣 2. Sử dụng React Hooks (Recommended cho UI)

### useMyTasksShared Hook (Optimized)
```typescript
import { useMyTasksShared } from '@/hooks/tasks/useMyTasksShared';

const MyTaskComponent = () => {
  // ✅ Một hook cho tất cả: data + actions + loading states
  const {
    tasks,                    // Raw task data
    taskListItems,           // Transformed for UI components
    filteredTasks,           // Filtered by search
    isLoading,               // Loading state
    isCreating,              // Creating state
    isUpdating,              // Updating state
    isDeleting,              // Deleting state
    error,                   // Error state
    actions,                 // All CRUD actions
    revalidate,              // Manual refresh
    convertTaskToTaskListItem // Utility function
  } = useMyTasksShared({
    page: 0,
    size: 1000,
    sortBy: 'startDate',
    sortDir: 'desc',
    searchValue: ''
  });

  // ✅ Sử dụng actions đã được centralized
  const handleCreateTask = async () => {
    const taskData = {
      name: 'New Task',
      description: 'Task description',
      status: 'todo',
      priority: 'medium',
      startDate: '2024-01-15'
    };
    
    try {
      await actions.onCreateTask(taskData);
      console.log('Task created successfully');
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const handleUpdateTask = async (task) => {
    try {
      await actions.onTaskEdit({
        ...task,
        title: 'Updated Title',
        status: 'in_progress'
      });
      console.log('Task updated successfully');
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await actions.onTaskDelete(taskId);
      console.log('Task deleted successfully');
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  // Calendar-specific actions
  const handleDateClick = async (dateStr) => {
    try {
      await actions.onDateClick(dateStr); // Creates task on date
      console.log('Task created on date:', dateStr);
    } catch (error) {
      console.error('Failed to create task on date:', error);
    }
  };

  const handleTaskDrop = async (task, newDate) => {
    try {
      await actions.onTaskDrop(task, newDate);
      console.log('Task moved to new date');
    } catch (error) {
      console.error('Failed to move task:', error);
    }
  };

  if (isLoading) return <div>Loading tasks...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2>My Tasks ({tasks.length})</h2>
      
      <button onClick={handleCreateTask} disabled={isCreating}>
        {isCreating ? 'Creating...' : 'Create Task'}
      </button>

      <div>
        {tasks.map(task => (
          <div key={task.id} className="task-item">
            <h3>{task.title}</h3>
            <p>Status: {task.status}</p>
            <p>Priority: {task.priority}</p>
            <p>Due: {task.dueDate}</p>
            
            <button 
              onClick={() => handleUpdateTask(task)}
              disabled={isUpdating}
            >
              {isUpdating ? 'Updating...' : 'Update'}
            </button>
            
            <button 
              onClick={() => handleDeleteTask(task.id)}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
```

### Traditional SWR Hooks
```typescript
import { useMyTasksSummary, useCreateTask, useUpdateTask, useDeleteTask } from '@/hooks/useTasks';

const MyTaskComponent = () => {
  // Data fetching
  const { tasks, isLoading, error, revalidate } = useMyTasksSummary({
    page: 0,
    size: 20,
    sortBy: 'startDate',
    sortDir: 'desc'
  });

  // Mutations
  const { createTask, isCreating } = useCreateTask();
  const { updateTask, isUpdating } = useUpdateTask();
  const { deleteTask, isDeleting } = useDeleteTask();

  const handleCreate = async () => {
    try {
      await createTask({
        title: 'New Task',
        status: 'TODO',
        priority: 'MEDIUM'
      });
      revalidate(); // Refresh data
    } catch (error) {
      console.error('Create failed:', error);
    }
  };

  // ... rest of component
};
```

---

## 🌐 3. Direct API Calls

### Import API Client
```typescript
import { api } from '@/lib/api';
// Hoặc
import { api } from '@/services';
```

### GET Requests
```typescript
// Get my tasks with pagination
const getMyTasks = async () => {
  try {
    const response = await api.get('/api/tasks/my-tasks/summary', {
      params: {
        page: 0,
        size: 20,
        sortBy: 'startDate',
        sortDir: 'desc'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('GET request failed:', error);
    throw error;
  }
};

// Get single task
const getTask = async (taskId) => {
  try {
    const response = await api.get(`/api/tasks/${taskId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to get task:', error);
    throw error;
  }
};
```

### POST Requests
```typescript
const createTask = async (taskData) => {
  try {
    const response = await api.post('/api/tasks', {
      title: taskData.title,
      description: taskData.description,
      status: 'TODO',
      priority: 'MEDIUM',
      startDate: taskData.startDate,
      deadline: taskData.deadline
    });
    
    return response.data;
  } catch (error) {
    console.error('POST request failed:', error);
    throw error;
  }
};
```

### PUT/PATCH Requests
```typescript
const updateTask = async (taskId, updates) => {
  try {
    const response = await api.put(`/api/tasks/${taskId}`, updates);
    return response.data;
  } catch (error) {
    console.error('PUT request failed:', error);
    throw error;
  }
};

const updateTaskStatus = async (taskId, status) => {
  try {
    const response = await api.patch(`/api/tasks/${taskId}/status`, {
      status: status
    });
    return response.data;
  } catch (error) {
    console.error('PATCH request failed:', error);
    throw error;
  }
};
```

### DELETE Requests
```typescript
const deleteTask = async (taskId) => {
  try {
    await api.delete(`/api/tasks/${taskId}`);
    console.log('Task deleted successfully');
  } catch (error) {
    console.error('DELETE request failed:', error);
    throw error;
  }
};
```

### File Upload
```typescript
const uploadFile = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.upload('/api/upload', formData, (progressEvent) => {
      const progress = (progressEvent.loaded / progressEvent.total) * 100;
      console.log(`Upload progress: ${progress}%`);
    });
    
    return response.data;
  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
};
```

### File Download
```typescript
const downloadFile = async (fileId, filename) => {
  try {
    await api.download(`/api/files/${fileId}`, filename);
    console.log('File downloaded successfully');
  } catch (error) {
    console.error('Download failed:', error);
    throw error;
  }
};
```

---

## 🔐 4. API Routes với Authentication Middleware

### Basic Authentication
```typescript
// src/app/api/my-endpoint/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withAuthHandler } from '@/lib/middleware';
import { tasksService } from '@/services';

export const GET = withAuthHandler(
  async (request: NextRequest, user) => {
    // user object contains: id, email, name, role, permissions
    console.log('Authenticated user:', user);
    
    const tasks = await tasksService.getMyTasksSummary();
    return NextResponse.json(tasks);
  }
);

export const POST = withAuthHandler(
  async (request: NextRequest, user) => {
    const body = await request.json();
    
    const task = await tasksService.createTask({
      ...body,
      creatorId: parseInt(user.id) // Auto-assign creator
    });
    
    return NextResponse.json(task, { status: 201 });
  }
);
```

### Role-based Authorization
```typescript
import { withAuthHandler, withAdmin, withManager } from '@/lib/middleware';

// Admin only endpoint
export const DELETE = withAuthHandler(
  async (request: NextRequest, user) => {
    // Only admins can access this
    await tasksService.deleteTask(params.id);
    return NextResponse.json({ success: true });
  },
  withAdmin // Middleware for admin-only access
);

// Manager level endpoint
export const PUT = withAuthHandler(
  async (request: NextRequest, user) => {
    // Only managers and above can access
    const body = await request.json();
    const task = await tasksService.updateTask(params.id, body);
    return NextResponse.json(task);
  },
  withManager // Middleware for manager+ access
);
```

### Permission-based Authorization
```typescript
import { withAuthHandler, withTaskPermissions, withProjectPermissions } from '@/lib/middleware';

// Task permissions required
export const GET = withAuthHandler(
  async (request: NextRequest, user) => {
    const tasks = await tasksService.getMyTasks();
    return NextResponse.json(tasks);
  },
  withTaskPermissions // Requires VIEW_TASK, CREATE_TASK permissions
);

// Project permissions required
export const POST = withAuthHandler(
  async (request: NextRequest, user) => {
    const body = await request.json();
    const project = await projectsService.createProject(body);
    return NextResponse.json(project);
  },
  withProjectPermissions // Requires VIEW_PROJECT, CREATE_PROJECT permissions
);
```

---

## 🛠️ 5. Data Transformation Utilities

### Import Transforms
```typescript
import { 
  safeParseDate,
  formatDateString,
  normalizeStatus,
  normalizePriority,
  toBackendStatus,
  toBackendPriority,
  transformPaginatedResponse,
  transformUser,
  transformTeam
} from '@/lib/transforms';
```

### Date Handling
```typescript
// Safe date parsing (handles multiple formats)
const date1 = safeParseDate([2024, 1, 15]);        // Array format
const date2 = safeParseDate('2024-01-15');         // String format
const date3 = safeParseDate(new Date());           // Date object

// Format date to string
const dateStr1 = formatDateString([2024, 1, 15]);  // "2024-01-15"
const dateStr2 = formatDateString(new Date());     // "2024-01-15"
```

### Status & Priority Normalization
```typescript
// Backend to Frontend
const frontendStatus = normalizeStatus('DONE');        // "completed"
const frontendPriority = normalizePriority('HIGH');    // "high"

// Frontend to Backend
const backendStatus = toBackendStatus('completed');    // "COMPLETED"
const backendPriority = toBackendPriority('high');     // "HIGH"
```

### Paginated Response Transform
```typescript
const transformedResponse = transformPaginatedResponse(
  backendResponse,
  (item) => transformUser(item) // Transform function for each item
);

// Result:
// {
//   items: User[],
//   totalElements: number,
//   totalPages: number,
//   currentPage: number,
//   pageSize: number
// }
```

---

## ⚡ 6. Performance Tips

### 1. Use SWR Hooks for Caching
```typescript
// ✅ Good: Automatic caching and revalidation
const { tasks, isLoading } = useMyTasksSummary(params);

// ❌ Avoid: Direct API calls in components (no caching)
const [tasks, setTasks] = useState([]);
useEffect(() => {
  tasksService.getMyTasksSummary().then(setTasks);
}, []);
```

### 2. Use Shared Hook for Multiple Views
```typescript
// ✅ Good: One hook for list, board, calendar views
const { tasks, actions } = useMyTasksShared(params);

// ❌ Avoid: Separate hooks for each view
const listData = useMyTasksSummary(params);
const boardData = useMyTasksSummary(params);
const calendarData = useMyTasksSummary(params);
```

### 3. Batch Operations
```typescript
// ✅ Good: Batch multiple updates
await actions.onBulkAction(['task1', 'task2', 'task3'], 'complete');

// ❌ Avoid: Individual API calls
await Promise.all([
  tasksService.updateTask('task1', { status: 'COMPLETED' }),
  tasksService.updateTask('task2', { status: 'COMPLETED' }),
  tasksService.updateTask('task3', { status: 'COMPLETED' })
]);
```

---

## 🚨 7. Error Handling

### Service Level Error Handling
```typescript
try {
  const task = await tasksService.createTask(data);
  console.log('Success:', task);
} catch (error) {
  // Normalized error object
  console.error('Error message:', error.message);
  console.error('Status code:', error.status);
  console.error('Error code:', error.code);
  console.error('Details:', error.details);
  
  // Handle specific errors
  if (error.status === 401) {
    // Redirect to login
    window.location.href = '/login';
  } else if (error.status === 403) {
    // Show permission error
    alert('You do not have permission to perform this action');
  } else if (error.status >= 500) {
    // Server error
    alert('Server error. Please try again later.');
  }
}
```

### Hook Level Error Handling
```typescript
const { tasks, error, isLoading } = useMyTasksShared(params);

if (error) {
  return (
    <div className="error-container">
      <h3>Error Loading Tasks</h3>
      <p>{error.message}</p>
      <button onClick={() => window.location.reload()}>
        Retry
      </button>
    </div>
  );
}
```

---

## 📝 8. TypeScript Support

### Type Imports
```typescript
// Service types
import type { 
  Task, 
  CreateTaskDTO, 
  UpdateTaskDTO,
  User,
  Team 
} from '@/services';

// Middleware types
import type { AuthenticatedUser } from '@/lib/middleware/auth';

// Hook types
import type { TaskListItem } from '@/components/TaskList/types';
```

### Usage with Types
```typescript
const createTypedTask = async (data: CreateTaskDTO): Promise<Task> => {
  try {
    const task = await tasksService.createTask(data);
    return task; // Fully typed Task object
  } catch (error) {
    throw error; // Normalized error object
  }
};

const handleAuthenticatedRequest = withAuthHandler(
  async (request: NextRequest, user: AuthenticatedUser): Promise<NextResponse> => {
    // user is fully typed with id, email, name, role, permissions
    const tasks = await tasksService.getMyTasks();
    return NextResponse.json(tasks);
  }
);
```

---

## 🎯 9. Best Practices

### ✅ DO
- Sử dụng `useMyTasksShared` hook cho UI components
- Import từ barrel exports (`@/services`)
- Sử dụng middleware cho API routes
- Handle errors properly với try/catch
- Sử dụng TypeScript types
- Batch operations khi có thể

### ❌ DON'T
- Tạo axios instance riêng
- Copy-paste authentication logic
- Ignore error handling
- Mix direct API calls với SWR hooks
- Import từ deep paths (`@/services/tasks/tasksService`)

---

## 🔧 10. Migration từ Old Code

### Old Way → New Way

```typescript
// ❌ Old way
import { taskService } from '@/services/task/service';
import { transformMyTasksSummary } from '@/services/task/transforms';
import { apiClient } from '@/services/api';

const response = await apiClient.get('/api/tasks');
const tasks = response.data.map(transformMyTasksSummary);

// ✅ New way
import { tasksService } from '@/services';

const result = await tasksService.getMyTasksSummary();
const tasks = result.tasks; // Already transformed
```

### Backward Compatibility
```typescript
// Old imports still work
import { taskService } from '@/services'; // Maps to tasksService
import { apiClient } from '@/services';   // Maps to api

// But prefer new imports
import { tasksService, api } from '@/services';
```

---

## 📞 Support & Troubleshooting

### Common Issues

1. **Authentication Errors**
   ```typescript
   // Check if token exists
   import { CookieAuth } from '@/utils/cookieAuth';
   const token = CookieAuth.getAccessToken();
   console.log('Token:', token);
   ```

2. **Network Errors**
   ```typescript
   // Test API connectivity
   import { api } from '@/services';
   const isHealthy = await api.healthCheck();
   console.log('API Health:', isHealthy);
   ```

3. **Type Errors**
   ```typescript
   // Ensure proper imports
   import type { Task } from '@/services';
   ```

### Debug Mode
```typescript
// Enable detailed logging
localStorage.setItem('DEBUG_API', 'true');

// Check network tab in browser dev tools
// All requests will have detailed logs
```

---

## 🎉 Conclusion

Kiến trúc API mới này cung cấp:
- ✅ **Centralized management** - Tất cả API logic ở một nơi
- ✅ **Type safety** - Full TypeScript support
- ✅ **Error handling** - Consistent error normalization
- ✅ **Performance** - SWR caching và optimization
- ✅ **Developer experience** - Clean imports và easy debugging
- ✅ **Maintainability** - DRY principle và modular structure

Hãy sử dụng `useMyTasksShared` hook cho UI components và `tasksService` cho direct operations. Kiến trúc này sẽ scale tốt khi project phát triển! 🚀