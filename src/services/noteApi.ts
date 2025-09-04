import BaseApiClient from '@/lib/baseApiClient';
import {
  CreateNoteRequest,
  UpdateNoteRequest,
  NoteResponse,
  NotePaginationResponse,
  NoteAttachmentResponse
} from '@/types/note';

class NoteApiService {
  private static readonly ENDPOINTS = {
    NOTES: '/api/notes',
    MY_NOTES: '/api/notes/my-notes',
    MY_NOTES_PAGINATED: '/api/notes/my-notes/paginated',
    MY_NOTES_SEARCH: '/api/notes/my-notes/search',
    MY_NOTES_RECENT: '/api/notes/my-notes/recent',
    PROJECT_NOTES: (projectId: number) => `/api/notes/project/${projectId}`,
    PROJECT_NOTES_PAGINATED: (projectId: number) => `/api/notes/project/${projectId}/paginated`,
    PROJECT_NOTES_SEARCH: (projectId: number) => `/api/notes/project/${projectId}/search`,
    PROJECT_NOTES_PUBLIC: (projectId: number) => `/api/notes/project/${projectId}/public`,
    NOTE_BY_ID: (noteId: number) => `/api/notes/${noteId}`,
    NOTE_ARCHIVE: (noteId: number) => `/api/notes/${noteId}/archive`,
    NOTE_VISIBILITY: (noteId: number) => `/api/notes/${noteId}/visibility`,
    NOTE_UPLOAD: (noteId: number) => `/api/notes/${noteId}/upload`,
    NOTE_ATTACHMENTS: (noteId: number) => `/api/notes/${noteId}/attachments`,
    ATTACHMENT_BY_ID: (attachmentId: number) => `/api/notes/attachments/${attachmentId}`,
    ATTACHMENT_DOWNLOAD: (attachmentId: number) => `/api/notes/attachments/${attachmentId}/download`,
    ATTACHMENT_PREVIEW: (attachmentId: number) => `/api/notes/attachments/${attachmentId}/preview`,
  };

  // Validate and sanitize note data before sending
  private static validateCreateNoteData(data: CreateNoteRequest): CreateNoteRequest {
    console.log('📝 Validating create note data:', data);

    // Provide default title if empty
    let validTitle = data.title?.trim() || '';
    if (!validTitle) {
      validTitle = 'Untitled Note';
      console.log('🔤 Using default title: "Untitled Note"');
    }

    // Ensure content is properly formatted JSON
    let validatedContent = '';
    if (data.content) {
      try {
        // Try to parse and re-stringify to ensure valid JSON
        const parsed = JSON.parse(data.content);
        validatedContent = JSON.stringify(parsed);
      } catch (error) {
        console.warn('Invalid JSON content, treating as plain text:', error);
        // Convert to BlockNote format if it's plain text
        validatedContent = JSON.stringify([{
          type: "paragraph",
          content: [{ type: "text", text: data.content, styles: {} }]
        }]);
      }
    } else {
      // Provide default empty content
      validatedContent = JSON.stringify([{
        type: "paragraph",
        content: []
      }]);
    }

    const validated = {
      title: validTitle,
      content: validatedContent,
      description: data.description?.trim() || undefined,
      userId: data.userId,
      projectId: data.projectId,
      isPublic: data.isPublic || false
    };

    console.log('✅ Validated note data:', validated);
    return validated;
  }

  private static validateUpdateNoteData(data: UpdateNoteRequest): UpdateNoteRequest {
    console.log('📝 Validating update note data:', data);

    // Validate content if provided
    let validatedContent = data.content;
    if (data.content) {
      try {
        const parsed = JSON.parse(data.content);
        validatedContent = JSON.stringify(parsed);
      } catch (error) {
        console.warn('Invalid JSON content, treating as plain text:', error);
        validatedContent = JSON.stringify([{
          type: "paragraph",
          content: [{ type: "text", text: data.content, styles: {} }]
        }]);
      }
    }

    const validated = {
      title: data.title?.trim(),
      content: validatedContent,
      description: data.description?.trim(),
      isPublic: data.isPublic,
      isArchived: data.isArchived
    };

    console.log('✅ Validated update data:', validated);
    return validated;
  }

  // Core CRUD Operations with enhanced error handling
  static async createNote(data: CreateNoteRequest): Promise<NoteResponse> {
    try {
      const validatedData = this.validateCreateNoteData(data);
      console.log('🚀 Creating note with validated data:', validatedData);

      const result = await BaseApiClient.post<NoteResponse>(this.ENDPOINTS.NOTES, validatedData);
      console.log('✅ Note created successfully:', result);
      return result;
    } catch (error) {
      console.error('❌ Failed to create note:', error);
      throw new Error(`Failed to create note: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async getNoteById(noteId: number): Promise<NoteResponse> {
    try {
      console.log(`🔍 Fetching note by ID: ${noteId}`);
      const result = await BaseApiClient.get<NoteResponse>(this.ENDPOINTS.NOTE_BY_ID(noteId));
      console.log('✅ Note fetched successfully:', result);
      return result;
    } catch (error) {
      console.error(`❌ Failed to fetch note ${noteId}:`, error);
      throw new Error(`Failed to fetch note: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async updateNote(noteId: number, data: UpdateNoteRequest): Promise<NoteResponse> {
    try {
      const validatedData = this.validateUpdateNoteData(data);
      console.log(`🔄 Updating note ${noteId} with validated data:`, validatedData);

      const result = await BaseApiClient.put<NoteResponse>(this.ENDPOINTS.NOTE_BY_ID(noteId), validatedData);
      console.log('✅ Note updated successfully:', result);
      return result;
    } catch (error) {
      console.error(`❌ Failed to update note ${noteId}:`, error);
      throw new Error(`Failed to update note: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async deleteNote(noteId: number): Promise<void> {
    try {
      console.log(`🗑️ Deleting note: ${noteId}`);
      await BaseApiClient.delete<void>(this.ENDPOINTS.NOTE_BY_ID(noteId));
      console.log('✅ Note deleted successfully');
    } catch (error) {
      console.error(`❌ Failed to delete note ${noteId}:`, error);
      throw new Error(`Failed to delete note: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Personal Notes
  static async getPersonalNotes(includeArchived = false): Promise<NoteResponse[]> {
    console.log('🌐 [NoteApiService] getPersonalNotes called with:', {
      includeArchived,
      endpoint: this.ENDPOINTS.MY_NOTES
    });

    try {
      const result = await BaseApiClient.get<NoteResponse[]>(this.ENDPOINTS.MY_NOTES, { includeArchived });
      console.log('✅ [NoteApiService] getPersonalNotes response:', result);
      return result;
    } catch (error) {
      console.error('❌ [NoteApiService] getPersonalNotes failed:', error);
      throw error;
    }
  }

  static async getPersonalNotesPaginated(
    includeArchived = false,
    page = 0,
    size = 20
  ): Promise<NotePaginationResponse> {
    console.log('🌐 [NoteApiService] getPersonalNotesPaginated called with:', {
      includeArchived,
      page,
      size,
      endpoint: this.ENDPOINTS.MY_NOTES_PAGINATED
    });

    try {
      const response = await BaseApiClient.get<any>(this.ENDPOINTS.MY_NOTES_PAGINATED, {
        includeArchived,
        page,
        size
      });

      console.log('✅ [NoteApiService] Personal notes response:', response);

      const result = {
        ...response,
        currentPage: page,
        pageSize: size
      } as NotePaginationResponse;

      console.log('✅ [NoteApiService] Formatted response:', result);
      return result;
    } catch (error) {
      console.error('❌ [NoteApiService] getPersonalNotesPaginated failed:', error);
      throw error;
    }
  }

  static async searchPersonalNotes(
    keyword: string,
    includeArchived = false
  ): Promise<NoteResponse[]> {
    return BaseApiClient.get<NoteResponse[]>(this.ENDPOINTS.MY_NOTES_SEARCH, {
      keyword,
      includeArchived
    });
  }

  static async getRecentPersonalNotes(limit = 5): Promise<NoteResponse[]> {
    return BaseApiClient.get<NoteResponse[]>(this.ENDPOINTS.MY_NOTES_RECENT, { limit });
  }

  // Project Notes
  static async getProjectNotes(
    projectId: number,
    includeArchived = false
  ): Promise<NoteResponse[]> {
    return BaseApiClient.get<NoteResponse[]>(
      this.ENDPOINTS.PROJECT_NOTES(projectId),
      { includeArchived }
    );
  }

  static async getProjectNotesPaginated(
    projectId: number,
    includeArchived = false,
    page = 0,
    size = 20
  ): Promise<NotePaginationResponse> {
    const response = await BaseApiClient.get<any>(
      this.ENDPOINTS.PROJECT_NOTES_PAGINATED(projectId),
      { includeArchived, page, size }
    );

    return {
      ...response,
      currentPage: page,
      pageSize: size
    } as NotePaginationResponse;
  }

  static async searchProjectNotes(
    projectId: number,
    keyword: string,
    includeArchived = false
  ): Promise<NoteResponse[]> {
    return BaseApiClient.get<NoteResponse[]>(
      this.ENDPOINTS.PROJECT_NOTES_SEARCH(projectId),
      { keyword, includeArchived }
    );
  }

  static async getPublicProjectNotes(projectId: number): Promise<NoteResponse[]> {
    return BaseApiClient.get<NoteResponse[]>(this.ENDPOINTS.PROJECT_NOTES_PUBLIC(projectId));
  }

  // Quick Actions - Fixed to follow docs examples exactly
  static async toggleArchiveNote(noteId: number, archived: boolean): Promise<NoteResponse> {
    // Following docs pattern: PUT with params (not body)
    return BaseApiClient.putWithParams<NoteResponse>(
      this.ENDPOINTS.NOTE_ARCHIVE(noteId),
      { archived }
    );
  }

  static async toggleNoteVisibility(noteId: number, isPublic: boolean): Promise<NoteResponse> {
    // Following docs pattern: PUT with params (not body)
    return BaseApiClient.putWithParams<NoteResponse>(
      this.ENDPOINTS.NOTE_VISIBILITY(noteId),
      { isPublic }
    );
  }

  // File Attachments
  static async uploadAttachment(
    noteId: number,
    file: File,
    description?: string
  ): Promise<NoteAttachmentResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (description?.trim()) {
      formData.append('description', description.trim());
    }

    return BaseApiClient.uploadFile<NoteAttachmentResponse>(
      this.ENDPOINTS.NOTE_UPLOAD(noteId),
      formData
    );
  }

  static async getNoteAttachments(noteId: number): Promise<NoteAttachmentResponse[]> {
    return BaseApiClient.get<NoteAttachmentResponse[]>(this.ENDPOINTS.NOTE_ATTACHMENTS(noteId));
  }

  static async getAttachmentInfo(attachmentId: number): Promise<NoteAttachmentResponse> {
    return BaseApiClient.get<NoteAttachmentResponse>(this.ENDPOINTS.ATTACHMENT_BY_ID(attachmentId));
  }

  static getAttachmentDownloadUrl(attachmentId: number): string {
    return this.ENDPOINTS.ATTACHMENT_DOWNLOAD(attachmentId);
  }

  static getAttachmentPreviewUrl(attachmentId: number): string {
    return this.ENDPOINTS.ATTACHMENT_PREVIEW(attachmentId);
  }

  static async deleteAttachment(attachmentId: number): Promise<void> {
    return BaseApiClient.delete<void>(this.ENDPOINTS.ATTACHMENT_BY_ID(attachmentId));
  }

  // Utility methods
  static async downloadAttachment(attachmentId: number, fileName: string): Promise<void> {
    return BaseApiClient.downloadFile(this.ENDPOINTS.ATTACHMENT_DOWNLOAD(attachmentId), fileName);
  }

  static async healthCheck(): Promise<boolean> {
    try {
      await BaseApiClient.get('/api/notes/health');
      return true;
    } catch (error) {
      console.warn('Notes API health check failed:', error);
      return false;
    }
  }
}

export default NoteApiService;
