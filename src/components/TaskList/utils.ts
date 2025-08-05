import { TaskPriority, TaskStatus, TaskListItem, TaskSection, TaskGroupBy } from './types';

// Priority configuration
export const PRIORITY_CONFIG = {
  low: {
    label: 'Low',
    color: 'bg-green-100 text-green-800',
    order: 1,
  },
  medium: {
    label: 'Medium', 
    color: 'bg-yellow-100 text-yellow-800',
    order: 2,
  },
  high: {
    label: 'High',
    color: 'bg-orange-100 text-orange-800', 
    order: 3,
  },
  urgent: {
    label: 'Urgent',
    color: 'bg-red-100 text-red-800',
    order: 4,
  },
} as const;

// Status configuration
export const STATUS_CONFIG = {
  todo: {
    label: 'To Do',
    color: 'bg-gray-100 text-gray-800',
    order: 1,
  },
  in_progress: {
    label: 'In Progress',
    color: 'bg-blue-100 text-blue-800',
    order: 2,
  },
  review: {
    label: 'Review',
    color: 'bg-purple-100 text-purple-800',
    order: 3,
  },
  done: {
    label: 'Done',
    color: 'bg-green-100 text-green-800',
    order: 4,
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-red-100 text-red-800',
    order: 5,
  },
} as const;

// Default table columns - matching the interface design
export const DEFAULT_COLUMNS = [
  {
    key: 'name' as const,
    label: 'Name',
    width: 'flex-1 min-w-[300px]',
    sortable: true,
  },
  {
    key: 'dueDate' as const,
    label: 'Due date',
    width: 'w-[120px]',
    sortable: true,
  },
  {
    key: 'assignees' as const,
    label: 'Collaborators',
    width: 'w-[150px]',
    sortable: false,
  },
  {
    key: 'project' as const,
    label: 'Projects',
    width: 'w-[150px]',
    sortable: true,
  },
  {
    key: 'status' as const,
    label: 'Task visibility',
    width: 'w-[140px]',
    sortable: true,
  },
  {
    key: 'actions' as const,
    label: '+',
    width: 'w-[50px]',
    sortable: false,
  },
];

// Utility functions
export const getPriorityConfig = (priority: TaskPriority) => {
  return PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.low;
};

export const getStatusConfig = (status: TaskStatus) => {
  return STATUS_CONFIG[status] || STATUS_CONFIG.todo;
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays > 0 && diffDays <= 7) return `${diffDays} days`;
  if (diffDays < 0 && diffDays >= -7) return `${Math.abs(diffDays)} days ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

export const formatTaskDate = (task: any): string => {
  // Check if task has start/end dates and times from enhanced calendar
  if (task.startDate && task.endDate) {
    const startDate = new Date(task.startDate);
    const endDate = new Date(task.endDate);
    
    // Validate dates
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      // If enhanced dates are invalid, fall back to regular dueDate
      if (task.dueDate) {
        return formatDate(task.dueDate);
      }
      return '-';
    }
    
    // Check if same date
    if (startDate.toDateString() === endDate.toDateString()) {
      let result = `${startDate.getDate()} ${startDate.toLocaleDateString('en-US', { month: 'short' }).toLowerCase()}`;
      
      // Add time if available
      if (task.startTime || task.endTime) {
        if (task.startTime && task.endTime && task.startTime !== task.endTime) {
          result += ` ${task.startTime}-${task.endTime}`;
        } else if (task.startTime) {
          result += ` ${task.startTime}`;
        }
      }
      return result;
    }
    
    // Check if same month
    if (startDate.getMonth() === endDate.getMonth() && startDate.getFullYear() === endDate.getFullYear()) {
      let result = `${startDate.getDate()}-${endDate.getDate()} ${startDate.toLocaleDateString('en-US', { month: 'short' }).toLowerCase()}`;
      
      // Add time if available
      if (task.startTime || task.endTime) {
        const timeStr = [];
        if (task.startTime) timeStr.push(task.startTime);
        if (task.endTime && task.endTime !== task.startTime) timeStr.push(task.endTime);
        if (timeStr.length > 0) {
          result += ` ${timeStr.join('-')}`;
        }
      }
      return result;
    }
    
    // Different months
    let result = `${startDate.getDate()} ${startDate.toLocaleDateString('en-US', { month: 'short' }).toLowerCase()} - ${endDate.getDate()} ${endDate.toLocaleDateString('en-US', { month: 'short' }).toLowerCase()}`;
    
    // Add time if available
    if (task.startTime || task.endTime) {
      const timeStr = [];
      if (task.startTime) timeStr.push(task.startTime);
      if (task.endTime && task.endTime !== task.startTime) timeStr.push(task.endTime);
      if (timeStr.length > 0) {
        result += ` ${timeStr.join('-')}`;
      }
    }
    return result;
  }
  
  // Fallback to regular dueDate formatting with consistent format
  if (task.dueDate) {
    const date = new Date(task.dueDate);
    if (!isNaN(date.getTime())) {
      // Use consistent format: "25 jan" instead of "Jan 25" 
      return `${date.getDate()} ${date.toLocaleDateString('en-US', { month: 'short' }).toLowerCase()}`;
    }
    // If date parsing fails, use original formatDate function
    return formatDate(task.dueDate);
  }
  
  return '-';
};

export const isOverdue = (dateString: string): boolean => {
  const date = new Date(dateString);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return date < now;
};

export const groupTasksByStatus = (tasks: TaskListItem[]): TaskSection[] => {
  const grouped = tasks.reduce((acc, task) => {
    const status = task.status;
    if (!acc[status]) {
      acc[status] = [];
    }
    acc[status].push(task);
    return acc;
  }, {} as Record<TaskStatus, TaskListItem[]>);

  return Object.entries(STATUS_CONFIG)
    .map(([status, config]) => ({
      id: status,
      title: config.label,
      tasks: grouped[status as TaskStatus] || [],
      collapsible: true,
      collapsed: false,
    }))
    .filter(section => section.tasks.length > 0);
};

export const groupTasksByPriority = (tasks: TaskListItem[]): TaskSection[] => {
  const grouped = tasks.reduce((acc, task) => {
    const priority = task.priority;
    if (!acc[priority]) {
      acc[priority] = [];
    }
    acc[priority].push(task);
    return acc;
  }, {} as Record<TaskPriority, TaskListItem[]>);

  return Object.entries(PRIORITY_CONFIG)
    .sort(([, a], [, b]) => b.order - a.order)
    .map(([priority, config]) => ({
      id: priority,
      title: config.label,
      tasks: grouped[priority as TaskPriority] || [],
      collapsible: true,
      collapsed: false,
    }))
    .filter(section => section.tasks.length > 0);
};

export const groupTasksByAssignmentDate = (tasks: TaskListItem[]): TaskSection[] => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);

  const sections = [
    {
      id: 'recently-assigned',
      title: 'Recently assigned',
      tasks: [] as TaskListItem[],
      collapsible: true,
      collapsed: false,
    },
    {
      id: 'do-today',
      title: 'Do today',
      tasks: [] as TaskListItem[],
      collapsible: true,
      collapsed: false,
    },
    {
      id: 'do-next-week',
      title: 'Do next week',
      tasks: [] as TaskListItem[],
      collapsible: true,
      collapsed: false,
    },
    {
      id: 'do-later',
      title: 'Do later',
      tasks: [] as TaskListItem[],
      collapsible: true,
      collapsed: false,
    },
  ];

  // Categorize tasks based on due dates first, then assignment date
  tasks.forEach(task => {
    const createdDate = new Date(task.createdAt);
    const daysSinceCreated = Math.floor((today.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (task.dueDate) {
      const dueDate = new Date(task.dueDate);
      
      // Check for enhanced calendar dates
      let effectiveDate = dueDate;
      if (task.startDate) {
        const startDate = new Date(task.startDate);
        if (!isNaN(startDate.getTime())) {
          effectiveDate = startDate;
        }
      }
      
      if (effectiveDate <= tomorrow) {
        sections[1].tasks.push(task); // Do today
      } else if (effectiveDate <= nextWeek) {
        sections[2].tasks.push(task); // Do next week
      } else {
        sections[3].tasks.push(task); // Do later
      }
    } else if (daysSinceCreated <= 3) {
      // Only put in "Recently assigned" if no due date and recently created
      sections[0].tasks.push(task); // Recently assigned
    } else {
      sections[3].tasks.push(task); // Do later (no due date, not recent)
    }
  });

  return sections;
};

export const groupTasks = (tasks: TaskListItem[], groupBy: TaskGroupBy): TaskSection[] => {
  switch (groupBy) {
    case 'status':
      return groupTasksByStatus(tasks);
    case 'priority':
      return groupTasksByPriority(tasks);
    case 'assignmentDate':
      return groupTasksByAssignmentDate(tasks);
    default:
      return [{
        id: 'all',
        title: 'All Tasks',
        tasks,
        collapsible: false,
        collapsed: false,
      }];
  }
};

export const sortTasks = (tasks: TaskListItem[], field: keyof TaskListItem, direction: 'asc' | 'desc'): TaskListItem[] => {
  return [...tasks].sort((a, b) => {
    let aValue = a[field];
    let bValue = b[field];

    // Handle special cases
    if (field === 'priority') {
      aValue = PRIORITY_CONFIG[a.priority as TaskPriority]?.order || 0;
      bValue = PRIORITY_CONFIG[b.priority as TaskPriority]?.order || 0;
    } else if (field === 'status') {
      aValue = STATUS_CONFIG[a.status as TaskStatus]?.order || 0;
      bValue = STATUS_CONFIG[b.status as TaskStatus]?.order || 0;
    } else if (field === 'dueDate') {
      aValue = a.dueDate ? new Date(a.dueDate).getTime() : 0;
      bValue = b.dueDate ? new Date(b.dueDate).getTime() : 0;
    }

    if (aValue < bValue) return direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return direction === 'asc' ? 1 : -1;
    return 0;
  });
};

export const filterTasks = (tasks: TaskListItem[], filters: {
  search?: string;
  status?: TaskStatus[];
  priority?: TaskPriority[];
  assignee?: string[];
}): TaskListItem[] => {
  return tasks.filter(task => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesName = task.name.toLowerCase().includes(searchLower);
      const matchesDescription = task.description?.toLowerCase().includes(searchLower);
      if (!matchesName && !matchesDescription) return false;
    }

    // Status filter
    if (filters.status && filters.status.length > 0) {
      if (!filters.status.includes(task.status)) return false;
    }

    // Priority filter
    if (filters.priority && filters.priority.length > 0) {
      if (!filters.priority.includes(task.priority)) return false;
    }

    // Assignee filter
    if (filters.assignee && filters.assignee.length > 0) {
      const taskAssigneeIds = task.assignees.map(a => a.id);
      const hasMatchingAssignee = filters.assignee.some(assigneeId => 
        taskAssigneeIds.includes(assigneeId)
      );
      if (!hasMatchingAssignee) return false;
    }

    return true;
  });
};

// Legacy compatibility functions for existing code
export const getPriorityColor = (priority: string): string => {
  switch (priority.toLowerCase()) {
    case 'high':
      return 'bg-red-100 text-red-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'low':
    default:
      return 'bg-green-100 text-green-800';
  }
};

export const getStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'done':
      return 'bg-green-100 text-green-800';
    case 'in_progress':
    case 'in progress':
      return 'bg-blue-100 text-blue-800';
    case 'blocked':
      return 'bg-red-100 text-red-800';
    case 'testing':
      return 'bg-purple-100 text-purple-800';
    case 'to_do':
    case 'todo':
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getDueDateColor = (dueDate: string): string => {
  if (!dueDate) return 'text-gray-500';
  
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  
  if (dueDate.toLowerCase().includes('today')) {
    return 'text-orange-600 font-medium';
  }
  
  if (dueDate.toLowerCase().includes('tomorrow')) {
    return 'text-yellow-600 font-medium';
  }
  
  if (dueDate.toLowerCase().includes('overdue')) {
    return 'text-red-600 font-medium';
  }
  
  return 'text-gray-700';
};