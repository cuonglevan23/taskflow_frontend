// Comment types for task management
export interface TaskComment {
  id: string;
  taskId: string;
  content: string;
  authorId: string;
  authorName: string;
  authorEmail: string;
  createdAt: Date;
  updatedAt: Date;
  isEdited?: boolean;
}

export interface CreateCommentRequest {
  taskId: string;
  content: string;
}

export interface UpdateCommentRequest {
  id: string;
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
