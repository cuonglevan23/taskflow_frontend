// Note API Types based on BlockNote integration guide

export interface CreateNoteRequest {
  title: string;
  content?: string;
  description?: string;
  userId?: number;
  projectId?: number;
  isPublic?: boolean;
}

export interface UpdateNoteRequest {
  title?: string;
  content?: string;
  description?: string;
  isPublic?: boolean;
  isArchived?: boolean;
}

export interface NoteAttachmentResponse {
  id: number;
  fileName: string;
  storedFileName: string;
  contentType: string;
  fileSize: number;
  formattedFileSize: string;
  description?: string;
  isImage: boolean;
  fileExtension: string;
  noteId: number;
  noteTitle: string;
  uploadedById: number;
  uploadedByName: string;
  uploadedByEmail: string;
  createdAt: string;
  updatedAt: string;
  downloadUrl: string;
}

export interface NoteResponse {
  id: number;
  title: string;
  content: string;
  description: string;
  userId?: number;
  userName?: string;
  userEmail?: string;
  projectId?: number;
  projectName?: string;
  creatorId: number;
  creatorName: string;
  creatorEmail: string;
  isPublic: boolean;
  isArchived: boolean;
  isPersonalNote: boolean;
  isProjectNote: boolean;
  createdAt: string;
  updatedAt: string;
  attachments: NoteAttachmentResponse[];
  attachmentCount: number;
  totalAttachmentSize: number;
  formattedTotalAttachmentSize: string;
  hasAttachments: boolean;
}

export interface NotePaginationResponse {
  content: NoteResponse[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export interface NoteSearchParams {
  keyword?: string;
  includeArchived?: boolean;
  page?: number;
  size?: number;
}

export interface NoteFilter {
  isArchived?: boolean;
  isPublic?: boolean;
  projectId?: number;
  creatorId?: number;
}

export interface NoteStats {
  totalNotes: number;
  archivedNotes: number;
  publicNotes: number;
  privateNotes: number;
  notesWithAttachments: number;
}

// UI Component Props Types
export interface NoteEditorProps {
  initialContent?: string;
  onContentChange?: (content: string) => void;
  onSave?: (content: string) => void;
  readOnly?: boolean;
  className?: string;
  placeholder?: string;
}

export interface NoteListItemProps {
  note: NoteResponse;
  onEdit: (note: NoteResponse) => void;
  onDelete: (noteId: number) => void;
  onArchive: (noteId: number, archived: boolean) => void;
  onToggleVisibility?: (noteId: number, isPublic: boolean) => void;
  showProjectInfo?: boolean;
}

export interface NoteFormProps {
  mode: 'create' | 'edit';
  initialData?: Partial<NoteResponse>;
  projectId?: number;
  onSubmit: (data: CreateNoteRequest | UpdateNoteRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export interface NoteSearchProps {
  onSearch: (params: NoteSearchParams) => void;
  placeholder?: string;
  showAdvancedFilters?: boolean;
  defaultFilters?: NoteFilter;
}

export interface NoteAttachmentProps {
  noteId: number;
  attachments: NoteAttachmentResponse[];
  onUploadSuccess?: (attachment: NoteAttachmentResponse) => void;
  onDeleteSuccess?: (attachmentId: number) => void;
  maxFileSize?: number;
  allowedTypes?: string[];
}

// Hook Types
export interface UseNotesOptions {
  projectId?: number;
  initialFilters?: NoteFilter;
  autoRefresh?: boolean;
  pageSize?: number;
}

export interface UseNotesReturn {
  notes: NoteResponse[];
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalElements: number;
    pageSize: number;
  };
  stats: NoteStats;
  actions: {
    createNote: (data: CreateNoteRequest) => Promise<NoteResponse>;
    updateNote: (id: number, data: UpdateNoteRequest) => Promise<NoteResponse>;
    deleteNote: (id: number) => Promise<void>;
    archiveNote: (id: number, archived: boolean) => Promise<NoteResponse>;
    toggleVisibility: (id: number, isPublic: boolean) => Promise<NoteResponse>;
    searchNotes: (params: NoteSearchParams) => Promise<void>;
    loadMore: () => Promise<void>;
    refresh: () => Promise<void>;
    setFilters: (filters: NoteFilter) => void;
  };
}

export interface UseNoteDetailOptions {
  noteId: number;
  autoSave?: boolean;
  autoSaveDelay?: number;
}

export interface UseNoteDetailReturn {
  note: NoteResponse | null;
  loading: boolean;
  error: string | null;
  isDirty: boolean;
  isSaving: boolean;
  actions: {
    updateNote: (data: UpdateNoteRequest) => Promise<void>;
    deleteNote: () => Promise<void>;
    archiveNote: (archived: boolean) => Promise<void>;
    toggleVisibility: (isPublic: boolean) => Promise<void>;
    uploadAttachment: (file: File, description?: string) => Promise<NoteAttachmentResponse>;
    deleteAttachment: (attachmentId: number) => Promise<void>;
    refresh: () => Promise<void>;
  };
}

// Error Types
export interface NoteError {
  code: string;
  message: string;
  field?: string;
  details?: Record<string, any>;
}

export interface NoteApiError {
  status: number;
  message: string;
  errors?: NoteError[];
  timestamp: string;
}
