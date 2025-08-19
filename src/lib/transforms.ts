// Centralized Data Transformation Functions
// Consolidates all transform logic to avoid duplication

// Safe date parsing function - handles multiple backend formats
export const safeParseDate = (dateValue: unknown): Date => {
  if (!dateValue) {
    return new Date();
  }
  
  try {
    // Handle array format from backend [year, month, day] 
    if (Array.isArray(dateValue) && dateValue.length >= 3) {
      const [year, month, day] = dateValue.map(Number);
      // Backend sends 1-indexed month, convert to 0-indexed for JS Date
      // Use noon time to avoid timezone issues
      const localDate = new Date(year, month - 1, day, 12, 0, 0, 0);
      return localDate;
    }
    
    // Handle string format YYYY-MM-DD
    if (typeof dateValue === 'string' && dateValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = dateValue.split('-').map(Number);
      // Create date in local timezone with noon time to avoid UTC conversion issues
      const localDate = new Date(year, month - 1, day, 12, 0, 0, 0); // month is 0-indexed
      return localDate;
    }
    
    // For other formats, use regular parsing
    const parsed = new Date(dateValue);
    return isNaN(parsed.getTime()) ? new Date() : parsed;
  } catch (error) {
    return new Date();
  }
};

// Format date to YYYY-MM-DD string
export const formatDateString = (date: Date | string | any[]): string => {
  if (Array.isArray(date) && date.length >= 3) {
    const [year, month, day] = date.map(Number);
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }
  
  if (typeof date === 'string') {
    return date;
  }
  
  if (date instanceof Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  return new Date().toISOString().split('T')[0];
};

// Normalize status from backend to frontend format
export const normalizeStatus = (backendStatus: string): 'completed' | 'in-progress' | 'pending' => {
  switch (backendStatus?.toUpperCase()) {
    case 'DONE':
    case 'COMPLETED':
      return 'completed';
    case 'IN_PROGRESS':
    case 'PROGRESS':
      return 'in-progress';
    case 'TODO':
    case 'PENDING':
    default:
      return 'pending';
  }
};

// Normalize priority from backend to frontend format
export const normalizePriority = (backendPriority: string): 'low' | 'medium' | 'high' | 'urgent' => {
  switch (backendPriority?.toLowerCase()) {
    case 'low':
      return 'low';
    case 'medium':
      return 'medium';
    case 'high':
      return 'high';
    case 'urgent':
      return 'urgent';
    default:
      return 'medium';
  }
};

// Convert frontend status to backend format
export const toBackendStatus = (frontendStatus: string): string => {
  const status = frontendStatus.toLowerCase(); // Handle both uppercase and lowercase
  switch (status) {
    case 'completed':
    case 'done':
      return 'COMPLETED';
    case 'in-progress':
    case 'in_progress':
      return 'IN_PROGRESS';
    case 'review':
      return 'REVIEW';
    case 'todo':
    case 'pending':
    default:
      return 'TODO';
  }
};

// Convert frontend priority to backend format
export const toBackendPriority = (frontendPriority: string): string => {
  switch (frontendPriority?.toLowerCase()) {
    case 'low':
      return 'LOW';
    case 'medium':
      return 'MEDIUM';
    case 'high':
      return 'HIGH';
    case 'urgent':
      return 'URGENT';
    default:
      return 'MEDIUM';
  }
};

// Generic response transformer
export const transformPaginatedResponse = <T, U>(
  response: {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
  },
  itemTransformer: (item: T) => U
) => {
  return {
    items: response.content.map(itemTransformer),
    totalElements: response.totalElements,
    totalPages: response.totalPages,
    currentPage: response.number,
    pageSize: response.size,
  };
};

// Error response transformer
export const transformErrorResponse = (error: unknown) => {
  return {
    message: error?.response?.data?.message || error?.message || 'An error occurred',
    status: error?.response?.status || 500,
    code: error?.response?.data?.code || 'UNKNOWN_ERROR',
    details: error?.response?.data?.details || null,
  };
};

// User data transformer
export const transformUser = (backendUser: Record<string, unknown>) => {
  return {
    id: backendUser.id?.toString() || 'unknown',
    name: (backendUser.name as string) || (backendUser.username as string) || 'Unknown User',
    email: (backendUser.email as string) || '',
    avatar: (backendUser.avatar as string) || (backendUser.profileImage as string) || null,
    role: (backendUser.role as string)?.toLowerCase() || 'member',
    teamIds: (backendUser.teamIds as string[]) || [],
    permissions: (backendUser.permissions as string[]) || [],
    createdAt: safeParseDate(backendUser.createdAt),
    updatedAt: safeParseDate(backendUser.updatedAt),
  };
};

// Team data transformer
export const transformTeam = (backendTeam: Record<string, unknown>) => {
  return {
    id: backendTeam.id?.toString() || 'unknown',
    name: backendTeam.name || 'Unnamed Team',
    description: backendTeam.description || '',
    color: backendTeam.color || '#3B82F6',
    memberIds: backendTeam.memberIds || [],
    managerId: backendTeam.managerId?.toString() || null,
    projectIds: backendTeam.projectIds || [],
    createdAt: safeParseDate(backendTeam.createdAt),
    updatedAt: safeParseDate(backendTeam.updatedAt),
  };
};

// Project data transformer
export const transformProject = (backendProject: Record<string, unknown>) => {
  return {
    id: backendProject.id?.toString() || 'unknown',
    name: backendProject.name || 'Unnamed Project',
    description: backendProject.description || '',
    status: normalizeStatus(backendProject.status),
    priority: normalizePriority(backendProject.priority),
    startDate: safeParseDate(backendProject.startDate),
    endDate: safeParseDate(backendProject.endDate),
    teamId: backendProject.teamId?.toString() || null,
    managerId: backendProject.managerId?.toString() || null,
    memberIds: backendProject.memberIds || [],
    createdAt: safeParseDate(backendProject.createdAt),
    updatedAt: safeParseDate(backendProject.updatedAt),
  };
};

// Calculate days between two dates
export const calculateDaysBetween = (startDate: Date, endDate: Date): number => {
  const timeDifference = endDate.getTime() - startDate.getTime();
  const daysDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
  return Math.max(0, daysDifference);
};

// Check if a date is overdue (past current date)
export const isDateOverdue = (date: Date): boolean => {
  const today = new Date();
  today.setHours(23, 59, 59, 999); // End of today
  return date.getTime() < today.getTime();
};