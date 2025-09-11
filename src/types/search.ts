export interface SearchQuery {
  query: string;
  entities: SearchEntity[];
  filters: SearchFilters;
  pagination: SearchPagination;
  sorting: SearchSorting;
  context: SearchContext;
}

export type SearchEntity = 'tasks' | 'projects' | 'users' | 'teams';

export interface SearchFilters {
  tasks?: TaskFilters;
  projects?: ProjectFilters;
  users?: UserFilters;
  teams?: TeamFilters;
}

export interface TaskFilters {
  status?: TaskStatus[];
  priority?: TaskPriority[];
  assigneeId?: number;
  dueDateRange?: DateRange;
  tags?: string[];
}

export interface ProjectFilters {
  status?: ProjectStatus[];
  ownerId?: number;
  memberIds?: number[];
}

export interface UserFilters {
  departments?: Department[];
  skills?: string[];
  isActive?: boolean;
}

export interface TeamFilters {
  types?: TeamType[];
  minMembers?: number;
  excludeMyTeams?: boolean;
}

export interface DateRange {
  from: string;
  to: string;
}

export interface SearchPagination {
  page: number;
  size: number;
}

export interface SearchSorting {
  field: 'relevance' | 'date' | 'name' | 'priority';
  direction: 'asc' | 'desc';
}

export interface SearchContext {
  userId: number;
  organizationId: number;
  userTeamIds: number[]; // Teams user belongs to
  userProjectIds: number[]; // Projects user has access to
  includePrivate: boolean;
  scope: 'my' | 'team' | 'organization' | 'all';
}

// Add ACL interfaces for authorization
export interface SearchACL {
  organizationId: number;
  teamIds: number[];
  projectIds: number[];
  assigneeId?: number;
  creatorId?: number;
  visibility: 'PUBLIC' | 'PRIVATE' | 'TEAM' | 'PROJECT';
  memberIds?: number[]; // For teams and projects
}

// Enhanced search filters with authorization
export interface AuthorizedSearchFilters extends SearchFilters {
  acl?: SearchACL;
  enforceSecurity?: boolean; // Default true in production
}

export interface SearchResponse {
  success: boolean;
  data: SearchResults;
  meta: SearchMeta;
}

export interface SearchResults {
  tasks?: SearchEntityResult<SearchTask>;
  projects?: SearchEntityResult<SearchProject>;
  users?: SearchEntityResult<SearchUser>;
  teams?: SearchEntityResult<SearchTeam>;
}

export interface SearchEntityResult<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
}

export interface SearchMeta {
  query: string;
  totalResults: number;
  searchTime: string;
  suggestions: string[];
}

// Search-specific entity types
export interface SearchTask {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: number;
  assigneeName: string;
  dueDate: string;
  tags: string[];
  projectId: number;
  projectName: string;
}

export interface SearchProject {
  id: number;
  name: string;
  description: string;
  status: ProjectStatus;
  ownerId: number;
  ownerName: string;
  memberCount: number;
  completionPercentage: number;
}

export interface SearchUser {
  id: number;
  fullName: string;
  email: string;
  username: string;
  jobTitle: string;
  department: Department;
  skills: string[];
  isActive: boolean;
  avatar?: string;
}

export interface SearchTeam {
  id: number;
  name: string;
  description: string;
  type: TeamType;
  memberCount: number;
  department: Department;
  performanceScore: number;
}

// Enums
export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export enum ProjectStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED'
}

export enum Department {
  ENGINEERING = 'ENGINEERING',
  DESIGN = 'DESIGN',
  MARKETING = 'MARKETING',
  SALES = 'SALES',
  HR = 'HR'
}

export enum TeamType {
  DEVELOPMENT = 'DEVELOPMENT',
  DESIGN = 'DESIGN',
  MARKETING = 'MARKETING',
  SALES = 'SALES'
}

export interface AutocompleteResponse {
  suggestions: string[];
}

export interface SearchHistory {
  id: string;
  query: string;
  timestamp: string;
  entities: SearchEntity[];
  resultCount: number;
}

export interface SmartSuggestionsRequest {
  partialQuery: string; // Changed from "query" to match backend DTO
  maxSuggestions?: number;
  // Remove userContext - not in backend DTO
  // Match backend DTO exactly with these 6 properties:
  activityContext?: any;
  recentSearches?: string[];
  entityTypes?: string[];
  context?: any;
}

export interface SmartSuggestionsResponse {
  suggestions: SmartSuggestion[];
  processingTime: string;
}

export interface SmartSuggestion {
  id: string;
  type: 'task' | 'project' | 'user' | 'team' | 'action' | 'filter';
  text: string;
  description?: string;
  confidence: number; // 0-1
  metadata?: {
    entityId?: string;
    category?: string;
    priority?: string;
  };
}
