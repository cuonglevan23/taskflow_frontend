import { useState, useEffect, useCallback, useRef } from 'react';
import {
  NoteResponse,
  CreateNoteRequest,
  UpdateNoteRequest,
  NoteSearchParams,
  NoteFilter,
  NoteStats,
  UseNotesOptions,
  UseNotesReturn,
  NoteAttachmentResponse
} from '@/types/note';
import NoteApiService from '@/services/noteApi';

export const useNotes = (options: UseNotesOptions = {}): UseNotesReturn => {
  const {
    projectId,
    initialFilters = {},
    autoRefresh = false,
    pageSize = 20
  } = options;

  const [notes, setNotes] = useState<NoteResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<NoteFilter>(initialFilters);
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    pageSize
  });
  const [stats, setStats] = useState<NoteStats>({
    totalNotes: 0,
    archivedNotes: 0,
    publicNotes: 0,
    privateNotes: 0,
    notesWithAttachments: 0
  });

  // Refs to prevent excessive calls
  const abortControllerRef = useRef<AbortController | null>(null);
  const isLoadingRef = useRef(false);
  const lastCallParamsRef = useRef<string>('');
  const initialLoadDoneRef = useRef(false);

  // Simple stats calculation
  const calculateStats = useCallback((notesList: NoteResponse[]): NoteStats => {
    return {
      totalNotes: notesList.length,
      archivedNotes: notesList.filter(note => note.isArchived).length,
      publicNotes: notesList.filter(note => note.isPublic).length,
      privateNotes: notesList.filter(note => !note.isPublic).length,
      notesWithAttachments: notesList.filter(note => note.hasAttachments).length
    };
  }, []);

  const loadNotes = useCallback(async (page = 0, append = false, forceLoad = false) => {
    // Create unique key for this call
    const callKey = `${projectId || 'personal'}-${filters.isArchived || false}-${page}-${pageSize}`;

    console.log('🔍 [useNotes] loadNotes called with:', {
      page,
      append,
      forceLoad,
      callKey,
      projectId,
      filters,
      isLoadingRef: isLoadingRef.current,
      lastCallParamsRef: lastCallParamsRef.current
    });

    // More aggressive duplicate prevention
    if (!forceLoad && isLoadingRef.current) {
      console.log('🚫 Already loading, skipping:', callKey);
      return;
    }

    // Check if same call was made recently (within 1 second)
    if (!forceLoad && lastCallParamsRef.current === callKey) {
      console.log('🚫 Duplicate call prevented:', callKey);
      return;
    }

    try {
      // Cancel any existing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      isLoadingRef.current = true;
      lastCallParamsRef.current = callKey;

      console.log('🌐 Loading notes with params:', {
        callKey,
        projectId,
        isArchived: filters.isArchived || false,
        page,
        pageSize
      });

      if (!append) {
        setLoading(true);
      }
      setError(null);

      let response;
      if (projectId) {
        console.log('📁 Loading PROJECT notes for projectId:', projectId);
        response = await NoteApiService.getProjectNotesPaginated(
          projectId,
          filters.isArchived || false,
          page,
          pageSize
        );
      } else {
        console.log('👤 Loading PERSONAL notes using regular endpoint (as per docs)');

        // Use regular endpoint as primary (per documentation)
        const regularNotes = await NoteApiService.getPersonalNotes(filters.isArchived || false);
        console.log('✅ Regular endpoint response:', regularNotes);

        // Convert to paginated format for consistency
        const startIndex = page * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedContent = regularNotes.slice(startIndex, endIndex);

        response = {
          content: paginatedContent,
          currentPage: page,
          totalPages: Math.ceil(regularNotes.length / pageSize),
          totalElements: regularNotes.length,
          pageSize: pageSize,
          // Add other pagination fields for compatibility
          empty: regularNotes.length === 0,
          first: page === 0,
          last: page >= Math.ceil(regularNotes.length / pageSize) - 1,
          number: page,
          numberOfElements: paginatedContent.length,
          size: pageSize
        };

        console.log('✅ Converted regular endpoint to paginated format:', response);
      }

      console.log('✅ Notes API response:', response);

      if (append) {
        setNotes(prev => [...prev, ...response.content]);
      } else {
        setNotes(response.content);
        setStats(calculateStats(response.content));
      }

      setPagination({
        currentPage: response.currentPage,
        totalPages: response.totalPages,
        totalElements: response.totalElements,
        pageSize: response.pageSize
      });

      initialLoadDoneRef.current = true;
      console.log('✅ Notes loaded successfully:', {
        notesCount: response.content.length,
        totalElements: response.totalElements,
        currentPage: response.currentPage
      });

    } catch (err: any) {
      if (err.name !== 'AbortError') {
        const errorMessage = err.message || 'Failed to load notes';
        setError(errorMessage);
        console.error('❌ Error loading notes:', {
          error: err,
          message: errorMessage,
          status: err.response?.status,
          data: err.response?.data
        });
      }
    } finally {
      isLoadingRef.current = false;
      // Don't reset lastCallParamsRef immediately to prevent rapid duplicates
      setTimeout(() => {
        lastCallParamsRef.current = '';
      }, 1000); // 1 second cooldown
      if (!append) {
        setLoading(false);
      }
    }
  }, [projectId, filters.isArchived, pageSize, calculateStats]);

  const createNote = useCallback(async (data: CreateNoteRequest): Promise<NoteResponse> => {
    try {
      setError(null);
      console.log('🔄 Creating note with data:', data);

      const newNote = await NoteApiService.createNote({
        ...data,
        projectId: projectId || data.projectId
      });

      console.log('✅ Note created successfully:', newNote);

      // Add to the beginning of the list
      setNotes(prev => [newNote, ...prev]);
      setStats(prev => ({ ...prev, totalNotes: prev.totalNotes + 1 }));

      return newNote;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create note';
      setError(errorMessage);
      console.error('❌ Failed to create note:', err);
      throw err;
    }
  }, [projectId]);

  const updateNote = useCallback(async (id: number, data: UpdateNoteRequest): Promise<NoteResponse> => {
    try {
      setError(null);
      const updatedNote = await NoteApiService.updateNote(id, data);

      setNotes(prev => prev.map(note =>
        note.id === id ? updatedNote : note
      ));

      return updatedNote;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update note';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const deleteNote = useCallback(async (id: number): Promise<void> => {
    try {
      setError(null);
      await NoteApiService.deleteNote(id);

      setNotes(prev => prev.filter(note => note.id !== id));
      setStats(prev => ({ ...prev, totalNotes: prev.totalNotes - 1 }));
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete note';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const archiveNote = useCallback(async (id: number, archived: boolean): Promise<NoteResponse> => {
    try {
      setError(null);
      const updatedNote = await NoteApiService.toggleArchiveNote(id, archived);

      setNotes(prev => prev.map(note =>
        note.id === id ? updatedNote : note
      ));

      return updatedNote;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to archive note';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const toggleVisibility = useCallback(async (id: number, isPublic: boolean): Promise<NoteResponse> => {
    try {
      setError(null);
      const updatedNote = await NoteApiService.toggleNoteVisibility(id, isPublic);

      setNotes(prev => prev.map(note =>
        note.id === id ? updatedNote : note
      ));

      return updatedNote;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to toggle visibility';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const searchNotes = useCallback(async (params: NoteSearchParams): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      if (!params.keyword?.trim()) {
        await loadNotes(0);
        return;
      }

      let searchResults;
      if (projectId) {
        searchResults = await NoteApiService.searchProjectNotes(
          projectId,
          params.keyword,
          params.includeArchived || false
        );
      } else {
        searchResults = await NoteApiService.searchPersonalNotes(
          params.keyword,
          params.includeArchived || false
        );
      }

      setNotes(searchResults);
      setStats(calculateStats(searchResults));
      setPagination(prev => ({
        ...prev,
        currentPage: 0,
        totalElements: searchResults.length,
        totalPages: Math.ceil(searchResults.length / pageSize)
      }));

    } catch (err: any) {
      const errorMessage = err.message || 'Failed to search notes';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [projectId, loadNotes, calculateStats, pageSize]);

  const loadMore = useCallback(async (): Promise<void> => {
    if (pagination.currentPage < pagination.totalPages - 1) {
      await loadNotes(pagination.currentPage + 1, true);
    }
  }, [pagination.currentPage, pagination.totalPages, loadNotes]);

  const refresh = useCallback(async (): Promise<void> => {
    await loadNotes(0);
  }, [loadNotes]);

  const updateFilters = useCallback((newFilters: NoteFilter) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Initial load - ONLY run once on mount or when key params change
  useEffect(() => {
    if (!initialLoadDoneRef.current) {
      const timeoutId = setTimeout(() => {
        loadNotes(0, false, true); // Force initial load
      }, 50); // Very short delay to batch multiple effects

      return () => clearTimeout(timeoutId);
    }
  }, [projectId]); // Only depend on projectId for initial load

  // Handle filter changes - reset and reload with debounce
  useEffect(() => {
    if (initialLoadDoneRef.current) {
      const timeoutId = setTimeout(() => {
        lastCallParamsRef.current = ''; // Reset to allow new call
        loadNotes(0, false, true);
      }, 300); // Increased debounce time

      return () => clearTimeout(timeoutId);
    }
  }, [filters.isArchived]); // Only essential filter changes

  // Auto refresh - much more controlled
  useEffect(() => {
    if (!autoRefresh || !initialLoadDoneRef.current) return;

    const interval = setInterval(() => {
      if (!isLoadingRef.current) {
        lastCallParamsRef.current = ''; // Reset to allow refresh
        loadNotes(0, false, true);
      }
    }, 60000); // 1 minute

    return () => clearInterval(interval);
  }, [autoRefresh]); // Only depend on autoRefresh flag

  // Cleanup
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    notes,
    loading,
    error,
    pagination,
    stats,
    actions: {
      createNote,
      updateNote,
      deleteNote,
      archiveNote,
      toggleVisibility,
      searchNotes,
      loadMore,
      refresh,
      setFilters: updateFilters
    }
  };
};
