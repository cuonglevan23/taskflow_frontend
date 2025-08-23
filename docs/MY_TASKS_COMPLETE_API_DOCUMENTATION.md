# MY TASKS API - Hướng Dẫn Sử Dụng Hoàn Chỉnh

## 📋 Tổng Quan
API My Tasks cho phép user quản lý task cá nhân bao gồm CRUD operations, giao task cho người khác và quản lý comment.

## 🔐 Authentication
Tất cả API đều yêu cầu JWT token trong header:
```
Authorization: Bearer <your-jwt-token>
```

---

## 🎯 1. CRUD OPERATIONS - Quản Lý Task

### 1.1 Tạo Task Mới
```http
POST /api/tasks/my-tasks
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Task title (bắt buộc)",
  "description": "Task description (tùy chọn)",
  "status": "IN_PROGRESS (bắt buộc)",
  "priority": "HIGH (bắt buộc)",
  "startDate": "2025-08-24 (tùy chọn)",
  "deadline": "2025-08-30 (tùy chọn)",
  "comment": "Ghi chú thêm cho task (tùy chọn)",
  "urlFile": "https://example.com/file.pdf (tùy chọn)",
  "projectId": 1,
  "groupId": 2,
  "creatorId": 123,
  "assignedToIds": [124, 125],
  "assignedToEmails": ["user1@example.com", "user2@example.com"]
}
```

**Response:**
```json
{
  "id": 1,
  "title": "Task title",
  "description": "Task description",
  "status": "IN_PROGRESS",
  "priority": "HIGH",
  "startDate": "2025-08-24",
  "deadline": "2025-08-30",
  "comment": "Ghi chú thêm cho task",
  "urlFile": "https://example.com/file.pdf",
  "createdAt": "2025-08-23T15:30:00",
  "updatedAt": "2025-08-23T15:30:00",
  "assignedToIds": [124, 125],
  "assignedToEmails": ["user1@example.com", "user2@example.com"],
  "creatorId": 123,
  "projectId": 1,
  "groupId": 2,
  "checklists": []
}
```

### 1.2 Lấy Danh Sách Task Của Tôi
```http
GET /api/tasks/my-tasks?page=0&size=10&sortBy=updatedAt&sortDir=desc
```

**Query Parameters:**
- `page` (default: 0): Trang hiện tại
- `size` (default: 10): Số task trên 1 trang
- `sortBy` (default: updatedAt): Sắp xếp theo (title, startDate, deadline, createdAt, updatedAt, priority, status)
- `sortDir` (default: desc): Hướng sắp xếp (asc/desc)

**Response:**
```json
{
  "content": [
    {
      "id": 1,
      "title": "Task 1",
      "description": "Description 1",
      "status": "IN_PROGRESS",
      "priority": "HIGH",
      "startDate": "2025-08-24",
      "deadline": "2025-08-30",
      "comment": "Ghi chú task",
      "urlFile": "https://example.com/file.pdf",
      "createdAt": "2025-08-23T15:30:00",
      "updatedAt": "2025-08-23T15:30:00",
      "assignedToIds": [124, 125],
      "assignedToEmails": ["user1@example.com", "user2@example.com"],
      "creatorId": 123,
      "projectId": 1,
      "groupId": 2,
      "checklists": []
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 10,
    "sort": {
      "sorted": true,
      "unsorted": false
    }
  },
  "totalElements": 25,
  "totalPages": 3,
  "first": true,
  "last": false,
  "numberOfElements": 10
}
```

### 1.3 Lấy Task Summary (Lightweight)
```http
GET /api/tasks/my-tasks/summary?page=0&size=20&sortBy=updatedAt&sortDir=desc
```

**Response:**
```json
{
  "content": [
    {
      "id": 1,
      "title": "Task title",
      "description": "Task description",
      "status": "IN_PROGRESS",
      "priority": "HIGH",
      "startDate": "2025-08-24",
      "deadline": "2025-08-30",
      "createdAt": "2025-08-23T15:30:00",
      "updatedAt": "2025-08-23T15:30:00",
      "creatorId": 123,
      "creatorName": "John Doe",
      "projectId": 1,
      "projectName": "Project A",
      "teamId": 2,
      "teamName": "Team Alpha",
      "checklistCount": 3,
      "assigneeCount": 2,
      "participationType": "CREATOR"
    }
  ],
  "totalElements": 15,
  "totalPages": 1
}
```

### 1.4 Lấy Thống Kê Task
```http
GET /api/tasks/my-tasks/stats
```

**Response:**
```json
{
  "totalParticipatingTasks": 25,
  "totalRegularTasks": 15,
  "totalProjectTasks": 10,
  "userEmail": "user@example.com",
  "userId": 123
}
```

### 1.5 Lấy Chi Tiết 1 Task
```http
GET /api/tasks/{taskId}
```

**Response:** Giống như response của create task

### 1.6 Cập Nhật Task
```http
PUT /api/tasks/my-tasks/{taskId}
Content-Type: application/json
```

**Request Body (tất cả field đều optional):**
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "status": "COMPLETED",
  "priority": "MEDIUM",
  "startDate": "2025-08-25",
  "deadline": "2025-09-01",
  "comment": "Updated comment",
  "urlFile": "https://example.com/new-file.pdf",
  "groupId": 3,
  
  // REPLACE tất cả assignees

  "assignedToEmails": ["newuser1@example.com", "newuser2@example.com"],
  
  // ADD assignees (không xóa assignees cũ)
  
  "addAssigneeEmails": ["adduser@example.com"],
  
  // REMOVE assignees
  
  "removeAssigneeEmails": ["removeuser@example.com"]
}
```

**Response:** Giống như response của create task

### 1.7 Xóa Task
```http
DELETE /api/tasks/my-tasks/{taskId}
```

**Response:**
```json
"My task deleted successfully."
```

---

## 👥 2. GIAO TASK - Assignment Operations


```

### 2.2 Giao Task Bằng Email
Sử dụng trong request create hoặc update:
```json
{
  "assignedToEmails": ["user1@example.com", "user2@example.com"]
}
```

### 2.3 Thêm Assignee Mới (Không Xóa Cũ)
```json
{

  "addAssigneeEmails": ["newuser@example.com"]
}
```

### 2.4 Xóa Assignee
```json
{
 
  "removeAssigneeEmails": ["olduser@example.com"]
}
```

### 2.5 Thay Thế Tất Cả Assignees
```json
{
  "assignedToIds": [130, 131],
  "assignedToEmails": ["replacement1@example.com", "replacement2@example.com"]
}
```

**⚠️ Lưu Ý Quan Trọng:**
- Nếu email không tồn tại trong hệ thống → API trả lỗi 400 với danh sách email invalid
- Nếu user đã được assign → hệ thống skip (không duplicate)
- Chỉ creator và assignee mới có thể update task

---

## 💬 3. COMMENT OPERATIONS

### 3.1 Tạo Comment Mới
```http
POST /api/task-comments
Content-Type: application/json
```

**Request Body:**
```json
{
  "content": "Nội dung comment",
  "taskId": 35
}
```

**Response:**
```json
{
  "id": 1,
  "content": "Nội dung comment",
  "createdAt": "2025-08-23T15:30:00",
  "updatedAt": "2025-08-23T15:30:00",
  "taskId": 35,
  "userId": 123,
  "userEmail": "user@example.com",
  "userName": "John Doe",
  "userAvatar": "https://example.com/avatar.jpg"
}
```

### 3.2 Lấy Comments Của Task
```http
GET /api/task-comments/task/{taskId}?page=0&size=10
```

**Query Parameters:**
- `page` (optional): Nếu có page & size → trả về phân trang
- `size` (optional): Nếu không có → trả về tất cả comments

**Response (với phân trang):**
```json
{
  "content": [
    {
      "id": 1,
      "content": "Comment 1",
      "createdAt": "2025-08-23T15:30:00",
      "updatedAt": "2025-08-23T15:30:00",
      "taskId": 35,
      "userId": 123,
      "userEmail": "user@example.com",
      "userName": "John Doe",
      "userAvatar": "https://example.com/avatar.jpg"
    }
  ],
  "totalElements": 5,
  "totalPages": 1,
  "first": true,
  "last": true
}
```

**Response (không phân trang):**
```json
[
  {
    "id": 1,
    "content": "Comment 1",
    "createdAt": "2025-08-23T15:30:00",
    "updatedAt": "2025-08-23T15:30:00",
    "taskId": 35,
    "userId": 123,
    "userEmail": "user@example.com",
    "userName": "John Doe",
    "userAvatar": "https://example.com/avatar.jpg"
  }
]
```

### 3.3 Đếm Số Comments
```http
GET /api/task-comments/task/{taskId}/count
```

**Response:**
```json
{
  "commentCount": 5
}
```

### 3.4 Cập Nhật Comment
```http
PUT /api/task-comments/{commentId}
Content-Type: application/json
```

**Request Body:**
```json
{
  "content": "Nội dung comment đã cập nhật"
}
```

**Response:** Giống như response create comment

### 3.5 Xóa Comment
```http
DELETE /api/task-comments/{commentId}
```

**Response:**
```json
"Comment deleted successfully"
```

**⚠️ Quyền Comment:**
- Chỉ **creator** và **assignee** của task mới có thể comment
- Chỉ **người tạo comment** mới có thể sửa comment của mình
- **Creator của task** và **người tạo comment** có thể xóa comment

---

## 🚀 4. ADVANCED FEATURES

### 4.1 Lấy Task Kết Hợp (Regular + Project Tasks)
```http
GET /api/tasks/my-tasks/combined?page=0&size=10&sortBy=updatedAt&sortDir=desc
```

### 4.2 Lấy Task Summary Kết Hợp
```http
GET /api/tasks/my-tasks/combined-summary?page=0&size=20&sortBy=updatedAt&sortDir=desc
```

### 4.3 Lấy Tasks Theo Project
```http
GET /api/tasks/project/{projectId}
```

### 4.4 Lấy Tasks Theo Team
```http
GET /api/tasks/team/{teamId}
```

---

## ❌ 5. XỬ LÝ LỖI

### 5.1 Lỗi Authentication
```json
{
  "timestamp": "2025-08-23T15:30:00",
  "status": 401,
  "error": "Unauthorized",
  "message": "User not authenticated"
}
```

### 5.2 Lỗi Permission
```json
{
  "timestamp": "2025-08-23T15:30:00",
  "status": 403,
  "error": "Forbidden",
  "message": "You don't have permission to update this task"
}
```

### 5.3 Lỗi Email Assignment
```json
{
  "timestamp": "2025-08-23T15:30:00",
  "status": 400,
  "error": "Email Not Found",
  "message": "Task assignment failed. Invalid emails found: invalid@email.com (user not found), bad-format (invalid format). Valid emails: valid@email.com",
  "invalidEmails": ["invalid@email.com (user not found)", "bad-format (invalid format)"]
}
```

### 5.4 Lỗi Not Found
```json
{
  "timestamp": "2025-08-23T15:30:00",
  "status": 404,
  "error": "Not Found",
  "message": "Task not found"
}
```

### 5.5 Lỗi Validation
```json
{
  "timestamp": "2025-08-23T15:30:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "errors": [
    {
      "field": "title",
      "message": "Title is required"
    },
    {
      "field": "assignedToEmails[0]",
      "message": "Invalid email format"
    }
  ]
}
```

---

## 📋 6. CHECKLIST SỬ DỤNG API

### ✅ Tạo Task Mới:
1. Gọi `POST /api/tasks/my-tasks` với đầy đủ thông tin
2. Kiểm tra response có `id` và `assignedToEmails`
3. Verify assignees nhận được task

### ✅ Giao Task:
1. Sử dụng `assignedToEmails` cho user mới
2. Sử dụng `addAssigneeEmails` để thêm assignee
3. Sử dụng `removeAssigneeEmails` để xóa assignee
4. Kiểm tra response trả về danh sách assignee mới

### ✅ Quản Lý Comment:
1. Tạo comment: `POST /api/task-comments`
2. Lấy comments: `GET /api/task-comments/task/{taskId}?page=0&size=10`
3. Đếm comments: `GET /api/task-comments/task/{taskId}/count`
4. Cập nhật comment: `PUT /api/task-comments/{commentId}`
5. Xóa comment: `DELETE /api/task-comments/{commentId}`

### ✅ Theo Dõi Task:
1. Lấy danh sách: `GET /api/tasks/my-tasks`
2. Lấy thống kê: `GET /api/tasks/my-tasks/stats`
3. Lấy chi tiết: `GET /api/tasks/{taskId}`

---

## 🔍 7. TROUBLESHOOTING

### Vấn đề thường gặp:

**1. Lỗi 404 khi lấy comments:**
- Kiểm tra `taskId` có đúng không
- Kiểm tra user có quyền xem task không (creator hoặc assignee)

**2. Lỗi 500 khi tạo comment:**
- Kiểm tra task có tồn tại không
- Kiểm tra user có quyền comment không
- Kiểm tra JWT token có hợp lệ không

**3. Lỗi assignment email:**
- Đảm bảo email đúng định dạng
- Kiểm tra user với email đó có tồn tại trong hệ thống không
- Sử dụng email chính xác (case-sensitive)

**4. Task không hiển thị:**
- Kiểm tra user có phải creator hoặc assignee không
- Kiểm tra pagination parameters
- Kiểm tra sort parameters

---

## 📞 LIÊN HỆ HỖ TRỢ

Nếu gặp vấn đề, vui lòng cung cấp:
1. HTTP method và endpoint
2. Request body (ẩn sensitive data)
3. Response error
4. User ID và email
5. Task ID (nếu có)

**Happy Coding! 🚀**
