# Task API - Frontend Integration Guide

## Overview
API endpoints để quản lý tasks cá nhân, team tasks, và project tasks với đầy đủ CRUD operations.

## Base Configuration

### Base URL
```
http://localhost:8080
```

### Authentication Required
Tất cả endpoints cần JWT token trong header:
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

---

## 📋 API Endpoints Summary

| Method | Endpoint | Description | Parameters | Role Access |
|--------|----------|-------------|------------|-------------|
| POST | `/api/tasks` | Tạo task mới | CreateTaskRequestDto | ADMIN, OWNER, MEMBER, LEADER |
| GET | `/api/tasks` | Lấy all tasks (filtered by role) | None | ADMIN, OWNER, MEMBER, LEADER |
| GET | `/api/tasks/my-tasks` | Lấy tasks của mình (paginated) | page, size, sortBy, sortDir | ADMIN, OWNER, MEMBER, LEADER |
| GET | `/api/tasks/my-tasks/summary` | Lấy task summary (lightweight) | page, size, sortBy, sortDir | ADMIN, OWNER, MEMBER, LEADER |
| GET | `/api/tasks/my-tasks/stats` | Lấy thống kê tasks | None | ADMIN, OWNER, MEMBER, LEADER |
| GET | `/api/tasks/{id}` | Lấy task theo ID | id (path) | Creator/Assignee only |
| PUT | `/api/tasks/{id}` | Cập nhật task | id (path), UpdateTaskRequestDto | Creator/Admin |
| DELETE | `/api/tasks/{id}` | Xóa task | id (path) | Creator/Admin |

---

## 🎯 1. TẠO TASK (POST /api/tasks)

### **A. Task Cá nhân (Personal Task):**

**Request Body:**
```json
{
  "title": "Complete morning workout",
  "description": "Daily exercise routine - 30 minutes",
  "status": "TODO",
  "priority": "MEDIUM",
  "startDate": "2024-01-20",
  "deadline": "2024-01-21",
  "creatorId": 21,
  "assignedToIds": [21]
}
```

**TypeScript Example:**
```typescript
interface CreatePersonalTaskRequest {
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  startDate: string; // YYYY-MM-DD
  deadline: string; // YYYY-MM-DD
  creatorId: number;
  assignedToIds: number[];
  // projectId và groupId = undefined cho personal task
}

const createPersonalTask = async (taskData: CreatePersonalTaskRequest) => {
  const response = await fetch('http://localhost:8080/api/tasks', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(taskData)
  });
  
  if (!response.ok) {
    throw new Error(`Failed to create personal task: ${response.status}`);
  }
  
  return response.json(); // TaskResponseDto
};
```

### **B. Task cho Team:**

**Request Body:**
```json
{
  "title": "Team sprint planning",
  "description": "Plan next 2-week sprint with all team members",
  "status": "TODO",
  "priority": "HIGH",
  "startDate": "2024-01-20",
  "deadline": "2024-01-22",
  "creatorId": 21,
  "groupId": 2,
  "assignedToIds": [21, 22, 23, 24]
}
```

**TypeScript Example:**
```typescript
interface CreateTeamTaskRequest {
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  startDate: string;
  deadline: string;
  creatorId: number;
  groupId: number;        // ✅ Team ID
  assignedToIds: number[];
  // projectId = undefined for pure team task
}

const createTeamTask = async (teamId: number, taskData: Omit<CreateTeamTaskRequest, 'groupId'>) => {
  const requestData = {
    ...taskData,
    groupId: teamId
  };

  const response = await fetch('http://localhost:8080/api/tasks', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestData)
  });
  
  return response.json();
};
```

### **C. Task cho Project:**

**Request Body:**
```json
{
  "title": "Implement user authentication API",
  "description": "Add JWT authentication endpoints and middleware",
  "status": "TODO",
  "priority": "CRITICAL",
  "startDate": "2024-01-20",
  "deadline": "2024-01-27",
  "creatorId": 21,
  "projectId": 1,
  "assignedToIds": [21, 25, 26]
}
```

**TypeScript Example:**
```typescript
interface CreateProjectTaskRequest {
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  startDate: string;
  deadline: string;
  creatorId: number;
  projectId: number;      // ✅ Project ID
  assignedToIds: number[];
  // groupId = undefined for project-wide task
}

const createProjectTask = async (projectId: number, taskData: Omit<CreateProjectTaskRequest, 'projectId'>) => {
  const requestData = {
    ...taskData,
    projectId: projectId
  };

  const response = await fetch('http://localhost:8080/api/tasks', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestData)
  });
  
  return response.json();
};
```

### **D. Task cho Project + Team (Combined):**

**Request Body:**
```json
{
  "title": "Database schema review",
  "description": "Review database design with backend team for user management module",
  "status": "TODO",
  "priority": "HIGH",
  "startDate": "2024-01-20",
  "deadline": "2024-01-25",
  "creatorId": 21,
  "projectId": 1,
  "groupId": 2,
  "assignedToIds": [21, 22, 23]
}
```

**TypeScript Example:**
```typescript
interface CreateProjectTeamTaskRequest {
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  startDate: string;
  deadline: string;
  creatorId: number;
  projectId: number;      // ✅ Project ID
  groupId: number;        // ✅ Team ID
  assignedToIds: number[];
}

const createProjectTeamTask = async (
  projectId: number, 
  teamId: number, 
  taskData: Omit<CreateProjectTeamTaskRequest, 'projectId' | 'groupId'>
) => {
  const requestData = {
    ...taskData,
    projectId: projectId,
    groupId: teamId
  };

  const response = await fetch('http://localhost:8080/api/tasks', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestData)
  });
  
  return response.json();
};
```

---

## 📖 2. ĐỌC TASKS (GET Methods)

### **A. Lấy tất cả tasks (Security filtered):**

**Endpoint:** `GET /api/tasks`

```typescript
const getAllTasks = async (): Promise<TaskResponseDto[]> => {
  const response = await fetch('http://localhost:8080/api/tasks', {
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json'
    }
  });
  
  return response.json();
};

// Security Logic:
// - ADMIN/OWNER/LEADER: See all organization tasks
// - MEMBER: See only created/assigned tasks
```

### **B. Lấy my participating tasks với pagination (Recommended):**

**Endpoint:** `GET /api/tasks/my-tasks?page=0&size=10&sortBy=updatedAt&sortDir=desc`

**✅ COMPREHENSIVE**: API này lấy **TẤT CẢ** tasks mà user tham gia bao gồm:
- 🎯 Tasks mình tạo (creator)
- 👤 Tasks được assign cho mình (assignee)  
- 📋 Tasks thuộc projects mà mình là member
- 👥 Tasks thuộc teams mà mình là member

```typescript
interface PaginationParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

const getMyParticipatingTasks = async (params: PaginationParams = {}): Promise<Page<TaskResponseDto>> => {
  const {
    page = 0,
    size = 10,
    sortBy = 'updatedAt',
    sortDir = 'desc'
  } = params;

  const searchParams = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
    sortBy,
    sortDir
  });

  const response = await fetch(`http://localhost:8080/api/tasks/my-tasks?${searchParams}`, {
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json'
    }
  });
  
  return response.json();
};

// Example: User sẽ thấy tasks từ:
// - Personal tasks created by user
// - Tasks assigned to user  
// - All tasks in projects where user is project member
// - All tasks in teams where user is team member
```

### **C. Lấy participating tasks summary (Lightweight):**

**Endpoint:** `GET /api/tasks/my-tasks/summary?page=0&size=20&sortBy=updatedAt&sortDir=desc`

**✅ COMPREHENSIVE SUMMARY**: API này lấy lightweight summary của **TẤT CẢ** tasks mà user tham gia:
- 🎯 Tasks mình tạo (creator)
- 👤 Tasks được assign cho mình (assignee)  
- 📋 Tasks thuộc projects mà mình là member
- 👥 Tasks thuộc teams mà mình là member
- ⚡ Bao gồm `participationType` để biết user tham gia với vai trò gì

```typescript
const getMyParticipatingTasksSummary = async (params: PaginationParams = {}): Promise<Page<MyTaskSummaryDto>> => {
  const {
    page = 0,
    size = 20,
    sortBy = 'updatedAt',
    sortDir = 'desc'
  } = params;

  const searchParams = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
    sortBy,
    sortDir
  });

  const response = await fetch(`http://localhost:8080/api/tasks/my-tasks/summary?${searchParams}`, {
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json'
    }
  });
  
  return response.json();
};

// Response bao gồm participationType cho mỗi task:
// - "CREATOR": User tạo task này
// - "ASSIGNEE": User được assign task này  
// - "PROJECT_MEMBER": User là member của project chứa task
// - "TEAM_MEMBER": User là member của team chứa task
```

### **D. Lấy task participation statistics:**

**Endpoint:** `GET /api/tasks/my-tasks/stats`

**✅ COMPREHENSIVE STATS**: Thống kê **TẤT CẢ** tasks mà user tham gia:
- 📊 Tổng số tasks user có tham gia (creator, assignee, project member, team member)
- 📧 Email và ID của user

```typescript
interface TaskParticipationStats {
  totalParticipatingTasks: number; // Total tasks user participates in
  userEmail: string;
  userId: number;
}

const getMyTaskParticipationStats = async (): Promise<TaskParticipationStats> => {
  const response = await fetch('http://localhost:8080/api/tasks/my-tasks/stats', {
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json'
    }
  });
  
  return response.json();
};

// Example response:
// {
//   "totalParticipatingTasks": 25,  // Includes all tasks from projects, teams, assignments, created
//   "userEmail": "user@example.com",
//   "userId": 21
// }
```

### **E. Lấy task theo ID:**

**Endpoint:** `GET /api/tasks/{id}`

```typescript
const getTaskById = async (taskId: number): Promise<TaskResponseDto> => {
  const response = await fetch(`http://localhost:8080/api/tasks/${taskId}`, {
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    if (response.status === 403) {
      throw new Error('Access denied: You can only view tasks you created or are assigned to');
    }
    if (response.status === 404) {
      throw new Error('Task not found');
    }
    throw new Error(`Failed to fetch task: ${response.status}`);
  }
  
  return response.json();
};
```

---

## 🔄 3. CẬP NHẬT TASK (PUT /api/tasks/{id})

**Endpoint:** `PUT /api/tasks/{id}`

```typescript
interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  startDate?: string;
  deadline?: string;
  groupId?: number; // Can change team assignment
}

const updateTask = async (taskId: number, updates: UpdateTaskRequest): Promise<TaskResponseDto> => {
  const response = await fetch(`http://localhost:8080/api/tasks/${taskId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updates)
  });
  
  if (!response.ok) {
    throw new Error(`Failed to update task: ${response.status}`);
  }
  
  return response.json();
};
```

**Update Examples:**
```typescript
// Cập nhật status
await updateTask(123, { status: 'IN_PROGRESS' });

// Cập nhật priority và deadline
await updateTask(123, { 
  priority: 'CRITICAL',
  deadline: '2024-01-25'
});

// Chuyển task sang team khác
await updateTask(123, { groupId: 5 });

// Cập nhật multiple fields
await updateTask(123, {
  title: 'Updated task title',
  description: 'New description',
  status: 'COMPLETED',
  priority: 'HIGH'
});
```

---

## 🗑️ 4. XÓA TASK (DELETE /api/tasks/{id})

**Endpoint:** `DELETE /api/tasks/{id}`

```typescript
const deleteTask = async (taskId: number): Promise<void> => {
  const response = await fetch(`http://localhost:8080/api/tasks/${taskId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    if (response.status === 403) {
      throw new Error('Access denied: You can only delete tasks you created');
    }
    if (response.status === 404) {
      throw new Error('Task not found');
    }
    throw new Error(`Failed to delete task: ${response.status}`);
  }
  
  // Response: "Task deleted successfully."
};
```

---

## 📦 5. TypeScript Interfaces

### **CreateTaskRequestDto:**
```typescript
interface CreateTaskRequestDto {
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  startDate: string; // YYYY-MM-DD format
  deadline: string; // YYYY-MM-DD format
  creatorId: number;
  projectId?: number; // Optional - for project tasks
  groupId?: number;   // Optional - for team tasks (team ID)
  assignedToIds: number[]; // Array of user IDs
}
```

### **TaskResponseDto:**
```typescript
interface TaskResponseDto {
  id: number;
  title: string;
  description: string;
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  startDate: string;
  deadline: string;
  createdAt: string; // ISO datetime
  updatedAt: string; // ISO datetime
  creatorId: number;
  projectId: number | null;
  groupId: number | null; // Team ID
  checklists: TaskChecklistResponseDto[] | null;
}

interface TaskChecklistResponseDto {
  id: number;
  item: string;
  isCompleted: boolean;
  createdAt: string;
  taskId: number;
}
```

### **MyTaskSummaryDto (Lightweight):**
```typescript
interface MyTaskSummaryDto {
  id: number;
  title: string;
  description: string;
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  startDate: string;
  deadline: string;
  createdAt: string;
  updatedAt: string;
  creatorId: number;
  creatorName: string;
  projectId: number | null;
  projectName: string | null;
  teamId: number | null;
  teamName: string | null;
  checklistCount: number;
  assigneeCount: number;
  participationType: 'CREATOR' | 'ASSIGNEE' | 'PROJECT_MEMBER' | 'TEAM_MEMBER' | 'OTHER';
}
```

### **Page<T> Response:**
```typescript
interface Page<T> {
  content: T[];
  pageable: {
    sort: {
      sorted: boolean;
      ascending: boolean;
    };
    pageNumber: number;
    pageSize: number;
  };
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}
```

---

## 🎣 6. React Hooks Examples

### **useTaskManagement Hook:**
```typescript
import { useState, useEffect } from 'react';
import { TaskResponseDto, MyTaskSummaryDto, TaskStats } from '../types/api.types';

export const useTaskManagement = () => {
  const [tasks, setTasks] = useState<TaskResponseDto[]>([]);
  const [tasksSummary, setTasksSummary] = useState<Page<MyTaskSummaryDto> | null>(null);
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get all tasks
  const fetchAllTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/api/tasks', {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      setTasks(data);
    } catch (err) {
      setError('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  // Get paginated tasks summary  
  const fetchTasksSummary = async (page = 0, size = 20) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        sortBy: 'updatedAt',
        sortDir: 'desc'
      });

      const response = await fetch(`http://localhost:8080/api/tasks/my-tasks/summary?${params}`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      setTasksSummary(data);
    } catch (err) {
      setError('Failed to fetch tasks summary');
    } finally {
      setLoading(false);
    }
  };

  // Get task statistics
  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/tasks/my-tasks/stats', {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError('Failed to fetch stats');
    }
  };

  // Create task
  const createTask = async (taskData: CreateTaskRequestDto): Promise<TaskResponseDto> => {
    const response = await fetch('http://localhost:8080/api/tasks', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(taskData)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create task: ${response.status}`);
    }
    
    const newTask = await response.json();
    setTasks(prev => [...prev, newTask]);
    return newTask;
  };

  // Update task
  const updateTask = async (taskId: number, updates: UpdateTaskRequest): Promise<TaskResponseDto> => {
    const response = await fetch(`http://localhost:8080/api/tasks/${taskId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update task: ${response.status}`);
    }
    
    const updatedTask = await response.json();
    setTasks(prev => prev.map(task => task.id === taskId ? updatedTask : task));
    return updatedTask;
  };

  // Delete task
  const deleteTask = async (taskId: number): Promise<void> => {
    const response = await fetch(`http://localhost:8080/api/tasks/${taskId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete task: ${response.status}`);
    }
    
    setTasks(prev => prev.filter(task => task.id !== taskId));
  };

  return {
    tasks,
    tasksSummary,
    stats,
    loading,
    error,
    fetchAllTasks,
    fetchTasksSummary,
    fetchStats,
    createTask,
    updateTask,
    deleteTask
  };
};
```

---

## 🔍 7. Project và Team Tasks

### **Lấy tasks của Project:**

**Endpoint:** `GET /api/projects/{id}/tasks` (from ProjectController)

```typescript
const getProjectTasks = async (projectId: number): Promise<TaskResponseDto[]> => {
  const response = await fetch(`http://localhost:8080/api/projects/${projectId}/tasks`, {
    headers: getAuthHeaders()
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch project tasks: ${response.status}`);
  }
  
  return response.json();
};
```

### **React Component Example - Project Tasks:**
```typescript
import React, { useState, useEffect } from 'react';

interface ProjectTasksProps {
  projectId: number;
}

const ProjectTasks: React.FC<ProjectTasksProps> = ({ projectId }) => {
  const [tasks, setTasks] = useState<TaskResponseDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjectTasks = async () => {
      try {
        const projectTasks = await getProjectTasks(projectId);
        setTasks(projectTasks);
      } catch (error) {
        console.error('Error fetching project tasks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectTasks();
  }, [projectId]);

  if (loading) return <div>Loading project tasks...</div>;

  return (
    <div className="project-tasks">
      <h3>Project Tasks ({tasks.length})</h3>
      {tasks.map(task => (
        <div key={task.id} className="task-card">
          <h4>{task.title}</h4>
          <p>{task.description}</p>
          <div className="task-meta">
            <span className={`status ${task.status.toLowerCase()}`}>
              {task.status}
            </span>
            <span className={`priority ${task.priority.toLowerCase()}`}>
              {task.priority}
            </span>
            <span className="deadline">Due: {task.deadline}</span>
          </div>
        </div>
      ))}
    </div>
  );
};
```

---

## 🎯 8. Complete Task Creation Examples

### **Task Creation Service:**
```typescript
// services/taskService.ts
export class TaskService {
  
  // Personal task
  static createPersonalTask = async (data: {
    title: string;
    description?: string;
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    deadline: string;
    currentUserId: number;
  }) => {
    return this.createTask({
      ...data,
      status: 'TODO',
      priority: data.priority || 'MEDIUM',
      startDate: new Date().toISOString().split('T')[0],
      creatorId: data.currentUserId,
      assignedToIds: [data.currentUserId]
    });
  };

  // Team task
  static createTeamTask = async (data: {
    title: string;
    description?: string;
    teamId: number;
    assigneeIds: number[];
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    deadline: string;
    currentUserId: number;
  }) => {
    return this.createTask({
      ...data,
      status: 'TODO',
      priority: data.priority || 'MEDIUM',
      startDate: new Date().toISOString().split('T')[0],
      creatorId: data.currentUserId,
      groupId: data.teamId,
      assignedToIds: data.assigneeIds
    });
  };

  // Project task
  static createProjectTask = async (data: {
    title: string;
    description?: string;
    projectId: number;
    assigneeIds: number[];
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    deadline: string;
    currentUserId: number;
  }) => {
    return this.createTask({
      ...data,
      status: 'TODO', 
      priority: data.priority || 'MEDIUM',
      startDate: new Date().toISOString().split('T')[0],
      creatorId: data.currentUserId,
      projectId: data.projectId,
      assignedToIds: data.assigneeIds
    });
  };

  // Project + Team task
  static createProjectTeamTask = async (data: {
    title: string;
    description?: string;
    projectId: number;
    teamId: number;
    assigneeIds: number[];
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    deadline: string;
    currentUserId: number;
  }) => {
    return this.createTask({
      ...data,
      status: 'TODO',
      priority: data.priority || 'MEDIUM',
      startDate: new Date().toISOString().split('T')[0],
      creatorId: data.currentUserId,
      projectId: data.projectId,
      groupId: data.teamId,
      assignedToIds: data.assigneeIds
    });
  };

  private static createTask = async (taskData: CreateTaskRequestDto): Promise<TaskResponseDto> => {
    const response = await fetch('http://localhost:8080/api/tasks', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(taskData)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create task: ${response.status}`);
    }
    
    return response.json();
  };
}
```

---

## 💼 9. Business Logic

### **Task Access Control:**
- **Creator**: Có thể view, update, delete task
- **Assignee**: Có thể view, update status/progress
- **ADMIN/OWNER/LEADER**: Có thể view all org tasks
- **MEMBER**: Chỉ view tasks they created or assigned to

### **Task Relationships:**
- **Personal**: `projectId = null, groupId = null`
- **Team**: `groupId = teamId, projectId = null/optional`
- **Project**: `projectId = projectId, groupId = null/optional`
- **Project+Team**: `projectId = projectId, groupId = teamId`

### **Security Features:**
- JWT authentication required
- Role-based filtering in `getAllTasks()`
- Permission check in `getTaskById()`
- Organization-level access control

---

## 🚀 10. Usage Patterns

### **Dashboard Component:**
```typescript
const Dashboard: React.FC = () => {
  const { tasks, tasksSummary, stats, loading, fetchTasksSummary, fetchStats } = useTaskManagement();

  useEffect(() => {
    // Load dashboard data
    Promise.all([
      fetchTasksSummary(0, 10),
      fetchStats()
    ]);
  }, []);

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div className="dashboard">
      <div className="stats">
        <h3>My Task Statistics</h3>
        <p>Total Participating Tasks: {stats?.totalParticipatingTasks}</p>
      </div>
      
      <div className="recent-tasks">
        <h3>Recent Tasks</h3>
        {tasksSummary?.content.map(task => (
          <TaskSummaryCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
};
```

### **Task Creation Form:**
```typescript
const CreateTaskForm: React.FC = () => {
  const [taskType, setTaskType] = useState<'personal' | 'team' | 'project'>('personal');
  const { createTask } = useTaskManagement();

  const handleSubmit = async (formData: any) => {
    try {
      let taskData: CreateTaskRequestDto;
      
      switch (taskType) {
        case 'personal':
          taskData = await TaskService.createPersonalTask(formData);
          break;
        case 'team':
          taskData = await TaskService.createTeamTask(formData);
          break;
        case 'project':
          taskData = await TaskService.createProjectTask(formData);
          break;
      }
      
      console.log('Task created successfully:', taskData);
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <select 
        value={taskType} 
        onChange={(e) => setTaskType(e.target.value as any)}
      >
        <option value="personal">Personal Task</option>
        <option value="team">Team Task</option>
        <option value="project">Project Task</option>
      </select>
      
      {/* Form fields based on taskType */}
    </form>
  );
};
```

---

## 🔧 11. Troubleshooting

### **Common Issues:**

1. **403 Forbidden**:
   - Check JWT token validity
   - Verify user has correct role
   - Ensure user has permission to access task

2. **404 Not Found**:
   - Verify task ID exists
   - Check if user has permission to view task

3. **400 Bad Request**:
   - Validate request body format
   - Check required fields
   - Verify date formats (YYYY-MM-DD)

4. **Entity Not Found**:
   - Verify `projectId`, `groupId`, `creatorId`, `assignedToIds` exist
   - Check user permissions on referenced entities

### **Debug Tips:**
```typescript
// Add debugging to API calls
const debugApiCall = async (url: string, options: RequestInit) => {
  console.log('🔍 API Call:', { url, options });
  
  const response = await fetch(url, options);
  
  console.log('📥 API Response:', {
    status: response.status,
    ok: response.ok,
    headers: Object.fromEntries(response.headers.entries())
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ API Error:', errorText);
    throw new Error(`API Error: ${response.status} - ${errorText}`);
  }
  
  return response.json();
};
```

---

## 📚 12. Quick Reference

### **Task Statuses:**
- `TODO` - Chưa bắt đầu
- `IN_PROGRESS` - Đang thực hiện  
- `COMPLETED` - Hoàn thành
- `CANCELLED` - Đã hủy

### **Task Priorities:**
- `LOW` - Thấp
- `MEDIUM` - Trung bình
- `HIGH` - Cao
- `CRITICAL` - Khẩn cấp

### **Participation Types:**
- `CREATOR` - Người tạo task
- `ASSIGNEE` - Được assign task
- `PROJECT_MEMBER` - Member của project chứa task
- `TEAM_MEMBER` - Member của team chứa task
- `OTHER` - Khác

### **Best Practices:**
- ✅ Sử dụng pagination cho lists lớn
- ✅ Sử dụng summary endpoint cho better performance
- ✅ Handle errors properly
- ✅ Cache task data appropriately  
- ✅ Implement optimistic updates
- ✅ Show loading states
- ✅ Validate form data before submit