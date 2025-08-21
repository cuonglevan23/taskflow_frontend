# Project Task & Team Task API Documentation

## 📋 Overview
Complete API documentation for ProjectTask and TeamTask management with unified task access.

**Architecture:**
- **ProjectTask**: Tasks belonging to specific projects
- **TeamTask**: Team-level tasks (meetings, planning, admin, etc.)
- **UnifiedTask**: Single endpoint to access ALL user's tasks

---

## 🔗 Base URLs

```
ProjectTask API: http://localhost:8080/api/project-tasks
TeamTask API:    http://localhost:8080/api/team-tasks  
Unified API:     http://localhost:8080/api/my-tasks
```

## 🔐 Authentication

All endpoints require JWT authentication:
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

---

## 🎯 PROJECT TASK API

### **1. Create Project Task**

**Endpoint:** `POST /api/project-tasks`

**Request Body:**
```json
{
  "title": "Implement user authentication API",
  "description": "Add JWT authentication endpoints and middleware",
  "projectId": 1,
  "status": "TODO",
  "priority": "HIGH",
  "startDate": "2024-01-20",
  "deadline": "2024-01-30",
  "estimatedHours": 40,
  "progressPercentage": 0,
  "assigneeId": 21,
  "additionalAssigneeIds": [22, 23],
  "parentTaskId": null
}
```

**TypeScript Example:**
```typescript
interface CreateProjectTaskRequest {
  title: string;
  description?: string;
  projectId: number;
  status?: 'TODO' | 'IN_PROGRESS' | 'DONE' | 'TESTING' | 'BLOCKED' | 'REVIEW';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  startDate?: string; // YYYY-MM-DD
  deadline?: string; // YYYY-MM-DD
  estimatedHours?: number;
  actualHours?: number;
  progressPercentage?: number; // 0-100
  assigneeId?: number;
  additionalAssigneeIds?: number[];
  parentTaskId?: number;
}

const createProjectTask = async (taskData: CreateProjectTaskRequest) => {
  const response = await fetch('/api/project-tasks', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(taskData)
  });
  
  return response.json(); // ProjectTaskResponseDto
};
```

### **2. Get All Project Tasks (with filtering)**

**Endpoint:** `GET /api/project-tasks`

**Query Parameters:**
```
page=0&size=20&sortBy=updatedAt&sortDir=desc
&projectId=1&status=TODO&priority=HIGH&assigneeId=21&creatorId=21
```

**TypeScript Example:**
```typescript
interface ProjectTaskFilters {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  projectId?: number;
  status?: string;
  priority?: string;
  assigneeId?: number;
  creatorId?: number;
}

const getProjectTasks = async (filters: ProjectTaskFilters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined) params.append(key, value.toString());
  });

  const response = await fetch(`/api/project-tasks?${params}`, {
    headers: getAuthHeaders()
  });
  
  return response.json(); // Page<ProjectTaskResponseDto>
};
```

### **3. Get Project Task by ID**

**Endpoint:** `GET /api/project-tasks/{id}`

```typescript
const getProjectTaskById = async (taskId: number) => {
  const response = await fetch(`/api/project-tasks/${taskId}`, {
    headers: getAuthHeaders()
  });
  
  return response.json(); // ProjectTaskResponseDto
};
```

### **4. Update Project Task**

**Endpoint:** `PUT /api/project-tasks/{id}`

```typescript
const updateProjectTask = async (taskId: number, updates: Partial<CreateProjectTaskRequest>) => {
  const response = await fetch(`/api/project-tasks/${taskId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(updates)
  });
  
  return response.json();
};
```

### **5. Delete Project Task**

**Endpoint:** `DELETE /api/project-tasks/{id}`

```typescript
const deleteProjectTask = async (taskId: number) => {
  const response = await fetch(`/api/project-tasks/${taskId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  
  return response.ok;
};
```

### **6. Project-specific Endpoints**

```typescript
// Get tasks by project
GET /api/project-tasks/project/{projectId}?page=0&size=20

// Get project task statistics
GET /api/project-tasks/project/{projectId}/stats

// Get overdue tasks by project
GET /api/project-tasks/project/{projectId}/overdue

// Get current user's project tasks
GET /api/project-tasks/my-tasks?page=0&size=20
```

### **7. Task Operations**

```typescript
// Assign task to user
PUT /api/project-tasks/{taskId}/assign/{userId}

// Update task progress
PUT /api/project-tasks/{taskId}/progress?progressPercentage=75

// Get subtasks
GET /api/project-tasks/{taskId}/subtasks
```

---

## 👥 TEAM TASK API

### **1. Create Team Task**

**Endpoint:** `POST /api/team-tasks`

**Request Body:**
```json
{
  "title": "Sprint Planning Meeting",
  "description": "Plan next 2-week sprint with all team members",
  "teamId": 1,
  "status": "TODO",
  "priority": "HIGH",
  "startDate": "2024-01-22",
  "deadline": "2024-01-22",
  "estimatedHours": 2,
  "progressPercentage": 0,
  "taskCategory": "MEETING",
  "assigneeId": 21,
  "assignedMemberIds": [21, 22, 23, 24],
  "relatedProjectId": 1,
  "isRecurring": true,
  "recurrencePattern": "WEEKLY",
  "recurrenceEndDate": "2024-12-31"
}
```

**TypeScript Example:**
```typescript
interface CreateTeamTaskRequest {
  title: string;
  description?: string;
  teamId: number;
  status?: 'TODO' | 'IN_PROGRESS' | 'DONE' | 'TESTING' | 'BLOCKED' | 'REVIEW';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  startDate?: string;
  deadline?: string;
  estimatedHours?: number;
  actualHours?: number;
  progressPercentage?: number;
  taskCategory?: 'MEETING' | 'PLANNING' | 'REVIEW' | 'ADMIN' | 'TRAINING' | 'RESEARCH' | 'OTHER';
  assigneeId?: number;
  assignedMemberIds?: number[];
  relatedProjectId?: number;
  parentTaskId?: number;
  isRecurring?: boolean;
  recurrencePattern?: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  recurrenceEndDate?: string;
}

const createTeamTask = async (taskData: CreateTeamTaskRequest) => {
  const response = await fetch('/api/team-tasks', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(taskData)
  });
  
  return response.json(); // TeamTaskResponseDto
};
```

### **2. Get All Team Tasks (with filtering)**

**Endpoint:** `GET /api/team-tasks`

**Query Parameters:**
```
page=0&size=20&sortBy=updatedAt&sortDir=desc
&teamId=1&status=TODO&priority=HIGH&taskCategory=MEETING
&assigneeId=21&creatorId=21&relatedProjectId=1
```

### **3. Team-specific Endpoints**

```typescript
// Get tasks by team
GET /api/team-tasks/team/{teamId}?page=0&size=20

// Get team task statistics
GET /api/team-tasks/team/{teamId}/stats

// Get tasks by category
GET /api/team-tasks/team/{teamId}/category/{category}

// Get recurring tasks
GET /api/team-tasks/team/{teamId}/recurring

// Get overdue tasks
GET /api/team-tasks/team/{teamId}/overdue

// Get current week tasks
GET /api/team-tasks/team/{teamId}/current-week

// Get upcoming recurring tasks
GET /api/team-tasks/team/{teamId}/upcoming-recurring?daysAhead=30
```

### **4. Team Task Operations**

```typescript
// Assign task to team member
PUT /api/team-tasks/{taskId}/assign/{userId}

// Update task progress
PUT /api/team-tasks/{taskId}/progress?progressPercentage=50

// Link task to project
PUT /api/team-tasks/{taskId}/link-project/{projectId}

// Get subtasks
GET /api/team-tasks/{taskId}/subtasks

// Get available task categories
GET /api/team-tasks/categories
```

---

## 🎯 UNIFIED TASK API

### **✅ Single Endpoint for ALL Tasks**

**Endpoint:** `GET /api/my-tasks`

**Features:**
- Gets ALL tasks from Personal, Project, and Team sources
- Unified response format
- Single pagination and sorting
- Combined statistics

```typescript
interface UnifiedTaskDto {
  // Common fields
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  startDate: string;
  deadline: string;
  progressPercentage: number;
  
  // Task identification
  taskType: 'PERSONAL' | 'PROJECT' | 'TEAM';
  sourceEntity: 'Task' | 'ProjectTask' | 'TeamTask';
  taskCategory?: string; // For team tasks
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  
  // Creator info
  creatorId: number;
  creatorName: string;
  
  // Participation
  participationType: 'CREATOR' | 'PRIMARY_ASSIGNEE' | 'ADDITIONAL_ASSIGNEE' | 'ASSIGNED_MEMBER' | 'PROJECT_MEMBER' | 'TEAM_MEMBER';
  
  // Project info
  projectId?: number;
  projectName?: string;
  
  // Team info
  teamId?: number;
  teamName?: string;
  
  // Additional info
  relatedProjectId?: number;
  relatedProjectName?: string;
  isRecurring?: boolean;
  recurrencePattern?: string;
  estimatedHours?: number;
  actualHours?: number;
}

// Get ALL user's tasks
const getAllMyTasks = async (page = 0, size = 20) => {
  const response = await fetch(`/api/my-tasks?page=${page}&size=${size}`, {
    headers: getAuthHeaders()
  });
  
  return response.json(); // Page<UnifiedTaskDto>
};

// Get unified statistics
const getMyTasksStats = async () => {
  const response = await fetch('/api/my-tasks/stats', {
    headers: getAuthHeaders()
  });
  
  return response.json();
  // Returns: { totalTasks, personalTasks, projectTasks, teamTasks, userEmail, userId }
};
```

### **Filtered Unified Endpoints:**

```typescript
// Get only personal tasks
GET /api/my-tasks/personal?page=0&size=20

// Get only project tasks  
GET /api/my-tasks/projects?page=0&size=20

// Get only team tasks
GET /api/my-tasks/teams?page=0&size=20
```

---

## 📊 Response Examples

### **ProjectTask Response:**
```json
{
  "id": 123,
  "title": "Implement API authentication",
  "description": "Add JWT authentication",
  "status": "IN_PROGRESS",
  "priority": "HIGH",
  "startDate": "2024-01-20",
  "deadline": "2024-01-30",
  "estimatedHours": 40,
  "actualHours": 15,
  "progressPercentage": 60,
  "projectId": 1,
  "projectName": "E-commerce Platform",
  "creatorId": 21,
  "creatorName": "John Doe",
  "creatorEmail": "john@example.com",
  "assigneeId": 22,
  "assigneeName": "Jane Smith",
  "assigneeEmail": "jane@example.com",
  "additionalAssignees": [
    {
      "id": 23,
      "name": "Bob Wilson",
      "email": "bob@example.com"
    }
  ],
  "subtasks": [],
  "subtaskCount": 0,
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-20T14:30:00Z"
}
```

### **TeamTask Response:**
```json
{
  "id": 456,
  "title": "Sprint Planning Meeting",
  "description": "Plan next sprint",
  "status": "TODO",
  "priority": "HIGH",
  "startDate": "2024-01-22",
  "deadline": "2024-01-22",
  "estimatedHours": 2,
  "actualHours": 0,
  "progressPercentage": 0,
  "taskCategory": "MEETING",
  "teamId": 1,
  "teamName": "Frontend Team",
  "creatorId": 21,
  "creatorName": "John Doe",
  "assigneeId": 21,
  "assigneeName": "John Doe",
  "assignedMembers": [
    {
      "id": 22,
      "name": "Jane Smith",
      "email": "jane@example.com",
      "role": "MEMBER"
    },
    {
      "id": 23,
      "name": "Bob Wilson", 
      "email": "bob@example.com",
      "role": "MEMBER"
    }
  ],
  "relatedProjectId": 1,
  "relatedProjectName": "E-commerce Platform",
  "isRecurring": true,
  "recurrencePattern": "WEEKLY",
  "recurrenceEndDate": "2024-12-31",
  "subtasks": [],
  "subtaskCount": 0,
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-20T14:30:00Z"
}
```

### **Unified Task Response:**
```json
{
  "content": [
    {
      "id": 123,
      "title": "Implement API authentication",
      "description": "Add JWT authentication",
      "status": "IN_PROGRESS",
      "priority": "HIGH",
      "startDate": "2024-01-20",
      "deadline": "2024-01-30",
      "progressPercentage": 60,
      "taskType": "PROJECT",
      "sourceEntity": "ProjectTask",
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-01-20T14:30:00Z",
      "creatorId": 21,
      "creatorName": "John Doe",
      "participationType": "CREATOR",
      "projectId": 1,
      "projectName": "E-commerce Platform",
      "estimatedHours": 40,
      "actualHours": 15
    },
    {
      "id": 456,
      "title": "Sprint Planning Meeting",
      "description": "Plan next sprint",
      "status": "TODO",
      "priority": "HIGH", 
      "startDate": "2024-01-22",
      "deadline": "2024-01-22",
      "progressPercentage": 0,
      "taskType": "TEAM",
      "sourceEntity": "TeamTask",
      "taskCategory": "MEETING",
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-01-20T14:30:00Z",
      "creatorId": 21,
      "creatorName": "John Doe",
      "participationType": "CREATOR",
      "teamId": 1,
      "teamName": "Frontend Team",
      "relatedProjectId": 1,
      "relatedProjectName": "E-commerce Platform",
      "isRecurring": true,
      "recurrencePattern": "WEEKLY",
      "estimatedHours": 2,
      "actualHours": 0
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 20
  },
  "totalElements": 25,
  "totalPages": 2,
  "first": true,
  "last": false
}
```

---

## 🛠️ React Hook Examples

### **useProjectTasks Hook:**
```typescript
import { useState, useEffect } from 'react';

export const useProjectTasks = (projectId?: number) => {
  const [tasks, setTasks] = useState<ProjectTaskResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = async (filters: ProjectTaskFilters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = projectId 
        ? await fetch(`/api/project-tasks/project/${projectId}`, { headers: getAuthHeaders() })
        : await getProjectTasks(filters);
        
      const data = await response.json();
      setTasks(projectId ? data.content : data.content);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (taskData: CreateProjectTaskRequest) => {
    const newTask = await createProjectTask(taskData);
    setTasks(prev => [newTask, ...prev]);
    return newTask;
  };

  const updateTask = async (taskId: number, updates: Partial<CreateProjectTaskRequest>) => {
    const updatedTask = await updateProjectTask(taskId, updates);
    setTasks(prev => prev.map(task => task.id === taskId ? updatedTask : task));
    return updatedTask;
  };

  const deleteTask = async (taskId: number) => {
    await deleteProjectTask(taskId);
    setTasks(prev => prev.filter(task => task.id !== taskId));
  };

  useEffect(() => {
    fetchTasks();
  }, [projectId]);

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask
  };
};
```

### **useTeamTasks Hook:**
```typescript
export const useTeamTasks = (teamId?: number) => {
  const [tasks, setTasks] = useState<TeamTaskResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);

  const fetchTasks = async (filters: TeamTaskFilters = {}) => {
    try {
      setLoading(true);
      
      const tasksResponse = teamId
        ? await fetch(`/api/team-tasks/team/${teamId}`, { headers: getAuthHeaders() })
        : await getTeamTasks(filters);
        
      const categoriesResponse = await fetch('/api/team-tasks/categories', { 
        headers: getAuthHeaders() 
      });
      
      const [tasksData, categoriesData] = await Promise.all([
        tasksResponse.json(),
        categoriesResponse.json()
      ]);
      
      setTasks(teamId ? tasksData.content : tasksData.content);
      setCategories(categoriesData);
    } catch (err) {
      console.error('Error fetching team tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const createRecurringTask = async (taskData: CreateTeamTaskRequest) => {
    const recurringTaskData = {
      ...taskData,
      isRecurring: true,
      recurrencePattern: 'WEEKLY'
    };
    
    const newTask = await createTeamTask(recurringTaskData);
    setTasks(prev => [newTask, ...prev]);
    return newTask;
  };

  return {
    tasks,
    categories,
    loading,
    fetchTasks,
    createRecurringTask
  };
};
```

### **useUnifiedTasks Hook:**
```typescript
export const useUnifiedTasks = () => {
  const [allTasks, setAllTasks] = useState<UnifiedTaskDto[]>([]);
  const [stats, setStats] = useState<UnifiedTaskStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAllTasks = async (page = 0, size = 20) => {
    try {
      setLoading(true);
      
      const [tasksResponse, statsResponse] = await Promise.all([
        fetch(`/api/my-tasks?page=${page}&size=${size}`, { headers: getAuthHeaders() }),
        fetch('/api/my-tasks/stats', { headers: getAuthHeaders() })
      ]);
      
      const [tasksData, statsData] = await Promise.all([
        tasksResponse.json(),
        statsResponse.json()
      ]);
      
      setAllTasks(tasksData.content);
      setStats(statsData);
    } catch (err) {
      console.error('Error fetching unified tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTasksByType = (taskType: 'PERSONAL' | 'PROJECT' | 'TEAM') => {
    return allTasks.filter(task => task.taskType === taskType);
  };

  useEffect(() => {
    fetchAllTasks();
  }, []);

  return {
    allTasks,
    stats,
    loading,
    fetchAllTasks,
    getTasksByType,
    personalTasks: getTasksByType('PERSONAL'),
    projectTasks: getTasksByType('PROJECT'),
    teamTasks: getTasksByType('TEAM')
  };
};
```

---

## 🎨 Frontend Components

### **Project Task Dashboard:**
```typescript
const ProjectTaskDashboard: React.FC<{ projectId: number }> = ({ projectId }) => {
  const { tasks, loading, createTask, updateTask } = useProjectTasks(projectId);
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <div className="project-task-dashboard">
      <div className="header">
        <h2>Project Tasks</h2>
        <button onClick={() => setShowCreateModal(true)}>
          Add Task
        </button>
      </div>
      
      {loading ? (
        <div>Loading tasks...</div>
      ) : (
        <div className="tasks-grid">
          {tasks.map(task => (
            <ProjectTaskCard 
              key={task.id}
              task={task}
              onUpdate={updateTask}
            />
          ))}
        </div>
      )}
      
      {showCreateModal && (
        <CreateProjectTaskModal
          projectId={projectId}
          onCreate={createTask}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
};
```

### **Team Task Calendar:**
```typescript
const TeamTaskCalendar: React.FC<{ teamId: number }> = ({ teamId }) => {
  const { tasks, categories, createRecurringTask } = useTeamTasks(teamId);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const filteredTasks = selectedCategory === 'ALL' 
    ? tasks 
    : tasks.filter(task => task.taskCategory === selectedCategory);

  return (
    <div className="team-task-calendar">
      <div className="filters">
        <select 
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="ALL">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>
      
      <Calendar
        tasks={filteredTasks}
        onCreateTask={createRecurringTask}
      />
    </div>
  );
};
```

### **Unified Task Dashboard:**
```typescript
const UnifiedTaskDashboard: React.FC = () => {
  const { allTasks, stats, personalTasks, projectTasks, teamTasks } = useUnifiedTasks();

  return (
    <div className="unified-dashboard">
      <div className="stats-overview">
        <StatCard title="Total Tasks" value={stats?.totalTasks || 0} />
        <StatCard title="Personal" value={stats?.personalTasks || 0} />
        <StatCard title="Project" value={stats?.projectTasks || 0} />
        <StatCard title="Team" value={stats?.teamTasks || 0} />
      </div>
      
      <div className="task-sections">
        <TaskSection title="Personal Tasks" tasks={personalTasks} />
        <TaskSection title="Project Tasks" tasks={projectTasks} />
        <TaskSection title="Team Tasks" tasks={teamTasks} />
      </div>
    </div>
  );
};
```

---

## 🔧 Utility Functions

### **API Configuration:**
```typescript
// config/api.ts
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

export const getAuthHeaders = () => ({
  'Authorization': `Bearer ${getToken()}`,
  'Content-Type': 'application/json'
});

export const getToken = (): string => {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('No auth token found');
  return token;
};
```

### **Error Handling:**
```typescript
// utils/errorHandler.ts
export const handleApiError = (error: any, context: string) => {
  console.error(`${context}:`, error);
  
  if (error.response?.status === 401) {
    // Redirect to login
    window.location.href = '/login';
  } else if (error.response?.status === 403) {
    throw new Error('Access denied: Insufficient permissions');
  } else if (error.response?.status === 404) {
    throw new Error('Resource not found');
  } else {
    throw new Error(`${context}: ${error.message || 'Unknown error'}`);
  }
};
```

---

## 📋 Quick Reference

### **Task Types:**
- **PERSONAL**: Individual tasks, personal goals
- **PROJECT**: Feature development, project milestones
- **TEAM**: Meetings, planning, admin tasks

### **Task Categories (Team Tasks):**
- **MEETING**: Team meetings, standups
- **PLANNING**: Sprint planning, roadmap
- **REVIEW**: Code reviews, retrospectives
- **ADMIN**: Administrative tasks
- **TRAINING**: Team training, learning
- **RESEARCH**: Research and investigation
- **OTHER**: Other team activities

### **Task Statuses:**
- **TODO**: Not started
- **IN_PROGRESS**: Currently working
- **DONE**: Completed
- **TESTING**: Under testing
- **BLOCKED**: Blocked by dependencies
- **REVIEW**: Under review

### **Priorities:**
- **LOW**: Low priority
- **MEDIUM**: Medium priority
- **HIGH**: High priority
- **CRITICAL**: Critical/urgent

### **Best Practices:**
1. ✅ Use unified endpoint `/api/my-tasks` for dashboard views
2. ✅ Use specific endpoints for task management operations
3. ✅ Implement proper error handling for all API calls
4. ✅ Use pagination for large task lists
5. ✅ Cache task data appropriately
6. ✅ Handle offline scenarios gracefully
7. ✅ Implement optimistic updates for better UX

This documentation provides complete coverage of ProjectTask and TeamTask APIs with practical examples for frontend integration.