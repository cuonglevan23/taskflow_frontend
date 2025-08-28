# Task Activity API Documentation

## Tổng quan
Task Activity API cung cấp các endpoint để theo dõi và quản lý lịch sử hoạt động của các task. API này cho phép lấy thông tin về tất cả các thay đổi, cập nhật và hoạt động liên quan đến một task cụ thể.

## Base URL
```
/api/tasks/{taskId}/activities
```

---

## 📚 Kiểu dữ liệu (Data Types)

### TaskActivityResponseDto
Đây là kiểu dữ liệu chính được trả về bởi tất cả các endpoints của Task Activity API.

```java
{
    "id": Long,                    // ID duy nhất của activity
    "taskId": Long,                // ID của task mà activity thuộc về
    "activityType": String,        // Loại hoạt động (xem TaskActivityType)
    "description": String,         // Mô tả chi tiết về hoạt động
    "oldValue": String,           // Giá trị cũ (trước khi thay đổi)
    "newValue": String,           // Giá trị mới (sau khi thay đổi)
    "fieldName": String,          // Tên field bị thay đổi
    "createdAt": LocalDateTime,   // Thời gian tạo activity
    "user": UserProfileDto,       // Thông tin user thực hiện hoạt động
    "formattedMessage": String,   // Thông điệp đã format để hiển thị
    "timeAgo": String            // Thời gian relative (vd: "2 minutes ago")
}
```

### UserProfileDto
Thông tin chi tiết về user thực hiện hoạt động:

```java
{
    "userId": Long,               // ID của user
    "email": String,              // Email của user
    "firstName": String,          // Tên
    "lastName": String,           // Họ
    "username": String,           // Username
    "jobTitle": String,           // Chức vụ công việc
    "department": String,         // Phòng ban
    "aboutMe": String,            // Thông tin giới thiệu
    "status": String,             // Trạng thái user (Active, Inactive)
    "avatarUrl": String,          // URL của avatar
    "isUpgraded": Boolean,        // Có phải premium user không
    "displayName": String,        // Tên hiển thị (tự động tính toán)
    "initials": String           // Chữ cái đầu tên (vd: "JD" cho John Doe)
}
```

### TaskActivityType Enum
Các loại hoạt động có thể xảy ra với task:

```java
TASK_CREATED          // Tạo task mới
TASK_UPDATED          // Cập nhật task
STATUS_CHANGED        // Thay đổi trạng thái
PRIORITY_CHANGED      // Thay đổi độ ưu tiên
DEADLINE_CHANGED      // Thay đổi deadline
START_DATE_CHANGED    // Thay đổi ngày bắt đầu
TITLE_CHANGED         // Thay đổi tiêu đề
DESCRIPTION_CHANGED   // Thay đổi mô tả
COMMENT_CHANGED       // Thay đổi comment
FILE_CHANGED          // Thay đổi file đính kèm
ASSIGNEE_ADDED        // Thêm người được giao
ASSIGNEE_REMOVED      // Xóa người được giao
TASK_COMPLETED        // Hoàn thành task
TASK_REOPENED         // Mở lại task
COMMENT_ADDED         // Thêm comment
CHECKLIST_ADDED       // Thêm checklist item
CHECKLIST_REMOVED     // Xóa checklist item
CHECKLIST_COMPLETED   // Hoàn thành checklist item
TEAM_CHANGED          // Thay đổi team
PROJECT_CHANGED       // Thay đổi project
```

---

## 🔗 API Endpoints

### 1. Lấy tất cả activities của task

**Endpoint:** `GET /api/tasks/{taskId}/activities`

**Mô tả:** Lấy tất cả hoạt động của một task cụ thể, sắp xếp theo thời gian mới nhất trước.

**Path Parameters:**
- `taskId` (Long, required): ID của task cần lấy activities

**Response Type:** `List<TaskActivityResponseDto>`

**Example Request:**
```http
GET /api/tasks/123/activities
Authorization: Bearer {jwt_token}
```

**Example Response:**
```json
[
    {
        "id": 456,
        "taskId": 123,
        "activityType": "STATUS_CHANGED",
        "description": "changed status from To Do to In Progress",
        "oldValue": "To Do",
        "newValue": "In Progress",
        "fieldName": "status",
        "createdAt": "2024-01-15T10:30:00",
        "user": {
            "userId": 1,
            "email": "john.doe@company.com",
            "firstName": "John",
            "lastName": "Doe",
            "username": "johndoe",
            "jobTitle": "Senior Developer",
            "department": "Engineering",
            "aboutMe": "Passionate developer with 5 years experience",
            "status": "Active",
            "avatarUrl": "https://storage.company.com/avatars/john-doe.jpg",
            "isUpgraded": true,
            "displayName": "John Doe",
            "initials": "JD"
        },
        "formattedMessage": "John Doe changed status from To Do to In Progress",
        "timeAgo": "2 minutes ago"
    },
    {
        "id": 455,
        "taskId": 123,
        "activityType": "PRIORITY_CHANGED",
        "description": "changed priority from Medium to High",
        "oldValue": "Medium",
        "newValue": "High",
        "fieldName": "priority",
        "createdAt": "2024-01-15T09:15:00",
        "user": {
            "userId": 2,
            "email": "jane.smith@company.com",
            "firstName": "Jane",
            "lastName": "Smith",
            "username": "janesmith",
            "jobTitle": "Project Manager",
            "department": "Product",
            "aboutMe": "Product enthusiast and team leader",
            "status": "Active",
            "avatarUrl": "https://storage.company.com/avatars/jane-smith.jpg",
            "isUpgraded": false,
            "displayName": "Jane Smith",
            "initials": "JS"
        },
        "formattedMessage": "Jane Smith changed priority from Medium to High",
        "timeAgo": "1 hour ago"
    }
]
```

---

### 2. Lấy activities với phân trang

**Endpoint:** `GET /api/tasks/{taskId}/activities/paginated`

**Mô tả:** Lấy activities của task với hỗ trợ phân trang.

**Path Parameters:**
- `taskId` (Long, required): ID của task

**Query Parameters:**
- `page` (int, optional, default: 0): Số trang (bắt đầu từ 0)
- `size` (int, optional, default: 10): Số lượng items per page

**Response Type:** `Page<TaskActivityResponseDto>`

**Example Request:**
```http
GET /api/tasks/123/activities/paginated?page=0&size=5
Authorization: Bearer {jwt_token}
```

**Example Response:**
```json
{
    "content": [
        {
            "id": 456,
            "taskId": 123,
            "activityType": "STATUS_CHANGED",
            "description": "changed status from To Do to In Progress",
            "oldValue": "To Do",
            "newValue": "In Progress",
            "fieldName": "status",
            "createdAt": "2024-01-15T10:30:00",
            "user": {
                "userId": 1,
                "email": "john.doe@company.com",
                "firstName": "John",
                "lastName": "Doe",
                "username": "johndoe",
                "jobTitle": "Senior Developer",
                "department": "Engineering",
                "aboutMe": "Passionate developer",
                "status": "Active",
                "avatarUrl": "https://storage.company.com/avatars/john-doe.jpg",
                "isUpgraded": true,
                "displayName": "John Doe",
                "initials": "JD"
            },
            "formattedMessage": "John Doe changed status from To Do to In Progress",
            "timeAgo": "2 minutes ago"
        }
    ],
    "pageable": {
        "sort": {
            "empty": false,
            "sorted": true,
            "unsorted": false
        },
        "offset": 0,
        "pageSize": 5,
        "pageNumber": 0,
        "paged": true,
        "unpaged": false
    },
    "last": false,
    "totalPages": 3,
    "totalElements": 15,
    "size": 5,
    "number": 0,
    "sort": {
        "empty": false,
        "sorted": true,
        "unsorted": false
    },
    "first": true,
    "numberOfElements": 5,
    "empty": false
}
```

---

### 3. Lấy activities gần đây

**Endpoint:** `GET /api/tasks/{taskId}/activities/recent`

**Mô tả:** Lấy 5 hoạt động gần đây nhất của task.

**Path Parameters:**
- `taskId` (Long, required): ID của task

**Response Type:** `List<TaskActivityResponseDto>`

**Example Request:**
```http
GET /api/tasks/123/activities/recent
Authorization: Bearer {jwt_token}
```

**Example Response:**
```json
[
    {
        "id": 456,
        "taskId": 123,
        "activityType": "TASK_COMPLETED",
        "description": "completed this task",
        "oldValue": null,
        "newValue": null,
        "fieldName": null,
        "createdAt": "2024-01-15T14:45:00",
        "user": {
            "userId": 1,
            "email": "john.doe@company.com",
            "firstName": "John",
            "lastName": "Doe",
            "username": "johndoe",
            "jobTitle": "Senior Developer",
            "department": "Engineering",
            "aboutMe": "Passionate developer",
            "status": "Active",
            "avatarUrl": "https://storage.company.com/avatars/john-doe.jpg",
            "isUpgraded": true,
            "displayName": "John Doe",
            "initials": "JD"
        },
        "formattedMessage": "John Doe completed this task",
        "timeAgo": "Just now"
    },
    {
        "id": 455,
        "taskId": 123,
        "activityType": "ASSIGNEE_ADDED",
        "description": "added alice.johnson@company.com to this task",
        "oldValue": null,
        "newValue": "alice.johnson@company.com",
        "fieldName": "assignee",
        "createdAt": "2024-01-15T14:30:00",
        "user": {
            "userId": 2,
            "email": "jane.smith@company.com",
            "firstName": "Jane",
            "lastName": "Smith",
            "username": "janesmith",
            "jobTitle": "Project Manager",
            "department": "Product",
            "aboutMe": null,
            "status": "Active",
            "avatarUrl": null,
            "isUpgraded": false,
            "displayName": "Jane Smith",
            "initials": "JS"
        },
        "formattedMessage": "Jane Smith added alice.johnson@company.com to this task",
        "timeAgo": "15 minutes ago"
    }
]
```

---

### 4. Đếm số lượng activities

**Endpoint:** `GET /api/tasks/{taskId}/activities/count`

**Mô tả:** Đếm tổng số activities của một task.

**Path Parameters:**
- `taskId` (Long, required): ID của task

**Response Type:** `Long`

**Example Request:**
```http
GET /api/tasks/123/activities/count
Authorization: Bearer {jwt_token}
```

**Example Response:**
```json
25
```

---

## 📊 Các trường hợp sử dụng phổ biến

### 1. Hiển thị Timeline Activities
```javascript
// Frontend code example
async function loadTaskTimeline(taskId) {
    const response = await fetch(`/api/tasks/${taskId}/activities`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    
    const activities = await response.json();
    
    activities.forEach(activity => {
        displayActivity({
            message: activity.formattedMessage,
            time: activity.timeAgo,
            user: {
                name: activity.user.displayName,
                avatar: activity.user.avatarUrl,
                initials: activity.user.initials,
                jobTitle: activity.user.jobTitle
            },
            type: activity.activityType
        });
    });
}
```

### 2. Hiển thị Recent Activities Widget
```javascript
async function loadRecentActivities(taskId) {
    const response = await fetch(`/api/tasks/${taskId}/activities/recent`);
    const recentActivities = await response.json();
    
    return recentActivities.map(activity => ({
        message: activity.formattedMessage,
        timeAgo: activity.timeAgo,
        userAvatar: activity.user.avatarUrl || generateAvatarFromInitials(activity.user.initials),
        activityType: activity.activityType
    }));
}
```

### 3. Activities với Pagination
```javascript
async function loadActivitiesPage(taskId, page = 0, size = 10) {
    const response = await fetch(
        `/api/tasks/${taskId}/activities/paginated?page=${page}&size=${size}`
    );
    
    const pageData = await response.json();
    
    return {
        activities: pageData.content,
        totalPages: pageData.totalPages,
        totalElements: pageData.totalElements,
        currentPage: pageData.number,
        hasNext: !pageData.last,
        hasPrevious: !pageData.first
    };
}
```

---

## 🎨 Frontend Integration Examples

### React Component Example
```jsx
import React, { useEffect, useState } from 'react';

const TaskActivityTimeline = ({ taskId }) => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchActivities = async () => {
            try {
                const response = await fetch(`/api/tasks/${taskId}/activities`);
                const data = await response.json();
                setActivities(data);
            } catch (error) {
                console.error('Error fetching activities:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchActivities();
    }, [taskId]);

    if (loading) return <div>Loading activities...</div>;

    return (
        <div className="activity-timeline">
            <h3>Task Activity Timeline</h3>
            {activities.map((activity) => (
                <div key={activity.id} className="activity-item">
                    <div className="activity-user">
                        {activity.user.avatarUrl ? (
                            <img 
                                src={activity.user.avatarUrl} 
                                alt={activity.user.displayName}
                                className="user-avatar"
                            />
                        ) : (
                            <div className="user-initials">
                                {activity.user.initials}
                            </div>
                        )}
                        <div className="user-info">
                            <span className="user-name">{activity.user.displayName}</span>
                            <span className="user-title">{activity.user.jobTitle}</span>
                        </div>
                    </div>
                    <div className="activity-content">
                        <p className="activity-message">{activity.formattedMessage}</p>
                        <span className="activity-time">{activity.timeAgo}</span>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default TaskActivityTimeline;
```

---

## 🔒 Authentication & Authorization

Tất cả endpoints yêu cầu authentication thông qua JWT token trong header:

```http
Authorization: Bearer {your_jwt_token}
```

### Quyền truy cập:
- **Xem activities**: User phải có quyền truy cập vào task (creator, assignee, hoặc member của project/team)
- **Task activities**: Chỉ hiển thị activities của tasks mà user có quyền xem

---

## ⚠️ Error Handling

### Các mã lỗi phổ biến:

**404 Not Found**
```json
{
    "timestamp": "2024-01-15T10:30:00",
    "status": 404,
    "error": "Not Found",
    "message": "Task not found with id: 123",
    "path": "/api/tasks/123/activities"
}
```

**401 Unauthorized**
```json
{
    "timestamp": "2024-01-15T10:30:00",
    "status": 401,
    "error": "Unauthorized",
    "message": "JWT token is missing or invalid",
    "path": "/api/tasks/123/activities"
}
```

**403 Forbidden**
```json
{
    "timestamp": "2024-01-15T10:30:00",
    "status": 403,
    "error": "Forbidden",
    "message": "You don't have permission to access this task",
    "path": "/api/tasks/123/activities"
}
```

---

## 📈 Performance Considerations

### Caching
- Activities được cache tự động để tăng hiệu suất
- Cache được invalidate khi có activity mới được tạo

### Pagination
- Sử dụng endpoint `/paginated` cho tasks có nhiều activities
- Recommended page size: 10-20 items

### Database Indexing
- Các activities được index theo `taskId` và `createdAt` để tối ưu query performance

---

## 🔄 Real-time Updates

Để nhận real-time updates về activities, có thể implement WebSocket hoặc Server-Sent Events:

```javascript
// WebSocket example
const ws = new WebSocket(`ws://localhost:8080/ws/tasks/${taskId}/activities`);

ws.onmessage = (event) => {
    const newActivity = JSON.parse(event.data);
    // Update UI với activity mới
    addActivityToTimeline(newActivity);
};
```

---

## 📝 Changelog

### Version 1.0.0
- Initial release với 4 endpoints cơ bản
- Support cho tất cả TaskActivityType
- Full user profile information trong response
- Pagination support
- Time ago formatting

---

## 🤝 Support

Nếu có vấn đề hoặc câu hỏi về Task Activity API, vui lòng liên hệ development team hoặc tạo issue trong repository.
