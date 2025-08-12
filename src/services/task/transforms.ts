// Task Data Transformation Functions
import type { 
  BackendTask, 
  Task, 
  MyTasksSummaryItem,
  MyTasksFullItem
} from '@/types/task';

// Safe date parsing function to handle both string and array formats from backend
const safeParseDate = (dateValue: any): Date => {
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

// Transform function - Safe data transformation with date handling
export const transformBackendTask = (backendTask: BackendTask): Task => {
  // Use startDate as primary field (REQUIRED)
  let dueDateString = 'No date';
  let dueDateISO = new Date();
  
  // Priority: startDate > deadline > fallback
  const dateSource = backendTask.startDate || backendTask.deadline;
  if (dateSource) {
    dueDateISO = safeParseDate(dateSource);
    
    // Convert to string format regardless of input type
    if (Array.isArray(dateSource) && dateSource.length >= 3) {
      const [year, month, day] = dateSource.map(Number);
      // Backend sends 1-indexed month, use it directly for string format
      dueDateString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    } else if (typeof dateSource === 'string') {
      dueDateString = dateSource;
    } else {
      // Fallback: format from parsed dueDateISO
      const year = dueDateISO.getFullYear();
      const month = String(dueDateISO.getMonth() + 1).padStart(2, '0'); // Convert 0-indexed back to 1-indexed
      const day = String(dueDateISO.getDate()).padStart(2, '0');
      dueDateString = `${year}-${month}-${day}`;
    }
  }

  return {
    id: backendTask.id,
    title: backendTask.title,
    description: backendTask.description || '',
    dueDate: dueDateString,
    dueDateISO: dueDateISO,
    completed: backendTask.status === 'DONE',
    priority: backendTask.priority?.toLowerCase() || 'medium',
    status: backendTask.status === 'DONE' ? 'completed' :
            backendTask.status === 'IN_PROGRESS' ? 'in-progress' :
            backendTask.status === 'TODO' ? 'pending' : 'pending',
    hasTag: false,
    projectId: backendTask.projectId,
    assigneeId: backendTask.assignedToIds?.[0] || null,
    tags: [],
    createdAt: safeParseDate(backendTask.createdAt),
    updatedAt: safeParseDate(backendTask.updatedAt),
    // Multi-day task support - use same dueDateISO for consistency
    startDate: dueDateISO,
    endDate: dueDateISO,
  };
};

// Transform My Tasks Summary Item to Task format
export const transformMyTasksSummary = (item: MyTasksSummaryItem): Task => {
  // Parse both startDate and deadline separately for multi-day support
  const taskStartDate = safeParseDate(item.startDate);
  const taskEndDate = safeParseDate(item.deadline);
  
  // For display, prioritize startDate > deadline
  const displayDate = item.startDate || item.deadline;
  const taskDueDateISO = safeParseDate(displayDate);

  return {
    id: item.id,
    title: item.title,
    description: '',
    dueDate: displayDate,
    dueDateISO: taskDueDateISO,
    completed: item.status === 'DONE',
    priority: item.priority?.toLowerCase() || 'medium',
    status: item.status === 'DONE' ? 'completed' :
            item.status === 'IN_PROGRESS' ? 'in-progress' :
            item.status === 'TODO' ? 'pending' : 'pending',
    hasTag: !!item.projectName || !!item.teamName,
    tagText: item.projectName || item.teamName || 'Default Project',
    projectId: undefined,
    assigneeId: null,
    tags: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    // Multi-day task support - use separate start and end dates
    startDate: taskStartDate,
    endDate: taskEndDate,
    // Additional fields from summary
    creatorName: item.creatorName,
    participationType: item.participationType,
    isOverdue: item.isOverdue,
    completionPercentage: item.completionPercentage,
    assigneeCount: item.assigneeCount,
    checklistCount: item.checklistCount,
  };
};

// Transform My Tasks Full Item to Task format  
export const transformMyTasksFull = (item: MyTasksFullItem): Task => {
  // Parse deadline to get correct dueDateISO
  const taskDueDateISO = item.deadline ? safeParseDate(item.deadline) : new Date();

  return {
    id: item.id,
    title: item.title,
    description: '',
    dueDate: item.deadline || 'No deadline',
    dueDateISO: taskDueDateISO,
    completed: item.status === 'DONE',
    priority: item.priority?.toLowerCase() || 'medium',
    status: item.status === 'DONE' ? 'completed' :
            item.status === 'IN_PROGRESS' ? 'in-progress' :
            item.status === 'TODO' ? 'pending' : 'pending',
    hasTag: false,
    projectId: item.projectId,
    assigneeId: null,
    tags: [],
    createdAt: safeParseDate(item.createdAt),
    updatedAt: safeParseDate(item.updatedAt),
    // Multi-day task support - use deadline as single day by default
    startDate: taskDueDateISO,
    endDate: taskDueDateISO,
  };
};