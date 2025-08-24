# PROGRESS MANAGEMENT API DOCUMENTATION

## Tổng quan
Document này hướng dẫn frontend sử dụng các API liên quan đến quản lý progress cho teams (có nhiều projects) và projects riêng lẻ.

## 1. KIẾN TRÚC PROGRESS SYSTEM

### 1.1 Cấu trúc Progress Hierarchy
```
Organization
├── Teams (có nhiều projects)
│   ├── Team Progress (tổng hợp tất cả projects trong team)
│   ├── Project 1
│   │   ├── Project Progress
│   │   └── Team-Project Progress (progress của team trong project này)
│   └── Project 2
│       ├── Project Progress
│       └── Team-Project Progress
└── Personal Projects (không thuộc team)
    └── Project Progress only
```

### 1.2 Auto-Update Mechanism
- **✅ Tự động cập nhật:** Khi task status thay đổi → Tất cả progress liên quan được cập nhật
- **✅ Real-time:** Không cần manual refresh
- **✅ Cascading updates:** Team Progress = tổng hợp tất cả Project Progress trong team

## 2. TEAM PROGRESS APIs

### 2.1 Lấy Team Progress (tổng hợp tất cả projects)
```http
GET /api/teams/{teamId}/progress
```

**Use case:** Hiển thị tổng progress của team across tất cả projects

**Response:**
```json
{
  "id": 1,
  "teamId": 123,
  "teamName": "Backend Team",
  "totalTasks": 45,           // Tổng tasks từ TẤT CẢ projects của team
  "completedTasks": 32,       // Tổng completed tasks từ TẤT CẢ projects
  "completionPercentage": 71.11,
  "lastUpdated": "2024-08-25T01:54:09.209",
  "createdAt": "2024-08-20T10:00:00",
  "updatedAt": "2024-08-25T01:54:09.209"
}
```

**Frontend implementation:**
```javascript
const getTeamOverallProgress = async (teamId) => {
  try {
    const response = await fetch(`/api/teams/${teamId}/progress`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      const teamProgress = await response.json();
      return teamProgress;
    }
  } catch (error) {
    console.error('Error fetching team progress:', error);
  }
};
```

### 2.2 Refresh Team Progress (manual)
```http
POST /api/teams/{teamId}/progress
```

**Use case:** Force refresh team progress (thường không cần vì auto-update)

**Response:** Same as GET endpoint

## 3. PROJECT PROGRESS APIs

### 3.1 Lấy Project Progress (chi tiết)
```http
GET /api/projects/{projectId}/progress
```

**Use case:** Hiển thị progress chi tiết của một project cụ thể

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
  "teamProjectProgressList": [    // Chi tiết progress của từng team trong project
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
  ]
}
```

### 3.2 Refresh Project Progress (manual + auto-update team)
```http
POST /api/projects/{projectId}/progress
```

**Use case:** Manual refresh project progress và tự động cập nhật team progress

**Đặc biệt:** API này sẽ:
1. Refresh project progress
2. **Tự động refresh team progress** nếu project thuộc về team
3. Refresh team-project progress

## 4. TEAM-PROJECT PROGRESS APIs

### 4.1 Lấy Team-Project Progress
```http
GET /api/team-project-progress/team/{teamId}/project/{projectId}
```

**Use case:** Xem progress của một team cụ thể trong một project cụ thể

**Response:**
```json
{
  "id": 1,
  "teamId": 123,
  "teamName": "Backend Team",
  "projectId": 456,
  "projectName": "Task Management System",
  "totalTasks": 18,
  "completedTasks": 17,
  "completionPercentage": 94.44,
  "lastUpdated": "2024-08-25T01:54:09.209",
  "createdAt": "2024-08-20T10:00:00",
  "updatedAt": "2024-08-25T01:54:09.209"
}
```

## 5. USE CASES CHI TIẾT

### 5.1 Team Dashboard - Hiển thị Team có nhiều Projects

**Mục tiêu:** Hiển thị tổng progress của team và breakdown theo từng project

```javascript
const TeamDashboard = ({ teamId }) => {
  const [teamProgress, setTeamProgress] = useState(null);
  const [projects, setProjects] = useState([]);
  
  useEffect(() => {
    const loadTeamData = async () => {
      // 1. Lấy tổng progress của team
      const teamProgressData = await getTeamOverallProgress(teamId);
      setTeamProgress(teamProgressData);
      
      // 2. Lấy danh sách projects của team
      const projectsList = await fetch(`/api/teams/${teamId}/projects`).then(r => r.json());
      
      // 3. Lấy progress chi tiết của từng project
      const projectsWithProgress = await Promise.all(
        projectsList.map(async (project) => {
          const progressData = await fetch(`/api/projects/${project.id}/progress`).then(r => r.json());
          return { ...project, progress: progressData };
        })
      );
      
      setProjects(projectsWithProgress);
    };
    
    loadTeamData();
  }, [teamId]);

  return (
    <div>
      {/* Team Overall Progress */}
      <div className="team-overall-progress">
        <h2>{teamProgress?.teamName} - Overall Progress</h2>
        <ProgressBar 
          percentage={teamProgress?.completionPercentage} 
          label={`${teamProgress?.completedTasks}/${teamProgress?.totalTasks} tasks`}
        />
      </div>

      {/* Projects Breakdown */}
      <div className="projects-breakdown">
        <h3>Projects Progress</h3>
        {projects.map(project => (
          <div key={project.id} className="project-progress">
            <h4>{project.name}</h4>
            <ProgressBar 
              percentage={project.progress.completionPercentage}
              label={`${project.progress.completedTasks}/${project.progress.totalTasks} tasks`}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
```

### 5.2 Project Dashboard - Project riêng lẻ

**Mục tiêu:** Hiển thị progress chi tiết của một project

```javascript
const ProjectDashboard = ({ projectId }) => {
  const [projectProgress, setProjectProgress] = useState(null);
  
  useEffect(() => {
    const loadProjectProgress = async () => {
      const progressData = await fetch(`/api/projects/${projectId}/progress`).then(r => r.json());
      setProjectProgress(progressData);
    };
    
    loadProjectProgress();
  }, [projectId]);

  return (
    <div>
      <h2>{projectProgress?.projectName} Progress</h2>
      
      {/* Overall Project Progress */}
      <div className="project-progress">
        <ProgressBar 
          percentage={projectProgress?.completionPercentage}
          label={`${projectProgress?.completedTasks}/${projectProgress?.totalTasks} tasks completed`}
        />
        <p>Last updated: {projectProgress?.lastUpdated}</p>
      </div>

      {/* Team breakdown (nếu có teams) */}
      {projectProgress?.teamProjectProgressList?.length > 0 && (
        <div className="teams-breakdown">
          <h3>Team Progress Breakdown</h3>
          {projectProgress.teamProjectProgressList.map(teamProgress => (
            <div key={teamProgress.teamId} className="team-progress">
              <h4>{teamProgress.teamName}</h4>
              <ProgressBar 
                percentage={teamProgress.completionPercentage}
                label={`${teamProgress.completedTasks}/${teamProgress.totalTasks} tasks`}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

### 5.3 Task Completion Handler

**Mục tiêu:** Xử lý khi user complete/uncomplete task

```javascript
const handleTaskStatusChange = async (taskId, newStatus) => {
  try {
    // 1. Cập nhật task status
    await fetch(`/api/project-tasks/${taskId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status: newStatus })
    });

    // 2. Progress sẽ TỰ ĐỘNG được cập nhật!
    // Không cần manual refresh vì hệ thống có auto-update

    // 3. Tùy chọn: Refresh UI để hiển thị progress mới
    // (hoặc sử dụng WebSocket/SSE để real-time update)
    setTimeout(() => {
      window.location.reload(); // Simple approach
      // Hoặc re-fetch progress data
    }, 500);

  } catch (error) {
    console.error('Error updating task status:', error);
  }
};
```

## 6. BEST PRACTICES

### 6.1 Performance Optimization
```javascript
// ✅ GOOD: Cache progress data và chỉ refresh khi cần
const useProgressData = (id, type = 'project') => {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshProgress = useCallback(async () => {
    setLoading(true);
    try {
      const endpoint = type === 'team' 
        ? `/api/teams/${id}/progress`
        : `/api/projects/${id}/progress`;
      
      const data = await fetch(endpoint).then(r => r.json());
      setProgress(data);
    } finally {
      setLoading(false);
    }
  }, [id, type]);

  useEffect(() => {
    refreshProgress();
  }, [refreshProgress]);

  return { progress, loading, refreshProgress };
};
```

### 6.2 Error Handling
```javascript
const safeProgressFetch = async (endpoint) => {
  try {
    const response = await fetch(endpoint, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
      if (response.status === 404) {
        return { error: 'Progress data not found' };
      }
      if (response.status === 403) {
        return { error: 'No permission to view this progress' };
      }
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Progress fetch error:', error);
    return { error: 'Failed to load progress data' };
  }
};
```

### 6.3 Real-time Updates (Optional)
```javascript
// Nếu muốn real-time updates không cần reload
const useRealTimeProgress = (projectId) => {
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    // Setup WebSocket hoặc SSE
    const eventSource = new EventSource(`/api/progress-updates/${projectId}`);
    
    eventSource.onmessage = (event) => {
      const updatedProgress = JSON.parse(event.data);
      setProgress(updatedProgress);
    };

    return () => eventSource.close();
  }, [projectId]);

  return progress;
};
```

## 7. API ENDPOINTS SUMMARY

| Endpoint | Method | Use Case |
|----------|---------|----------|
| `/api/teams/{teamId}/progress` | GET | Team overall progress |
| `/api/teams/{teamId}/progress` | POST | Manual refresh team progress |
| `/api/projects/{projectId}/progress` | GET | Project detailed progress |
| `/api/projects/{projectId}/progress` | POST | Manual refresh (auto-updates team) |
| `/api/team-project-progress/team/{teamId}/project/{projectId}` | GET | Specific team-project progress |

## 8. NOTES QUAN TRỌNG

1. **Auto-Update:** Progress tự động cập nhật khi task status thay đổi
2. **Cascading Updates:** Project progress changes → Team progress auto-updates
3. **Permissions:** User cần quyền view project/team để xem progress
4. **Performance:** Cache progress data, chỉ refresh khi thực sự cần
5. **Error Handling:** Handle 404 (not found) và 403 (no permission)

## 9. TROUBLESHOOTING

**Vấn đề:** Progress không cập nhật
- **Giải pháp:** Kiểm tra task có thuộc đúng project/team không
- **Debug:** Check logs cho "ProgressUpdateService"

**Vấn đề:** Team progress không đúng
- **Giải pháp:** Manual refresh `/api/teams/{teamId}/progress` POST

**Vấn đề:** Permission denied
- **Giải pháp:** User cần là member của team hoặc project

---

**API Progress Management đã sẵn sàng để sử dụng với auto-update và real-time capabilities!** 🚀
