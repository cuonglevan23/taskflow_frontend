# Team API Documentation

## Overview
This document provides detailed information about the Team-related API endpoints, specifically focusing on the newly added endpoints for retrieving team projects and tasks.

---

## 📋 **Team Projects API**

### **GET /api/teams/{id}/projects**

#### **Description**
Retrieves all projects assigned to a specific team.

#### **HTTP Method**
`GET`

#### **URL Structure**
```
GET http://localhost:8080/api/teams/{id}/projects
```

#### **Path Parameters**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | Long | Yes | The unique identifier of the team |

#### **Request Headers**
```http
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

#### **Response Format**

**Success Response (200 OK)**
```json
[
  {
    "id": 1,
    "name": "E-commerce Website",
    "description": "Building a modern e-commerce platform",
    "status": "IN_PROGRESS",
    "startDate": "2024-01-15T00:00:00",
    "endDate": "2024-06-15T00:00:00",
    "ownerId": 5,
    "organizationId": 2,
    "teamId": 3,
    "createdById": 5,
    "isPersonal": false,
    "createdAt": "2024-01-10T09:30:00",
    "updatedAt": "2024-01-20T14:45:00"
  },
  {
    "id": 2,
    "name": "Mobile App Development",
    "description": "Cross-platform mobile application",
    "status": "PLANNED",
    "startDate": "2024-03-01T00:00:00",
    "endDate": "2024-08-01T00:00:00",
    "ownerId": 7,
    "organizationId": 2,
    "teamId": 3,
    "createdById": 7,
    "isPersonal": false,
    "createdAt": "2024-02-15T11:20:00",
    "updatedAt": "2024-02-15T11:20:00"
  }
]
```

**Error Responses**

**404 Not Found**
```json
{
  "timestamp": "2024-01-25T10:30:00",
  "status": 404,
  "error": "Not Found",
  "message": "Team not found with id: 999",
  "path": "/api/teams/999/projects"
}
```

**401 Unauthorized**
```json
{
  "timestamp": "2024-01-25T10:30:00",
  "status": 401,
  "error": "Unauthorized",
  "message": "User not authenticated",
  "path": "/api/teams/3/projects"
}
```

#### **Example Requests**

**cURL**
```bash
curl -X GET \
  http://localhost:8080/api/teams/3/projects \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' \
  -H 'Content-Type: application/json'
```

**JavaScript (Fetch API)**
```javascript
const response = await fetch('http://localhost:8080/api/teams/3/projects', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('jwt_token'),
    'Content-Type': 'application/json'
  }
});

const projects = await response.json();
console.log('Team Projects:', projects);
```

**Java (Spring RestTemplate)**
```java
HttpHeaders headers = new HttpHeaders();
headers.setBearerAuth(jwtToken);
HttpEntity<String> entity = new HttpEntity<>(headers);

ResponseEntity<ProjectResponseDto[]> response = restTemplate.exchange(
    "http://localhost:8080/api/teams/3/projects",
    HttpMethod.GET,
    entity,
    ProjectResponseDto[].class
);

List<ProjectResponseDto> projects = Arrays.asList(response.getBody());
```

#### **Use Cases**
- Display all projects assigned to a team in team dashboard
- Team leads reviewing project portfolio
- Project management and resource allocation
- Team performance analysis across projects

---

## 🎯 **All Team Tasks API**

### **GET /api/teams/{id}/all-tasks**

#### **Description**
Retrieves all tasks from all projects assigned to a specific team. This provides a comprehensive view of all work items across the team's project portfolio.

#### **HTTP Method**
`GET`

#### **URL Structure**
```
GET http://localhost:8080/api/teams/{id}/all-tasks
```

#### **Path Parameters**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | Long | Yes | The unique identifier of the team |

#### **Request Headers**
```http
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

#### **Response Format**

**Success Response (200 OK)**
```json
[
  {
    "id": 15,
    "title": "Implement user authentication",
    "description": "Set up JWT-based authentication system",
    "status": "IN_PROGRESS",
    "priority": "HIGH",
    "startDate": "2024-01-20T00:00:00",
    "deadline": "2024-02-01T00:00:00",
    "createdAt": "2024-01-18T09:30:00",
    "updatedAt": "2024-01-22T14:20:00",
    "creatorId": 5,
    "projectId": 1,
    "groupId": 3,
    "checklists": [
      {
        "id": 1,
        "item": "Design authentication flow",
        "isCompleted": true,
        "createdAt": "2024-01-18T10:00:00",
        "taskId": 15
      },
      {
        "id": 2,
        "item": "Implement JWT token generation",
        "isCompleted": false,
        "createdAt": "2024-01-18T10:05:00",
        "taskId": 15
      }
    ]
  },
  {
    "id": 28,
    "title": "Design mobile UI mockups",
    "description": "Create high-fidelity mockups for mobile app",
    "status": "TODO",
    "priority": "MEDIUM",
    "startDate": "2024-03-01T00:00:00",
    "deadline": "2024-03-15T00:00:00",
    "createdAt": "2024-02-20T11:15:00",
    "updatedAt": "2024-02-20T11:15:00",
    "creatorId": 7,
    "projectId": 2,
    "groupId": 3,
    "checklists": []
  }
]
```

**Error Responses**

**404 Not Found**
```json
{
  "timestamp": "2024-01-25T10:30:00",
  "status": 404,
  "error": "Not Found",
  "message": "Team not found with id: 999",
  "path": "/api/teams/999/all-tasks"
}
```

**401 Unauthorized**
```json
{
  "timestamp": "2024-01-25T10:30:00",
  "status": 401,
  "error": "Unauthorized",
  "message": "User not authenticated",
  "path": "/api/teams/3/all-tasks"
}
```

#### **Example Requests**

**cURL**
```bash
curl -X GET \
  http://localhost:8080/api/teams/3/all-tasks \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' \
  -H 'Content-Type: application/json'
```

**JavaScript (Fetch API)**
```javascript
const response = await fetch('http://localhost:8080/api/teams/3/all-tasks', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('jwt_token'),
    'Content-Type': 'application/json'
  }
});

const allTasks = await response.json();
console.log('All Team Tasks:', allTasks);

// Group tasks by project
const tasksByProject = allTasks.reduce((acc, task) => {
  const projectId = task.projectId;
  if (!acc[projectId]) acc[projectId] = [];
  acc[projectId].push(task);
  return acc;
}, {});
```

**Java (Spring RestTemplate)**
```java
HttpHeaders headers = new HttpHeaders();
headers.setBearerAuth(jwtToken);
HttpEntity<String> entity = new HttpEntity<>(headers);

ResponseEntity<TaskResponseDto[]> response = restTemplate.exchange(
    "http://localhost:8080/api/teams/3/all-tasks",
    HttpMethod.GET,
    entity,
    TaskResponseDto[].class
);

List<TaskResponseDto> allTasks = Arrays.asList(response.getBody());

// Filter by status
List<TaskResponseDto> inProgressTasks = allTasks.stream()
    .filter(task -> "IN_PROGRESS".equals(task.getStatus()))
    .collect(Collectors.toList());
```

#### **Use Cases**
- Team dashboard showing all active work items
- Cross-project task analysis and reporting
- Team workload assessment and resource planning
- Sprint planning across multiple projects
- Team performance metrics and KPI tracking
- Burndown charts across entire team portfolio

---

## 🔄 **Comparison with Existing APIs**

### **Difference from existing endpoints:**

| Endpoint | Scope | Description |
|----------|--------|-------------|
| `GET /api/teams/{id}/tasks` | Team-specific tasks only | Tasks directly assigned to the team (not project-based) |
| `GET /api/teams/{id}/projects` | **NEW** - Team's projects | All projects assigned to the team |
| `GET /api/teams/{id}/all-tasks` | **NEW** - Cross-project tasks | All tasks from all projects of the team |
| `GET /api/projects/{id}/tasks` | Single project tasks | Tasks within one specific project |

---

## 🛡️ **Security Considerations**

### **Authentication**
- Both endpoints require valid JWT authentication
- User must be authenticated to access team data

### **Authorization**
- Users can only access teams they are members of or have permissions to view
- Task filtering is applied based on user permissions
- Personal projects and tasks respect privacy settings

### **Performance Notes**
- `/all-tasks` endpoint may return large datasets for teams with many projects
- Consider implementing pagination for teams with extensive project portfolios
- Results are filtered based on user access permissions for security

---

## 📊 **Response Data Models**

### **ProjectResponseDto**
```typescript
interface ProjectResponseDto {
  id: number;
  name: string;
  description: string;
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD' | 'CANCELLED';
  startDate: string; // ISO 8601 format
  endDate: string;   // ISO 8601 format
  ownerId: number;
  organizationId: number | null;
  teamId: number | null;
  createdById: number;
  isPersonal: boolean;
  createdAt: string; // ISO 8601 format
  updatedAt: string; // ISO 8601 format
}
```

### **TaskResponseDto**
```typescript
interface TaskResponseDto {
  id: number;
  title: string;
  description: string;
  status: string; // Task status key
  priority: string; // Priority key
  startDate: string | null; // ISO 8601 format
  deadline: string | null;  // ISO 8601 format
  createdAt: string; // ISO 8601 format
  updatedAt: string; // ISO 8601 format
  creatorId: number | null;
  projectId: number | null;
  groupId: number | null; // Team ID
  checklists: TaskChecklistResponseDto[] | null;
}

interface TaskChecklistResponseDto {
  id: number;
  item: string;
  isCompleted: boolean;
  createdAt: string; // ISO 8601 format
  taskId: number;
}
```

---

## 🧪 **Testing Examples**

### **Swagger UI Testing**
1. Navigate to `http://localhost:8080/swagger-ui.html`
2. Locate the Team Controller section
3. Test the endpoints with sample team IDs

### **Postman Collection**
```json
{
  "info": {
    "name": "Team APIs",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Get Team Projects",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{jwt_token}}"
          }
        ],
        "url": {
          "raw": "{{base_url}}/api/teams/3/projects",
          "host": ["{{base_url}}"],
          "path": ["api", "teams", "3", "projects"]
        }
      }
    },
    {
      "name": "Get All Team Tasks",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{jwt_token}}"
          }
        ],
        "url": {
          "raw": "{{base_url}}/api/teams/3/all-tasks",
          "host": ["{{base_url}}"],
          "path": ["api", "teams", "3", "all-tasks"]
        }
      }
    }
  ]
}
```