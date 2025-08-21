# User Teams & Projects API Documentation

## 📋 Overview

Comprehensive API documentation cho việc quản lý teams và projects. Cung cấp đầy đủ type definitions, validation rules, và detailed examples để frontend team dễ dàng implement.

## 🔐 Authentication & Authorization

### JWT Token Requirements
```http
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### Authorization Matrix
| Endpoint | Self Access | Admin Access | Owner Access |
|----------|-------------|--------------|--------------|
| `/users/{id}/teams` | ✅ Own ID only | ✅ Any ID | ✅ Any ID |
| `/users/{id}/projects` | ✅ Own ID only | ✅ Any ID | ✅ Any ID |
| `/users/me/*` | ✅ Always | ✅ Always | ✅ Always |

### Role Hierarchy
```typescript
enum UserRole {
  MEMBER = "MEMBER",        // Lowest permission
  LEADER = "LEADER",        // Team leader permissions   
  ADMIN = "ADMIN",         // Administrative permissions
  OWNER = "OWNER"          // Highest permission
}
```

## 📋 Complete Type Definitions

### Core Interfaces

```typescript
// ===== TEAM INTERFACES =====

interface TeamResponseDto {
  id: number;                          // Primary key, auto-generated
  name: string;                        // Required, max 255 chars
  description?: string | null;         // Optional, max 1000 chars
  leaderId?: number | null;            // FK to User.id, optional
  createdById?: number | null;         // FK to User.id who created team
  isDefaultWorkspace: boolean;         // Default: false
  organizationId?: number | null;      // FK to Organization.id, optional
  createdAt: string;                   // ISO 8601 datetime
  updatedAt: string;                   // ISO 8601 datetime
}

interface CreateTeamRequestDto {
  name: string;                        // Required, min 2 chars, max 255
  description?: string;                // Optional, max 1000 chars
  project_id?: number;                 // Optional FK to Project.id
  leader_id?: number;                  // Optional FK to User.id
}

interface UpdateTeamRequestDto {
  name?: string;                       // Optional, min 2 chars, max 255
  description?: string;                // Optional, max 1000 chars
  leaderId?: number;                   // Optional FK to User.id
  projectId?: number;                  // Optional FK to Project.id
}

// ===== PROJECT INTERFACES =====

interface ProjectResponseDto {
  id: number;                          // Primary key, auto-generated
  name: string;                        // Required, max 255 chars
  description?: string | null;         // Optional, max 2000 chars
  status: ProjectStatus;               // Required enum value
  startDate: string;                   // Required, ISO date format (YYYY-MM-DD)
  endDate: string;                     // Required, ISO date format (YYYY-MM-DD)
  ownerId: number;                     // Required FK to User.id
  organizationId?: number | null;      // Optional FK to Organization.id
  teamId?: number | null;              // Optional FK to Team.id
  createdById: number;                 // Required FK to User.id who created
  isPersonal: boolean;                 // Default: false
  createdAt: string;                   // ISO 8601 datetime
  updatedAt: string;                   // ISO 8601 datetime
}

interface CreateProjectRequestDto {
  name: string;                        // Required, min 3 chars, max 255
  description?: string;                // Optional, max 2000 chars
  startDate: string;                   // Required, format: YYYY-MM-DD
  endDate: string;                     // Required, format: YYYY-MM-DD, must be after startDate
  status?: ProjectStatus;              // Optional, default: PLANNED
  ownerId?: number;                    // Optional, default: current user
  organizationId?: number;             // Optional FK to Organization.id
  teamId?: number;                     // Optional FK to Team.id
  isPersonal?: boolean;                // Optional, default: false
}

interface UpdateProjectRequestDto {
  name?: string;                       // Optional, min 3 chars, max 255
  description?: string;                // Optional, max 2000 chars
  startDate?: string;                  // Optional, format: YYYY-MM-DD
  endDate?: string;                    // Optional, format: YYYY-MM-DD
  status?: ProjectStatus;              // Optional enum value
  ownerId?: number;                    // Optional FK to User.id
  organizationId?: number;             // Optional FK to Organization.id
  teamId?: number;                     // Optional FK to Team.id
  isPersonal?: boolean;                // Optional boolean
}

// ===== ENUM DEFINITIONS =====

enum ProjectStatus {
  PLANNED = "PLANNED",                 // Initial planning phase
  PLANNING = "PLANNING",               // Active planning
  IN_PROGRESS = "IN_PROGRESS",         // Currently being worked on
  ON_HOLD = "ON_HOLD",                // Temporarily paused
  COMPLETED = "COMPLETED",             // Successfully finished
  CANCELLED = "CANCELLED",             // Cancelled/abandoned
  ARCHIVED = "ARCHIVED"                // Completed and archived
}

// ===== UTILITY TYPES =====

interface ApiResponse<T> {
  data?: T;
  message?: string;
  timestamp: string;
  status: number;
}

interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  details?: Record<string, any>;
}

interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

// ===== VALIDATION TYPES =====

interface FieldValidation {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  min?: number;
  max?: number;
  format?: 'date' | 'datetime' | 'email' | 'url';
}

interface TeamValidationRules {
  name: FieldValidation;
  description: FieldValidation;
  leaderId: FieldValidation;
}

interface ProjectValidationRules {
  name: FieldValidation;
  description: FieldValidation;
  startDate: FieldValidation;
  endDate: FieldValidation;
  status: FieldValidation;
}
```

## 🎯 Core API Endpoints

### 1. Get User Teams

#### `GET /api/users/{userId}/teams`

**Description**: Retrieve all teams that a user has created or joined as a member

**URL Parameters:**
- `userId` (number, required): Target user ID. Use current user ID for self-access

**Query Parameters:** None

**Request Headers:**
```http
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Authorization Rules:**
- ✅ Users can access their own teams (`userId` matches JWT user)
- ✅ ADMIN/OWNER roles can access any user's teams
- ❌ Regular users cannot access other users' teams

**Success Response (200):**
```typescript
TeamResponseDto[]
```

**Example Response:**
```json
[
  {
    "id": 1,
    "name": "Frontend Development Team",
    "description": "Team responsible for React/Next.js development",
    "leaderId": 456,
    "createdById": 123,
    "isDefaultWorkspace": false,
    "organizationId": 789,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-20T14:45:00.000Z"
  },
  {
    "id": 2,
    "name": "QA Team",
    "description": "Quality Assurance and Testing Team",
    "leaderId": 789,
    "createdById": 456,
    "isDefaultWorkspace": false,
    "organizationId": 789,
    "createdAt": "2024-01-10T09:00:00.000Z",
    "updatedAt": "2024-01-18T16:20:00.000Z"
  }
]
```

**Field Descriptions:**
- `id`: Unique team identifier
- `name`: Team display name (2-255 characters)
- `description`: Optional detailed description (max 1000 chars)
- `leaderId`: User ID of team leader (null if no leader assigned)
- `createdById`: User ID who created this team
- `isDefaultWorkspace`: Whether this is user's default workspace
- `organizationId`: Organization this team belongs to (null for personal teams)
- `createdAt`: Team creation timestamp (UTC)
- `updatedAt`: Last modification timestamp (UTC)

**Error Responses:**
```typescript
// 400 Bad Request
{
  "timestamp": "2024-01-22T10:30:00.000Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Invalid user ID format",
  "path": "/api/users/abc/teams"
}

// 403 Forbidden
{
  "timestamp": "2024-01-22T10:30:00.000Z",
  "status": 403,
  "error": "Forbidden",
  "message": "Access denied. You can only view your own teams",
  "path": "/api/users/999/teams"
}

// 404 Not Found
{
  "timestamp": "2024-01-22T10:30:00.000Z",
  "status": 404,
  "error": "Not Found",
  "message": "User not found with id: 999",
  "path": "/api/users/999/teams"
}
```

---

### 2. Get User Projects

#### `GET /api/users/{userId}/projects`

**Description**: Retrieve all projects that a user has created, owns, or joined as a member

**URL Parameters:**
- `userId` (number, required): Target user ID. Use current user ID for self-access

**Query Parameters:** None

**Request Headers:**
```http
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Authorization Rules:**
- ✅ Users can access their own projects (`userId` matches JWT user)
- ✅ ADMIN/OWNER roles can access any user's projects
- ❌ Regular users cannot access other users' projects

**Success Response (200):**
```typescript
ProjectResponseDto[]
```

**Example Response:**
```json
[
  {
    "id": 1,
    "name": "E-commerce Platform",
    "description": "Full-stack online shopping platform with React frontend and Spring Boot backend",
    "status": "IN_PROGRESS",
    "startDate": "2024-01-01",
    "endDate": "2024-06-30",
    "ownerId": 123,
    "organizationId": 789,
    "teamId": 1,
    "createdById": 123,
    "isPersonal": false,
    "createdAt": "2024-01-01T08:00:00.000Z",
    "updatedAt": "2024-01-20T11:30:00.000Z"
  },
  {
    "id": 2,
    "name": "Mobile Learning App",
    "description": "Cross-platform educational mobile application using React Native",
    "status": "PLANNING",
    "startDate": "2024-02-01",
    "endDate": "2024-08-31",
    "ownerId": 456,
    "organizationId": 789,
    "teamId": 2,
    "createdById": 456,
    "isPersonal": false,
    "createdAt": "2024-01-15T14:20:00.000Z",
    "updatedAt": "2024-01-22T09:45:00.000Z"
  },
  {
    "id": 3,
    "name": "Personal Portfolio",
    "description": "My personal developer portfolio website",
    "status": "COMPLETED",
    "startDate": "2024-01-05",
    "endDate": "2024-01-25",
    "ownerId": 123,
    "organizationId": null,
    "teamId": null,
    "createdById": 123,
    "isPersonal": true,
    "createdAt": "2024-01-05T10:00:00.000Z",
    "updatedAt": "2024-01-25T16:45:00.000Z"
  }
]
```

**Field Descriptions:**
- `id`: Unique project identifier
- `name`: Project display name (3-255 characters)
- `description`: Optional detailed description (max 2000 chars)
- `status`: Current project status (see ProjectStatus enum)
- `startDate`: Project start date (YYYY-MM-DD format)
- `endDate`: Project end date (YYYY-MM-DD format, must be after startDate)
- `ownerId`: User ID who owns/manages this project
- `organizationId`: Organization this project belongs to (null for personal projects)
- `teamId`: Team assigned to this project (null for personal/unassigned projects)
- `createdById`: User ID who originally created this project
- `isPersonal`: Whether this is a personal project (true) or team project (false)
- `createdAt`: Project creation timestamp (UTC)
- `updatedAt`: Last modification timestamp (UTC)

**Status Enum Values:**
```typescript
"PLANNED"      // Initial planning phase
"PLANNING"     // Active planning in progress
"IN_PROGRESS"  // Currently being developed
"ON_HOLD"      // Temporarily paused
"COMPLETED"    // Successfully finished
"CANCELLED"    // Cancelled/abandoned
"ARCHIVED"     // Completed and archived
```

**Error Responses:**
```typescript
// 400 Bad Request
{
  "timestamp": "2024-01-22T10:30:00.000Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Invalid user ID format",
  "path": "/api/users/abc/projects"
}

// 403 Forbidden
{
  "timestamp": "2024-01-22T10:30:00.000Z",
  "status": 403,
  "error": "Forbidden",
  "message": "Access denied. You can only view your own projects",
  "path": "/api/users/999/projects"
}

// 404 Not Found
{
  "timestamp": "2024-01-22T10:30:00.000Z",
  "status": 404,
  "error": "Not Found",
  "message": "User not found with id: 999",
  "path": "/api/users/999/projects"
}
```

---

## 🚀 Convenience Endpoints (Recommended for Frontend)

### 3. Get Current User Teams

#### `GET /api/users/me/teams`

**Description**: Retrieve teams for the currently authenticated user (automatically uses JWT user ID)

**URL Parameters:** None

**Query Parameters:** None

**Request Headers:**
```http
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Authorization Rules:**
- ✅ Any authenticated user can access this endpoint
- ✅ Automatically uses JWT token to identify current user
- ✅ No need to pass user ID in URL

**Success Response (200):**
```typescript
TeamResponseDto[]
```

**Example Request:**
```bash
curl -X GET "http://localhost:8080/api/users/me/teams" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json"
```

**Example Response:**
```json
[
  {
    "id": 1,
    "name": "My Development Team",
    "description": "Team I created for frontend development",
    "leaderId": 123,
    "createdById": 123,
    "isDefaultWorkspace": false,
    "organizationId": 456,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-20T14:45:00.000Z"
  },
  {
    "id": 5,
    "name": "QA Team Alpha",
    "description": "Quality assurance team I joined as a member",
    "leaderId": 789,
    "createdById": 789,
    "isDefaultWorkspace": false,
    "organizationId": 456,
    "createdAt": "2024-01-10T09:00:00.000Z",
    "updatedAt": "2024-01-18T16:20:00.000Z"
  }
]
```

**Use Cases:**
- ✅ Dashboard showing user's teams
- ✅ Team selector dropdown
- ✅ Navigation sidebar with team list
- ✅ User profile team overview

**Error Responses:**
```typescript
// 401 Unauthorized
{
  "timestamp": "2024-01-22T10:30:00.000Z",
  "status": 401,
  "error": "Unauthorized",
  "message": "JWT token is missing or invalid",
  "path": "/api/users/me/teams"
}

// 500 Internal Server Error
{
  "timestamp": "2024-01-22T10:30:00.000Z",
  "status": 500,
  "error": "Internal Server Error",
  "message": "Failed to retrieve current user information",
  "path": "/api/users/me/teams"
}
```

---

### 4. Get Current User Projects

#### `GET /api/users/me/projects`

**Description**: Retrieve projects for the currently authenticated user (automatically uses JWT user ID)

**URL Parameters:** None

**Query Parameters:** None

**Request Headers:**
```http
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Authorization Rules:**
- ✅ Any authenticated user can access this endpoint
- ✅ Automatically uses JWT token to identify current user
- ✅ No need to pass user ID in URL

**Success Response (200):**
```typescript
ProjectResponseDto[]
```

**Example Request:**
```bash
curl -X GET "http://localhost:8080/api/users/me/projects" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json"
```

**Example Response:**
```json
[
  {
    "id": 1,
    "name": "My E-commerce Project",
    "description": "Personal project for building an online store",
    "status": "IN_PROGRESS",
    "startDate": "2024-01-01",
    "endDate": "2024-06-30",
    "ownerId": 123,
    "organizationId": 456,
    "teamId": 1,
    "createdById": 123,
    "isPersonal": false,
    "createdAt": "2024-01-01T08:00:00.000Z",
    "updatedAt": "2024-01-20T11:30:00.000Z"
  },
  {
    "id": 7,
    "name": "Company Mobile App",
    "description": "Mobile application I'm contributing to as a team member",
    "status": "PLANNING",
    "startDate": "2024-02-01",
    "endDate": "2024-08-31",
    "ownerId": 789,
    "organizationId": 456,
    "teamId": 5,
    "createdById": 789,
    "isPersonal": false,
    "createdAt": "2024-01-15T14:20:00.000Z",
    "updatedAt": "2024-01-22T09:45:00.000Z"
  },
  {
    "id": 12,
    "name": "Personal Blog",
    "description": "My personal development blog website",
    "status": "COMPLETED",
    "startDate": "2024-01-05",
    "endDate": "2024-01-25",
    "ownerId": 123,
    "organizationId": null,
    "teamId": null,
    "createdById": 123,
    "isPersonal": true,
    "createdAt": "2024-01-05T10:00:00.000Z",
    "updatedAt": "2024-01-25T16:45:00.000Z"
  }
]
```

**Use Cases:**
- ✅ Project dashboard for current user
- ✅ Project selector for task creation
- ✅ User profile project portfolio
- ✅ Navigation sidebar with project list
- ✅ Recent projects widget

**Response Notes:**
- Projects are returned in order of last update (most recent first)
- Includes projects where user is creator, owner, or team member
- Personal projects (`isPersonal: true`) are included
- Team projects where user is a member are included

**Error Responses:**
```typescript
// 401 Unauthorized
{
  "timestamp": "2024-01-22T10:30:00.000Z",
  "status": 401,
  "error": "Unauthorized", 
  "message": "JWT token is missing or invalid",
  "path": "/api/users/me/projects"
}

// 500 Internal Server Error
{
  "timestamp": "2024-01-22T10:30:00.000Z",
  "status": 500,
  "error": "Internal Server Error",
  "message": "Failed to retrieve current user information",
  "path": "/api/users/me/projects"
}
```

---

## 🔍 Granular Endpoints (Advanced Usage)

### 5. Get Teams Created by User

#### `GET /api/users/{userId}/teams/created`

**Description**: Retrieve only teams that were originally created by the specified user (excludes teams where user is just a member)

**URL Parameters:**
- `userId` (number, required): Target user ID

**Query Parameters:** None

**Request Headers:**
```http
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Authorization Rules:**
- ✅ Users can access their own created teams
- ✅ ADMIN/OWNER roles can access any user's created teams
- ❌ Regular users cannot access other users' created teams

**Success Response (200):**
```typescript
TeamResponseDto[]
```

**Example Request:**
```bash
curl -X GET "http://localhost:8080/api/users/123/teams/created" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json"
```

**Example Response:**
```json
[
  {
    "id": 1,
    "name": "My Frontend Team",
    "description": "Team I created for React development",
    "leaderId": 123,
    "createdById": 123,
    "isDefaultWorkspace": false,
    "organizationId": 456,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-20T14:45:00.000Z"
  }
]
```

**Use Cases:**
- ✅ Admin panel showing teams created by specific user
- ✅ User profile showing teams they founded
- ✅ Analytics/reporting on team creation activity
- ✅ Team management dashboard for team creators

**Filtering Logic:**
- Only returns teams where `createdById` matches the specified `userId`
- Excludes teams where user is leader but not creator
- Excludes teams where user is member but not creator

---

### 6. Get Projects Created by User

#### `GET /api/users/{userId}/projects/created`

**Description**: Retrieve only projects that were originally created by the specified user (excludes projects where user is owner or member but not creator)

**URL Parameters:**
- `userId` (number, required): Target user ID

**Query Parameters:** None

**Request Headers:**
```http
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Authorization Rules:**
- ✅ Users can access their own created projects
- ✅ ADMIN/OWNER roles can access any user's created projects
- ❌ Regular users cannot access other users' created projects

**Success Response (200):**
```typescript
ProjectResponseDto[]
```

**Example Request:**
```bash
curl -X GET "http://localhost:8080/api/users/123/projects/created" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json"
```

**Example Response:**
```json
[
  {
    "id": 1,
    "name": "My E-commerce Platform",
    "description": "Project I initiated and created from scratch",
    "status": "IN_PROGRESS",
    "startDate": "2024-01-01",
    "endDate": "2024-06-30",
    "ownerId": 123,
    "organizationId": 456,
    "teamId": 1,
    "createdById": 123,
    "isPersonal": false,
    "createdAt": "2024-01-01T08:00:00.000Z",
    "updatedAt": "2024-01-20T11:30:00.000Z"
  },
  {
    "id": 3,
    "name": "Personal Portfolio",
    "description": "My developer portfolio website",
    "status": "COMPLETED",
    "startDate": "2024-01-05",
    "endDate": "2024-01-25",
    "ownerId": 123,
    "organizationId": null,
    "teamId": null,
    "createdById": 123,
    "isPersonal": true,
    "createdAt": "2024-01-05T10:00:00.000Z",
    "updatedAt": "2024-01-25T16:45:00.000Z"
  }
]
```

**Use Cases:**
- ✅ Project initiative tracking
- ✅ User profile showing original projects
- ✅ Analytics on project creation patterns
- ✅ Recognition system for project initiators

**Filtering Logic:**
- Only returns projects where `createdById` matches the specified `userId`
- Includes both personal and team projects if created by user
- Excludes projects where user became owner/member later

---

### 7. Get Projects Owned by User

#### `GET /api/users/{userId}/projects/owned`

**Description**: Retrieve only projects that are currently owned/managed by the specified user (user has ownership responsibility)

**URL Parameters:**
- `userId` (number, required): Target user ID

**Query Parameters:** None

**Request Headers:**
```http
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Authorization Rules:**
- ✅ Users can access their own owned projects
- ✅ ADMIN/OWNER roles can access any user's owned projects
- ❌ Regular users cannot access other users' owned projects

**Success Response (200):**
```typescript
ProjectResponseDto[]
```

**Example Request:**
```bash
curl -X GET "http://localhost:8080/api/users/123/projects/owned" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json"
```

**Example Response:**
```json
[
  {
    "id": 1,
    "name": "E-commerce Platform",
    "description": "Project I currently own and manage",
    "status": "IN_PROGRESS",
    "startDate": "2024-01-01",
    "endDate": "2024-06-30",
    "ownerId": 123,
    "organizationId": 456,
    "teamId": 1,
    "createdById": 456,
    "isPersonal": false,
    "createdAt": "2024-01-01T08:00:00.000Z",
    "updatedAt": "2024-01-20T11:30:00.000Z"
  },
  {
    "id": 5,
    "name": "Mobile App Project",
    "description": "Mobile project transferred to my ownership",
    "status": "PLANNING",
    "startDate": "2024-02-01",
    "endDate": "2024-08-31",
    "ownerId": 123,
    "organizationId": 456,
    "teamId": 2,
    "createdById": 789,
    "isPersonal": false,
    "createdAt": "2024-01-15T14:20:00.000Z",
    "updatedAt": "2024-01-22T09:45:00.000Z"
  }
]
```

**Use Cases:**
- ✅ Project management dashboard
- ✅ Accountability tracking for project owners
- ✅ Workload management for managers
- ✅ Project handover scenarios
- ✅ Performance review data

**Filtering Logic:**
- Only returns projects where `ownerId` matches the specified `userId`
- Includes projects created by others but now owned by user
- Includes projects where ownership was transferred to user
- User might be owner but not original creator

**Key Differences:**
| Endpoint | What it returns | Use Case |
|----------|----------------|----------|
| `/teams` | All teams (created + joined) | Complete team list for user |
| `/teams/created` | Only teams user created | Team founding history |
| `/projects` | All projects (created + owned + joined) | Complete project list for user |
| `/projects/created` | Only projects user created | Project initiative history |
| `/projects/owned` | Only projects user owns | Current project management responsibility |

---

## 📋 Validation Rules & Constraints

### Team Validation Rules

```typescript
const TEAM_VALIDATION: TeamValidationRules = {
  name: {
    required: true,
    minLength: 2,
    maxLength: 255,
    pattern: "^[a-zA-Z0-9\\s\\-_]+$"  // Alphanumeric, spaces, hyphens, underscores
  },
  description: {
    required: false,
    maxLength: 1000
  },
  leaderId: {
    required: false,
    min: 1  // Must be valid user ID if provided
  }
};
```

### Project Validation Rules

```typescript
const PROJECT_VALIDATION: ProjectValidationRules = {
  name: {
    required: true,
    minLength: 3,
    maxLength: 255,
    pattern: "^[a-zA-Z0-9\\s\\-_.]+$"
  },
  description: {
    required: false,
    maxLength: 2000
  },
  startDate: {
    required: true,
    format: "date",  // YYYY-MM-DD
    min: new Date().toISOString().split('T')[0]  // Cannot be in the past
  },
  endDate: {
    required: true,
    format: "date",  // YYYY-MM-DD
    // Must be after startDate (validated on backend)
  },
  status: {
    required: false,
    pattern: "^(PLANNED|PLANNING|IN_PROGRESS|ON_HOLD|COMPLETED|CANCELLED|ARCHIVED)$"
  }
};
```

### Frontend Validation Helper

```typescript
// Frontend validation utility
export class ValidationHelper {
  static validateTeamName(name: string): string | null {
    if (!name || name.trim().length === 0) {
      return "Team name is required";
    }
    if (name.trim().length < 2) {
      return "Team name must be at least 2 characters";
    }
    if (name.trim().length > 255) {
      return "Team name cannot exceed 255 characters";
    }
    if (!/^[a-zA-Z0-9\s\-_]+$/.test(name.trim())) {
      return "Team name can only contain letters, numbers, spaces, hyphens, and underscores";
    }
    return null;
  }

  static validateProjectName(name: string): string | null {
    if (!name || name.trim().length === 0) {
      return "Project name is required";
    }
    if (name.trim().length < 3) {
      return "Project name must be at least 3 characters";
    }
    if (name.trim().length > 255) {
      return "Project name cannot exceed 255 characters";
    }
    if (!/^[a-zA-Z0-9\s\-_.]+$/.test(name.trim())) {
      return "Project name can only contain letters, numbers, spaces, hyphens, underscores, and periods";
    }
    return null;
  }

  static validateDateRange(startDate: string, endDate: string): string | null {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      return "Start date cannot be in the past";
    }
    if (end <= start) {
      return "End date must be after start date";
    }
    return null;
  }
}
```

---

## ⚠️ Comprehensive Error Handling

### HTTP Status Codes & Meanings

| Status Code | Description | When it occurs | Frontend Action |
|-------------|-------------|----------------|-----------------|
| `200` | OK | Request successful | Process response data |
| `400` | Bad Request | Invalid request format/data | Show validation errors |
| `401` | Unauthorized | Missing/invalid JWT token | Redirect to login |
| `403` | Forbidden | Access denied for resource | Show permission error |
| `404` | Not Found | User/resource doesn't exist | Show "not found" message |
| `422` | Unprocessable Entity | Validation errors | Show field-specific errors |
| `429` | Too Many Requests | Rate limit exceeded | Show retry message |
| `500` | Internal Server Error | Backend error | Show generic error message |

### Complete Error Response Format

```typescript
interface ApiErrorResponse {
  timestamp: string;           // ISO 8601 datetime
  status: number;             // HTTP status code
  error: string;              // HTTP status text
  message: string;            // Human-readable error message
  path: string;               // API endpoint that failed
  details?: {                 // Optional additional details
    field?: string;           // Field that caused validation error
    rejectedValue?: any;      // Value that was rejected
    code?: string;            // Error code for frontend handling
    validationErrors?: {      // Multiple validation errors
      [field: string]: string[];
    };
  };
}
```

### Error Examples by Status Code

```typescript
// 400 Bad Request - Invalid input
{
  "timestamp": "2024-01-22T10:30:00.000Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Invalid user ID format",
  "path": "/api/users/abc/teams",
  "details": {
    "field": "userId",
    "rejectedValue": "abc",
    "code": "INVALID_FORMAT"
  }
}

// 401 Unauthorized - Missing/invalid token
{
  "timestamp": "2024-01-22T10:30:00.000Z",
  "status": 401,
  "error": "Unauthorized",
  "message": "JWT token is missing or invalid",
  "path": "/api/users/me/teams",
  "details": {
    "code": "TOKEN_INVALID"
  }
}

// 403 Forbidden - Access denied
{
  "timestamp": "2024-01-22T10:30:00.000Z",
  "status": 403,
  "error": "Forbidden",
  "message": "Access denied. You can only view your own teams",
  "path": "/api/users/999/teams",
  "details": {
    "code": "ACCESS_DENIED",
    "requiredRole": ["ADMIN", "OWNER"]
  }
}

// 404 Not Found - Resource doesn't exist
{
  "timestamp": "2024-01-22T10:30:00.000Z",
  "status": 404,
  "error": "Not Found",
  "message": "User not found with id: 999",
  "path": "/api/users/999/teams",
  "details": {
    "field": "userId",
    "rejectedValue": 999,
    "code": "USER_NOT_FOUND"
  }
}

// 422 Unprocessable Entity - Validation errors
{
  "timestamp": "2024-01-22T10:30:00.000Z",
  "status": 422,
  "error": "Unprocessable Entity",
  "message": "Validation failed for multiple fields",
  "path": "/api/teams",
  "details": {
    "code": "VALIDATION_FAILED",
    "validationErrors": {
      "name": ["Team name is required", "Team name must be at least 2 characters"],
      "endDate": ["End date must be after start date"]
    }
  }
}

// 500 Internal Server Error - Backend issue
{
  "timestamp": "2024-01-22T10:30:00.000Z",
  "status": 500,
  "error": "Internal Server Error",
  "message": "Failed to retrieve user teams due to database connection issue",
  "path": "/api/users/123/teams",
  "details": {
    "code": "DATABASE_ERROR"
  }
}
```

---

## 💻 Production-Ready Frontend Integration

### Complete TypeScript Definitions

```typescript
// types/api.types.ts
export interface TeamResponseDto {
  id: number;
  name: string;
  description?: string | null;
  leaderId?: number | null;
  createdById?: number | null;
  isDefaultWorkspace: boolean;
  organizationId?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectResponseDto {
  id: number;
  name: string;
  description?: string | null;
  status: ProjectStatus;
  startDate: string;
  endDate: string;
  ownerId: number;
  organizationId?: number | null;
  teamId?: number | null;
  createdById: number;
  isPersonal: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTeamRequestDto {
  name: string;
  description?: string;
  project_id?: number;
  leader_id?: number;
}

export interface CreateProjectRequestDto {
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  status?: ProjectStatus;
  ownerId?: number;
  organizationId?: number;
  teamId?: number;
  isPersonal?: boolean;
}

export enum ProjectStatus {
  PLANNED = "PLANNED",
  PLANNING = "PLANNING",
  IN_PROGRESS = "IN_PROGRESS",
  ON_HOLD = "ON_HOLD",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  ARCHIVED = "ARCHIVED"
}

export interface ApiErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  details?: {
    field?: string;
    rejectedValue?: any;
    code?: string;
    validationErrors?: {
      [field: string]: string[];
    };
  };
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}
```

### Advanced API Service with Error Handling

```typescript
// services/apiService.ts
import { 
  TeamResponseDto, 
  ProjectResponseDto, 
  CreateTeamRequestDto, 
  CreateProjectRequestDto,
  ApiErrorResponse 
} from '../types/api.types';

export class ApiError extends Error {
  constructor(
    public status: number,
    public response: ApiErrorResponse
  ) {
    super(response.message);
    this.name = 'ApiError';
  }
}

export class ApiService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  
  private async request<T>(
    endpoint: string, 
    token: string, 
    options?: RequestInit
  ): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      if (!response.ok) {
        const errorData: ApiErrorResponse = await response.json();
        throw new ApiError(response.status, errorData);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      // Network or other errors
      throw new Error(`Network error: ${error.message}`);
    }
  }

  // ===== TEAMS API =====
  
  async getCurrentUserTeams(token: string): Promise<TeamResponseDto[]> {
    return this.request<TeamResponseDto[]>('/api/users/me/teams', token);
  }

  async getUserTeams(userId: number, token: string): Promise<TeamResponseDto[]> {
    return this.request<TeamResponseDto[]>(`/api/users/${userId}/teams`, token);
  }

  async getUserCreatedTeams(userId: number, token: string): Promise<TeamResponseDto[]> {
    return this.request<TeamResponseDto[]>(`/api/users/${userId}/teams/created`, token);
  }

  async createTeam(data: CreateTeamRequestDto, token: string): Promise<TeamResponseDto> {
    return this.request<TeamResponseDto>('/api/teams', token, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTeam(
    teamId: number, 
    data: Partial<CreateTeamRequestDto>, 
    token: string
  ): Promise<TeamResponseDto> {
    return this.request<TeamResponseDto>(`/api/teams/${teamId}`, token, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTeam(teamId: number, token: string): Promise<void> {
    await this.request<void>(`/api/teams/${teamId}`, token, {
      method: 'DELETE',
    });
  }

  // ===== PROJECTS API =====
  
  async getCurrentUserProjects(token: string): Promise<ProjectResponseDto[]> {
    return this.request<ProjectResponseDto[]>('/api/users/me/projects', token);
  }

  async getUserProjects(userId: number, token: string): Promise<ProjectResponseDto[]> {
    return this.request<ProjectResponseDto[]>(`/api/users/${userId}/projects`, token);
  }

  async getUserCreatedProjects(userId: number, token: string): Promise<ProjectResponseDto[]> {
    return this.request<ProjectResponseDto[]>(`/api/users/${userId}/projects/created`, token);
  }

  async getUserOwnedProjects(userId: number, token: string): Promise<ProjectResponseDto[]> {
    return this.request<ProjectResponseDto[]>(`/api/users/${userId}/projects/owned`, token);
  }

  async createProject(data: CreateProjectRequestDto, token: string): Promise<ProjectResponseDto> {
    return this.request<ProjectResponseDto>('/api/projects', token, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProject(
    projectId: number, 
    data: Partial<CreateProjectRequestDto>, 
    token: string
  ): Promise<ProjectResponseDto> {
    return this.request<ProjectResponseDto>(`/api/projects/${projectId}`, token, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProject(projectId: number, token: string): Promise<void> {
    await this.request<void>(`/api/projects/${projectId}`, token, {
      method: 'DELETE',
    });
  }
}

export const apiService = new ApiService();
```

### Advanced React Hook with Caching

```typescript
// hooks/useUserTeamsProjects.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { apiService, ApiError } from '../services/apiService';
import { TeamResponseDto, ProjectResponseDto } from '../types/api.types';

interface UseUserTeamsProjectsOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  enableCaching?: boolean;
  cacheTimeout?: number;
}

interface UseUserTeamsProjectsReturn {
  teams: TeamResponseDto[];
  projects: ProjectResponseDto[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createTeam: (data: CreateTeamRequestDto) => Promise<TeamResponseDto>;
  createProject: (data: CreateProjectRequestDto) => Promise<ProjectResponseDto>;
  deleteTeam: (teamId: number) => Promise<void>;
  deleteProject: (projectId: number) => Promise<void>;
}

const CACHE_KEYS = {
  TEAMS: 'user_teams',
  PROJECTS: 'user_projects',
} as const;

export const useUserTeamsProjects = (
  options: UseUserTeamsProjectsOptions = {}
): UseUserTeamsProjectsReturn => {
  const {
    autoRefresh = false,
    refreshInterval = 30000, // 30 seconds
    enableCaching = true,
    cacheTimeout = 300000, // 5 minutes
  } = options;

  const { data: session } = useSession();
  const [teams, setTeams] = useState<TeamResponseDto[]>([]);
  const [projects, setProjects] = useState<ProjectResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout>();

  // Cache management
  const getCachedData = useCallback((key: string) => {
    if (!enableCaching) return null;
    
    try {
      const cached = localStorage.getItem(key);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < cacheTimeout) {
          return data;
        }
      }
    } catch (error) {
      console.warn('Failed to read cache:', error);
    }
    return null;
  }, [enableCaching, cacheTimeout]);

  const setCachedData = useCallback((key: string, data: any) => {
    if (!enableCaching) return;
    
    try {
      localStorage.setItem(key, JSON.stringify({
        data,
        timestamp: Date.now(),
      }));
    } catch (error) {
      console.warn('Failed to write cache:', error);
    }
  }, [enableCaching]);

  // Fetch data function
  const fetchData = useCallback(async () => {
    if (!session?.accessToken) return;

    try {
      setLoading(true);
      setError(null);

      // Try cache first
      const cachedTeams = getCachedData(CACHE_KEYS.TEAMS);
      const cachedProjects = getCachedData(CACHE_KEYS.PROJECTS);

      if (cachedTeams && cachedProjects) {
        setTeams(cachedTeams);
        setProjects(cachedProjects);
        setLoading(false);
        return;
      }

      // Fetch from API
      const [teamsData, projectsData] = await Promise.all([
        apiService.getCurrentUserTeams(session.accessToken),
        apiService.getCurrentUserProjects(session.accessToken),
      ]);

      setTeams(teamsData);
      setProjects(projectsData);

      // Cache the results
      setCachedData(CACHE_KEYS.TEAMS, teamsData);
      setCachedData(CACHE_KEYS.PROJECTS, projectsData);

    } catch (err) {
      console.error('Error fetching data:', err);
      
      if (err instanceof ApiError) {
        switch (err.status) {
          case 401:
            setError('Authentication expired. Please log in again.');
            break;
          case 403:
            setError('Access denied. You do not have permission to view this data.');
            break;
          case 404:
            setError('User not found.');
            break;
          case 500:
            setError('Server error. Please try again later.');
            break;
          default:
            setError(err.response.message || 'An unexpected error occurred.');
        }
      } else {
        setError('Network error. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [session?.accessToken, getCachedData, setCachedData]);

  // CRUD operations
  const createTeam = useCallback(async (data: CreateTeamRequestDto): Promise<TeamResponseDto> => {
    if (!session?.accessToken) throw new Error('Not authenticated');
    
    const newTeam = await apiService.createTeam(data, session.accessToken);
    setTeams(prev => [newTeam, ...prev]);
    setCachedData(CACHE_KEYS.TEAMS, [newTeam, ...teams]);
    return newTeam;
  }, [session?.accessToken, teams, setCachedData]);

  const createProject = useCallback(async (data: CreateProjectRequestDto): Promise<ProjectResponseDto> => {
    if (!session?.accessToken) throw new Error('Not authenticated');
    
    const newProject = await apiService.createProject(data, session.accessToken);
    setProjects(prev => [newProject, ...prev]);
    setCachedData(CACHE_KEYS.PROJECTS, [newProject, ...projects]);
    return newProject;
  }, [session?.accessToken, projects, setCachedData]);

  const deleteTeam = useCallback(async (teamId: number): Promise<void> => {
    if (!session?.accessToken) throw new Error('Not authenticated');
    
    await apiService.deleteTeam(teamId, session.accessToken);
    const updatedTeams = teams.filter(team => team.id !== teamId);
    setTeams(updatedTeams);
    setCachedData(CACHE_KEYS.TEAMS, updatedTeams);
  }, [session?.accessToken, teams, setCachedData]);

  const deleteProject = useCallback(async (projectId: number): Promise<void> => {
    if (!session?.accessToken) throw new Error('Not authenticated');
    
    await apiService.deleteProject(projectId, session.accessToken);
    const updatedProjects = projects.filter(project => project.id !== projectId);
    setProjects(updatedProjects);
    setCachedData(CACHE_KEYS.PROJECTS, updatedProjects);
  }, [session?.accessToken, projects, setCachedData]);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto refresh setup
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      intervalRef.current = setInterval(fetchData, refreshInterval);
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [autoRefresh, refreshInterval, fetchData]);

  return {
    teams,
    projects,
    loading,
    error,
    refetch: fetchData,
    createTeam,
    createProject,
    deleteTeam,
    deleteProject,
  };
};
```

### Production React Component

```tsx
// components/UserDashboard.tsx
import React, { useState, useCallback } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  Typography, 
  Button, 
  Grid, 
  Chip, 
  Dialog,
  Alert,
  Skeleton,
  IconButton,
  Menu,
  MenuItem
} from '@mui/material';
import { 
  Add as AddIcon, 
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useUserTeamsProjects } from '../hooks/useUserTeamsProjects';
import { ProjectStatus, TeamResponseDto, ProjectResponseDto } from '../types/api.types';

const UserDashboard: React.FC = () => {
  const { 
    teams, 
    projects, 
    loading, 
    error, 
    refetch,
    deleteTeam,
    deleteProject 
  } = useUserTeamsProjects({
    autoRefresh: true,
    refreshInterval: 60000, // 1 minute
    enableCaching: true,
  });

  const [selectedTeam, setSelectedTeam] = useState<TeamResponseDto | null>(null);
  const [selectedProject, setSelectedProject] = useState<ProjectResponseDto | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const handleMenuClick = useCallback((event: React.MouseEvent<HTMLElement>, item: TeamResponseDto | ProjectResponseDto) => {
    setAnchorEl(event.currentTarget);
    if ('leaderId' in item) {
      setSelectedTeam(item);
      setSelectedProject(null);
    } else {
      setSelectedProject(item);
      setSelectedTeam(null);
    }
  }, []);

  const handleMenuClose = useCallback(() => {
    setAnchorEl(null);
    setSelectedTeam(null);
    setSelectedProject(null);
  }, []);

  const handleDelete = useCallback(async () => {
    try {
      if (selectedTeam) {
        await deleteTeam(selectedTeam.id);
      } else if (selectedProject) {
        await deleteProject(selectedProject.id);
      }
      setDeleteConfirmOpen(false);
      handleMenuClose();
    } catch (error) {
      console.error('Delete failed:', error);
    }
  }, [selectedTeam, selectedProject, deleteTeam, deleteProject, handleMenuClose]);

  const getStatusColor = (status: ProjectStatus): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (status) {
      case ProjectStatus.COMPLETED: return 'success';
      case ProjectStatus.IN_PROGRESS: return 'primary';
      case ProjectStatus.ON_HOLD: return 'warning';
      case ProjectStatus.CANCELLED: return 'error';
      case ProjectStatus.PLANNING: return 'info';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Grid container spacing={3}>
        {[...Array(6)].map((_, index) => (
          <Grid item xs={12} md={6} lg={4} key={index}>
            <Card>
              <CardHeader
                title={<Skeleton variant="text" width="60%" />}
                action={<Skeleton variant="circular" width={24} height={24} />}
              />
              <CardContent>
                <Skeleton variant="text" width="100%" />
                <Skeleton variant="text" width="80%" />
                <Skeleton variant="text" width="40%" />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  if (error) {
    return (
      <Alert severity="error" action={
        <Button color="inherit" size="small" onClick={refetch}>
          Retry
        </Button>
      }>
        {error}
      </Alert>
    );
  }

  return (
    <div>
      {/* Teams Section */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <Typography variant="h5" component="h2">
            My Teams ({teams.length})
          </Typography>
          <Button
            startIcon={<AddIcon />}
            variant="contained"
            color="primary"
            onClick={() => {/* Open create team dialog */}}
          >
            Create Team
          </Button>
        </div>
        
        <Grid container spacing={2}>
          {teams.map((team) => (
            <Grid item xs={12} md={6} lg={4} key={team.id}>
              <Card>
                <CardHeader
                  title={team.name}
                  action={
                    <IconButton onClick={(e) => handleMenuClick(e, team)}>
                      <MoreVertIcon />
                    </IconButton>
                  }
                />
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {team.description || 'No description'}
                  </Typography>
                  <Typography variant="caption" display="block">
                    Created: {new Date(team.createdAt).toLocaleDateString()}
                  </Typography>
                  {team.isDefaultWorkspace && (
                    <Chip 
                      label="Default Workspace" 
                      size="small" 
                      color="primary" 
                      style={{ marginTop: '8px' }}
                    />
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </div>

      {/* Projects Section */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <Typography variant="h5" component="h2">
            My Projects ({projects.length})
          </Typography>
          <Button
            startIcon={<AddIcon />}
            variant="contained"
            color="primary"
            onClick={() => {/* Open create project dialog */}}
          >
            Create Project
          </Button>
        </div>
        
        <Grid container spacing={2}>
          {projects.map((project) => (
            <Grid item xs={12} md={6} lg={4} key={project.id}>
              <Card>
                <CardHeader
                  title={project.name}
                  action={
                    <IconButton onClick={(e) => handleMenuClick(e, project)}>
                      <MoreVertIcon />
                    </IconButton>
                  }
                />
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {project.description || 'No description'}
                  </Typography>
                  
                  <div style={{ marginBottom: '8px' }}>
                    <Chip 
                      label={project.status} 
                      size="small" 
                      color={getStatusColor(project.status)}
                    />
                    {project.isPersonal && (
                      <Chip 
                        label="Personal" 
                        size="small" 
                        variant="outlined"
                        style={{ marginLeft: '4px' }}
                      />
                    )}
                  </div>

                  <Typography variant="caption" display="block">
                    Duration: {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
                  </Typography>
                  <Typography variant="caption" display="block">
                    Created: {new Date(project.createdAt).toLocaleDateString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </div>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {/* Handle edit */}}>
          <EditIcon style={{ marginRight: '8px' }} />
          Edit
        </MenuItem>
        <MenuItem 
          onClick={() => setDeleteConfirmOpen(true)}
          style={{ color: 'red' }}
        >
          <DeleteIcon style={{ marginRight: '8px' }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <div style={{ padding: '24px' }}>
          <Typography variant="h6" gutterBottom>
            Confirm Deletion
          </Typography>
          <Typography variant="body1" gutterBottom>
            Are you sure you want to delete "{selectedTeam?.name || selectedProject?.name}"? 
            This action cannot be undone.
          </Typography>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '24px' }}>
            <Button onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleDelete}
              color="error"
              variant="contained"
            >
              Delete
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default UserDashboard;
```

---

## 🏗️ Team Management & Member Invitation System

### Overview
System cho phép user tạo teams, mời members qua email, và quản lý permissions. Người tạo team tự động trở thành leader với full quyền quản lý.

---

### 1. Create Team

#### `POST /api/teams`

**Description**: Tạo team mới và tự động trở thành team leader

**Request Body:**
```typescript
interface CreateTeamRequestDto {
  name: string;                    // Required, tên team (2-255 chars)
  description?: string;            // Optional, mô tả team (max 1000 chars)
  project_id?: number;             // Optional, assign existing project
  leader_id?: number;              // Optional, default: current user
}
```

**Example Request:**
```bash
curl -X POST "http://localhost:8080/api/teams" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Frontend Development Team",
    "description": "Team chuyên phát triển giao diện người dùng với React/Vue"
  }'
```

**Example Response:**
```json
{
  "id": 123,
  "name": "Frontend Development Team",
  "description": "Team chuyên phát triển giao diện người dùng với React/Vue",
  "leaderId": 456,                 // Current user becomes leader
  "createdById": 456,              // Current user is creator
  "isDefaultWorkspace": false,
  "organizationId": null,
  "createdAt": "2024-01-22T10:30:00.000Z",
  "updatedAt": "2024-01-22T10:30:00.000Z"
}
```

---

### 2. Invite Members by Email

#### `POST /api/teams/{teamId}/invitations`

**Description**: Mời user tham gia team qua email address

**Authorization**: Chỉ team leader mới có quyền mời members

**URL Parameters:**
- `teamId` (number, required): ID của team

**Request Body:**
```typescript
interface TeamInvitationRequestDto {
  email: string;                   // Required, email của user được mời
  message?: string;                // Optional, tin nhắn kèm theo (max 500 chars)
  role?: 'MEMBER' | 'LEADER';      // Optional, default: 'MEMBER'
}
```

**Example Request:**
```bash
curl -X POST "http://localhost:8080/api/teams/123/invitations" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "developer@company.com",
    "message": "Chào bạn! Mình muốn mời bạn tham gia team Frontend Development. Chúng ta sẽ cùng làm việc trên các dự án React thú vị!",
    "role": "MEMBER"
  }'
```

**Example Response:**
```json
{
  "id": 789,
  "teamId": 123,
  "inviterEmail": "leader@company.com",
  "inviteeEmail": "developer@company.com", 
  "message": "Chào bạn! Mình muốn mời bạn tham gia team Frontend Development...",
  "role": "MEMBER",
  "status": "PENDING",               // PENDING | ACCEPTED | REJECTED
  "sentAt": "2024-01-22T11:00:00.000Z",
  "expiresAt": "2024-01-29T11:00:00.000Z"
}
```

**Invitation Flow:**
1. Leader gửi invitation qua API
2. System gửi email notification đến invitee
3. Invitee click link trong email để accept/reject
4. Nếu accept, user được thêm vào team as member

---

### 3. Add Member Directly (by User ID)

#### `POST /api/teams/{teamId}/members`

**Description**: Thêm user vào team trực tiếp (nếu biết User ID)

**Authorization**: Chỉ team leader mới có quyền thêm members

**Request Body:**
```typescript
interface AddMemberRequestDto {
  userId: number;                  // Required, ID của user
  role?: 'MEMBER' | 'LEADER';      // Optional, default: 'MEMBER'
}
```

**Example Request:**
```bash
curl -X POST "http://localhost:8080/api/teams/123/members" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 789,
    "role": "MEMBER"
  }'
```

**Example Response:**
```json
{
  "id": 999,
  "teamId": 123,
  "userId": 789,
  "userEmail": "developer@company.com",
  "userName": "John Developer",
  "role": "MEMBER",
  "joinedAt": "2024-01-22T11:30:00.000Z"
}
```

---

### 4. Get Team Members

#### `GET /api/teams/{teamId}/members`

**Description**: Lấy danh sách tất cả members trong team

**Authorization**: Team members và leaders có thể xem

**Example Request:**
```bash
curl -X GET "http://localhost:8080/api/teams/123/members" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Example Response:**
```json
[
  {
    "id": 1,
    "userId": 456,
    "userEmail": "leader@company.com",
    "userName": "Team Leader",
    "role": "LEADER",
    "joinedAt": "2024-01-22T10:30:00.000Z",
    "isCreator": true
  },
  {
    "id": 2,
    "userId": 789,
    "userEmail": "developer@company.com", 
    "userName": "John Developer",
    "role": "MEMBER",
    "joinedAt": "2024-01-22T11:30:00.000Z",
    "isCreator": false
  },
  {
    "id": 3,
    "userId": 101,
    "userEmail": "designer@company.com",
    "userName": "Jane Designer", 
    "role": "MEMBER",
    "joinedAt": "2024-01-22T12:00:00.000Z",
    "isCreator": false
  }
]
```

---

### 5. Remove Team Member

#### `DELETE /api/teams/{teamId}/members/{memberId}`

**Description**: Xóa member khỏi team

**Authorization**: CHỈ team leader mới có quyền xóa members

**URL Parameters:**
- `teamId` (number, required): ID của team
- `memberId` (number, required): ID của team member (không phải user ID)

**Example Request:**
```bash
curl -X DELETE "http://localhost:8080/api/teams/123/members/999" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Success Response (204):** No content

**Error Responses:**
```typescript
// 403 Forbidden - Not team leader
{
  "timestamp": "2024-01-22T12:00:00.000Z",
  "status": 403,
  "error": "Forbidden",
  "message": "Only team leader can remove members",
  "path": "/api/teams/123/members/999"
}

// 404 Not Found - Member not found
{
  "timestamp": "2024-01-22T12:00:00.000Z", 
  "status": 404,
  "error": "Not Found",
  "message": "Team member not found with id: 999",
  "path": "/api/teams/123/members/999"
}
```

---

### 6. Update Team Information

#### `PUT /api/teams/{teamId}`

**Description**: Cập nhật thông tin team

**Authorization**: CHỈ team leader mới có quyền update

**Request Body:**
```typescript
interface UpdateTeamRequestDto {
  name?: string;                   // Optional, tên team mới
  description?: string;            // Optional, mô tả mới
  leaderId?: number;               // Optional, transfer leadership
}
```

**Example Request:**
```bash
curl -X PUT "http://localhost:8080/api/teams/123" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Frontend & UI/UX Team",
    "description": "Team phát triển frontend và thiết kế UX/UI cho các sản phẩm web"
  }'
```

---

### 7. Delete Team

#### `DELETE /api/teams/{teamId}`

**Description**: Xóa team hoàn toàn

**Authorization**: CHỈ team leader (người tạo) mới có quyền xóa

**Example Request:**
```bash
curl -X DELETE "http://localhost:8080/api/teams/123" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Success Response:**
```json
{
  "message": "Team deleted successfully",
  "teamId": 123,
  "deletedAt": "2024-01-22T15:00:00.000Z"
}
```

---

## 🔐 Permission Matrix (Leader vs Member)

### Complete Authorization Rules

| Action | Team Leader | Team Member | Non-Member |
|--------|-------------|-------------|------------|
| **View team info** | ✅ | ✅ | ❌ |
| **View team members** | ✅ | ✅ | ❌ |
| **Create team** | ✅ | ✅ | ✅ |
| **Update team info** | ✅ | ❌ | ❌ |
| **Delete team** | ✅ | ❌ | ❌ |
| **Invite members** | ✅ | ❌ | ❌ |
| **Add members directly** | ✅ | ❌ | ❌ |
| **Remove members** | ✅ | ❌ | ❌ |
| **Transfer leadership** | ✅ | ❌ | ❌ |
| **Assign projects to team** | ✅ | ❌ | ❌ |
| **Remove projects from team** | ✅ | ❌ | ❌ |
| **View team projects** | ✅ | ✅ | ❌ |
| **Create tasks in team projects** | ✅ | ✅ | ❌ |
| **Leave team** | ✅* | ✅ | ❌ |

*Leader can leave team only after transferring leadership to another member

---

## 📋 Team Management Workflow

### Complete User Journey

#### 1. **Tạo Team (Leader Perspective)**
```typescript
// Step 1: Create team
const newTeam = await apiService.createTeam({
  name: "My Development Team",
  description: "Team for web development projects"
});
// User automatically becomes leader

// Step 2: Invite members by email
await apiService.inviteTeamMember(newTeam.id, {
  email: "dev1@company.com",
  message: "Join our development team!",
  role: "MEMBER"
});

// Step 3: Add existing users directly
await apiService.addTeamMember(newTeam.id, {
  userId: 456,
  role: "MEMBER"
});

// Step 4: Assign projects to team
await apiService.updateProject(projectId, {
  teamId: newTeam.id,
  isPersonal: false
});
```

#### 2. **Join Team (Member Perspective)**
```typescript
// Member receives email invitation
// Clicks accept link in email
// System automatically adds them to team

// Or leader adds them directly
// Member can view team info
const teamInfo = await apiService.getTeamById(teamId);
const teamMembers = await apiService.getTeamMembers(teamId);
const teamProjects = await apiService.getTeamProjects(teamId);
```

#### 3. **Team Management (Leader Only)**
```typescript
// View team dashboard
const team = await apiService.getTeamById(teamId);
const members = await apiService.getTeamMembers(teamId);
const projects = await apiService.getTeamProjects(teamId);

// Manage members
await apiService.removeTeamMember(teamId, memberId);
await apiService.inviteTeamMember(teamId, {
  email: "newmember@company.com"
});

// Manage team info
await apiService.updateTeam(teamId, {
  name: "Updated Team Name",
  description: "New description"
});

// Transfer leadership (if needed)
await apiService.updateTeam(teamId, {
  leaderId: newLeaderId
});

// Delete team (last resort)
await apiService.deleteTeam(teamId);
```

---

## 🎯 Frontend Integration Examples

### Team Management Component

```tsx
// components/TeamManagement.tsx
import React, { useState, useEffect } from 'react';
import { useTeamManagement } from '../hooks/useTeamManagement';

const TeamManagement: React.FC<{ teamId: number }> = ({ teamId }) => {
  const {
    team,
    members,
    loading,
    error,
    inviteMember,
    removeMember,
    updateTeam,
    deleteTeam
  } = useTeamManagement(teamId);

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await inviteMember({
        email: inviteEmail,
        message: inviteMessage,
        role: 'MEMBER'
      });
      setInviteEmail('');
      setInviteMessage('');
      alert('Invitation sent successfully!');
    } catch (error) {
      alert('Failed to send invitation');
    }
  };

  const handleRemoveMember = async (memberId: number) => {
    if (confirm('Are you sure you want to remove this member?')) {
      try {
        await removeMember(memberId);
        alert('Member removed successfully');
      } catch (error) {
        alert('Failed to remove member');
      }
    }
  };

  if (loading) return <div>Loading team...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!team) return <div>Team not found</div>;

  const isLeader = team.leaderId === getCurrentUserId();

  return (
    <div className="team-management">
      <div className="team-header">
        <h2>{team.name}</h2>
        <p>{team.description}</p>
        {isLeader && (
          <button onClick={() => setShowEditModal(true)}>
            Edit Team
          </button>
        )}
      </div>

      <div className="team-members">
        <h3>Members ({members.length})</h3>
        <div className="members-list">
          {members.map(member => (
            <div key={member.id} className="member-card">
              <div className="member-info">
                <span className="member-name">{member.userName}</span>
                <span className="member-email">{member.userEmail}</span>
                <span className={`member-role ${member.role.toLowerCase()}`}>
                  {member.role}
                </span>
              </div>
              {isLeader && member.role !== 'LEADER' && (
                <button 
                  onClick={() => handleRemoveMember(member.id)}
                  className="remove-button"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {isLeader && (
        <div className="invite-section">
          <h3>Invite New Member</h3>
          <form onSubmit={handleInviteMember}>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="member@company.com"
                required
              />
            </div>
            <div className="form-group">
              <label>Invitation Message (Optional)</label>
              <textarea
                value={inviteMessage}
                onChange={(e) => setInviteMessage(e.target.value)}
                placeholder="Join our team to work on exciting projects!"
                maxLength={500}
              />
            </div>
            <button type="submit">Send Invitation</button>
          </form>
        </div>
      )}

      {isLeader && (
        <div className="danger-zone">
          <h3>Danger Zone</h3>
          <button 
            onClick={() => handleDeleteTeam()}
            className="delete-button"
          >
            Delete Team
          </button>
        </div>
      )}
    </div>
  );
};
```

### Team Management Hook

```typescript
// hooks/useTeamManagement.ts
import { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';

export const useTeamManagement = (teamId: number) => {
  const [team, setTeam] = useState<TeamResponseDto | null>(null);
  const [members, setMembers] = useState<TeamMemberDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeamData = async () => {
    try {
      setLoading(true);
      const [teamData, membersData] = await Promise.all([
        apiService.getTeamById(teamId),
        apiService.getTeamMembers(teamId)
      ]);
      setTeam(teamData);
      setMembers(membersData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inviteMember = async (inviteData: TeamInvitationRequestDto) => {
    const token = getAuthToken();
    await apiService.inviteTeamMember(teamId, inviteData, token);
    await fetchTeamData(); // Refresh data
  };

  const removeMember = async (memberId: number) => {
    const token = getAuthToken();
    await apiService.removeTeamMember(teamId, memberId, token);
    await fetchTeamData(); // Refresh data
  };

  const updateTeam = async (updateData: UpdateTeamRequestDto) => {
    const token = getAuthToken();
    const updatedTeam = await apiService.updateTeam(teamId, updateData, token);
    setTeam(updatedTeam);
  };

  const deleteTeam = async () => {
    const token = getAuthToken();
    await apiService.deleteTeam(teamId, token);
    // Redirect to teams list
    window.location.href = '/teams';
  };

  useEffect(() => {
    fetchTeamData();
  }, [teamId]);

  return {
    team,
    members,
    loading,
    error,
    inviteMember,
    removeMember,
    updateTeam,
    deleteTeam,
    refetch: fetchTeamData
  };
};
```

---

## 📝 Key Points Summary

### ✅ **Quyền của Team Creator/Leader:**
- Tạo team và tự động trở thành leader
- Mời members qua email hoặc thêm trực tiếp
- Xóa members khỏi team
- Update thông tin team
- Assign/remove projects cho team
- Xóa toàn bộ team (chỉ leader)

### ✅ **Quyền của Team Members:**
- Xem thông tin team và members
- Tham gia vào team projects
- Tạo tasks trong team projects
- Leave team (tự rời khỏi team)

### ❌ **Members KHÔNG thể:**
- Xóa team
- Mời hoặc xóa members khác
- Update thông tin team
- Assign/remove projects

### 🔄 **Team Workflow:**
1. **Tạo team** → Tự động là leader
2. **Mời members** → Qua email hoặc user ID  
3. **Quản lý projects** → Assign cho team
4. **Collaborate** → Members work together
5. **Manage** → Leader controls permissions

---

## 🧪 Testing & Quality Assurance

### Unit Testing Examples

```typescript
// __tests__/apiService.test.ts
import { apiService, ApiError } from '../services/apiService';
import { TeamResponseDto, ProjectResponseDto } from '../types/api.types';

// Mock fetch
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('ApiService', () => {
  const mockToken = 'mock-jwt-token';

  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('getCurrentUserTeams', () => {
    it('should return teams successfully', async () => {
      const mockTeams: TeamResponseDto[] = [
        {
          id: 1,
          name: 'Test Team',
          description: 'Test Description',
          leaderId: 123,
          createdById: 123,
          isDefaultWorkspace: false,
          organizationId: 456,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTeams,
      } as Response);

      const result = await apiService.getCurrentUserTeams(mockToken);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/users/me/teams',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockToken}`,
            'Content-Type': 'application/json',
          }),
        })
      );
      expect(result).toEqual(mockTeams);
    });

    it('should throw ApiError on 401 response', async () => {
      const errorResponse = {
        timestamp: '2024-01-01T00:00:00.000Z',
        status: 401,
        error: 'Unauthorized',
        message: 'JWT token is invalid',
        path: '/api/users/me/teams',
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => errorResponse,
      } as Response);

      await expect(apiService.getCurrentUserTeams(mockToken))
        .rejects
        .toThrow(ApiError);
    });
  });

  describe('createTeam', () => {
    it('should create team successfully', async () => {
      const createTeamData = {
        name: 'New Team',
        description: 'New team description',
        leader_id: 123,
      };

      const mockCreatedTeam: TeamResponseDto = {
        id: 2,
        name: createTeamData.name,
        description: createTeamData.description,
        leaderId: createTeamData.leader_id,
        createdById: 123,
        isDefaultWorkspace: false,
        organizationId: null,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockCreatedTeam,
      } as Response);

      const result = await apiService.createTeam(createTeamData, mockToken);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/teams',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockToken}`,
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify(createTeamData),
        })
      );
      expect(result).toEqual(mockCreatedTeam);
    });
  });
});
```

### Integration Testing

```typescript
// __tests__/useUserTeamsProjects.test.tsx
import { renderHook, waitFor } from '@testing-library/react';
import { useUserTeamsProjects } from '../hooks/useUserTeamsProjects';
import { apiService } from '../services/apiService';

// Mock the API service
jest.mock('../services/apiService');
const mockApiService = apiService as jest.Mocked<typeof apiService>;

// Mock useSession
jest.mock('next-auth/react', () => ({
  useSession: () => ({
    data: { accessToken: 'mock-token' },
  }),
}));

describe('useUserTeamsProjects', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('should fetch teams and projects on mount', async () => {
    const mockTeams = [{ id: 1, name: 'Test Team' }];
    const mockProjects = [{ id: 1, name: 'Test Project' }];

    mockApiService.getCurrentUserTeams.mockResolvedValue(mockTeams as any);
    mockApiService.getCurrentUserProjects.mockResolvedValue(mockProjects as any);

    const { result } = renderHook(() => useUserTeamsProjects());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.teams).toEqual(mockTeams);
    expect(result.current.projects).toEqual(mockProjects);
    expect(result.current.error).toBeNull();
  });

  it('should handle API errors gracefully', async () => {
    mockApiService.getCurrentUserTeams.mockRejectedValue(
      new Error('Network error')
    );

    const { result } = renderHook(() => useUserTeamsProjects());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe(
      'Network error. Please check your connection and try again.'
    );
  });
});
```

### E2E Testing with Cypress

```typescript
// cypress/e2e/user-dashboard.cy.ts
describe('User Dashboard', () => {
  beforeEach(() => {
    // Mock API responses
    cy.intercept('GET', '/api/users/me/teams', {
      fixture: 'teams.json'
    }).as('getTeams');
    
    cy.intercept('GET', '/api/users/me/projects', {
      fixture: 'projects.json'
    }).as('getProjects');

    // Login and visit dashboard
    cy.login();
    cy.visit('/dashboard');
  });

  it('should display user teams and projects', () => {
    cy.wait(['@getTeams', '@getProjects']);

    // Check teams section
    cy.get('[data-testid="teams-section"]').should('be.visible');
    cy.get('[data-testid="team-card"]').should('have.length.greaterThan', 0);

    // Check projects section
    cy.get('[data-testid="projects-section"]').should('be.visible');
    cy.get('[data-testid="project-card"]').should('have.length.greaterThan', 0);
  });

  it('should create a new team', () => {
    cy.intercept('POST', '/api/teams', {
      statusCode: 200,
      body: { id: 99, name: 'New Team', description: 'Test team' }
    }).as('createTeam');

    cy.get('[data-testid="create-team-button"]').click();
    cy.get('[data-testid="team-name-input"]').type('New Team');
    cy.get('[data-testid="team-description-input"]').type('Test team');
    cy.get('[data-testid="submit-team-button"]').click();

    cy.wait('@createTeam');
    cy.get('[data-testid="team-card"]').should('contain', 'New Team');
  });

  it('should handle API errors gracefully', () => {
    cy.intercept('GET', '/api/users/me/teams', {
      statusCode: 500,
      body: { message: 'Internal server error' }
    }).as('getTeamsError');

    cy.visit('/dashboard');
    cy.wait('@getTeamsError');

    cy.get('[data-testid="error-message"]')
      .should('be.visible')
      .and('contain', 'Server error');
  });
});
```

---

## 📝 Production Best Practices

### 1. **API Endpoint Selection Strategy**
```typescript
// Recommended endpoint usage hierarchy
const ENDPOINT_PREFERENCES = {
  // ✅ First choice: Convenience endpoints
  getCurrentUserData: '/api/users/me/teams',
  
  // ✅ Second choice: Specific user endpoints (admin only)
  getUserData: '/api/users/{id}/teams',
  
  // ✅ Third choice: Granular endpoints (specific use cases)
  getCreatedOnly: '/api/users/{id}/teams/created',
  getOwnedOnly: '/api/users/{id}/projects/owned',
};
```

### 2. **Advanced Error Handling Strategy**
```typescript
// Error handling with retry logic and user feedback
class ErrorHandler {
  static handleApiError(error: ApiError, context: string): string {
    // Log error for monitoring
    console.error(`API Error in ${context}:`, error);
    
    // Send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Sentry.captureException(error);
    }

    // Return user-friendly message
    switch (error.status) {
      case 400:
        return 'Invalid request. Please check your input and try again.';
      case 401:
        // Trigger logout
        window.location.href = '/login';
        return 'Session expired. Redirecting to login...';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 429:
        return 'Too many requests. Please wait a moment and try again.';
      case 500:
        return 'Server error. Our team has been notified.';
      default:
        return error.response.message || 'An unexpected error occurred.';
    }
  }

  static withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const attempt = async (attemptsLeft: number) => {
        try {
          const result = await operation();
          resolve(result);
        } catch (error) {
          if (attemptsLeft > 0 && this.isRetriableError(error)) {
            setTimeout(() => attempt(attemptsLeft - 1), delay);
          } else {
            reject(error);
          }
        }
      };
      attempt(maxRetries);
    });
  }

  private static isRetriableError(error: any): boolean {
    return error instanceof ApiError && 
           [408, 429, 500, 502, 503, 504].includes(error.status);
  }
}
```

### 3. **Performance Optimization**
```typescript
// Advanced caching with cache invalidation
class CacheManager {
  private static readonly CACHE_PREFIX = 'taskflow_';
  private static readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  static set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    try {
      const cacheData = {
        data,
        timestamp: Date.now(),
        ttl,
      };
      localStorage.setItem(
        `${this.CACHE_PREFIX}${key}`, 
        JSON.stringify(cacheData)
      );
    } catch (error) {
      console.warn('Cache write failed:', error);
    }
  }

  static get<T>(key: string): T | null {
    try {
      const cached = localStorage.getItem(`${this.CACHE_PREFIX}${key}`);
      if (!cached) return null;

      const { data, timestamp, ttl } = JSON.parse(cached);
      
      if (Date.now() - timestamp > ttl) {
        this.remove(key);
        return null;
      }

      return data;
    } catch (error) {
      console.warn('Cache read failed:', error);
      return null;
    }
  }

  static remove(key: string): void {
    localStorage.removeItem(`${this.CACHE_PREFIX}${key}`);
  }

  static clear(): void {
    Object.keys(localStorage)
      .filter(key => key.startsWith(this.CACHE_PREFIX))
      .forEach(key => localStorage.removeItem(key));
  }

  // Cache invalidation strategies
  static invalidateUserData(userId: number): void {
    this.remove(`user_${userId}_teams`);
    this.remove(`user_${userId}_projects`);
  }

  static invalidateTeamData(teamId: number): void {
    // Invalidate all user caches that might contain this team
    this.clear(); // Simple approach - invalidate all
  }
}
```

### 4. **State Management Integration**
```typescript
// Redux Toolkit integration example
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunks
export const fetchUserTeams = createAsyncThunk(
  'userDashboard/fetchTeams',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState() as RootState;
      return await apiService.getCurrentUserTeams(auth.token);
    } catch (error) {
      return rejectWithValue(error.response);
    }
  }
);

export const createTeam = createAsyncThunk(
  'userDashboard/createTeam',
  async (teamData: CreateTeamRequestDto, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState() as RootState;
      return await apiService.createTeam(teamData, auth.token);
    } catch (error) {
      return rejectWithValue(error.response);
    }
  }
);

// Slice
const userDashboardSlice = createSlice({
  name: 'userDashboard',
  initialState: {
    teams: [] as TeamResponseDto[],
    projects: [] as ProjectResponseDto[],
    loading: false,
    error: null as string | null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserTeams.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserTeams.fulfilled, (state, action) => {
        state.loading = false;
        state.teams = action.payload;
      })
      .addCase(fetchUserTeams.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch teams';
      })
      .addCase(createTeam.fulfilled, (state, action) => {
        state.teams.unshift(action.payload);
      });
  },
});
```

### 5. **Security Best Practices**
```typescript
// Secure token management
class TokenManager {
  private static readonly TOKEN_KEY = 'auth_token';
  private static readonly REFRESH_TOKEN_KEY = 'refresh_token';

  static setTokens(accessToken: string, refreshToken: string): void {
    // Use httpOnly cookies for production
    if (process.env.NODE_ENV === 'production') {
      // Set httpOnly cookies via API call
      this.setSecureCookie('access_token', accessToken);
      this.setSecureCookie('refresh_token', refreshToken);
    } else {
      // Use localStorage for development
      localStorage.setItem(this.TOKEN_KEY, accessToken);
      localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    }
  }

  static getAccessToken(): string | null {
    if (process.env.NODE_ENV === 'production') {
      return this.getSecureCookie('access_token');
    }
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static clearTokens(): void {
    if (process.env.NODE_ENV === 'production') {
      this.clearSecureCookie('access_token');
      this.clearSecureCookie('refresh_token');
    } else {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    }
  }

  private static setSecureCookie(name: string, value: string): void {
    document.cookie = `${name}=${value}; httpOnly; secure; sameSite=strict`;
  }

  private static getSecureCookie(name: string): string | null {
    // Implementation depends on your cookie strategy
    return null;
  }

  private static clearSecureCookie(name: string): void {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; httpOnly; secure; sameSite=strict`;
  }
}
```

### 6. **Monitoring & Analytics**
```typescript
// API performance monitoring
class ApiMonitor {
  static trackApiCall(endpoint: string, method: string, duration: number, status: number): void {
    // Send metrics to monitoring service
    if (window.gtag) {
      window.gtag('event', 'api_call', {
        endpoint,
        method,
        duration,
        status,
        custom_map: {
          metric1: 'api_response_time',
        },
      });
    }

    // Log slow requests
    if (duration > 2000) {
      console.warn(`Slow API request: ${method} ${endpoint} took ${duration}ms`);
    }
  }

  static trackError(error: ApiError, context: string): void {
    // Send error to monitoring service
    if (window.Sentry) {
      window.Sentry.captureException(error, {
        tags: {
          context,
          endpoint: error.response.path,
          status: error.status,
        },
      });
    }
  }
}

// Usage in API service
class MonitoredApiService extends ApiService {
  protected async request<T>(
    endpoint: string, 
    token: string, 
    options?: RequestInit
  ): Promise<T> {
    const startTime = Date.now();
    const method = options?.method || 'GET';

    try {
      const result = await super.request<T>(endpoint, token, options);
      
      ApiMonitor.trackApiCall(
        endpoint, 
        method, 
        Date.now() - startTime, 
        200
      );

      return result;
    } catch (error) {
      if (error instanceof ApiError) {
        ApiMonitor.trackApiCall(
          endpoint, 
          method, 
          Date.now() - startTime, 
          error.status
        );
        ApiMonitor.trackError(error, 'api_request');
      }
      throw error;
    }
  }
}
```

---

## 🧪 Testing Examples

### API Testing với curl

```bash
# Test với current user
curl -X GET "http://localhost:8080/api/users/me/teams" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Test với specific user (admin required)
curl -X GET "http://localhost:8080/api/users/123/projects" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Test error case (unauthorized)
curl -X GET "http://localhost:8080/api/users/999/teams" \
  -H "Authorization: Bearer INVALID_TOKEN"
```

---

## 📞 Support

Nếu có vấn đề gì với API, vui lòng:

1. **Check Authentication**: Đảm bảo JWT token còn hạn và đúng format
2. **Check Authorization**: User chỉ có thể truy cập data của chính mình
3. **Check User ID**: Đảm bảo userId tồn tại trong hệ thống
4. **Check Console**: Xem error message chi tiết trong browser console

**Contact Backend Team**: [Slack channel hoặc email]

---

## 🔄 Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2024-01-22 | Initial implementation với full CRUD endpoints |
