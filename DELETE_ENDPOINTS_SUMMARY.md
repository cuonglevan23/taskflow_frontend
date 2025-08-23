# DELETE Endpoints Summary

Tất cả các chức năng xóa đã được triển khai đầy đủ trong API routes:

## ✅ Tasks
- **DELETE** `/api/tasks/[id]` - Xóa task tổng quát
- **DELETE** `/api/tasks/my-tasks/[id]` - Xóa my-task

## ✅ Projects
- **DELETE** `/api/projects/[id]` - Xóa project

## ✅ Teams
- **DELETE** `/api/teams/[id]` - Xóa team
- **DELETE** `/api/teams/[id]/members/[memberId]` - Xóa member khỏi team

## ✅ Project Tasks
- **DELETE** `/api/project-tasks/[id]` - Xóa project task

## ✅ Calendar Events
- **DELETE** `/api/calendar/events/[id]` - Xóa calendar event

## Cách sử dụng:

### 1. Xóa Task:
```javascript
// Xóa my-task
const response = await fetch('/api/tasks/my-tasks/123', {
  method: 'DELETE'
});

// Xóa task tổng quát  
const response = await fetch('/api/tasks/123', {
  method: 'DELETE'
});
```

### 2. Xóa Project:
```javascript
const response = await fetch('/api/projects/123', {
  method: 'DELETE'
});
```

### 3. Xóa Team:
```javascript
const response = await fetch('/api/teams/123', {
  method: 'DELETE'
});
```

### 4. Xóa Member khỏi Team:
```javascript
const response = await fetch('/api/teams/123/members/456', {
  method: 'DELETE'
});
```

### 5. Xóa Project Task:
```javascript
const response = await fetch('/api/project-tasks/123', {
  method: 'DELETE'
});
```

### 6. Xóa Calendar Event:
```javascript
const response = await fetch('/api/calendar/events/123', {
  method: 'DELETE'
});
```

## Tính năng Authentication:
- Tất cả DELETE endpoints đều yêu cầu authentication
- Sử dụng NextAuth session và JWT token
- Tự động forward requests tới backend với Authorization header

## Error Handling:
- 401: Authentication required
- 403: Forbidden (không có quyền xóa)
- 404: Resource not found
- 500: Internal server error

Tất cả các chức năng xóa đã sẵn sàng sử dụng! 🚀
