# HƯỚNG DẪN SỬ DỤNG API PROGRESS CHO FRONTEND

## Giới thiệu

Document này cung cấp hướng dẫn chi tiết về cách sử dụng các API liên quan đến progress cho teams và projects trong hệ thống. Được thiết kế đặc biệt cho frontend developers để dễ dàng tích hợp và hiển thị dữ liệu progress.

## Các API Progress Chính

### 1. Lấy Progress Cho Tất Cả Team Của User Hiện Tại (✨ NEW)

**Endpoint:**
```http
GET /api/teams/progress/all
```

**Mô tả:** API này trả về danh sách progress của **tất cả** team mà user hiện tại là thành viên. Đây là API mới nhất, giúp frontend hiển thị dashboard tổng quan về tất cả team của user mà không cần gọi nhiều API riêng lẻ.

**Headers Required:**
```
Authorization: Bearer {jwt_token}
```

**Response:**
```json
[
  {
    "id": 1,
    "teamId": 123,
    "teamName": "Backend Team",
    "totalTasks": 45,
    "completedTasks": 32,
    "completionPercentage": 71.11,
    "lastUpdated": "2024-08-25T01:54:09.209",
    "createdAt": "2024-08-20T10:00:00",
    "updatedAt": "2024-08-25T01:54:09.209",
    "teamOwner": {
      "userId": 456,
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "username": "johndoe",
      "jobTitle": "Team Lead",
      "department": "Engineering",
      "aboutMe": "Experienced developer",
      "status": "Active",
      "avatarUrl": "https://example.com/avatars/john.jpg",
      "isUpgraded": true,
      "displayName": "John Doe",
      "initials": "JD"
    },
    "teamMembers": [
      {
        "userId": 456,
        "email": "john@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "displayName": "John Doe",
        "initials": "JD",
        "avatarUrl": "https://example.com/avatars/john.jpg"
      },
      {
        "userId": 789,
        "email": "jane@example.com",
        "firstName": "Jane",
        "lastName": "Smith",
        "displayName": "Jane Smith",
        "initials": "JS",
        "avatarUrl": "https://example.com/avatars/jane.jpg"
      }
    ],
    "lastUpdatedBy": {
      "userId": 789,
      "email": "jane@example.com",
      "displayName": "Jane Smith",
      "initials": "JS",
      "avatarUrl": "https://example.com/avatars/jane.jpg"
    }
  },
  {
    "id": 2,
    "teamId": 124,
    "teamName": "Frontend Team",
    "totalTasks": 38,
    "completedTasks": 25,
    "completionPercentage": 65.79,
    "lastUpdated": "2024-08-24T15:32:21.103",
    "createdAt": "2024-08-15T09:30:00",
    "updatedAt": "2024-08-24T15:32:21.103",
    "teamOwner": { /* ... */ },
    "teamMembers": [ /* ... */ ],
    "lastUpdatedBy": { /* ... */ }
  }
]
```

**Frontend Implementation:**
```javascript
import { useState, useEffect } from 'react';

const TeamProgressDashboard = () => {
  const [allTeamsProgress, setAllTeamsProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchAllTeamsProgress = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/teams/progress/all', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch teams progress');
        }
        
        const data = await response.json();
        setAllTeamsProgress(data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching teams progress:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllTeamsProgress();
  }, []);
  
  if (loading) return <div>Loading teams progress...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div className="teams-progress-dashboard">
      <h1>My Teams Progress</h1>
      
      {allTeamsProgress.length === 0 ? (
        <p>You are not a member of any team yet.</p>
      ) : (
        <div className="teams-grid">
          {allTeamsProgress.map(team => (
            <div key={team.teamId} className="team-card">
              <h3>{team.teamName}</h3>
              
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${team.completionPercentage}%` }}
                />
                <span>
                  {team.completionPercentage.toFixed(1)}% 
                  ({team.completedTasks}/{team.totalTasks})
                </span>
              </div>
              
              <div className="team-members">
                <h4>Team Members ({team.teamMembers.length})</h4>
                <div className="avatar-group">
                  {team.teamMembers.slice(0, 5).map(member => (
                    <img 
                      key={member.userId}
                      src={member.avatarUrl || `/default-avatar/${member.initials}`}
                      alt={member.displayName}
                      title={member.displayName}
                      className="avatar"
                    />
                  ))}
                  {team.teamMembers.length > 5 && (
                    <div className="avatar more">
                      +{team.teamMembers.length - 5}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="team-footer">
                <span>Last updated: {new Date(team.lastUpdated).toLocaleString()}</span>
                {team.lastUpdatedBy && (
                  <span>by {team.lastUpdatedBy.displayName}</span>
                )}
              </div>
              
              <button 
                onClick={() => navigate(`/teams/${team.teamId}`)}
                className="view-details-btn"
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeamProgressDashboard;
```

### 2. Lấy Progress Cho Một Team Cụ Thể

**Endpoint:**
```http
GET /api/teams/{teamId}/progress
```

**Mô tả:** Lấy progress chi tiết cho một team cụ thể. Chỉ các thành viên của team mới có quyền truy cập.

**Path Parameters:**
- `teamId`: ID của team cần lấy progress

**Headers Required:**
```
Authorization: Bearer {jwt_token}
```

**Response:**
```json
{
  "id": 1,
  "teamId": 123,
  "teamName": "Backend Team",
  "totalTasks": 45,
  "completedTasks": 32,
  "completionPercentage": 71.11,
  "lastUpdated": "2024-08-25T01:54:09.209",
  "createdAt": "2024-08-20T10:00:00",
  "updatedAt": "2024-08-25T01:54:09.209",
  "teamOwner": { /* ... */ },
  "teamMembers": [ /* ... */ ],
  "lastUpdatedBy": { /* ... */ }
}
```

### 3. Lấy Progress Cho Một Project

**Endpoint:**
```http
GET /api/projects/{projectId}/progress
```

**Mô tả:** Lấy progress chi tiết cho một project cụ thể, bao gồm cả progress của từng team trong project đó (nếu có).

**Path Parameters:**
- `projectId`: ID của project cần lấy progress

**Headers Required:**
```
Authorization: Bearer {jwt_token}
```

**Response:**
```json
{
  "id": 1,
  "projectId": 456,
  "projectName": "Task Management System",
  "totalTasks": 18,
  "completedTasks": 17,
  "completionPercentage": 94.44,
  "totalTeams": 1,
  "lastUpdated": "2024-08-25T01:54:09.209",
  "createdAt": "2024-08-20T10:00:00",
  "updatedAt": "2024-08-25T01:54:09.209",
  "teamProjectProgressList": [
    {
      "id": 1,
      "teamId": 123,
      "teamName": "Backend Team",
      "projectId": 456,
      "projectName": "Task Management System",
      "totalTasks": 18,
      "completedTasks": 17,
      "completionPercentage": 94.44,
      "lastUpdated": "2024-08-25T01:54:09.209"
    }
  ],
  "projectCreator": { /* ... */ },
  "projectMembers": [ /* ... */ ],
  "lastUpdatedBy": { /* ... */ }
}
```

### 4. Manual Refresh Progress (nếu cần)

Tuy hệ thống đã có auto-update khi task status thay đổi, nhưng vẫn có thể force refresh progress nếu cần thiết.

**Endpoint cho Team Progress:**
```http
POST /api/teams/{teamId}/progress
```

**Endpoint cho Project Progress:**
```http
POST /api/projects/{projectId}/progress
```

## Cách Hiển Thị Progress Trong Frontend

### 1. Dashboard Overview - Hiển Thị Tất Cả Teams (Recommended)

Sử dụng API `/api/teams/progress/all` để hiển thị dashboard tổng quan về tất cả teams của user hiện tại:

```jsx
// TeamsDashboard.jsx
import React, { useEffect, useState } from 'react';
import { fetchAllTeamsProgress } from '../services/progressService';
import ProgressCard from '../components/ProgressCard';
import Spinner from '../components/Spinner';

const TeamsDashboard = () => {
  const [teamsProgress, setTeamsProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchAllTeamsProgress();
        setTeamsProgress(data);
      } catch (error) {
        console.error('Error loading teams progress:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  if (loading) return <Spinner />;
  
  // Sắp xếp teams theo % hoàn thành (cao đến thấp)
  const sortedTeams = [...teamsProgress].sort(
    (a, b) => b.completionPercentage - a.completionPercentage
  );
  
  return (
    <div className="teams-dashboard">
      <h1>My Teams</h1>
      
      <div className="teams-grid">
        {sortedTeams.map(team => (
          <ProgressCard
            key={team.teamId}
            id={team.teamId}
            name={team.teamName}
            type="team"
            completedTasks={team.completedTasks}
            totalTasks={team.totalTasks}
            completionPercentage={team.completionPercentage}
            lastUpdated={team.lastUpdated}
            members={team.teamMembers}
            owner={team.teamOwner}
            lastUpdatedBy={team.lastUpdatedBy}
          />
        ))}
      </div>
    </div>
  );
};

// progressService.js
export const fetchAllTeamsProgress = async () => {
  const response = await fetch('/api/teams/progress/all', {
    headers: {
      'Authorization': `Bearer ${getToken()}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch teams progress');
  }
  
  return await response.json();
};

// ProgressCard.jsx (component tái sử dụng cho cả team và project)
const ProgressCard = ({
  id,
  name,
  type, // 'team' hoặc 'project'
  completedTasks,
  totalTasks,
  completionPercentage,
  lastUpdated,
  members,
  owner,
  lastUpdatedBy
}) => {
  return (
    <div className={`progress-card ${type}-card`}>
      <h3>{name}</h3>
      
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${completionPercentage}%` }}
        />
        <span className="progress-text">
          {Math.round(completionPercentage)}%
        </span>
      </div>
      
      <div className="progress-details">
        <span>
          {completedTasks}/{totalTasks} tasks completed
        </span>
      </div>
      
      <div className="members-preview">
        {members.slice(0, 5).map(member => (
          <div 
            key={member.userId} 
            className="member-avatar"
            title={member.displayName}
          >
            {member.avatarUrl ? (
              <img src={member.avatarUrl} alt={member.displayName} />
            ) : (
              <div className="initials-avatar">{member.initials}</div>
            )}
          </div>
        ))}
        {members.length > 5 && (
          <div className="more-members">+{members.length - 5}</div>
        )}
      </div>
      
      <div className="card-footer">
        <span>Last updated: {new Date(lastUpdated).toLocaleDateString()}</span>
        {lastUpdatedBy && (
          <span className="updated-by">
            by {lastUpdatedBy.displayName}
          </span>
        )}
      </div>
      
      <button 
        className="view-details" 
        onClick={() => window.location.href = `/${type}s/${id}`}
      >
        View Details
      </button>
    </div>
  );
};
```

### 2. Team Detail Page - Hiển thị Projects trong Team

Khi user click vào một team từ dashboard, hiển thị chi tiết team đó với danh sách các projects trong team:

```jsx
// TeamDetailPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchTeamProgress, fetchTeamProjects } from '../services/progressService';
import ProgressBar from '../components/ProgressBar';
import ProjectsList from '../components/ProjectsList';
import MembersSection from '../components/MembersSection';

const TeamDetailPage = () => {
  const { teamId } = useParams();
  const [teamProgress, setTeamProgress] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        // Lấy team progress
        const progressData = await fetchTeamProgress(teamId);
        setTeamProgress(progressData);
        
        // Lấy danh sách projects của team
        const projectsData = await fetchTeamProjects(teamId);
        setProjects(projectsData);
      } catch (error) {
        console.error('Error loading team data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [teamId]);
  
  if (loading) return <div>Loading team details...</div>;
  if (!teamProgress) return <div>Team not found</div>;
  
  return (
    <div className="team-detail-page">
      <header className="team-header">
        <h1>{teamProgress.teamName}</h1>
        <div className="team-owner">
          <span>Team Owner: </span>
          <div className="user-info">
            {teamProgress.teamOwner.avatarUrl ? (
              <img 
                src={teamProgress.teamOwner.avatarUrl} 
                alt={teamProgress.teamOwner.displayName} 
                className="avatar"
              />
            ) : (
              <div className="avatar-initials">
                {teamProgress.teamOwner.initials}
              </div>
            )}
            <span>{teamProgress.teamOwner.displayName}</span>
          </div>
        </div>
      </header>
      
      <section className="team-progress-section">
        <h2>Overall Progress</h2>
        <ProgressBar 
          percentage={teamProgress.completionPercentage}
          label={`${teamProgress.completedTasks}/${teamProgress.totalTasks} tasks completed`}
        />
        <p className="last-updated">
          Last updated: {new Date(teamProgress.lastUpdated).toLocaleString()}
          {teamProgress.lastUpdatedBy && (
            <span> by {teamProgress.lastUpdatedBy.displayName}</span>
          )}
        </p>
      </section>
      
      <section className="team-projects-section">
        <h2>Projects ({projects.length})</h2>
        <ProjectsList projects={projects} />
      </section>
      
      <section className="team-members-section">
        <h2>Team Members ({teamProgress.teamMembers.length})</h2>
        <MembersSection members={teamProgress.teamMembers} />
      </section>
    </div>
  );
};

export const fetchTeamProgress = async (teamId) => {
  const response = await fetch(`/api/teams/${teamId}/progress`, {
    headers: {
      'Authorization': `Bearer ${getToken()}`
    }
  });
  
  if (!response.ok) {
    if (response.status === 403) {
      throw new Error('You do not have permission to view this team');
    }
    throw new Error('Failed to fetch team progress');
  }
  
  return await response.json();
};

export const fetchTeamProjects = async (teamId) => {
  const response = await fetch(`/api/teams/${teamId}/projects`, {
    headers: {
      'Authorization': `Bearer ${getToken()}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch team projects');
  }
  
  return await response.json();
};
```

### 3. Project Detail Page - Hiển thị Tasks và Teams

```jsx
// ProjectDetailPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchProjectProgress, fetchProjectTasks } from '../services/progressService';
import ProgressBar from '../components/ProgressBar';
import TasksList from '../components/TasksList';

const ProjectDetailPage = () => {
  const { projectId } = useParams();
  const [projectProgress, setProjectProgress] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        // Lấy project progress
        const progressData = await fetchProjectProgress(projectId);
        setProjectProgress(progressData);
        
        // Lấy danh sách tasks của project
        const tasksData = await fetchProjectTasks(projectId);
        setTasks(tasksData);
      } catch (error) {
        console.error('Error loading project data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [projectId]);
  
  if (loading) return <div>Loading project details...</div>;
  if (!projectProgress) return <div>Project not found</div>;
  
  return (
    <div className="project-detail-page">
      <header className="project-header">
        <h1>{projectProgress.projectName}</h1>
        {projectProgress.projectCreator && (
          <div className="project-creator">
            <span>Created by: </span>
            <div className="user-info">
              {projectProgress.projectCreator.avatarUrl ? (
                <img 
                  src={projectProgress.projectCreator.avatarUrl} 
                  alt={projectProgress.projectCreator.displayName} 
                  className="avatar"
                />
              ) : (
                <div className="avatar-initials">
                  {projectProgress.projectCreator.initials}
                </div>
              )}
              <span>{projectProgress.projectCreator.displayName}</span>
            </div>
          </div>
        )}
      </header>
      
      <section className="project-progress-section">
        <h2>Project Progress</h2>
        <ProgressBar 
          percentage={projectProgress.completionPercentage}
          label={`${projectProgress.completedTasks}/${projectProgress.totalTasks} tasks completed`}
        />
        <p className="last-updated">
          Last updated: {new Date(projectProgress.lastUpdated).toLocaleString()}
          {projectProgress.lastUpdatedBy && (
            <span> by {projectProgress.lastUpdatedBy.displayName}</span>
          )}
        </p>
      </section>
      
      {projectProgress.teamProjectProgressList && 
       projectProgress.teamProjectProgressList.length > 0 && (
        <section className="teams-progress-section">
          <h2>Teams Progress</h2>
          {projectProgress.teamProjectProgressList.map(teamProgress => (
            <div key={teamProgress.teamId} className="team-progress-item">
              <h3>{teamProgress.teamName}</h3>
              <ProgressBar 
                percentage={teamProgress.completionPercentage}
                label={`${teamProgress.completedTasks}/${teamProgress.totalTasks} tasks`}
              />
            </div>
          ))}
        </section>
      )}
      
      <section className="project-tasks-section">
        <h2>Tasks ({tasks.length})</h2>
        <TasksList 
          tasks={tasks} 
          onTaskStatusChange={(taskId, newStatus) => {
            // Implement task status change logic
          }}
        />
      </section>
      
      {projectProgress.projectMembers && (
        <section className="project-members-section">
          <h2>Project Members ({projectProgress.projectMembers.length})</h2>
          <div className="members-list">
            {projectProgress.projectMembers.map(member => (
              <div key={member.userId} className="member-card">
                {member.avatarUrl ? (
                  <img 
                    src={member.avatarUrl} 
                    alt={member.displayName} 
                    className="avatar"
                  />
                ) : (
                  <div className="avatar-initials">
                    {member.initials}
                  </div>
                )}
                <div className="member-info">
                  <span className="member-name">{member.displayName}</span>
                  {member.jobTitle && (
                    <span className="member-title">{member.jobTitle}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export const fetchProjectProgress = async (projectId) => {
  const response = await fetch(`/api/projects/${projectId}/progress`, {
    headers: {
      'Authorization': `Bearer ${getToken()}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch project progress');
  }
  
  return await response.json();
};

export const fetchProjectTasks = async (projectId) => {
  const response = await fetch(`/api/projects/${projectId}/tasks`, {
    headers: {
      'Authorization': `Bearer ${getToken()}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch project tasks');
  }
  
  return await response.json();
};
```

## CSS Components Mẫu

Dưới đây là một số CSS components để hiển thị progress một cách đẹp mắt:

### Progress Bar Component
```css
.progress-bar {
  width: 100%;
  height: 12px;
  background-color: #e0e0e0;
  border-radius: 6px;
  overflow: hidden;
  position: relative;
  margin: 10px 0;
}

.progress-fill {
  height: 100%;
  background-color: #4caf50;
  border-radius: 6px;
  transition: width 0.5s ease;
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #000;
  font-size: 12px;
  font-weight: 500;
  text-shadow: 0 0 3px rgba(255, 255, 255, 0.5);
}
```

### Team/Project Card Component
```css
.progress-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 20px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.progress-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
}

.progress-card h3 {
  margin-top: 0;
  font-size: 18px;
  color: #333;
}

.members-preview {
  display: flex;
  margin: 15px 0;
}

.member-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  margin-right: -10px;
  border: 2px solid #fff;
  overflow: hidden;
  position: relative;
}

.member-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.initials-avatar {
  width: 100%;
  height: 100%;
  background-color: #7e57c2;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
}

.more-members {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #e0e0e0;
  color: #757575;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  border: 2px solid #fff;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
  font-size: 12px;
  color: #757575;
}

.view-details {
  display: block;
  width: 100%;
  padding: 8px;
  margin-top: 15px;
  background-color: #3f51b5;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.view-details:hover {
  background-color: #303f9f;
}
```

## Xử Lý Error Cases

### Khi user không có quyền truy cập:

```javascript
const fetchTeamData = async (teamId) => {
  try {
    const response = await fetch(`/api/teams/${teamId}/progress`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    });
    
    if (response.status === 403) {
      // User không có quyền truy cập team
      showNotification({
        title: 'Access Denied',
        message: 'You do not have permission to view this team.',
        type: 'error'
      });
      navigate('/dashboard'); // Redirect về dashboard
      return null;
    }
    
    if (!response.ok) {
      throw new Error('Failed to fetch team data');
    }
    
    return await response.json();
  } catch (error) {
    showErrorNotification(error.message);
    return null;
  }
};
```

### Khi không tìm thấy team/project:

```javascript
if (response.status === 404) {
  // Team/project không tồn tại
  showNotification({
    title: 'Not Found',
    message: 'The requested team does not exist or has been deleted.',
    type: 'warning'
  });
  navigate('/dashboard'); // Redirect về dashboard
  return null;
}
```

## Cơ chế Auto-update

Progress được tự động cập nhật khi:

1. Task được tạo mới
2. Task status thay đổi (completed ↔ not completed)
3. Task được xóa

**Frontend không cần gọi API refresh sau khi thay đổi task status** - hệ thống backend sẽ tự động cập nhật progress và trả về dữ liệu mới nhất khi bạn gọi API lấy progress.

## Best Practices

1. **Cache data** để tránh gọi API quá nhiều:

```javascript
const useProgressData = (id, type = 'team', refreshInterval = 30000) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      let endpoint;
      
      if (type === 'team') {
        endpoint = `/api/teams/${id}/progress`;
      } else if (type === 'project') {
        endpoint = `/api/projects/${id}/progress`;
      } else if (type === 'all-teams') {
        endpoint = '/api/teams/progress/all';
      }
      
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch progress data');
      }
      
      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id, type]);
  
  useEffect(() => {
    fetchData();
    
    // Set up polling interval để cập nhật dữ liệu định kỳ
    const interval = setInterval(fetchData, refreshInterval);
    
    // Clean up
    return () => clearInterval(interval);
  }, [fetchData, refreshInterval]);
  
  return { data, loading, error, refreshData: fetchData };
};

// Sử dụng:
const TeamDetail = ({ teamId }) => {
  const { data: teamProgress, loading, error, refreshData } = 
    useProgressData(teamId, 'team');
    
  // ...
};
```

2. **Lazy loading** cho danh sách dài:

```javascript
const TeamsList = () => {
  const { data: allTeams, loading } = useProgressData(null, 'all-teams');
  
  if (loading) return <Spinner />;
  
  return (
    <div className="teams-list">
      {allTeams.map((team, index) => (
        <LazyLoad key={team.id} height={200} offset={100} once>
          <TeamCard team={team} />
        </LazyLoad>
      ))}
    </div>
  );
};
```

## Troubleshooting

### Progress không cập nhật sau khi thay đổi task status

**Nguyên nhân có thể:**
1. Cần thời gian để backend cập nhật progress
2. Task không thuộc team/project đang xem
3. Cache frontend chưa được refresh

**Giải pháp:**
1. Chờ khoảng 1-2 giây sau khi update task status
2. Kiểm tra task có đúng thuộc project/team không
3. Manual refresh: `refreshData()`

### Không có quyền truy cập (403)

**Nguyên nhân có thể:**
1. User không phải member của team
2. JWT token hết hạn
3. Server-side authorization lỗi

**Giải pháp:**
1. Đảm bảo user là member của team
2. Refresh token hoặc login lại
3. Liên hệ admin nếu vẫn có vấn đề

## Kết luận

API Progress System cung cấp các endpoint mạnh mẽ để hiển thị tiến độ của teams và projects, với các tính năng:

- **Toàn diện:** Hiển thị đầy đủ thông tin progress
- **Tự động:** Auto-update khi task thay đổi
- **User-friendly:** API được thiết kế để dễ dàng tích hợp vào frontend
- **Bảo mật:** Authorization được kiểm tra trên mỗi request

Với API mới `/api/teams/progress/all`, frontend có thể dễ dàng tạo dashboard tổng quan hiển thị tất cả team mà user tham gia trong một request duy nhất.
