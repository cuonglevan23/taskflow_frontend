/**
 * Unified Calendar Types for Enterprise Application
 * Supports all calendar views: Month, Week, Timeline, Gantt
 */

// Base Event Interface
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end?: Date;
  allDay: boolean;
  
  // Event Classification
  type: EventType;
  category: EventCategory;
  priority: EventPriority;
  status: EventStatus;
  
  // Assignment & Ownership
  ownerId: string;
  assigneeIds: string[];
  teamId?: string;
  projectId?: string;
  
  // Metadata
  color?: string;
  tags: string[];
  location?: string;
  meetingUrl?: string;
  attachments?: string[];
  
  // Permissions & Editing
  editable: boolean;
  deletable: boolean;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

// Event Types
export type EventType = 
  | 'task' 
  | 'meeting' 
  | 'milestone' 
  | 'deadline' 
  | 'reminder'
  | 'vacation'
  | 'holiday';

export type EventCategory = 
  | 'personal' 
  | 'team' 
  | 'project' 
  | 'company'
  | 'client';

export type EventPriority = 'low' | 'medium' | 'high' | 'critical';

export type EventStatus = 
  | 'planned' 
  | 'in_progress' 
  | 'completed' 
  | 'cancelled' 
  | 'on_hold';

// Calendar Views
export type CalendarView = 
  | 'dayGridMonth'     // Month view
  | 'timeGridWeek'     // Week view  
  | 'timeGridDay'      // Day view
  | 'listWeek'         // List view
  | 'multiMonthYear'   // Year view
  | 'timelineWeek'     // Timeline view
  | 'resourceTimeline' // Resource timeline
  | 'gantt';           // Gantt chart

// Calendar Configuration
export interface CalendarConfig {
  view: CalendarView;
  date: Date;
  editable: boolean;
  selectable: boolean;
  businessHours: BusinessHours;
  timeZone: string;
  locale: string;
  firstDay: number; // 0 = Sunday, 1 = Monday
  weekends: boolean;
  showWeekNumbers: boolean;
  height: string | number;
}

export interface BusinessHours {
  daysOfWeek: number[]; // [1,2,3,4,5] for Mon-Fri
  startTime: string;    // '09:00'
  endTime: string;      // '17:00'
}

// Filtering & Search
export interface CalendarFilter {
  id: string;
  name: string;
  type: 'type' | 'category' | 'priority' | 'status' | 'assignee' | 'team' | 'project';
  values: string[];
  active: boolean;
  color?: string;
}

export interface CalendarSearchParams {
  query?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  filters: CalendarFilter[];
  sortBy?: 'start' | 'title' | 'priority' | 'status';
  sortOrder?: 'asc' | 'desc';
}

// API Response Types
export interface CalendarEventsResponse {
  events: CalendarEvent[];
  total: number;
  hasMore: boolean;
  nextCursor?: string;
}

export interface CreateEventRequest {
  title: string;
  description?: string;
  start: Date;
  end?: Date;
  allDay: boolean;
  type: EventType;
  category: EventCategory;
  priority: EventPriority;
  assigneeIds: string[];
  teamId?: string;
  projectId?: string;
  tags: string[];
  location?: string;
  meetingUrl?: string;
}

export interface UpdateEventRequest extends Partial<CreateEventRequest> {
  id: string;
}

// Context State Types
export interface CalendarContextState {
  // Configuration
  config: CalendarConfig;
  
  // Data
  events: CalendarEvent[];
  loading: boolean;
  error: string | null;
  
  // UI State
  selectedEvent: CalendarEvent | null;
  filters: CalendarFilter[];
  searchParams: CalendarSearchParams;
  
  // Modals & Dialogs
  showCreateModal: boolean;
  showEditModal: boolean;
  showDeleteModal: boolean;
}

// Action Types for Reducer
export type CalendarAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_EVENTS'; payload: CalendarEvent[] }
  | { type: 'ADD_EVENT'; payload: CalendarEvent }
  | { type: 'UPDATE_EVENT'; payload: CalendarEvent }
  | { type: 'DELETE_EVENT'; payload: string }
  | { type: 'SET_CONFIG'; payload: Partial<CalendarConfig> }
  | { type: 'SET_SELECTED_EVENT'; payload: CalendarEvent | null }
  | { type: 'TOGGLE_FILTER'; payload: string }
  | { type: 'SET_SEARCH_PARAMS'; payload: CalendarSearchParams }
  | { type: 'SHOW_CREATE_MODAL'; payload: boolean }
  | { type: 'SHOW_EDIT_MODAL'; payload: boolean }
  | { type: 'SHOW_DELETE_MODAL'; payload: boolean };

// User & Permission Types
export interface CalendarUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  teamIds: string[];
  permissions: CalendarPermission[];
}

export type UserRole = 'admin' | 'manager' | 'member' | 'viewer';

export interface CalendarPermission {
  resource: 'event' | 'calendar' | 'team' | 'project';
  action: 'create' | 'read' | 'update' | 'delete' | 'share';
  scope: 'own' | 'team' | 'project' | 'all';
}

// Team & Project Types
export interface Team {
  id: string;
  name: string;
  description?: string;
  color: string;
  memberIds: string[];
  managerId: string;
  projectIds: string[];
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  color: string;
  teamId: string;
  managerId: string;
  status: 'active' | 'on_hold' | 'completed' | 'cancelled';
  startDate: Date;
  endDate?: Date;
}