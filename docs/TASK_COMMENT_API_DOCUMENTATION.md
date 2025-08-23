# 📝 Task Comment API Documentation

## 📋 Tổng quan
API TaskComment hỗ trợ hệ thống comment đa người dùng cho tasks, cho phép nhiều users comment trên cùng một task mà không bị ghi đè.

## 🔗 Base URL
```
http://localhost:8080/api/task-comments
```

## 🔐 Authentication
Tất cả endpoints yêu cầu JWT token trong header:
```http
Authorization: Bearer <your-jwt-token>
```

---

## 📍 API Endpoints

### 1. 🆕 Tạo Comment Mới

#### **POST** `/api/task-comments`

**Description:** Tạo comment mới cho một task

**Request Headers:**
```http
Content-Type: application/json
Authorization: Bearer <jwt-token>
```

**Request Body:**
```typescript
interface CreateTaskCommentRequest {
  content: string;     // ✅ Required - Nội dung comment
  taskId: number;      // ✅ Required - ID của task
}
```

**Example Request:**
```http
POST /api/task-comments
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "content": "Tôi nghĩ task này cần thêm validation cho form input",
  "taskId": 35
}
```

**Response:**
```typescript
interface TaskCommentResponse {
  id: number;                    // ID của comment
  content: string;               // Nội dung comment
  createdAt: string;             // Thời gian tạo (ISO 8601)
  updatedAt: string;             // Thời gian cập nhật (ISO 8601)
  taskId: number;                // ID của task
  userId: number;                // ID của user tạo comment
  userEmail: string;             // Email của user
  userName: string;              // Tên đầy đủ của user
  userAvatar: string | null;     // URL avatar của user
}
```

**Example Response:**
```json
{
  "id": 1,
  "content": "Tôi nghĩ task này cần thêm validation cho form input",
  "createdAt": "2024-01-15T10:30:00",
  "updatedAt": "2024-01-15T10:30:00",
  "taskId": 35,
  "userId": 123,
  "userEmail": "cuonglv.21ad@vku.udn.vn",
  "userName": "Lê Văn Cường",
  "userAvatar": "https://example.com/avatar.jpg"
}
```

**Error Responses:**
- `400 Bad Request` - Thiếu thông tin bắt buộc
- `401 Unauthorized` - Chưa đăng nhập
- `403 Forbidden` - Không có quyền comment trên task này
- `404 Not Found` - Task không tồn tại

---

### 2. 📖 Lấy Tất Cả Comments Của Task

#### **GET** `/api/task-comments/task/{taskId}`

**Description:** Lấy tất cả comments của một task (sắp xếp theo thời gian tạo tăng dần)

**Path Parameters:**
- `taskId` (number) - ID của task

**Example Request:**
```http
GET /api/task-comments/task/35
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```typescript
interface TaskCommentResponse[] {
  // Array of TaskCommentResponse objects
}
```

**Example Response:**
```json
[
  {
    "id": 1,
    "content": "Tôi nghĩ task này cần thêm validation cho form input",
    "createdAt": "2024-01-15T10:30:00",
    "updatedAt": "2024-01-15T10:30:00",
    "taskId": 35,
    "userId": 123,
    "userEmail": "cuonglv.21ad@vku.udn.vn",
    "userName": "Lê Văn Cường",
    "userAvatar": "https://example.com/avatar.jpg"
  },
  {
    "id": 2,
    "content": "Đồng ý! Tôi sẽ thêm validation cho các trường required",
    "createdAt": "2024-01-15T11:00:00",
    "updatedAt": "2024-01-15T11:00:00",
    "taskId": 35,
    "userId": 456,
    "userEmail": "nguyenvan.a@example.com",
    "userName": "Nguyễn Văn A",
    "userAvatar": null
  }
]
```

---

### 3. 📄 Lấy Comments Với Phân Trang

#### **GET** `/api/task-comments/task/{taskId}/paginated`

**Description:** Lấy comments của task với phân trang (sắp xếp theo thời gian tạo giảm dần)

**Path Parameters:**
- `taskId` (number) - ID của task

**Query Parameters:**
- `page` (number, optional) - Số trang (default: 0)
- `size` (number, optional) - Số items per page (default: 10)

**Example Request:**
```http
GET /api/task-comments/task/35/paginated?page=0&size=5
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```typescript
interface PaginatedTaskComments {
  content: TaskCommentResponse[];    // Array comments trong trang hiện tại
  pageable: {
    pageNumber: number;              // Số trang hiện tại
    pageSize: number;                // Số items per page
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalElements: number;             // Tổng số comments
  totalPages: number;                // Tổng số trang
  last: boolean;                     // Có phải trang cuối không
  size: number;                      // Số items per page
  number: number;                    // Số trang hiện tại
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  numberOfElements: number;          // Số items trong trang hiện tại
  first: boolean;                    // Có phải trang đầu không
  empty: boolean;                    // Trang có rỗng không
}
```

**Example Response:**
```json
{
  "content": [
    {
      "id": 2,
      "content": "Đồng ý! Tôi sẽ thêm validation cho các trường required",
      "createdAt": "2024-01-15T11:00:00",
      "updatedAt": "2024-01-15T11:00:00",
      "taskId": 35,
      "userId": 456,
      "userEmail": "nguyenvan.a@example.com",
      "userName": "Nguyễn Văn A",
      "userAvatar": null
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 5,
    "sort": {
      "empty": false,
      "sorted": true,
      "unsorted": false
    },
    "offset": 0,
    "paged": true,
    "unpaged": false
  },
  "totalElements": 2,
  "totalPages": 1,
  "last": true,
  "size": 5,
  "number": 0,
  "sort": {
    "empty": false,
    "sorted": true,
    "unsorted": false
  },
  "numberOfElements": 2,
  "first": true,
  "empty": false
}
```

---

### 4. ✏️ Cập Nhật Comment

#### **PUT** `/api/task-comments/{commentId}`

**Description:** Cập nhật nội dung comment (chỉ người tạo comment mới được sửa)

**Path Parameters:**
- `commentId` (number) - ID của comment

**Request Body:**
```typescript
interface UpdateTaskCommentRequest {
  content?: string;    // ⚠️ Optional - Nội dung comment mới
}
```

**Example Request:**
```http
PUT /api/task-comments/1
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "content": "Tôi nghĩ task này cần thêm validation cho form input và thêm error handling"
}
```

**Response:** Same as TaskCommentResponse

**Error Responses:**
- `403 Forbidden` - Chỉ người tạo comment mới được sửa
- `404 Not Found` - Comment không tồn tại

---

### 5. 🗑️ Xóa Comment

#### **DELETE** `/api/task-comments/{commentId}`

**Description:** Xóa comment (người tạo comment hoặc creator của task có thể xóa)

**Path Parameters:**
- `commentId` (number) - ID của comment

**Example Request:**
```http
DELETE /api/task-comments/1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
"Comment deleted successfully"
```

**Error Responses:**
- `403 Forbidden` - Không có quyền xóa comment này
- `404 Not Found` - Comment không tồn tại

---

### 6. 🔢 Đếm Số Comments

#### **GET** `/api/task-comments/task/{taskId}/count`

**Description:** Đếm tổng số comments của một task

**Path Parameters:**
- `taskId` (number) - ID của task

**Example Request:**
```http
GET /api/task-comments/task/35/count
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```typescript
interface CommentCountResponse {
  commentCount: number;
}
```

**Example Response:**
```json
{
  "commentCount": 5
}
```

---

## 🔒 Quyền Hạn (Permissions)

### **Xem Comments:**
- Creator của task
- Users được assign vào task

### **Tạo Comments:**
- Creator của task
- Users được assign vào task

### **Sửa Comments:**
- ✅ Chỉ người tạo comment đó

### **Xóa Comments:**
- ✅ Người tạo comment
- ✅ Creator của task

---

## 💻 Frontend Integration Examples

### React/TypeScript Example

```typescript
// types/taskComment.ts
export interface TaskComment {
  id: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  taskId: number;
  userId: number;
  userEmail: string;
  userName: string;
  userAvatar: string | null;
}

export interface CreateCommentRequest {
  content: string;
  taskId: number;
}

// services/taskCommentService.ts
import axios from 'axios';

const API_BASE = 'http://localhost:8080/api/task-comments';

export const taskCommentService = {
  // Lấy tất cả comments của task
  getComments: async (taskId: number): Promise<TaskComment[]> => {
    const response = await axios.get(`${API_BASE}/task/${taskId}`, {
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    });
    return response.data;
  },

  // Lấy comments với phân trang
  getCommentsPaginated: async (taskId: number, page = 0, size = 10) => {
    const response = await axios.get(
      `${API_BASE}/task/${taskId}/paginated?page=${page}&size=${size}`,
      {
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      }
    );
    return response.data;
  },

  // Tạo comment mới
  createComment: async (data: CreateCommentRequest): Promise<TaskComment> => {
    const response = await axios.post(API_BASE, data, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`
      }
    });
    return response.data;
  },

  // Cập nhật comment
  updateComment: async (commentId: number, content: string): Promise<TaskComment> => {
    const response = await axios.put(`${API_BASE}/${commentId}`, { content }, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`
      }
    });
    return response.data;
  },

  // Xóa comment
  deleteComment: async (commentId: number): Promise<void> => {
    await axios.delete(`${API_BASE}/${commentId}`, {
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    });
  },

  // Đếm số comments
  getCommentCount: async (taskId: number): Promise<number> => {
    const response = await axios.get(`${API_BASE}/task/${taskId}/count`, {
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    });
    return response.data.commentCount;
  }
};

function getToken(): string {
  return localStorage.getItem('authToken') || '';
}
```

### React Component Example

```tsx
// components/TaskComments.tsx
import React, { useState, useEffect } from 'react';
import { TaskComment, CreateCommentRequest } from '../types/taskComment';
import { taskCommentService } from '../services/taskCommentService';

interface TaskCommentsProps {
  taskId: number;
}

export const TaskComments: React.FC<TaskCommentsProps> = ({ taskId }) => {
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [commentCount, setCommentCount] = useState(0);

  // Load comments khi component mount
  useEffect(() => {
    loadComments();
    loadCommentCount();
  }, [taskId]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const data = await taskCommentService.getComments(taskId);
      setComments(data);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCommentCount = async () => {
    try {
      const count = await taskCommentService.getCommentCount(taskId);
      setCommentCount(count);
    } catch (error) {
      console.error('Error loading comment count:', error);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const commentData: CreateCommentRequest = {
        content: newComment.trim(),
        taskId
      };

      const newCommentResponse = await taskCommentService.createComment(commentData);
      setComments(prev => [...prev, newCommentResponse]);
      setNewComment('');
      setCommentCount(prev => prev + 1);
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Không thể thêm comment');
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa comment này?')) return;

    try {
      await taskCommentService.deleteComment(commentId);
      setComments(prev => prev.filter(c => c.id !== commentId));
      setCommentCount(prev => prev - 1);
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Không thể xóa comment');
    }
  };

  if (loading) return <div>Loading comments...</div>;

  return (
    <div className="task-comments">
      <h3>Comments ({commentCount})</h3>
      
      {/* Form thêm comment */}
      <div className="add-comment">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Viết comment..."
          rows={3}
          className="comment-input"
        />
        <button onClick={handleAddComment} disabled={!newComment.trim()}>
          Thêm Comment
        </button>
      </div>

      {/* Danh sách comments */}
      <div className="comments-list">
        {comments.map(comment => (
          <div key={comment.id} className="comment-item">
            <div className="comment-header">
              <img 
                src={comment.userAvatar || '/default-avatar.png'} 
                alt={comment.userName}
                className="avatar"
              />
              <div className="comment-meta">
                <span className="author">{comment.userName}</span>
                <span className="timestamp">
                  {new Date(comment.createdAt).toLocaleString('vi-VN')}
                </span>
              </div>
              <button 
                onClick={() => handleDeleteComment(comment.id)}
                className="delete-btn"
              >
                🗑️
              </button>
            </div>
            <div className="comment-content">
              {comment.content}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
```

---

## 🚨 Error Handling

### Common Error Responses

```typescript
interface ErrorResponse {
  message: string;
  error: string;
  status: number;
}

// Examples:
{
  "message": "Task not found",
  "error": "Not Found", 
  "status": 404
}

{
  "message": "You don't have permission to comment on this task",
  "error": "Forbidden",
  "status": 403
}

{
  "message": "Authentication required: Please provide a valid access token",
  "error": "Unauthorized",
  "status": 401
}
```

### Frontend Error Handling

```typescript
try {
  const comments = await taskCommentService.getComments(taskId);
  setComments(comments);
} catch (error) {
  if (error.response?.status === 404) {
    alert('Task không tồn tại');
  } else if (error.response?.status === 403) {
    alert('Bạn không có quyền xem comments của task này');
  } else if (error.response?.status === 401) {
    // Redirect to login
    window.location.href = '/login';
  } else {
    alert('Đã có lỗi xảy ra');
  }
}
```

---

## 🔄 Workflow Integration

### Tích hợp với My-Tasks API

```typescript
// Khi load task detail, load cả comments
const loadTaskDetail = async (taskId: number) => {
  try {
    // Load task info
    const task = await taskService.getTaskById(taskId);
    
    // Load comments
    const comments = await taskCommentService.getComments(taskId);
    const commentCount = await taskCommentService.getCommentCount(taskId);
    
    return {
      ...task,
      comments,
      commentCount
    };
  } catch (error) {
    console.error('Error loading task detail:', error);
  }
};
```

### Real-time Updates (Optional)

```typescript
// WebSocket hoặc polling để update comments real-time
const useRealTimeComments = (taskId: number) => {
  const [comments, setComments] = useState<TaskComment[]>([]);

  useEffect(() => {
    // Polling every 30 seconds
    const interval = setInterval(async () => {
      try {
        const latestComments = await taskCommentService.getComments(taskId);
        setComments(latestComments);
      } catch (error) {
        console.error('Error polling comments:', error);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [taskId]);

  return comments;
};
```

---

## 📱 Mobile/Responsive Considerations

### Pagination cho Mobile
```typescript
// Load comments theo batch cho mobile
const useInfiniteComments = (taskId: number) => {
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const loadMore = async () => {
    try {
      const response = await taskCommentService.getCommentsPaginated(taskId, page, 10);
      
      if (response.content.length === 0) {
        setHasMore(false);
        return;
      }

      setComments(prev => [...prev, ...response.content]);
      setPage(prev => prev + 1);
      setHasMore(!response.last);
    } catch (error) {
      console.error('Error loading more comments:', error);
    }
  };

  return { comments, loadMore, hasMore };
};
```

---

## 🎯 Best Practices

### 1. **Caching Comments**
```typescript
// Cache comments để tránh gọi API liên tục
const commentCache = new Map<number, TaskComment[]>();

const getCachedComments = async (taskId: number): Promise<TaskComment[]> => {
  if (commentCache.has(taskId)) {
    return commentCache.get(taskId)!;
  }
  
  const comments = await taskCommentService.getComments(taskId);
  commentCache.set(taskId, comments);
  return comments;
};
```

### 2. **Optimistic Updates**
```typescript
const addCommentOptimistic = async (content: string, taskId: number) => {
  // Thêm comment tạm thời vào UI
  const tempComment: TaskComment = {
    id: -1, // Temporary ID
    content,
    taskId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: currentUser.id,
    userEmail: currentUser.email,
    userName: currentUser.name,
    userAvatar: currentUser.avatar
  };

  setComments(prev => [...prev, tempComment]);

  try {
    // Gọi API
    const realComment = await taskCommentService.createComment({ content, taskId });
    
    // Replace temporary comment với real comment
    setComments(prev => 
      prev.map(c => c.id === -1 ? realComment : c)
    );
  } catch (error) {
    // Remove temporary comment nếu failed
    setComments(prev => prev.filter(c => c.id !== -1));
    throw error;
  }
};
```

### 3. **Validation**
```typescript
const validateComment = (content: string): string | null => {
  if (!content.trim()) {
    return 'Comment không được để trống';
  }
  
  if (content.length > 1000) {
    return 'Comment không được vượt quá 1000 ký tự';
  }
  
  return null;
};
```

---

## 🧪 Testing Examples

### Unit Test Example
```typescript
// __tests__/taskCommentService.test.ts
import { taskCommentService } from '../services/taskCommentService';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('TaskCommentService', () => {
  beforeEach(() => {
    mockedAxios.get.mockClear();
    mockedAxios.post.mockClear();
  });

  it('should fetch comments for a task', async () => {
    const mockComments = [
      {
        id: 1,
        content: 'Test comment',
        taskId: 35,
        userId: 123,
        userEmail: 'test@example.com',
        userName: 'Test User',
        userAvatar: null,
        createdAt: '2024-01-15T10:30:00',
        updatedAt: '2024-01-15T10:30:00'
      }
    ];

    mockedAxios.get.mockResolvedValue({ data: mockComments });

    const result = await taskCommentService.getComments(35);

    expect(mockedAxios.get).toHaveBeenCalledWith(
      'http://localhost:8080/api/task-comments/task/35',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: expect.stringMatching(/Bearer .+/)
        })
      })
    );
    expect(result).toEqual(mockComments);
  });
});
```

---

## 📊 Performance Tips

1. **Lazy Loading**: Chỉ load comments khi user click vào tab comments
2. **Pagination**: Sử dụng pagination cho tasks có nhiều comments
3. **Debouncing**: Debounce input khi user typing comment
4. **Image Optimization**: Optimize avatar images
5. **Caching**: Cache comments đã load để tránh re-fetch

---

Tài liệu này cung cấp đầy đủ thông tin cần thiết cho team frontend để tích hợp API TaskComment. Nếu có thắc mắc hoặc cần thêm thông tin, vui lòng liên hệ team backend.
