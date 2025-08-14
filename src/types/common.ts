// Common TypeScript interfaces to replace 'any' types

// Generic API response types
export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  status: number;
}

export interface PaginatedApiResponse<T = unknown> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages?: number;
}

// Error types
export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: Record<string, unknown>;
}

// Event handler types
export interface EventInfo {
  event: {
    id: string;
    title: string;
    start: Date;
    end?: Date;
    extendedProps?: Record<string, unknown>;
  };
  el: HTMLElement;
  jsEvent: MouseEvent;
  view: {
    type: string;
    title: string;
  };
}

export interface DateClickInfo {
  date: Date;
  dateStr: string;
  allDay: boolean;
  dayEl: HTMLElement;
  jsEvent: MouseEvent;
  view: {
    type: string;
    title: string;
  };
}

export interface DropInfo {
  event: {
    id: string;
    title: string;
    start: Date;
    end?: Date;
  };
  oldEvent: {
    start: Date;
    end?: Date;
  };
  delta: {
    years: number;
    months: number;
    days: number;
    milliseconds: number;
  };
  revert: () => void;
  el: HTMLElement;
  jsEvent: MouseEvent;
  view: {
    type: string;
  };
}

export interface ResizeInfo {
  event: {
    id: string;
    title: string;
    start: Date;
    end?: Date;
  };
  prevEvent: {
    start: Date;
    end?: Date;
  };
  endDelta: {
    years: number;
    months: number;
    days: number;
    milliseconds: number;
  };
  startDelta: {
    years: number;
    months: number;
    days: number;
    milliseconds: number;
  };
  revert: () => void;
  el: HTMLElement;
  jsEvent: MouseEvent;
  view: {
    type: string;
  };
}

// Progress event for file uploads
export interface UploadProgressEvent {
  loaded: number;
  total: number;
  lengthComputable: boolean;
}

// Generic form data
export interface FormData {
  [key: string]: string | number | boolean | Date | File | null | undefined;
}

// Cache entry
export interface CacheEntry<T = unknown> {
  data: T;
  timestamp: number;
  ttl: number;
}

// Generic filter and sort types
export interface FilterOptions {
  [key: string]: string | number | boolean | string[] | null | undefined;
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

// Generic dropdown/select option
export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

// Generic table column
export interface TableColumn<T = unknown> {
  key: string;
  title: string;
  dataIndex?: keyof T;
  width?: number | string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: unknown, record: T, index: number) => React.ReactNode;
}

// Generic action button config
export interface ActionConfig {
  key: string;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
}

// Generic tab config
export interface TabConfig {
  key: string;
  label: string;
  icon?: React.ReactNode;
  content?: React.ReactNode;
  disabled?: boolean;
  badge?: string | number;
}

// Generic navigation item
export interface NavigationItem {
  id: string;
  label: string;
  path?: string;
  icon?: React.ReactNode;
  children?: NavigationItem[];
  badge?: string | number;
  disabled?: boolean;
  external?: boolean;
}

// Generic user info
export interface UserInfo {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
}

// Generic projects info
export interface ProjectInfo {
  id: string;
  name: string;
  description?: string;
  status?: string;
  progress?: number;
  members?: UserInfo[];
}

// Generic team info
export interface TeamInfo {
  id: string;
  name: string;
  description?: string;
  members?: UserInfo[];
  projects?: ProjectInfo[];
}

// Generic notification
export interface NotificationInfo {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read?: boolean;
  actions?: ActionConfig[];
}

// Generic search result
export interface SearchResult {
  id: string;
  title: string;
  description?: string;
  type: string;
  url?: string;
  metadata?: Record<string, unknown>;
}

// Generic file info
export interface FileInfo {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  thumbnail?: string;
  uploadedAt?: Date;
  uploadedBy?: UserInfo;
}

// Generic breadcrumb item
export interface BreadcrumbItem {
  label: string;
  path?: string;
  icon?: React.ReactNode;
}

// Generic modal props
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closable?: boolean;
}

// Generic loading state
export interface LoadingState {
  [key: string]: boolean;
}

// Generic error state
export interface ErrorState {
  [key: string]: string | null;
}