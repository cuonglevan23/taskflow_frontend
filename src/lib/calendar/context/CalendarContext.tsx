/**
 * Calendar Context Provider - Global state management
 * Enterprise-grade with reducer pattern and optimistic updates
 */

"use client";

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { 
  CalendarContextState, 
  CalendarAction, 
  CalendarEvent, 
  CalendarConfig,
  CalendarFilter,
  CalendarSearchParams,
  EventType,
  EventCategory,
  EventPriority,
  UserRole 
} from '../types';
import { calendarService, CalendarServiceError } from '../services/calendarService';

// Initial State
const initialConfig: CalendarConfig = {
  view: 'dayGridMonth',
  date: new Date(),
  editable: true,
  selectable: true,
  businessHours: {
    daysOfWeek: [1, 2, 3, 4, 5], // Mon-Fri
    startTime: '09:00',
    endTime: '17:00',
  },
  timeZone: 'local',
  locale: 'en',
  firstDay: 1, // Monday
  weekends: true,
  showWeekNumbers: false,
  height: 'auto',
};

const initialFilters: CalendarFilter[] = [
  { 
    id: 'personal', 
    name: 'Personal Tasks', 
    type: 'category', 
    values: ['personal'], 
    active: true,
    color: '#3B82F6' 
  },
  { 
    id: 'team', 
    name: 'Team Events', 
    type: 'category', 
    values: ['team'], 
    active: true,
    color: '#10B981' 
  },
  { 
    id: 'project', 
    name: 'Project Tasks', 
    type: 'category', 
    values: ['project'], 
    active: true,
    color: '#F59E0B' 
  },
  { 
    id: 'meetings', 
    name: 'Meetings', 
    type: 'type', 
    values: ['meeting'], 
    active: true,
    color: '#8B5CF6' 
  },
  { 
    id: 'deadlines', 
    name: 'Deadlines', 
    type: 'type', 
    values: ['deadline'], 
    active: true,
    color: '#EF4444' 
  },
];

const initialSearchParams: CalendarSearchParams = {
  query: '',
  dateRange: undefined,
  filters: initialFilters,
  sortBy: 'start',
  sortOrder: 'asc',
};

const initialState: CalendarContextState = {
  config: initialConfig,
  events: [],
  loading: false,
  error: null,
  selectedEvent: null,
  filters: initialFilters,
  searchParams: initialSearchParams,
  showCreateModal: false,
  showEditModal: false,
  showDeleteModal: false,
};

// Reducer
function calendarReducer(state: CalendarContextState, action: CalendarAction): CalendarContextState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };

    case 'SET_EVENTS':
      return { 
        ...state, 
        events: action.payload, 
        loading: false, 
        error: null 
      };

    case 'ADD_EVENT': {
      const newEvent = action.payload;
      return {
        ...state,
        events: [...state.events, newEvent],
        showCreateModal: false,
        selectedEvent: newEvent,
      };
    }

    case 'UPDATE_EVENT': {
      const updatedEvent = action.payload;
      return {
        ...state,
        events: state.events.map(event => 
          event.id === updatedEvent.id ? updatedEvent : event
        ),
        showEditModal: false,
        selectedEvent: updatedEvent,
      };
    }

    case 'DELETE_EVENT': {
      const eventId = action.payload;
      return {
        ...state,
        events: state.events.filter(event => event.id !== eventId),
        showDeleteModal: false,
        selectedEvent: state.selectedEvent?.id === eventId ? null : state.selectedEvent,
      };
    }

    case 'SET_CONFIG':
      return { 
        ...state, 
        config: { ...state.config, ...action.payload } 
      };

    case 'SET_SELECTED_EVENT':
      return { ...state, selectedEvent: action.payload };

    case 'TOGGLE_FILTER': {
      const filterId = action.payload;
      return {
        ...state,
        filters: state.filters.map(filter =>
          filter.id === filterId 
            ? { ...filter, active: !filter.active }
            : filter
        ),
      };
    }

    case 'SET_SEARCH_PARAMS':
      return { ...state, searchParams: action.payload };

    case 'SHOW_CREATE_MODAL':
      return { ...state, showCreateModal: action.payload };

    case 'SHOW_EDIT_MODAL':
      return { ...state, showEditModal: action.payload };

    case 'SHOW_DELETE_MODAL':
      return { ...state, showDeleteModal: action.payload };

    default:
      return state;
  }
}

// Context Types
interface CalendarContextValue {
  // State
  state: CalendarContextState;
  
  // Configuration Actions
  setView: (view: CalendarContextState['config']['view']) => void;
  setDate: (date: Date) => void;
  navigateMonth: (direction: 'prev' | 'next') => void;
  goToToday: () => void;
  
  // Event Actions
  loadEvents: (params?: Partial<CalendarSearchParams>) => Promise<void>;
  createEvent: (event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>) => Promise<void>;
  updateEvent: (event: Partial<CalendarEvent> & { id: string }) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  selectEvent: (event: CalendarEvent | null) => void;
  
  // Filtering Actions
  toggleFilter: (filterId: string) => void;
  setSearchQuery: (query: string) => void;
  setDateRange: (start: Date, end: Date) => void;
  clearFilters: () => void;
  
  // Modal Actions
  openCreateModal: () => void;
  closeCreateModal: () => void;
  openEditModal: (event: CalendarEvent) => void;
  closeEditModal: () => void;
  openDeleteModal: (event: CalendarEvent) => void;
  closeDeleteModal: () => void;
  
  // Utility Functions
  getFilteredEvents: () => CalendarEvent[];
  getEventsForDate: (date: Date) => CalendarEvent[];
  isEventVisible: (event: CalendarEvent) => boolean;
}

// Create Context
const CalendarContext = createContext<CalendarContextValue | null>(null);

// Provider Component
interface CalendarProviderProps {
  children: React.ReactNode;
  initialConfig?: Partial<CalendarConfig>;
  userRole?: UserRole;
  teamId?: string;
  projectId?: string;
}

export const CalendarProvider: React.FC<CalendarProviderProps> = ({
  children,
  initialConfig = {},
  userRole = 'member',
  teamId,
  projectId,
}) => {
  const [state, dispatch] = useReducer(calendarReducer, {
    ...initialState,
    config: { ...initialState.config, ...initialConfig },
  });

  // Configuration Actions
  const setView = useCallback((view: CalendarContextState['config']['view']) => {
    dispatch({ type: 'SET_CONFIG', payload: { view } });
  }, []);

  const setDate = useCallback((date: Date) => {
    // Only update if date actually changed to prevent infinite loops
    const currentDate = state.config.date;
    if (!currentDate || date.getTime() !== currentDate.getTime()) {
      dispatch({ type: 'SET_CONFIG', payload: { date } });
    }
  }, [state.config.date]);

  const navigateMonth = useCallback((direction: 'prev' | 'next') => {
    const currentDate = state.config.date;
    const newDate = new Date(currentDate);
    
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    
    setDate(newDate);
  }, [state.config.date, setDate]);

  const goToToday = useCallback(() => {
    setDate(new Date());
  }, [setDate]);

  // Event Actions
  const loadEvents = useCallback(async (params: Partial<CalendarSearchParams> = {}) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const searchParams: CalendarSearchParams = {
        ...state.searchParams,
        ...params,
      };

      // Add context-specific filters
      if (teamId) {
        searchParams.filters = [
          ...searchParams.filters,
          { 
            id: 'current-team', 
            name: 'Current Team', 
            type: 'team', 
            values: [teamId], 
            active: true 
          }
        ];
      }

      if (projectId) {
        searchParams.filters = [
          ...searchParams.filters,
          { 
            id: 'current-project', 
            name: 'Current Project', 
            type: 'project', 
            values: [projectId], 
            active: true 
          }
        ];
      }

      const response = await calendarService.getEvents(searchParams);
      dispatch({ type: 'SET_EVENTS', payload: response.events });
      
    } catch (error) {
      const message = error instanceof CalendarServiceError 
        ? error.message 
        : 'Failed to load events';
      dispatch({ type: 'SET_ERROR', payload: message });
    }
  }, [state.searchParams, teamId, projectId]);

  const createEvent = useCallback(async (eventData: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const newEvent = await calendarService.createEvent({
        title: eventData.title,
        description: eventData.description,
        start: eventData.start,
        end: eventData.end,
        allDay: eventData.allDay,
        type: eventData.type,
        category: eventData.category,
        priority: eventData.priority,
        assigneeIds: eventData.assigneeIds,
        teamId: eventData.teamId || teamId,
        projectId: eventData.projectId || projectId,
        tags: eventData.tags,
        location: eventData.location,
        meetingUrl: eventData.meetingUrl,
      });
      
      dispatch({ type: 'ADD_EVENT', payload: newEvent });
      
    } catch (error) {
      const message = error instanceof CalendarServiceError 
        ? error.message 
        : 'Failed to create event';
      dispatch({ type: 'SET_ERROR', payload: message });
    }
  }, [teamId, projectId]);

  const updateEvent = useCallback(async (eventData: Partial<CalendarEvent> & { id: string }) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const updatedEvent = await calendarService.updateEvent(eventData);
      dispatch({ type: 'UPDATE_EVENT', payload: updatedEvent });
      
    } catch (error) {
      const message = error instanceof CalendarServiceError 
        ? error.message 
        : 'Failed to update event';
      dispatch({ type: 'SET_ERROR', payload: message });
    }
  }, []);

  const deleteEvent = useCallback(async (id: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      await calendarService.deleteEvent(id);
      dispatch({ type: 'DELETE_EVENT', payload: id });
      
    } catch (error) {
      const message = error instanceof CalendarServiceError 
        ? error.message 
        : 'Failed to delete event';
      dispatch({ type: 'SET_ERROR', payload: message });
    }
  }, []);

  const selectEvent = useCallback((event: CalendarEvent | null) => {
    dispatch({ type: 'SET_SELECTED_EVENT', payload: event });
  }, []);

  // Filtering Actions
  const toggleFilter = useCallback((filterId: string) => {
    dispatch({ type: 'TOGGLE_FILTER', payload: filterId });
  }, []);

  const setSearchQuery = useCallback((query: string) => {
    const newSearchParams = { ...state.searchParams, query };
    dispatch({ type: 'SET_SEARCH_PARAMS', payload: newSearchParams });
  }, [state.searchParams]);

  const setDateRange = useCallback((start: Date, end: Date) => {
    const newSearchParams = { 
      ...state.searchParams, 
      dateRange: { start, end } 
    };
    dispatch({ type: 'SET_SEARCH_PARAMS', payload: newSearchParams });
  }, [state.searchParams]);

  const clearFilters = useCallback(() => {
    const clearedFilters = state.filters.map(filter => ({ ...filter, active: false }));
    dispatch({ type: 'SET_SEARCH_PARAMS', payload: { 
      ...state.searchParams, 
      filters: clearedFilters,
      query: '',
      dateRange: undefined 
    }});
  }, [state.filters, state.searchParams]);

  // Modal Actions
  const openCreateModal = useCallback(() => {
    dispatch({ type: 'SHOW_CREATE_MODAL', payload: true });
  }, []);

  const closeCreateModal = useCallback(() => {
    dispatch({ type: 'SHOW_CREATE_MODAL', payload: false });
  }, []);

  const openEditModal = useCallback((event: CalendarEvent) => {
    dispatch({ type: 'SET_SELECTED_EVENT', payload: event });
    dispatch({ type: 'SHOW_EDIT_MODAL', payload: true });
  }, []);

  const closeEditModal = useCallback(() => {
    dispatch({ type: 'SHOW_EDIT_MODAL', payload: false });
  }, []);

  const openDeleteModal = useCallback((event: CalendarEvent) => {
    dispatch({ type: 'SET_SELECTED_EVENT', payload: event });
    dispatch({ type: 'SHOW_DELETE_MODAL', payload: true });
  }, []);

  const closeDeleteModal = useCallback(() => {
    dispatch({ type: 'SHOW_DELETE_MODAL', payload: false });
  }, []);

  // Utility Functions
  const getFilteredEvents = useCallback(() => {
    const activeFilters = state.filters.filter(f => f.active);
    
    return state.events.filter(event => {
      // Apply search query
      if (state.searchParams.query) {
        const query = state.searchParams.query.toLowerCase();
        const matchesQuery = 
          event.title.toLowerCase().includes(query) ||
          event.description?.toLowerCase().includes(query) ||
          event.tags.some(tag => tag.toLowerCase().includes(query));
        
        if (!matchesQuery) return false;
      }

      // Apply date range filter
      if (state.searchParams.dateRange) {
        const { start, end } = state.searchParams.dateRange;
        if (event.start < start || event.start > end) return false;
      }

      // Apply active filters
      if (activeFilters.length === 0) return true;

      return activeFilters.some(filter => {
        switch (filter.type) {
          case 'type':
            return filter.values.includes(event.type);
          case 'category':
            return filter.values.includes(event.category);
          case 'priority':
            return filter.values.includes(event.priority);
          case 'status':
            return filter.values.includes(event.status);
          case 'assignee':
            return event.assigneeIds.some(id => filter.values.includes(id));
          case 'team':
            return event.teamId && filter.values.includes(event.teamId);
          case 'project':
            return event.projectId && filter.values.includes(event.projectId);
          default:
            return true;
        }
      });
    });
  }, [state.events, state.filters, state.searchParams]);

  const getEventsForDate = useCallback((date: Date) => {
    const filteredEvents = getFilteredEvents();
    return filteredEvents.filter(event => {
      const eventDate = new Date(event.start);
      return eventDate.toDateString() === date.toDateString();
    });
  }, [getFilteredEvents]);

  const isEventVisible = useCallback((event: CalendarEvent) => {
    return getFilteredEvents().some(e => e.id === event.id);
  }, [getFilteredEvents]);

  // Load initial events
  useEffect(() => {
    loadEvents();
  }, [state.config.date?.getTime()]); // Re-load when date changes (using timestamp to avoid object reference issues)

  const value: CalendarContextValue = {
    state,
    setView,
    setDate,
    navigateMonth,
    goToToday,
    loadEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    selectEvent,
    toggleFilter,
    setSearchQuery,
    setDateRange,
    clearFilters,
    openCreateModal,
    closeCreateModal,
    openEditModal,
    closeEditModal,
    openDeleteModal,
    closeDeleteModal,
    getFilteredEvents,
    getEventsForDate,
    isEventVisible,
  };

  return (
    <CalendarContext.Provider value={value}>
      {children}
    </CalendarContext.Provider>
  );
};

// Hook to use calendar context
export const useCalendar = (): CalendarContextValue => {
  const context = useContext(CalendarContext);
  if (!context) {
    throw new Error('useCalendar must be used within a CalendarProvider');
  }
  return context;
};

export default CalendarContext;