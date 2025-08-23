# Role-Based Access Control Documentation

## Overview

Hệ thống phân quyền được chia thành 3 cấp độ:

1. System Level (Toàn hệ thống)
2. Team Level (Cấp độ nhóm)
3. Project Level (Cấp độ dự án)

## 1. System Level Roles

### Available Roles
- `ADMIN`: Quản trị viên hệ thống
- `MEMBER`: Người dùng thông thường (mặc định khi đăng ký)

### Permissions
#### ADMIN
- Quản lý user (tạo, xóa, khóa tài khoản)
- Quản lý cài đặt hệ thống
- Xem thống kê toàn hệ thống
- **Lưu ý**: ADMIN không can thiệp vào nội dung của Team/Project cụ thể

#### MEMBER
- Đăng nhập/đăng xuất
- Cập nhật thông tin cá nhân
- Tham gia team/project khi được mời
- Tạo team/project mới

## 2. Team Level Roles

### Available Roles
- `OWNER`: Người tạo/sở hữu team
- `MEMBER`: Thành viên thông thường

### Permissions
#### TEAM_OWNER
- Xóa team
- Quản lý thành viên (mời/xóa người)
- Tạo/xóa project trong team
- Phân công tasks
- Tất cả quyền của TEAM_MEMBER

#### TEAM_MEMBER
- Xem thông tin team
- Tạo/sửa/xóa task trong team
- Xem các project của team
- Comment/trao đổi trong team

## 3. Project Level Roles

### Available Roles
- `OWNER`: Người tạo/sở hữu project  
- `MEMBER`: Thành viên project

### Permissions
#### PROJECT_OWNER
- Xóa project
- Quản lý thành viên project (mời/xóa người)
- Phân công tasks
- Tất cả quyền của PROJECT_MEMBER

#### PROJECT_MEMBER
- Xem thông tin project
- Tạo/sửa/xóa task trong project 
- Comment/trao đổi trong project

## API Response Format

Khi gọi API, server sẽ trả về thông tin role của user trong response:

```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "systemRole": "MEMBER",
    "teams": [
      {
        "teamId": 1,
        "role": "OWNER"
      },
      {
        "teamId": 2,
        "role": "MEMBER"
      }
    ],
    "projects": [
      {
        "projectId": 1,
        "role": "OWNER"
      },
      {
        "projectId": 2,
        "role": "MEMBER" 
      }
    ]
  }
}
```

## Checking Permissions (Frontend)

### 1. System Level
```typescript
// Kiểm tra user có phải admin không
const isAdmin = user.systemRole === 'ADMIN';

// Hiển thị menu admin
{isAdmin && <AdminMenu />}
```

### 2. Team Level
```typescript
// Kiểm tra user có phải team owner không
const isTeamOwner = (teamId: number) => {
  const team = user.teams.find(t => t.teamId === teamId);
  return team?.role === 'OWNER';
};

// Hiển thị nút xóa team
{isTeamOwner(currentTeamId) && <DeleteTeamButton />}
```

### 3. Project Level  
```typescript
// Kiểm tra user có phải project owner không
const isProjectOwner = (projectId: number) => {
  const project = user.projects.find(p => p.projectId === projectId);
  return project?.role === 'OWNER';
};

// Hiển thị nút quản lý thành viên
{isProjectOwner(currentProjectId) && <ManageProjectMembersButton />}
```

## Common Use Cases

1. Khi user đăng nhập:
- Lưu thông tin role vào global state/context
- Hiển thị menu và chức năng phù hợp với role

2. Khi vào team/project:
- Kiểm tra role trong team/project đó
- Hiển thị/ẩn các button quản lý theo role

3. Khi thao tác với task:
- Tất cả thành viên trong project/team đều có quyền CRUD task
- Không cần kiểm tra role khi thao tác task

## Error Handling

Khi user không có quyền thực hiện một action, server sẽ trả về:

```json
{
  "error": "FORBIDDEN",
  "message": "You don't have permission to perform this action",
  "status": 403
}
```

Frontend cần handle error này và hiển thị thông báo phù hợp cho user.

## Best Practices

1. Luôn kiểm tra role trước khi hiển thị các button nhạy cảm (delete, manage members, etc.)

2. Cache thông tin role ở client để tránh gọi API nhiều lần

3. Clear cache role khi user logout hoặc bị thay đổi role

4. Sử dụng HOC hoặc custom hook để wrap logic check permission

Ví dụ custom hook:
```typescript
const usePermission = () => {
  const user = useUser(); // hook lấy user từ context/store

  return {
    isAdmin: () => user.systemRole === 'ADMIN',
    isTeamOwner: (teamId) => user.teams.find(t => t.teamId === teamId)?.role === 'OWNER',
    isProjectOwner: (projectId) => user.projects.find(p => p.projectId === projectId)?.role === 'OWNER'
  };
};
```

## API Endpoints

### 1. Get User Roles
```
GET /api/users/me/roles
```
Trả về tất cả role của user hiện tại trong hệ thống

### 2. Get Team Members with Roles  
```
GET /api/teams/{teamId}/members
```
Trả về danh sách thành viên và role của họ trong team

### 3. Get Project Members with Roles
```
GET /api/projects/{projectId}/members
```
Trả về danh sách thành viên và role của họ trong project
