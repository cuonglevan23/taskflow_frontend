# 📧 API Documentation - Mời User Vào Project

## 🎯 Tổng quan
API cho phép mời người dùng tham gia vào project thông qua email invitation system.

## 🚀 Base URL
```
http://localhost:8080/api/project-invitations
```

---

## 📚 API Endpoints

### 1. Tạo Lời Mời Mới

**POST** `/api/project-invitations`

#### Request Body
```json
{
  "email": "user@example.com",
  "projectId": 1,
  "invitedById": 2
}
```

#### Request DTO Structure
```java
CreateProjectInvitationRequestDto {
  @NotBlank @Email
  private String email;        // Email người được mời
  
  @NotNull
  private Long projectId;      // ID của project
  
  @NotNull
  private Long invitedById;    // ID người gửi lời mời
}
```

#### Response
```json
{
  "id": 1,
  "email": "user@example.com",
  "projectId": 1,
  "projectName": "My Project",
  "invitedById": 2,
  "invitedByName": "John Doe",
  "status": "PENDING",
  "token": "uuid-token-here",
  "createdAt": "2024-01-15T10:30:00"
}
```

---

### 2. Lấy Danh Sách Lời Mời Theo Project

**GET** `/api/project-invitations/project/{projectId}`

#### Response
```json
[
  {
    "id": 1,
    "email": "user1@example.com",
    "projectId": 1,
    "projectName": "My Project",
    "invitedById": 2,
    "invitedByName": "John Doe",
    "status": "PENDING",
    "token": "uuid-token-1",
    "createdAt": "2024-01-15T10:30:00"
  },
  {
    "id": 2,
    "email": "user2@example.com",
    "projectId": 1,
    "projectName": "My Project", 
    "invitedById": 2,
    "invitedByName": "John Doe",
    "status": "ACCEPTED",
    "token": "uuid-token-2",
    "createdAt": "2024-01-14T09:15:00"
  }
]
```

---

### 3. Cập Nhật Trạng Thái Lời Mời

**PUT** `/api/project-invitations/{invitationId}/status`

#### Request Body
```json
{
  "status": "ACCEPTED"
}
```

#### Available Status Values
- `PENDING` - Chờ phản hồi
- `ACCEPTED` - Đã chấp nhận
- `REJECTED` - Đã từ chối
- `EXPIRED` - Đã hết hạn

---

### 4. Chấp Nhận Lời Mời (từ Email Link)

**GET** `/api/invitations/accept-project?token={token}`

> ⚠️ **Lưu ý**: Endpoint này được gọi tự động khi user click vào link trong email

---

## 🔄 Flow Hoàn Chỉnh

### 1. Tạo Lời Mời
```bash
curl -X POST http://localhost:8080/api/project-invitations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {jwt-token}" \
  -d '{
    "email": "newuser@example.com",
    "projectId": 1,
    "invitedById": 2
  }'
```

### 2. Hệ Thống Tự Động
- ✅ Validate dữ liệu đầu vào
- ✅ Tạo unique token (UUID)
- ✅ Lưu vào database với status `PENDING`
- ✅ Gửi email với link: `localhost:8080/api/invitations/accept-project?token={token}`

### 3. User Nhận Email và Click Link
- User click vào link trong email
- Hệ thống validate token
- Cập nhật status thành `ACCEPTED`
- Tạo record trong `project_members`

### 4. Kiểm Tra Trạng Thái
```bash
curl -X GET http://localhost:8080/api/project-invitations/project/1 \
  -H "Authorization: Bearer {jwt-token}"
```

---

## 🗃️ Database Tables

### `project_invitations`
- `id` - Primary key
- `email` - Email người được mời
- `project_id` - Foreign key to projects
- `invited_by` - Foreign key to users (người mời)
- `status` - Enum: PENDING/ACCEPTED/REJECTED/EXPIRED
- `token` - UUID token để accept
- `created_at` - Timestamp

### `project_members` (sau khi accept)
- `id` - Primary key  
- `project_id` - Foreign key to projects
- `user_id` - Foreign key to users
- `joined_at` - Timestamp

---

## 🛡️ Security & Validation

### Authentication Required
- Tất cả endpoints yêu cầu JWT token
- Chỉ project owner/admin mới có thể mời user

### Validation Rules
- Email phải hợp lệ format
- Project và User phải tồn tại
- Không thể mời duplicate user
- Token có thể expire (tùy business logic)

---

## 🚨 Error Responses

```json
{
  "error": "EntityNotFoundException",
  "message": "Project không tồn tại"
}
```

```json
{
  "error": "IllegalStateException", 
  "message": "Lời mời đã hết hạn hoặc đã xử lý trước đó"
}
```

---

## 📋 Ví Dụ Sử Dụng Complete

```javascript
// 1. Tạo lời mời
const invitation = await fetch('/api/project-invitations', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  },
  body: JSON.stringify({
    email: 'colleague@company.com',
    projectId: 5,
    invitedById: currentUserId
  })
});

// 2. Lấy danh sách lời mời
const invitations = await fetch('/api/project-invitations/project/5');

// 3. User click email link → tự động accept
// Link: localhost:8080/api/invitations/accept-project?token=abc123
```

---

## 🔗 Related APIs

Xem thêm:
- [Team Invitation API](./TEAM_INVITATION_API.md) - Mời user vào team
- [Project Management API](./PROJECT_API.md) - Quản lý projects
- [Authentication API](./AUTH_API.md) - Xác thực người dùng

---

## 📝 Implementation Notes

### Service Layer
- `ProjectInvitationService.createInvitation()` - Tạo lời mời
- `ProjectInvitationService.acceptInvitation()` - Chấp nhận lời mời
- `EmailService.sendInvitationEmail()` - Gửi email thông báo

### Repository Layer
- `ProjectInvitationRepository.findByToken()` - Tìm theo token
- `ProjectInvitationRepository.findByProjectId()` - Lấy theo project

### Controller Layer
- `ProjectInvitationController` - REST endpoints chính
- Validation sử dụng `@Valid` annotation
- Error handling với custom exceptions