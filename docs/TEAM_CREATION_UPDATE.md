# Team Creation API Update - Frontend Integration Guide

## 🔄 Updated Team Creation Logic

### Key Changes Made in Backend

#### 1. **CreatedBy Field Logic**
```java
// Before (BUG)
.createdBy(dto.getLeader_id() != null ? getUser(dto.getLeader_id()) : null)

// After (FIXED)  
.createdBy(currentUser)  // Always current user from JWT
```

#### 2. **Leader Assignment Logic**
```java
// Before (BUG)
.leader(dto.getLeader_id() != null ? getUser(dto.getLeader_id()) : null)

// After (FIXED)
.leader(dto.getLeader_id() != null ? getUser(dto.getLeader_id()) : currentUser)
```

---

## 📋 Complete API Specification

### `POST /api/teams`

**Description**: Tạo team mới với logic creator/leader cải tiến

**Authentication**: JWT token required

**Request Body:**
```typescript
interface CreateTeamRequestDto {
  name: string;                    // Required, 2-255 characters
  description?: string;            // Optional, max 1000 characters  
  project_id?: number;             // Optional, assign existing project
  leader_id?: number;              // Optional, assign specific leader
}
```

**Backend Logic:**
- **createdBy**: Luôn là current user từ JWT token
- **leaderId**: 
  - Nếu `leader_id` = null/undefined → Current user làm leader
  - Nếu `leader_id` = valid user ID → User đó làm leader

---

## 🎯 Frontend Implementation Examples

### 1. Current User làm Leader (Default)

**Request:**
```bash
curl -X POST "http://localhost:8080/api/teams" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Development Team",
    "description": "Team for React/Node.js projects"
  }'
```

**Response:**
```json
{
  "id": 123,
  "name": "My Development Team", 
  "description": "Team for React/Node.js projects",
  "leaderId": 456,         // Current user (từ JWT) 
  "createdById": 456,      // Current user (từ JWT)
  "isDefaultWorkspace": false,
  "organizationId": null,
  "createdAt": "2024-01-22T10:30:00.000Z",
  "updatedAt": "2024-01-22T10:30:00.000Z"
}
```

### 2. Assign Leader Khác

**Request:**
```bash
curl -X POST "http://localhost:8080/api/teams" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Backend API Team",
    "description": "Team for Spring Boot development", 
    "leader_id": 789
  }'
```

**Response:**
```json
{
  "id": 124,
  "name": "Backend API Team",
  "description": "Team for Spring Boot development",
  "leaderId": 789,         // Assigned user làm leader
  "createdById": 456,      // Current user vẫn là creator
  "isDefaultWorkspace": false,
  "organizationId": null,
  "createdAt": "2024-01-22T10:35:00.000Z",
  "updatedAt": "2024-01-22T10:35:00.000Z"  
}
```

### 3. Team với Project Assignment

**Request:**
```bash
curl -X POST "http://localhost:8080/api/teams" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Project Alpha Team",
    "description": "Dedicated team for Project Alpha",
    "project_id": 555,
    "leader_id": 789
  }'
```

**Backend Auto-Processing:**
- Tạo team với leader_id = 789, createdBy = current user
- Assign project 555 cho team này
- Set project.isPersonal = false

---

## 💻 TypeScript Frontend Integration

### API Service Method

```typescript
// services/teamService.ts
interface CreateTeamRequest {
  name: string;
  description?: string;
  project_id?: number;
  leader_id?: number;
}

interface TeamResponse {
  id: number;
  name: string;
  description?: string;
  leaderId: number;
  createdById: number;
  isDefaultWorkspace: boolean;
  organizationId?: number;
  createdAt: string;
  updatedAt: string;
}

class TeamService {
  async createTeam(data: CreateTeamRequest, token: string): Promise<TeamResponse> {
    const response = await fetch('/api/teams', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to create team: ${response.status}`);
    }

    return response.json();
  }
}
```

### React Component Example

```tsx
// components/CreateTeamForm.tsx
import React, { useState } from 'react';
import { TeamService } from '../services/teamService';

interface CreateTeamFormProps {
  currentUserId: number;
  availableUsers: User[];
  availableProjects: Project[];
  onTeamCreated: (team: TeamResponse) => void;
}

const CreateTeamForm: React.FC<CreateTeamFormProps> = ({
  currentUserId,
  availableUsers,
  availableProjects,
  onTeamCreated
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    project_id: undefined as number | undefined,
    leader_id: undefined as number | undefined,
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('authToken');
      const team = await TeamService.createTeam(formData, token);
      
      onTeamCreated(team);
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        project_id: undefined,
        leader_id: undefined,
      });
      
      alert('Team created successfully!');
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="create-team-form">
      <div className="form-group">
        <label>Team Name *</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          required
          minLength={2}
          maxLength={255}
          placeholder="Enter team name"
        />
      </div>

      <div className="form-group">
        <label>Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          maxLength={1000}
          placeholder="Optional team description"
        />
      </div>

      <div className="form-group">
        <label>Team Leader</label>
        <select
          value={formData.leader_id || ''}
          onChange={(e) => setFormData({
            ...formData, 
            leader_id: e.target.value ? Number(e.target.value) : undefined
          })}
        >
          <option value="">I will be the leader</option>
          {availableUsers.filter(user => user.id !== currentUserId).map(user => (
            <option key={user.id} value={user.id}>
              {user.name} ({user.email})
            </option>
          ))}
        </select>
        <small>Leave empty to make yourself the leader</small>
      </div>

      <div className="form-group">
        <label>Assign Project (Optional)</label>
        <select
          value={formData.project_id || ''}
          onChange={(e) => setFormData({
            ...formData,
            project_id: e.target.value ? Number(e.target.value) : undefined
          })}
        >
          <option value="">No project assignment</option>
          {availableProjects.map(project => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Team'}
      </button>
    </form>
  );
};
```

---

## ✅ Key Benefits After Fix

### 1. **Proper Creator Tracking**
- createdBy luôn chính xác (current user từ JWT)
- Không còn null values

### 2. **Flexible Leadership**
- Creator có thể assign leader khác
- Creator vẫn có quyền quản lý dù không là leader

### 3. **Security Improvement**
- Tự động lấy user từ JWT token
- Không thể forge createdBy field

### 4. **Better UX**
- Frontend có thể hiển thị đúng creator
- Permission logic rõ ràng hơn

---

## 🧪 Testing Scenarios

### Test Case 1: Default Leadership
```bash
# Current user làm leader
POST /api/teams
{
  "name": "Test Team 1",
  "description": "Default leadership test"
}

# Expected: leaderId = createdById = current user ID
```

### Test Case 2: Assigned Leadership  
```bash
# Assign leader khác
POST /api/teams
{
  "name": "Test Team 2", 
  "description": "Assigned leadership test",
  "leader_id": 789
}

# Expected: leaderId = 789, createdById = current user ID
```

### Test Case 3: With Project Assignment
```bash
# Team + project assignment
POST /api/teams
{
  "name": "Test Team 3",
  "description": "Project assignment test", 
  "project_id": 555,
  "leader_id": 789
}

# Expected: Team created + Project 555 assigned to team
```

---

## 📞 Support

Nếu có vấn đề với team creation API:

1. **Check JWT token** - Đảm bảo token hợp lệ
2. **Verify user IDs** - leader_id phải tồn tại
3. **Check project IDs** - project_id phải tồn tại nếu truyền
4. **Validate input** - name là required field

**API Documentation**: `docs/USER_TEAMS_PROJECTS_API.md`