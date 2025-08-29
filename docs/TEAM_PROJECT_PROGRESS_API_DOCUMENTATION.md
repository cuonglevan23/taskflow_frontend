# TEAM & PROJECT PROGRESS API DOCUMENTATION

## Tổng quan
Document này hướng dẫn chi tiết về các API liên quan đến quản lý tiến độ (progress) cho teams và projects. Bao gồm đầy đủ kiểu dữ liệu, endpoints, cách sử dụng, và các best practices.

## ⚠️ BẢO MẬT VÀ PHÂN QUYỀN

### Quy tắc phân quyền:
- **✅ Chỉ members của team** mới có thể truy cập progress, tasks, và thông tin của team
- **❌ User chưa join team** sẽ nhận lỗi `403 Forbidden` khi truy cập
- **✅ Tự động filter:** API `GET /api/teams` chỉ trả về teams mà user có quyền truy cập
- **✅ Validation:** Tất cả endpoints đều kiểm tra membership trước khi trả dữ liệu

### Response Codes cho Authorization:
- `200 OK` - User có quyền truy cập
- `403 Forbidden` - User không phải member của team
- `404 Not Found` - Team/project không tồn tại hoặc user không có quyền

## 1. KIỂU DỮ LIỆU CHI TIẾT

### 1.1 UserProfileDto
User profile được dùng xuyên suốt các progress APIs để hiển thị thông tin user.

```java
public class UserProfileDto {
    private Long userId;         // ID của user
    private String email;        // Email của user
    private String firstName;    // Tên
    private String lastName;     // Họ
    private String username;     // Tên đăng nhập
    private String jobTitle;     // Chức vụ
    private String department;   // Phòng ban
    private String aboutMe;      // Giới thiệu ngắn
    private String status;       // Trạng thái (Active, Inactive, etc.)
    private String avatarUrl;    // URL của ảnh đại diện
    private boolean isUpgraded;  // Tài khoản premium hay không

    // Computed fields cho frontend
    private String displayName;  // firstName + lastName hoặc username
    private String initials;     // Chữ cái đầu của firstName + lastName (VD: JD cho John Doe)
}
```

### 1.2 TeamProgressResponseDto
Đại diện cho progress tổng thể của một team (across tất cả projects).

```java
public class TeamProgressResponseDto {
    private Long id;                         // ID của team progress record
    private Long teamId;                     // ID của team
    private String teamName;                 // Tên team
    private Integer totalTasks;              // Tổng số tasks của team
    private Integer completedTasks;          // Số tasks đã hoàn thành
    private Double completionPercentage;     // Phần trăm hoàn thành (0-100)
    private LocalDateTime lastUpdated;       // Thời điểm cập nhật cuối
    private LocalDateTime createdAt;         // Thời điểm tạo
    private LocalDateTime updatedAt;         // Thời điểm cập nhật

    // Thông tin user profiles
    private UserProfileDto teamOwner;           // Owner của team
    private List<UserProfileDto> teamMembers;   // Tất cả members trong team
    private UserProfileDto lastUpdatedBy;       // User cuối cùng cập nhật progress
}
```

### 1.3 ProjectProgressResponseDto
Đại diện cho progress của một project cụ thể.

```java
public class ProjectProgressResponseDto {
    private Long id;                         // ID của project progress record
    private Long projectId;                  // ID của project
    private String projectName;              // Tên project
    private Integer totalTasks;              // Tổng số tasks trong project
    private Integer completedTasks;          // Số tasks đã hoàn thành
    private Double completionPercentage;     // Phần trăm hoàn thành (0-100)
    private Integer totalTeams;              // Tổng số teams tham gia project
    private LocalDateTime lastUpdated;       // Thời điểm cập nhật cuối
    private LocalDateTime createdAt;         // Thời điểm tạo
    private LocalDateTime updatedAt;         // Thời điểm cập nhật
    
    // Chi tiết progress của từng team trong project
    private List<TeamProjectProgressResponseDto> teamProjectProgressList;

    // Thông tin user profiles
    private UserProfileDto projectCreator;      // User tạo project
    private List<UserProfileDto> projectMembers; // Tất cả members trong project
    private UserProfileDto lastUpdatedBy;       // User cuối cùng cập nhật progress
}
```

### 1.4 TeamProjectProgressResponseDto
Đại diện cho progress của một team cụ thể trong một project cụ thể.

```java
public class TeamProjectProgressResponseDto {
    private Long id;                         // ID của team-project progress record
    private Long teamId;                     // ID của team
    private String teamName;                 // Tên team
    private Long projectId;                  // ID của project
    private String projectName;              // Tên project
    private Integer totalTasks;              // Tổng số tasks của team trong project
    private Integer completedTasks;          // Số tasks đã hoàn thành
    private Double completionPercentage;     // Phần trăm hoàn thành (0-100)
    private LocalDateTime lastUpdated;       // Thời điểm cập nhật cuối
    private LocalDateTime createdAt;         // Thời điểm tạo
    private LocalDateTime updatedAt;         // Thời điểm cập nhật

    // Thông tin user profiles
    private List<UserProfileDto> teamMembersInProject; // Members của team trong project này
    private UserProfileDto lastUpdatedBy;              // User cuối cùng cập nhật progress
}
```

## 2. TEAM PROGRESS APIs

### 2.1 Lấy Team Progress (tổng hợp tất cả projects)
Endpoint để lấy progress tổng thể của một team với đầy đủ thông tin user profiles.

**Endpoint:**
```
GET /api/teams/{teamId}/progress
```

**Path Parameters:**

| Tham số | Kiểu  | Bắt buộc | Mô tả                                 |
|---------|-------|----------|--------------------------------------|
| teamId  | Long  | Có       | ID của team cần lấy thông tin progress |

**Headers:**

| Header          | Giá trị                     | Bắt buộc | Mô tả                            |
|----------------|----------------------------|----------|----------------------------------|
| Authorization  | Bearer {accessToken}       | Có       | JWT token xác thực user          |

**Response Codes:**

| Code | Description                                            |
|------|--------------------------------------------------------|
| 200  | Thành công - Trả về thông tin progress của team        |
| 403  | Forbidden - User không có quyền truy cập team progress |
| 404  | Not Found - Team không tồn tại                         |

**Response Body (200 OK):**
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
  
  "teamOwner": {
    "userId": 456,
    "email": "john.doe@company.com",
    "firstName": "John",
    "lastName": "Doe",
    "username": "john.doe",
    "jobTitle": "Team Lead",
    "department": "Engineering",
    "aboutMe": "Experienced team leader with 5 years in backend development",
    "status": "Active",
    "avatarUrl": "https://example.com/avatars/john.jpg",
    "isUpgraded": true,
    "displayName": "John Doe",
    "initials": "JD"
  },
  "teamMembers": [
    {
      "userId": 456,
      "email": "john.doe@company.com",
      "firstName": "John",
      "lastName": "Doe",
      "displayName": "John Doe",
      "initials": "JD",
      "avatarUrl": "https://example.com/avatars/john.jpg",
      "jobTitle": "Team Lead",
      "department": "Engineering"
    },
    {
      "userId": 789,
      "email": "jane.smith@company.com",
      "firstName": "Jane",
      "lastName": "Smith",
      "displayName": "Jane Smith",
      "initials": "JS",
      "avatarUrl": "https://example.com/avatars/jane.jpg",
      "jobTitle": "Senior Developer",
      "department": "Engineering"
    }
  ],
  "lastUpdatedBy": {
    "userId": 789,
    "email": "jane.smith@company.com",
    "displayName": "Jane Smith",
    "initials": "JS",
    "avatarUrl": "https://example.com/avatars/jane.jpg"
  }
}
```

### 2.2 Refresh Team Progress (manual)
Endpoint để force refresh team progress theo yêu cầu.

**Endpoint:**
```
POST /api/teams/{teamId}/progress
```

**Path Parameters:**

| Tham số | Kiểu  | Bắt buộc | Mô tả                                 |
|---------|-------|----------|--------------------------------------|
| teamId  | Long  | Có       | ID của team cần refresh progress      |

**Headers:**

| Header          | Giá trị                     | Bắt buộc | Mô tả                            |
|----------------|----------------------------|----------|----------------------------------|
| Authorization  | Bearer {accessToken}       | Có       | JWT token xác thực user          |

**Response Codes:**

| Code | Description                                            |
|------|--------------------------------------------------------|
| 200  | Thành công - Trả về thông tin progress sau khi refresh |
| 403  | Forbidden - User không có quyền truy cập team progress |
| 404  | Not Found - Team không tồn tại                         |

**Response Body (200 OK):** Giống với GET endpoint

## 3. PROJECT PROGRESS APIs

### 3.1 Lấy Project Progress (chi tiết)
Endpoint để lấy thông tin chi tiết về progress của một project.

**Endpoint:**
```
GET /api/projects/{projectId}/progress
```

**Path Parameters:**

| Tham số   | Kiểu  | Bắt buộc | Mô tả                                   |
|-----------|-------|----------|----------------------------------------|
| projectId | Long  | Có       | ID của project cần lấy thông tin progress |

**Headers:**

| Header          | Giá trị                     | Bắt buộc | Mô tả                            |
|----------------|----------------------------|----------|----------------------------------|
| Authorization  | Bearer {accessToken}       | Có       | JWT token xác thực user          |

**Response Codes:**

| Code | Description                                               |
|------|-----------------------------------------------------------|
| 200  | Thành công - Trả về thông tin progress của project        |
| 403  | Forbidden - User không có quyền truy cập project progress |
| 404  | Not Found - Project không tồn tại                         |

**Response Body (200 OK):**
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
  
  "projectCreator": {
    "userId": 456,
    "email": "john.doe@company.com",
    "firstName": "John",
    "lastName": "Doe",
    "displayName": "John Doe",
    "initials": "JD",
    "avatarUrl": "https://example.com/avatars/john.jpg",
    "jobTitle": "Team Lead"
  },
  "projectMembers": [
    {
      "userId": 456,
      "email": "john.doe@company.com",
      "firstName": "John",
      "lastName": "Doe",
      "displayName": "John Doe",
      "initials": "JD",
      "avatarUrl": "https://example.com/avatars/john.jpg"
    },
    {
      "userId": 789,
      "email": "jane.smith@company.com",
      "firstName": "Jane",
      "lastName": "Smith",
      "displayName": "Jane Smith",
      "initials": "JS",
      "avatarUrl": "https://example.com/avatars/jane.jpg"
    }
  ],
  "lastUpdatedBy": {
    "userId": 789,
    "displayName": "Jane Smith",
    "avatarUrl": "https://example.com/avatars/jane.jpg"
  },
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
      "lastUpdated": "2024-08-25T01:54:09.209",
      "teamMembersInProject": [
        {
          "userId": 456,
          "displayName": "John Doe",
          "avatarUrl": "https://example.com/avatars/john.jpg"
        },
        {
          "userId": 789,
          "displayName": "Jane Smith",
          "avatarUrl": "https://example.com/avatars/jane.jpg"
        }
      ],
      "lastUpdatedBy": {
        "userId": 789,
        "displayName": "Jane Smith",
        "avatarUrl": "https://example.com/avatars/jane.jpg"
      }
    }
  ]
}
```

### 3.2 Refresh Project Progress (manual + auto-update team)
Endpoint để force refresh project progress và tự động cập nhật team progress.

**Endpoint:**
```
POST /api/projects/{projectId}/progress
```

**Path Parameters:**

| Tham số   | Kiểu  | Bắt buộc | Mô tả                                   |
|-----------|-------|----------|----------------------------------------|
| projectId | Long  | Có       | ID của project cần refresh progress      |

**Headers:**

| Header          | Giá trị                     | Bắt buộc | Mô tả                            |
|----------------|----------------------------|----------|----------------------------------|
| Authorization  | Bearer {accessToken}       | Có       | JWT token xác thực user          |

**Mô tả Chi Tiết:**

Khi gọi API này, hệ thống sẽ:

1. Refresh project progress: Tính toán lại tất cả metrics dựa trên task hiện tại
2. Auto-update team progress: Nếu project thuộc về team, hệ thống sẽ tự động cập nhật team progress
3. Refresh team-project progress: Cập nhật progress của team trong project này
4. Lưu lại thông tin người cập nhật (lastUpdatedBy)
5. Cập nhật lastUpdated timestamp

**Response Codes:**

| Code | Description                                               |
|------|-----------------------------------------------------------|
| 200  | Thành công - Trả về thông tin progress sau khi refresh    |
| 403  | Forbidden - User không có quyền truy cập project progress |
| 404  | Not Found - Project không tồn tại                         |

**Response Body (200 OK):** Giống với GET endpoint

## 4. TEAM-PROJECT PROGRESS APIs

### 4.1 Lấy Team-Project Progress
Endpoint để lấy thông tin về progress của một team cụ thể trong một project cụ thể.

**Endpoint:**
```
GET /api/team-project-progress/team/{teamId}/project/{projectId}
```

**Path Parameters:**

| Tham số   | Kiểu  | Bắt buộc | Mô tả                                   |
|-----------|-------|----------|----------------------------------------|
| teamId    | Long  | Có       | ID của team                             |
| projectId | Long  | Có       | ID của project                          |

**Headers:**

| Header          | Giá trị                     | Bắt buộc | Mô tả                            |
|----------------|----------------------------|----------|----------------------------------|
| Authorization  | Bearer {accessToken}       | Có       | JWT token xác thực user          |

**Response Codes:**

| Code | Description                                                        |
|------|--------------------------------------------------------------------|
| 200  | Thành công - Trả về thông tin progress của team trong project      |
| 403  | Forbidden - User không có quyền truy cập team-project progress     |
| 404  | Not Found - Team, project hoặc team-project relation không tồn tại |

**Response Body (200 OK):**
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
  "updatedAt": "2024-08-25T01:54:09.209",
  
  "teamMembersInProject": [
    {
      "userId": 456,
      "email": "john.doe@company.com",
      "firstName": "John",
      "lastName": "Doe",
      "displayName": "John Doe",
      "initials": "JD",
      "avatarUrl": "https://example.com/avatars/john.jpg"
    },
    {
      "userId": 789,
      "email": "jane.smith@company.com",
      "firstName": "Jane",
      "lastName": "Smith",
      "displayName": "Jane Smith",
      "initials": "JS",
      "avatarUrl": "https://example.com/avatars/jane.jpg"
    }
  ],
  "lastUpdatedBy": {
    "userId": 789,
    "email": "jane.smith@company.com",
    "displayName": "Jane Smith",
    "initials": "JS",
    "avatarUrl": "https://example.com/avatars/jane.jpg"
  }
}
```

## 5. CƠ CHẾ AUTO-UPDATE

### 5.1 Progress Update Flow
Mô tả chi tiết về cách progress được tự động cập nhật trong hệ thống:

```
Task Status Update
      ↓
Project Progress Update
      ↓
Team-Project Progress Update (nếu project thuộc team)
      ↓
Team Overall Progress Update (tổng hợp từ tất cả projects)
```

### 5.2 Trigger Points
Các điểm trigger tự động cập nhật progress:

1. **Task Creation**: Khi tạo task mới → Tăng totalTasks trong tất cả progress liên quan
2. **Task Completion**: Khi đánh dấu task hoàn thành → Tăng completedTasks, cập nhật completionPercentage
3. **Task Deletion**: Khi xóa task → Cập nhật lại totalTasks và completedTasks trong tất cả progress liên quan
4. **Task Status Change**: Khi thay đổi status của task → Cập nhật completedTasks dựa trên status mới
5. **Project Assignment**: Khi assign project cho team → Tạo team-project progress mới và cập nhật team overall progress

### 5.3 Transaction Integrity
Để đảm bảo tính toàn vẹn dữ liệu:

- Tất cả cập nhật progress được thực hiện trong một transaction
- Nếu bất kỳ bước nào thất bại, toàn bộ cập nhật sẽ được rollback
- Hệ thống ghi log chi tiết về quá trình cập nhật progress

## 6. USE CASES CHI TIẾT

### 6.1 Team Dashboard - Hiển thị Team có nhiều Projects

**Mục tiêu:** Hiển thị tổng progress của team và breakdown theo từng project.

**API Calls:**
1. Lấy team progress: `GET /api/teams/{teamId}/progress`
2. Lấy danh sách projects của team: `GET /api/teams/{teamId}/projects`
3. (Tùy chọn) Lấy progress chi tiết của từng project: `GET /api/projects/{projectId}/progress`

**Code Example:**
```javascript
const TeamDashboard = ({ teamId }) => {
  const [teamProgress, setTeamProgress] = useState(null);
  const [projects, setProjects] = useState([]);
  
  useEffect(() => {
    const loadTeamData = async () => {
      // 1. Lấy tổng progress của team với thông tin user profiles
      const teamProgressData = await fetch(
        `/api/teams/${teamId}/progress`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      ).then(r => r.json());
      
      setTeamProgress(teamProgressData);
      
      // 2. Lấy danh sách projects của team
      const projectsList = await fetch(
        `/api/teams/${teamId}/projects`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      ).then(r => r.json());
      
      // 3. Lấy progress chi tiết của từng project
      const projectsWithProgress = await Promise.all(
        projectsList.map(async (project) => {
          const progressData = await fetch(
            `/api/projects/${project.id}/progress`,
            { headers: { 'Authorization': `Bearer ${token}` } }
          ).then(r => r.json());
          
          return { ...project, progress: progressData };
        })
      );
      
      setProjects(projectsWithProgress);
    };
    
    loadTeamData();
  }, [teamId, token]);

  return (
    <div>
      {/* Team Overall Progress */}
      <div className="team-overall-progress">
        <div className="team-header">
          <h2>{teamProgress?.teamName} - Overall Progress</h2>
          
          {/* Team Owner & Members */}
          <div className="team-members">
            <div className="owner">
              <img 
                src={teamProgress?.teamOwner?.avatarUrl} 
                alt={teamProgress?.teamOwner?.displayName} 
                title="Team Owner"
              />
              <span>{teamProgress?.teamOwner?.displayName} (Owner)</span>
            </div>
            
            <div className="members-list">
              {teamProgress?.teamMembers?.map(member => (
                <img 
                  key={member.userId}
                  src={member.avatarUrl || `/default-avatar/${member.initials}`} 
                  alt={member.displayName}
                  title={`${member.displayName} - ${member.jobTitle}`}
                />
              ))}
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <ProgressBar 
          percentage={teamProgress?.completionPercentage} 
          label={`${teamProgress?.completedTasks}/${teamProgress?.totalTasks} tasks`}
          lastUpdated={teamProgress?.lastUpdated}
          lastUpdatedBy={teamProgress?.lastUpdatedBy?.displayName}
        />
      </div>

      {/* Projects Breakdown */}
      <div className="projects-breakdown">
        <h3>Projects Progress</h3>
        {projects.map(project => (
          <div key={project.id} className="project-progress">
            <h4>{project.name}</h4>
            <ProgressBar 
              percentage={project.progress?.completionPercentage}
              label={`${project.progress?.completedTasks}/${project.progress?.totalTasks} tasks`}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
```

### 6.2 Project Dashboard - Project riêng lẻ

**Mục tiêu:** Hiển thị progress chi tiết của một project và breakdown theo teams.

**API Calls:**
1. Lấy project progress: `GET /api/projects/{projectId}/progress`

**Code Example:**
```javascript
const ProjectDashboard = ({ projectId }) => {
  const [projectProgress, setProjectProgress] = useState(null);
  
  useEffect(() => {
    const loadProjectProgress = async () => {
      // Lấy project progress với thông tin user profiles và team breakdown
      const progressData = await fetch(
        `/api/projects/${projectId}/progress`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      ).then(r => r.json());
      
      setProjectProgress(progressData);
    };
    
    loadProjectProgress();
  }, [projectId, token]);

  return (
    <div>
      {/* Project Header with Creator */}
      <div className="project-header">
        <h2>{projectProgress?.projectName}</h2>
        <div className="project-creator">
          <span>Created by: </span>
          <img 
            src={projectProgress?.projectCreator?.avatarUrl} 
            alt={projectProgress?.projectCreator?.displayName}
          />
          <span>{projectProgress?.projectCreator?.displayName}</span>
        </div>
      </div>
      
      {/* Overall Project Progress */}
      <div className="project-progress">
        <ProgressBar 
          percentage={projectProgress?.completionPercentage}
          label={`${projectProgress?.completedTasks}/${projectProgress?.totalTasks} tasks completed`}
        />
        <div className="last-update-info">
          <p>Last updated: {formatDate(projectProgress?.lastUpdated)}</p>
          {projectProgress?.lastUpdatedBy && (
            <p>
              By: <img 
                src={projectProgress.lastUpdatedBy.avatarUrl} 
                alt={projectProgress.lastUpdatedBy.displayName}
                className="small-avatar"
              />
              {projectProgress.lastUpdatedBy.displayName}
            </p>
          )}
        </div>
      </div>

      {/* Members involved in this project */}
      <div className="project-members">
        <h3>Project Members</h3>
        <div className="avatars-list">
          {projectProgress?.projectMembers?.map(member => (
            <div key={member.userId} className="member-avatar">
              <img 
                src={member.avatarUrl || `/default-avatar/${member.initials}`}
                alt={member.displayName} 
                title={`${member.displayName} - ${member.jobTitle || ''}`}
              />
              <span>{member.displayName}</span>
            </div>
          ))}
        </div>
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
              
              {/* Team members in this project */}
              <div className="team-members-in-project">
                <p>Team members working on this project:</p>
                <div className="avatars-list">
                  {teamProgress.teamMembersInProject?.map(member => (
                    <img 
                      key={member.userId}
                      src={member.avatarUrl || `/default-avatar/${member.initials}`}
                      alt={member.displayName}
                      title={member.displayName}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

### 6.3 Task Completion Handler

**Mục tiêu:** Xử lý khi user complete/uncomplete task và hiển thị realtime progress updates.

**API Calls:**
1. Update task status: `PUT /api/project-tasks/{taskId}` (body: `{ status: "COMPLETED" }`)
2. (Không cần gọi) Progress sẽ tự động cập nhật

**Code Example:**
```javascript
const TaskItem = ({ task, projectId, teamId }) => {
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
      // ⚠️ Không cần gọi API refresh progress vì hệ thống có auto-update
      
      // 3. (Tùy chọn) Set up WebSocket để nhận realtime update về progress
      // - Xem phần WebSocket Integration

    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  return (
    <div className="task-item">
      <input
        type="checkbox"
        checked={task.status === "COMPLETED"}
        onChange={() => handleTaskStatusChange(
          task.id, 
          task.status === "COMPLETED" ? "IN_PROGRESS" : "COMPLETED"
        )}
      />
      <span className={task.status === "COMPLETED" ? "completed" : ""}>
        {task.title}
      </span>
      
      {/* Task metadata */}
      <div className="task-metadata">
        <span>Due: {formatDate(task.dueDate)}</span>
        <span>Assigned to: {task.assigneeDisplayName}</span>
      </div>
    </div>
  );
};
```

## 7. WEBSOCKET INTEGRATION (REALTIME UPDATES)

### 7.1 WebSocket Endpoints

```
ws://your-domain.com/api/websocket/progress
```

### 7.2 Events

| Event Type            | Mô tả                                 | Payload Format                           |
|----------------------|--------------------------------------|------------------------------------------|
| `TEAM_PROGRESS_UPDATE` | Team progress đã được cập nhật       | `{ teamId: number, progress: object }`   |
| `PROJECT_PROGRESS_UPDATE` | Project progress đã được cập nhật   | `{ projectId: number, progress: object }` |

### 7.3 Cách Sử Dụng WebSocket cho Realtime Updates

```javascript
const useRealtimeProgress = (teamId, projectId) => {
  const [progress, setProgress] = useState(null);
  
  useEffect(() => {
    // Create WebSocket connection
    const socket = new WebSocket(`ws://your-domain.com/api/websocket/progress`);
    
    // Connection opened
    socket.addEventListener('open', function (event) {
      // Subscribe to specific progress updates
      socket.send(JSON.stringify({
        action: 'SUBSCRIBE',
        teamId: teamId,  // Optional - subscribe to specific team updates
        projectId: projectId,  // Optional - subscribe to specific project updates
      }));
    });
    
    // Listen for messages
    socket.addEventListener('message', function (event) {
      const data = JSON.parse(event.data);
      
      // Handle different event types
      if (data.type === 'TEAM_PROGRESS_UPDATE' && data.payload.teamId === teamId) {
        setProgress(prev => ({...prev, teamProgress: data.payload.progress}));
      }
      
      if (data.type === 'PROJECT_PROGRESS_UPDATE' && data.payload.projectId === projectId) {
        setProgress(prev => ({...prev, projectProgress: data.payload.progress}));
      }
    });
    
    // Handle errors and connection close
    socket.addEventListener('error', function (event) {
      console.error('WebSocket error:', event);
    });
    
    socket.addEventListener('close', function (event) {
      console.log('WebSocket connection closed');
    });
    
    // Cleanup on component unmount
    return () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, [teamId, projectId]);
  
  return progress;
};
```

## 8. BEST PRACTICES

### 8.1 Performance Optimization
```javascript
// ✅ GOOD: Cache progress data và chỉ refresh khi cần
const useProgressData = (id, type = 'project') => {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const cache = useRef({});
  const lastFetch = useRef(0);

  const refreshProgress = useCallback(async (force = false) => {
    // Nếu có dữ liệu cache và chưa quá 1 phút, dùng cache
    const now = Date.now();
    if (!force && cache.current[`${type}-${id}`] && (now - lastFetch.current < 60000)) {
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const endpoint = type === 'team' 
        ? `/api/teams/${id}/progress`
        : `/api/projects/${id}/progress`;
      
      const response = await fetch(endpoint, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      setProgress(data);
      
      // Cập nhật cache
      cache.current[`${type}-${id}`] = data;
      lastFetch.current = now;
    } catch (err) {
      setError(err.message);
      console.error(`Error fetching ${type} progress:`, err);
    } finally {
      setLoading(false);
    }
  }, [id, type, token]);

  useEffect(() => {
    refreshProgress();
    
    // Optional: Set up polling để cập nhật dữ liệu định kỳ
    const interval = setInterval(() => refreshProgress(), 60000); // 1 phút
    
    return () => clearInterval(interval);
  }, [refreshProgress]);

  return { progress, loading, error, refreshProgress };
};
```

### 8.2 Error Handling
```javascript
const safeProgressFetch = async (endpoint) => {
  try {
    const response = await fetch(endpoint, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
      if (response.status === 404) {
        return { error: 'Progress data not found', code: 404 };
      }
      
      if (response.status === 403) {
        return { error: 'No permission to view this progress', code: 403 };
      }
      
      throw new Error(`HTTP ${response.status}`);
    }

    return { data: await response.json() };
  } catch (error) {
    console.error('Progress fetch error:', error);
    return { error: 'Failed to load progress data', code: 500 };
  }
};

// Sử dụng
const { data, error, code } = await safeProgressFetch(`/api/teams/${teamId}/progress`);

if (error) {
  if (code === 403) {
    // Hiển thị thông báo không có quyền
    showPermissionError();
  } else if (code === 404) {
    // Hiển thị thông báo không tìm thấy
    showNotFoundError();
  } else {
    // Hiển thị lỗi chung
    showGeneralError(error);
  }
} else {
  // Xử lý data
  setTeamProgress(data);
}
```

## 9. SECURITY CONSIDERATIONS

### 9.1 Authentication & Authorization
- **JWT Required**: Tất cả API calls phải kèm theo JWT token trong Authorization header
- **Team Membership**: Chỉ team members mới có thể truy cập team progress
- **Project Membership**: Chỉ project members mới có thể truy cập project progress

### 9.2 Bảo Vệ Data Privacy
- **Sensitive User Data**: Email và thông tin cá nhân chỉ được trả về khi user có quyền truy cập
- **Avatars & Profile Info**: Chỉ hiển thị cho team/project members

### 9.3 Rate Limiting
- **Standard Limits**: 100 requests/minute cho API progress
- **Websocket Throttling**: Maximum 10 subscriptions/client

## 10. API ENDPOINTS SUMMARY

| Endpoint | Method | Use Case |
|----------|---------|----------|
| `/api/teams/{teamId}/progress` | GET | Team overall progress |
| `/api/teams/{teamId}/progress` | POST | Manual refresh team progress |
| `/api/projects/{projectId}/progress` | GET | Project detailed progress |
| `/api/projects/{projectId}/progress` | POST | Manual refresh (auto-updates team) |
| `/api/team-project-progress/team/{teamId}/project/{projectId}` | GET | Specific team-project progress |

## 11. TROUBLESHOOTING

### Common Issues & Solutions

**Vấn đề:** Progress không cập nhật sau khi thay đổi task status
- **Nguyên nhân**: Task không thuộc đúng project hoặc team
- **Giải pháp**: Kiểm tra task có thuộc đúng project/team không
- **Debug**: Check logs cho "ProgressUpdateService"
- **Validate**: Gọi API `POST /api/projects/{projectId}/progress` để force refresh

**Vấn đề:** Team progress không phản ánh đúng task completion
- **Nguyên nhân**: Có thể có race condition trong cập nhật
- **Giải pháp**: Manual refresh `/api/teams/{teamId}/progress` POST
- **Debug**: Kiểm tra lastUpdated timestamp trong team progress và project progress

**Vấn đề:** Permission denied (403)
- **Nguyên nhân**: User không phải member của team hoặc project
- **Giải pháp**: Thêm user vào team/project hoặc kiểm tra quyền
- **Debug**: Check JWT token và xem user có trong team_members table

**Vấn đề:** Hiệu suất chậm khi load nhiều progress cùng lúc
- **Nguyên nhân**: N+1 query problem
- **Giải pháp**: Sử dụng cache và batch queries
- **Code Example**: Implement useProgressData hook như trên

---

**API Progress Management đã sẵn sàng để sử dụng với auto-update và real-time capabilities!** 🚀

## 12. Mã Nguồn Tham Khảo

### Controller Implementation
```java
@RestController
@RequestMapping("/api/teams")
public class TeamController {
    @Autowired
    private TeamProgressService teamProgressService;
    
    // Team Progress Endpoints
    @GetMapping("/{id}/progress")
    public ResponseEntity<TeamProgressResponseDto> getTeamProgress(@PathVariable Long id) {
        try {
            // Kiểm tra quyền truy cập team trước khi trả về progress
            teamService.validateTeamAccess(id);

            TeamProgressResponseDto progress = teamProgressService.getTeamProgressByTeamId(id);
            return ResponseEntity.ok(progress);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("Access denied")) {
                return ResponseEntity.status(403).build(); // Forbidden
            }
            return ResponseEntity.notFound().build();
        }
    }
}

@RestController
@RequestMapping("/api/projects")
public class ProjectController {
    @Autowired
    private ProjectProgressService projectProgressService;
    
    // Project Progress Endpoints
    @GetMapping("/{id}/progress")
    public ResponseEntity<ProjectProgressResponseDto> getProjectProgress(@PathVariable Long id) {
        try {
            ProjectProgressResponseDto progress = projectProgressService.getProjectProgress(id);
            return ResponseEntity.ok(progress);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{id}/progress")
    public ResponseEntity<ProjectProgressResponseDto> refreshProjectProgress(@PathVariable Long id) {
        try {
            // Lấy thông tin project để biết teamId
            ProjectResponseDto project = projectService.getProjectById(id);
            Long teamId = project.getTeamId();

            if (teamId != null) {
                // Project thuộc team - refresh tất cả progress liên quan
                projectProgressService.refreshAllProgressData(teamId, id);
            } else {
                // Project cá nhân - chỉ refresh project progress
                projectProgressService.refreshProjectProgressData(id);
            }

            // Trả về progress đã được refresh
            ProjectProgressResponseDto progress = projectProgressService.getProjectProgress(id);
            return ResponseEntity.ok(progress);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
```
