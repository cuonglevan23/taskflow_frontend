# User Teams & Projects API - Frontend Integration Guide

## Overview
API endpoints để lấy teams và projects của user hiện tại hoặc user khác. Hỗ trợ role-based authorization.

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

| Method | Endpoint | Description | Authorization |
|--------|----------|-------------|---------------|
| GET | `/api/users/me/teams` | Lấy teams của user hiện tại | Authenticated user |
| GET | `/api/users/me/projects` | Lấy projects của user hiện tại | Authenticated user |
| GET | `/api/users/{id}/teams` | Lấy teams của user khác | Own data or OWNER/ADMIN |
| GET | `/api/users/{id}/projects` | Lấy projects của user khác | Own data or OWNER/ADMIN |
| GET | `/api/users/{id}/teams/created` | Lấy teams do user tạo | Own data or OWNER/ADMIN |
| GET | `/api/users/{id}/projects/created` | Lấy projects do user tạo | Own data or OWNER/ADMIN |
| GET | `/api/users/{id}/projects/owned` | Lấy projects user sở hữu | Own data or OWNER/ADMIN |

---

## 🚀 Frontend Implementation

### 1. User hiện tại - Lấy Teams

**Endpoint:** `GET /api/users/me/teams`

**Axios Example:**
```typescript
const getMyTeams = async (): Promise<TeamResponseDto[]> => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/users/me/teams`,
      {
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data;
  } catch (error) {
    handleApiError(error, 'Failed to fetch user teams');
    throw error;
  }
};
```

**Fetch Example:**
```typescript
const getMyTeams = async (): Promise<TeamResponseDto[]> => {
  const response = await fetch(`${API_BASE_URL}/api/users/me/teams`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};
```

### 2. User hiện tại - Lấy Projects

**Endpoint:** `GET /api/users/me/projects`

**Axios Example:**
```typescript
const getMyProjects = async (): Promise<ProjectResponseDto[]> => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/users/me/projects`,
      {
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data;
  } catch (error) {
    handleApiError(error, 'Failed to fetch user projects');
    throw error;
  }
};
```

### 3. User khác - Lấy Teams (Admin/Owner only)

**Endpoint:** `GET /api/users/{id}/teams`

**Axios Example:**
```typescript
const getUserTeams = async (userId: number): Promise<TeamResponseDto[]> => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/users/${userId}/teams`,
      {
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data;
  } catch (error) {
    if (error.response?.status === 403) {
      throw new Error('Access denied: You can only view your own teams or need OWNER/ADMIN role');
    }
    handleApiError(error, 'Failed to fetch user teams');
    throw error;
  }
};
```

### 4. User khác - Lấy Projects (Admin/Owner only)

**Endpoint:** `GET /api/users/{id}/projects`

**Axios Example:**
```typescript
const getUserProjects = async (userId: number): Promise<ProjectResponseDto[]> => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/users/${userId}/projects`,
      {
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data;
  } catch (error) {
    if (error.response?.status === 403) {
      throw new Error('Access denied: You can only view your own projects or need OWNER/ADMIN role');
    }
    handleApiError(error, 'Failed to fetch user projects');
    throw error;
  }
};
```

---

## 📦 TypeScript Interfaces

### TeamResponseDto
```typescript
interface TeamResponseDto {
  id: number;
  name: string;
  description: string;
  leaderId: number | null;
  createdById: number | null;
  isDefaultWorkspace: boolean;
  organizationId: number | null;
  createdAt: string; // ISO datetime string
  updatedAt: string; // ISO datetime string
}
```

### ProjectResponseDto
```typescript
interface ProjectResponseDto {
  id: number;
  name: string;
  description: string;
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD' | 'CANCELLED';
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  ownerId: number | null;
  organizationId: number | null;
  teamId: number | null;
  createdById: number | null;
  isPersonal: boolean;
  createdAt: string; // ISO datetime string
  updatedAt: string; // ISO datetime string
}
```

---

## 🎯 React Hooks Examples

### useUserTeams Hook
```typescript
import { useState, useEffect } from 'react';
import { TeamResponseDto } from '../types/api.types';
import { getMyTeams } from '../services/api.service';

export const useUserTeams = () => {
  const [teams, setTeams] = useState<TeamResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setLoading(true);
        setError(null);
        const userTeams = await getMyTeams();
        setTeams(userTeams);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch teams');
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);

  const refetch = async () => {
    await fetchTeams();
  };

  return { teams, loading, error, refetch };
};
```

### useUserProjects Hook
```typescript
import { useState, useEffect } from 'react';
import { ProjectResponseDto } from '../types/api.types';
import { getMyProjects } from '../services/api.service';

export const useUserProjects = () => {
  const [projects, setProjects] = useState<ProjectResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError(null);
        const userProjects = await getMyProjects();
        setProjects(userProjects);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch projects');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const refetch = async () => {
    await fetchProjects();
  };

  return { projects, loading, error, refetch };
};
```

### Combined Hook
```typescript
import { useState, useEffect } from 'react';
import { TeamResponseDto, ProjectResponseDto } from '../types/api.types';
import { getMyTeams, getMyProjects } from '../services/api.service';

export const useUserData = () => {
  const [teams, setTeams] = useState<TeamResponseDto[]>([]);
  const [projects, setProjects] = useState<ProjectResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [userTeams, userProjects] = await Promise.all([
          getMyTeams(),
          getMyProjects()
        ]);
        
        setTeams(userTeams);
        setProjects(userProjects);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const refetch = async () => {
    await fetchUserData();
  };

  return { teams, projects, loading, error, refetch };
};
```

---

## 🛠 Utility Functions

### API Configuration
```typescript
// config/api.config.ts
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

export const getToken = (): string => {
  const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  return token;
};

export const getAuthHeaders = () => ({
  'Authorization': `Bearer ${getToken()}`,
  'Content-Type': 'application/json'
});
```

### Error Handling
```typescript
// utils/error.utils.ts
export const handleApiError = (error: any, defaultMessage: string) => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    
    switch (status) {
      case 401:
        // Redirect to login
        window.location.href = '/login';
        break;
      case 403:
        console.error('Access denied:', data.message || 'Insufficient permissions');
        break;
      case 404:
        console.error('Resource not found:', data.message);
        break;
      case 500:
        console.error('Server error:', data.message);
        break;
      default:
        console.error('API Error:', data.message || defaultMessage);
    }
  } else if (error.request) {
    // Network error
    console.error('Network error:', defaultMessage);
  } else {
    // Other error
    console.error('Error:', error.message || defaultMessage);
  }
};
```

---

## 📝 Response Examples

### Successful Teams Response
```json
[
  {
    "id": 1,
    "name": "Development Team",
    "description": "Main frontend development team",
    "leaderId": 21,
    "createdById": 21,
    "isDefaultWorkspace": false,
    "organizationId": 1,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  {
    "id": 2,
    "name": "QA Team",
    "description": "Quality assurance team",
    "leaderId": 22,
    "createdById": 21,
    "isDefaultWorkspace": false,
    "organizationId": 1,
    "createdAt": "2024-01-16T09:15:00.000Z",
    "updatedAt": "2024-01-16T09:15:00.000Z"
  }
]
```

### Successful Projects Response
```json
[
  {
    "id": 1,
    "name": "Task Management App",
    "description": "Project management application with team collaboration",
    "status": "IN_PROGRESS",
    "startDate": "2024-01-01",
    "endDate": "2024-06-01",
    "ownerId": 21,
    "organizationId": 1,
    "teamId": 1,
    "createdById": 21,
    "isPersonal": false,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-20T14:20:00.000Z"
  },
  {
    "id": 2,
    "name": "Personal Todo List",
    "description": "My personal task tracking",
    "status": "PLANNED",
    "startDate": "2024-02-01",
    "endDate": "2024-03-01",
    "ownerId": 21,
    "organizationId": null,
    "teamId": null,
    "createdById": 21,
    "isPersonal": true,
    "createdAt": "2024-01-18T11:00:00.000Z",
    "updatedAt": "2024-01-18T11:00:00.000Z"
  }
]
```

---

## ⚠️ Error Responses

### 401 Unauthorized
```json
{
  "timestamp": "2024-01-20T10:30:00.000Z",
  "status": 401,
  "error": "Unauthorized",
  "message": "JWT token is expired or invalid",
  "path": "/api/users/me/teams"
}
```

### 403 Forbidden
```json
{
  "timestamp": "2024-01-20T10:30:00.000Z",
  "status": 403,
  "error": "Forbidden",
  "message": "Access denied: You can only view your own data or need OWNER/ADMIN role",
  "path": "/api/users/123/teams"
}
```

### 404 Not Found
```json
{
  "timestamp": "2024-01-20T10:30:00.000Z",
  "status": 404,
  "error": "Not Found",
  "message": "User not found with id: 999",
  "path": "/api/users/999/teams"
}
```

---

## 🔧 Testing with Postman/curl

### Test với curl
```bash
# Lấy teams của user hiện tại
curl -X GET "http://localhost:8080/api/users/me/teams" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"

# Lấy projects của user hiện tại  
curl -X GET "http://localhost:8080/api/users/me/projects" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"

# Lấy teams của user khác (cần quyền admin)
curl -X GET "http://localhost:8080/api/users/21/teams" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### Postman Collection
```json
{
  "info": {
    "name": "User Teams & Projects API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Get My Teams",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{jwt_token}}"
          },
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "url": {
          "raw": "{{base_url}}/api/users/me/teams",
          "host": ["{{base_url}}"],
          "path": ["api", "users", "me", "teams"]
        }
      }
    },
    {
      "name": "Get My Projects",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{jwt_token}}"
          },
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "url": {
          "raw": "{{base_url}}/api/users/me/projects",
          "host": ["{{base_url}}"],
          "path": ["api", "users", "me", "projects"]
        }
      }
    }
  ],
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:8080"
    },
    {
      "key": "jwt_token",
      "value": "YOUR_JWT_TOKEN_HERE"
    }
  ]
}
```

---

## 📋 Implementation Checklist

### Frontend Team Tasks:
- [ ] Implement TypeScript interfaces
- [ ] Create API service functions
- [ ] Develop React hooks
- [ ] Add error handling
- [ ] Implement loading states
- [ ] Add token management
- [ ] Test with different user roles
- [ ] Handle 403 errors for unauthorized access
- [ ] Implement data refresh functionality
- [ ] Add proper error messages for users

### Backend Requirements:
- [x] JWT authentication implemented
- [x] Role-based authorization working
- [x] CORS configured for frontend
- [x] API endpoints tested
- [x] Error responses standardized
- [x] Documentation completed

---

## 🚀 Quick Start

1. **Get JWT Token** từ login API
2. **Store token** trong localStorage/sessionStorage
3. **Import hooks** hoặc service functions
4. **Call APIs** với proper authentication headers
5. **Handle responses** và errors appropriately

**Recommended approach:** Sử dụng `/api/users/me/teams` và `/api/users/me/projects` cho hầu hết các use cases của frontend.