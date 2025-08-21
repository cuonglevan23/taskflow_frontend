# 📚 API Documentation for Frontend Team (Next.js) - Updated Asana-like Structure

## 🔗 Base URL
```
http://localhost:8080/api
```

## 🔐 Authentication
All APIs require JWT token in Authorization header:
```javascript
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

## 🏗️ NEW FLEXIBLE STRUCTURE (Asana-like)

### **Data Model:**
```
User
├── My Workspace (default team) - Auto-created
├── Teams (created/joined) - Creator = Leader  
│   └── Projects (team projects)
└── Personal Projects (no team required)
```

### **Key Features:**
- ✅ **Personal Projects**: Create projects without teams
- ✅ **Team Projects**: Create projects within teams
- ✅ **Default Workspace**: Every user gets "My Workspace" automatically
- ✅ **Flexible Creation**: Users can create teams and projects independently
- ✅ **Leader Role**: Team creator becomes leader automatically

---

## 👥 TEAM MANAGEMENT APIs

### 1. Create Team
```http
POST /api/teams
```
**Roles:** All authenticated users

**Request Body:**
```json
{
  "name": "Marketing Team",
  "description": "Team for marketing campaigns",
  "organizationId": 456,
  "isDefaultWorkspace": false
}
```

**Response:**
```json
{
  "id": 1,
  "name": "Marketing Team",
  "description": "Team for marketing campaigns",
  "isDefaultWorkspace": false,
  "leaderId": 123,
  "createdById": 123,
  "organizationId": 456,
  "createdAt": "2024-01-01T10:00:00.000Z",
  "updatedAt": "2024-01-01T10:00:00.000Z"
}
```

### 2. Get User's Teams
```http
GET /api/teams/my-teams
```
**Response:** Array of teams (including default workspace)

### 3. Get Team Details
```http
GET /api/teams/{id}
```

### 4. Update Team
```http
PUT /api/teams/{id}
```
**Roles:** Team leader, Admin, Owner

### 5. Delete Team
```http
DELETE /api/teams/{id}
```
**Roles:** Team leader, Admin, Owner
**Note:** Cannot delete default workspace

---

## 🏗️ PROJECT MANAGEMENT APIs (Updated)

### 1. Create Personal Project
```http
POST /api/projects
```
**Roles:** All authenticated users

**Request Body (Personal Project):**
```json
{
  "name": "Learn React",
  "description": "Personal learning project",
  "startDate": "2024-01-01",
  "endDate": "2024-03-31",
  "isPersonal": true,
  "teamId": null,
  "organizationId": null
}
```

### 2. Create Team Project
```http
POST /api/projects
```
**Roles:** Team members, Leaders

**Request Body (Team Project):**
```json
{
  "name": "Marketing Campaign Q1",
  "description": "Q1 marketing campaign project",
  "startDate": "2024-01-01",
  "endDate": "2024-03-31",
  "isPersonal": false,
  "teamId": 5,
  "organizationId": 456
}
```

**Response (Both Types):**
```json
{
  "id": 1,
  "name": "Learn React",
  "description": "Personal learning project",
  "status": "PLANNED",
  "startDate": "2024-01-01",
  "endDate": "2024-03-31",
  "ownerId": 123,
  "organizationId": null,
  "teamId": null,
  "createdById": 123,
  "isPersonal": true,
  "createdAt": "2024-01-01T10:00:00.000Z",
  "updatedAt": "2024-01-01T10:00:00.000Z"
}
```

### 3. Get My Projects (Personal + Team)
```http
GET /api/projects/my-projects
```
**Roles:** All authenticated users

**Response:** Array of user's personal and team projects

### 4. Get Team Projects
```http
GET /api/teams/{teamId}/projects
```
**Roles:** Team members

**Response:** Array of projects in specific team

### 5. Get All Projects (Admin)
```http
GET /api/projects
```
**Roles:** `LEADER`, `OWNER`, `ADMIN`

**Response:** Array of all projects (admin view)

### 6. Get Project by ID
```http
GET /api/projects/{id}
```
**Roles:** Project creator, Team members, Admin

**Response:** Single project object

### 7. Update Project
```http
PUT /api/projects/{id}
```
**Roles:** Project creator, Team leader, Admin

**Request Body:** (all fields optional)
```json
{
  "name": "Updated Project Name",
  "description": "Updated description",
  "status": "IN_PROGRESS",
  "startDate": "2024-02-01",
  "endDate": "2024-04-30",
  "teamId": 5,
  "isPersonal": false
}
```

### 8. Delete Project
```http
DELETE /api/projects/{id}
```
**Roles:** Project creator, Team leader, Admin

**Response:** `200 OK`

### 9. Get All Tasks in Project
```http
GET /api/projects/{id}/tasks
```
**Roles:** `ADMIN`, `OWNER`, `LEADER`, `MEMBER`

**Response:**
```json
[
  {
    "id": 1,
    "title": "Task 1",
    "description": "Task description",
    "status": "TODO",
    "priority": "HIGH",
    "dueDate": "2024-01-15",
    "projectId": 1,
    "teamId": 2,
    "creatorId": 123,
    "assignees": [
      {
        "userId": 456,
        "userName": "John Doe"
      }
    ]
  }
]
```

### 10. Get Project Progress
```http
GET /api/projects/{id}/progress
```
**Roles:** `ADMIN`, `OWNER`, `LEADER`, `MEMBER`

**Response:**
```json
{
  "projectId": 1,
  "totalTasks": 50,
  "completedTasks": 20,
  "progressPercentage": 40.0,
  "tasksInProgress": 15,
  "todoTasks": 15
}
```

### 11. Refresh Project Progress
```http
POST /api/projects/{id}/progress
```
**Roles:** `ADMIN`, `OWNER`, `LEADER`, `MEMBER`

---

## 🏠 WORKSPACE MANAGEMENT APIs

### 1. Get My Default Workspace
```http
GET /api/workspaces/my-workspace
```
**Roles:** All authenticated users

**Response:**
```json
{
  "id": 1,
  "name": "My Workspace",
  "description": "Personal workspace for user@example.com",
  "isDefaultWorkspace": true,
  "leaderId": 123,
  "createdById": 123,
  "organizationId": null,
  "createdAt": "2024-01-01T10:00:00.000Z",
  "updatedAt": "2024-01-01T10:00:00.000Z"
}
```

### 2. Get Workspace Projects
```http
GET /api/workspaces/{workspaceId}/projects
```
**Roles:** Workspace members

**Response:** Array of projects in the workspace

### 3. Add Project to Workspace
```http
POST /api/workspaces/{workspaceId}/projects
```
**Roles:** Workspace leader, Admin

**Request Body:**
```json
{
  "projectId": 5
}
```

---

## 👤 USER PROFILE MANAGEMENT APIs

### 1. Get User Profile
```http
GET /api/userprofile/{userId}
```
**Roles:** All authenticated users

**Response:**
```json
{
  "id": 1,
  "firstName": "John",
  "lastName": "Doe",
  "username": "johndoe",
  "jobTitle": "Senior Developer",
  "department": "Engineering Team",
  "aboutMe": "Passionate developer with 5+ years experience in full-stack development...",
  "status": "active",
  "avtUrl": "/images/avatar_123.jpg",
  "userId": 123
}
```

### 2. Update User Profile
```http
PUT /api/userprofile/{userId}
```
**Roles:** User can update their own profile

**Request Body:** (all fields optional)
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "username": "johndoe_updated",
  "jobTitle": "Lead Developer",
  "department": "Frontend Team",
  "aboutMe": "Updated bio...",
  "avtUrl": "path/to/new/avatar.jpg"
}
```

**Response:** Updated profile object

---

## 🔧 FRONTEND INTEGRATION EXAMPLES

### React/Next.js API Service Examples

```javascript
// api/projectService.js
const API_BASE = 'http://localhost:8080/api';

class ProjectService {
  constructor() {
    this.token = localStorage.getItem('authToken');
  }

  getHeaders() {
    return {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    };
  }

  // Create personal project
  async createPersonalProject(projectData) {
    const response = await fetch(`${API_BASE}/projects`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        ...projectData,
        isPersonal: true,
        teamId: null
      })
    });
    return response.json();
  }

  // Create team project
  async createTeamProject(projectData, teamId) {
    const response = await fetch(`${API_BASE}/projects`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        ...projectData,
        isPersonal: false,
        teamId: teamId
      })
    });
    return response.json();
  }

  // Get my projects (personal + team)
  async getMyProjects() {
    const response = await fetch(`${API_BASE}/projects/my-projects`, {
      method: 'GET',
      headers: this.getHeaders()
    });
    return response.json();
  }

  // Get team projects
  async getTeamProjects(teamId) {
    const response = await fetch(`${API_BASE}/teams/${teamId}/projects`, {
      method: 'GET',
      headers: this.getHeaders()
    });
    return response.json();
  }

  // Update project
  async updateProject(id, projectData) {
    const response = await fetch(`${API_BASE}/projects/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(projectData)
    });
    return response.json();
  }

  // Delete project
  async deleteProject(id) {
    const response = await fetch(`${API_BASE}/projects/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    return response.ok;
  }

  // Get project tasks
  async getProjectTasks(id) {
    const response = await fetch(`${API_BASE}/projects/${id}/tasks`, {
      method: 'GET',
      headers: this.getHeaders()
    });
    return response.json();
  }

  // Get project progress
  async getProjectProgress(id) {
    const response = await fetch(`${API_BASE}/projects/${id}/progress`, {
      method: 'GET',
      headers: this.getHeaders()
    });
    return response.json();
  }
}

export default new ProjectService();
```

### Team Service Example

```javascript
// api/teamService.js
class TeamService {
  constructor() {
    this.token = localStorage.getItem('authToken');
  }

  getHeaders() {
    return {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    };
  }

  // Create team
  async createTeam(teamData) {
    const response = await fetch(`${API_BASE}/teams`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(teamData)
    });
    return response.json();
  }

  // Get my teams (including default workspace)
  async getMyTeams() {
    const response = await fetch(`${API_BASE}/teams/my-teams`, {
      method: 'GET',
      headers: this.getHeaders()
    });
    return response.json();
  }

  // Get team details
  async getTeam(id) {
    const response = await fetch(`${API_BASE}/teams/${id}`, {
      method: 'GET',
      headers: this.getHeaders()
    });
    return response.json();
  }

  // Update team
  async updateTeam(id, teamData) {
    const response = await fetch(`${API_BASE}/teams/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(teamData)
    });
    return response.json();
  }

  // Delete team
  async deleteTeam(id) {
    const response = await fetch(`${API_BASE}/teams/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    return response.ok;
  }
}

export default new TeamService();
```

### Workspace Service Example

```javascript
// api/workspaceService.js
class WorkspaceService {
  constructor() {
    this.token = localStorage.getItem('authToken');
  }

  getHeaders() {
    return {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    };
  }

  // Get my default workspace
  async getMyWorkspace() {
    const response = await fetch(`${API_BASE}/workspaces/my-workspace`, {
      method: 'GET',
      headers: this.getHeaders()
    });
    return response.json();
  }

  // Get workspace projects
  async getWorkspaceProjects(workspaceId) {
    const response = await fetch(`${API_BASE}/workspaces/${workspaceId}/projects`, {
      method: 'GET',
      headers: this.getHeaders()
    });
    return response.json();
  }

  // Add project to workspace
  async addProjectToWorkspace(workspaceId, projectId) {
    const response = await fetch(`${API_BASE}/workspaces/${workspaceId}/projects`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ projectId })
    });
    return response.json();
  }
}

export default new WorkspaceService();
```

### User Profile Service Example

```javascript
// api/userProfileService.js
class UserProfileService {
  constructor() {
    this.token = localStorage.getItem('authToken');
  }

  getHeaders() {
    return {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    };
  }

  // Get user profile
  async getUserProfile(userId) {
    const response = await fetch(`${API_BASE}/userprofile/${userId}`, {
      method: 'GET',
      headers: this.getHeaders()
    });
    return response.json();
  }

  // Update user profile
  async updateUserProfile(userId, profileData) {
    const response = await fetch(`${API_BASE}/userprofile/${userId}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(profileData)
    });
    return response.json();
  }
}

export default new UserProfileService();
```

---

## 🚨 ERROR HANDLING

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

### Error Response Format
```json
{
  "error": "Error message",
  "message": "Detailed error description",
  "timestamp": "2024-01-01T10:00:00.000Z"
}
```

### Frontend Error Handling Example
```javascript
async function handleApiCall(apiFunction) {
  try {
    const result = await apiFunction();
    return { success: true, data: result };
  } catch (error) {
    if (error.status === 401) {
      // Redirect to login
      window.location.href = '/login';
    } else if (error.status === 403) {
      // Show permission denied message
      alert('You do not have permission to perform this action');
    } else {
      // Show generic error
      alert('An error occurred. Please try again.');
    }
    return { success: false, error };
  }
}
```

---

## 🔑 ROLE-BASED ACCESS SUMMARY

| **Role** | **Teams** | **Projects** | **Tasks** | **Profile** |
|----------|-----------|-------------|-----------|-------------|
| `ADMIN` | Full CRUD | Full CRUD | Full access | Full access |
| `OWNER` | Full CRUD | Full CRUD | Full access | Full access |
| `LEADER` | Team CRUD | Team projects CRUD | Full access | Full access |
| `MEMBER` | View only | Personal projects only | Limited access | Own profile only |

### **New Flexible Permissions:**
- ✅ **Any user** can create personal projects
- ✅ **Any user** can create teams (becomes leader)
- ✅ **Team leaders** can manage team projects
- ✅ **Project creators** can manage their projects
- ✅ **Default workspace** auto-created for every user

---

## 📝 NOTES FOR FRONTEND TEAM

### **New Asana-like Features:**
1. **Personal Projects**: Users can create projects without teams
2. **Default Workspace**: Every user gets "My Workspace" automatically
3. **Flexible Team Creation**: Any user can create teams and become leader
4. **Project Types**: Support both personal and team projects
5. **Simplified Structure**: No complex hierarchy requirements

### **Implementation Guidelines:**
1. **Authentication Required**: All APIs require valid JWT token
2. **Project Creation Flow**: 
   - Show option for "Personal Project" vs "Team Project"
   - For team projects, let user select from their teams
3. **Dashboard Layout**: 
   - Show "My Workspace" section
   - Show "Teams" section
   - Show "Personal Projects" section
4. **Error Handling**: Implement proper error handling for all API calls
5. **Loading States**: Show loading indicators during API calls
6. **Data Validation**: Validate form data before sending to API
7. **Token Refresh**: Implement token refresh mechanism
8. **CORS**: Backend CORS is configured for `http://localhost:3000`

---

## 🧪 TESTING

### Swagger UI
```
http://localhost:8080/swagger-ui.html
```

### Test Authentication
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'
```

---

## 📞 SUPPORT

For any API questions or issues, contact the backend team or check:
- Swagger documentation: `http://localhost:8080/swagger-ui.html`
- Backend logs for debugging
- This documentation for reference