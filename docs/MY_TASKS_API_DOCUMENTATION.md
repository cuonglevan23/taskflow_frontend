# My Tasks API Documentation

## Overview
The My Tasks API provides secure endpoints for users to manage their personal tasks. With the latest updates, all CRUD operations now include proper authorization checks to ensure users can only access and modify tasks they have permission to work with.

## Base URL
```
/api/tasks/my-tasks
```

## Authentication
All endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Authorization Rules
Users can only access tasks where they are:
- **Creator**: The user who created the task
- **Assignee**: The user is assigned to the task
- **Team Member**: The user is a member of the task's team
- **Project Member**: The user is a member of the task's project

## API Endpoints

### 1. Get My Tasks (Paginated)
Retrieve tasks that the current user has access to with pagination and sorting.

**Endpoint:** `GET /api/tasks/my-tasks`

**Query Parameters:**
- `page` (integer, optional): Page number (0-based), default: 0
- `size` (integer, optional): Page size, default: 10
- `sortBy` (string, optional): Sort field, default: "createdAt"
  - Available fields: `createdAt`, `updatedAt`, `startDate`, `deadline`, `title`, `priority`, `status`
- `sortDir` (string, optional): Sort direction, default: "desc"
  - Values: `asc`, `desc`

**Example Request:**
```http
GET /api/tasks/my-tasks?page=0&size=10&sortBy=startDate&sortDir=desc
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Example Response:**
```json
{
  "content": [
    {
      "id": 1,
      "title": "Complete project documentation",
      "description": "Write comprehensive API documentation",
      "status": "IN_PROGRESS",
      "priority": "HIGH",
      "startDate": "2025-08-23T09:00:00",
      "deadline": "2025-08-25T17:00:00",
      "createdAt": "2025-08-23T08:30:00",
      "updatedAt": "2025-08-23T10:15:00",
      "creatorId": 1,
      "projectId": 5,
      "groupId": 3,
      "checklists": []
    }
  ],
  "pageable": {
    "sort": {
      "sorted": true,
      "direction": "DESC",
      "property": "startDate"
    },
    "pageNumber": 0,
    "pageSize": 10
  },
  "totalElements": 25,
  "totalPages": 3,
  "last": false,
  "first": true,
  "numberOfElements": 10
}
```

### 2. Get My Tasks Summary (Optimized)
Retrieve a lightweight summary of user's tasks with participation information.

**Endpoint:** `GET /api/tasks/my-tasks/summary`

**Query Parameters:** Same as above

**Example Request:**
```http
GET /api/tasks/my-tasks/summary?page=0&size=20&sortBy=deadline&sortDir=asc
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Example Response:**
```json
{
  "content": [
    {
      "id": 1,
      "title": "Complete project documentation",
      "description": "Write comprehensive API documentation",
      "status": "IN_PROGRESS",
      "priority": "HIGH",
      "startDate": "2025-08-23T09:00:00",
      "deadline": "2025-08-25T17:00:00",
      "createdAt": "2025-08-23T08:30:00",
      "updatedAt": "2025-08-23T10:15:00",
      "creatorId": 1,
      "creatorName": "John Doe",
      "projectId": 5,
      "projectName": "Task Management System",
      "teamId": 3,
      "teamName": "Development Team",
      "checklistCount": 3,
      "assigneeCount": 2,
      "participationType": "CREATOR"
    }
  ],
  "totalElements": 25,
  "totalPages": 2,
  "first": true,
  "last": false
}
```

**Participation Types:**
- `CREATOR`: User created the task
- `ASSIGNEE`: User is assigned to the task
- `TEAM_MEMBER`: User is a team member
- `PROJECT_MEMBER`: User is a project member

### 3. Get My Tasks Statistics
Get summary statistics about user's tasks.

**Endpoint:** `GET /api/tasks/my-tasks/stats`

**Example Request:**
```http
GET /api/tasks/my-tasks/stats
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Example Response:**
```json
{
  "totalParticipatingTasks": 25,
  "userEmail": "john.doe@example.com",
  "userId": 1
}
```

### 4. Get Single Task
Retrieve details of a specific task (with authorization check).

**Endpoint:** `GET /api/tasks/my-tasks/{id}`

**Path Parameters:**
- `id` (integer): Task ID

**Example Request:**
```http
GET /api/tasks/my-tasks/123
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Example Response:**
```json
{
  "id": 123,
  "title": "Complete project documentation",
  "description": "Write comprehensive API documentation",
  "status": "IN_PROGRESS",
  "priority": "HIGH",
  "startDate": "2025-08-23T09:00:00",
  "deadline": "2025-08-25T17:00:00",
  "createdAt": "2025-08-23T08:30:00",
  "updatedAt": "2025-08-23T10:15:00",
  "creatorId": 1,
  "projectId": 5,
  "groupId": 3,
  "checklists": [
    {
      "id": 1,
      "item": "Research API best practices",
      "isCompleted": true,
      "createdAt": "2025-08-23T09:00:00",
      "taskId": 123
    }
  ]
}
```

### 5. Update Task ✅ FIXED
Update a task that the user has permission to modify.

**Endpoint:** `PUT /api/tasks/my-tasks/{id}`

**Path Parameters:**
- `id` (integer): Task ID

**Request Body:**
```json
{
  "title": "Updated task title",
  "description": "Updated description",
  "status": "COMPLETED",
  "priority": "MEDIUM",
  "startDate": "2025-08-24T09:00:00",
  "deadline": "2025-08-26T17:00:00",
  "groupId": 3
}
```

**Authorization Check:**
- User must be the task creator OR assigned to the task
- Returns `403 Forbidden` if user lacks permission

**Example Request:**
```http
PUT /api/tasks/my-tasks/123
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "title": "Updated documentation task",
  "status": "COMPLETED",
  "priority": "MEDIUM"
}
```

**Example Response:**
```json
{
  "id": 123,
  "title": "Updated documentation task",
  "description": "Write comprehensive API documentation",
  "status": "COMPLETED",
  "priority": "MEDIUM",
  "startDate": "2025-08-23T09:00:00",
  "deadline": "2025-08-25T17:00:00",
  "createdAt": "2025-08-23T08:30:00",
  "updatedAt": "2025-08-23T11:30:00",
  "creatorId": 1,
  "projectId": 5,
  "groupId": 3,
  "checklists": []
}
```

### 6. Delete Task ✅ FIXED
Delete a task that the user has permission to remove.

**Endpoint:** `DELETE /api/tasks/my-tasks/{id}`

**Path Parameters:**
- `id` (integer): Task ID

**Authorization Check:**
- User must be the task creator OR assigned to the task
- Returns `403 Forbidden` if user lacks permission

**Example Request:**
```http
DELETE /api/tasks/my-tasks/123
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Example Response:**
```
HTTP/1.1 204 No Content
```

### 7. Create Task
Create a new task.

**Endpoint:** `POST /api/tasks/my-tasks`

**Request Body:**
```json
{
  "title": "New task title",
  "description": "Task description",
  "status": "TODO",
  "priority": "HIGH",
  "startDate": "2025-08-24T09:00:00",
  "deadline": "2025-08-26T17:00:00",
  "creatorId": 1,
  "projectId": 5,
  "groupId": 3,
  "assignedToIds": [1, 2, 3]
}
```

**Example Request:**
```http
POST /api/tasks/my-tasks
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "title": "Implement user authentication",
  "description": "Add JWT-based authentication system",
  "status": "TODO",
  "priority": "HIGH",
  "startDate": "2025-08-24T09:00:00",
  "deadline": "2025-08-30T17:00:00",
  "creatorId": 1,
  "projectId": 5,
  "groupId": 3,
  "assignedToIds": [1, 2]
}
```

**Example Response:**
```json
{
  "id": 124,
  "title": "Implement user authentication",
  "description": "Add JWT-based authentication system",
  "status": "TODO",
  "priority": "HIGH",
  "startDate": "2025-08-24T09:00:00",
  "deadline": "2025-08-30T17:00:00",
  "createdAt": "2025-08-23T11:45:00",
  "updatedAt": "2025-08-23T11:45:00",
  "creatorId": 1,
  "projectId": 5,
  "groupId": 3,
  "checklists": []
}
```

## Status Codes

### Success Responses
- `200 OK`: Request successful
- `201 Created`: Task created successfully
- `204 No Content`: Task deleted successfully

### Error Responses
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: User lacks permission to access/modify the task
- `404 Not Found`: Task not found or user doesn't have access
- `500 Internal Server Error`: Server error

## Error Response Format
```json
{
  "timestamp": "2025-08-23T12:00:00.000+00:00",
  "status": 403,
  "error": "Forbidden",
  "message": "You don't have permission to update this task",
  "path": "/api/tasks/my-tasks/123"
}
```

## Field Definitions

### Task Status Values
- `TODO`: Task not started
- `IN_PROGRESS`: Task is being worked on
- `COMPLETED`: Task is finished
- `CANCELLED`: Task was cancelled

### Task Priority Values
- `LOW`: Low priority
- `MEDIUM`: Medium priority
- `HIGH`: High priority
- `URGENT`: Urgent priority

## Frontend Integration Examples

### React/Next.js Example
```javascript
// Get my tasks with pagination
const fetchMyTasks = async (page = 0, size = 10) => {
  try {
    const response = await fetch(
      `/api/tasks/my-tasks?page=${page}&size=${size}&sortBy=deadline&sortDir=asc`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
};

// Update a task
const updateTask = async (taskId, updateData) => {
  try {
    const response = await fetch(`/api/tasks/my-tasks/${taskId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });
    
    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('You don\'t have permission to update this task');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
};

// Delete a task
const deleteTask = async (taskId) => {
  try {
    const response = await fetch(`/api/tasks/my-tasks/${taskId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('You don\'t have permission to delete this task');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
};
```

### Axios Example
```javascript
import axios from 'axios';

// Configure axios with auth header
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// Get my tasks
const getMyTasks = async (params = {}) => {
  try {
    const response = await api.get('/tasks/my-tasks', { params });
    return response.data;
  } catch (error) {
    if (error.response?.status === 403) {
      throw new Error('Access denied');
    }
    throw error;
  }
};

// Update task
const updateTask = async (id, data) => {
  try {
    const response = await api.put(`/tasks/my-tasks/${id}`, data);
    return response.data;
  } catch (error) {
    if (error.response?.status === 403) {
      throw new Error('You don\'t have permission to update this task');
    }
    throw error;
  }
};
```

## Security Improvements ✅

### What's Fixed
1. **Authorization Checks**: All update/delete operations now verify user permissions
2. **Proper Error Messages**: Clear feedback when access is denied
3. **Security Compliance**: Users can only modify tasks they have rights to
4. **Consistent Behavior**: Same authorization logic across all endpoints

### Before vs After
**Before (Broken):**
```
PUT /api/tasks/my-tasks/11 → 404 (Task exists but no permission check)
PUT /api/tasks/my-tasks/12 → 404 (Task exists but no permission check)
```

**After (Fixed):**
```
PUT /api/tasks/my-tasks/11 → 200 (User has permission) or 403 (Access denied)
PUT /api/tasks/my-tasks/12 → 200 (User has permission) or 403 (Access denied)
```

## Cache Integration

The API includes Redis caching for improved performance:
- Task data is cached for faster retrieval
- Cache is automatically invalidated when tasks are updated/deleted
- Fallback to database if cache is unavailable

## Testing the API

### Using cURL
```bash
# Get my tasks
curl -X GET "http://localhost:8080/api/tasks/my-tasks?page=0&size=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Update a task
curl -X PUT "http://localhost:8080/api/tasks/my-tasks/123" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Updated task", "status": "COMPLETED"}'

# Delete a task
curl -X DELETE "http://localhost:8080/api/tasks/my-tasks/123" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Using Postman
1. Set up environment variable for `baseUrl` and `authToken`
2. Add Authorization header: `Bearer {{authToken}}`
3. Use the endpoints as documented above

## Troubleshooting

### Common Issues
1. **403 Forbidden**: User doesn't have permission to access/modify the task
   - Check if user is creator or assignee of the task
   - Verify JWT token is valid and contains correct user information

2. **404 Not Found**: Task doesn't exist or user doesn't have access
   - Confirm task ID is correct
   - Ensure user has appropriate permissions

3. **401 Unauthorized**: Authentication required
   - Include valid JWT token in Authorization header
   - Check token expiration

### Best Practices
1. Always include proper error handling in frontend code
2. Cache user permissions on frontend to avoid unnecessary API calls
3. Use pagination for better performance with large task lists
4. Implement optimistic updates with rollback on error
5. Show clear user feedback for permission-related errors

---

*Last updated: August 23, 2025*
*API Version: 2.0 (with authorization fixes)*
