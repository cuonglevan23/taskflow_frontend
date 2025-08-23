// Comment types for task management
export interface TaskComment {
  id: number;                 // ID của comment
  content: string;            // Nội dung comment
  createdAt: string;          // Thời gian tạo (ISO 8601)
  updatedAt: string;          // Thời gian cập nhật (ISO 8601)
  taskId: number;             // ID của task
  userId: number;             // ID của user tạo comment
  userEmail: string;          // Email của user
  userName: string;           // Tên đầy đủ của user
  userAvatar: string | null;  // URL avatar của user
  isEdited?: boolean;         // Có đang được chỉnh sửa không
}

export interface CreateCommentRequest {
  taskId: number;
  content: string;
}

export interface UpdateCommentRequest {
  id: number;
  content: string;
}

export interface CommentListResponse {
  comments: TaskComment[];
  total: number;
  page: number;
  size: number;
}

// Update task description request
export interface UpdateTaskDescriptionRequest {
  taskId: string;
  description: string;
}

// Task comment field update request
export interface UpdateTaskCommentRequest {
  taskId: string;
  comment: string;
}

// Enhanced task interface to include comments
export interface TaskWithComments {
  id: string;
  title: string;
  description: string;
  comment?: string; // Task comment field from API
  comments: TaskComment[]; // Comments array
  commentsCount: number;
}
