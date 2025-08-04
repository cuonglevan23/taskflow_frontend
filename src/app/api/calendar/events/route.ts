/**
 * Calendar Events API - Mock implementation for development
 * Enterprise-grade calendar system mock backend
 */

import { NextRequest, NextResponse } from 'next/server';
import { CalendarEvent } from '@/lib/calendar/types';

// Mock calendar events data
const MOCK_EVENTS: CalendarEvent[] = [
  {
    id: '1',
    title: 'Team Standup',
    description: 'Daily team standup meeting',
    start: new Date('2024-01-15T09:00:00'),
    end: new Date('2024-01-15T09:30:00'),
    allDay: false,
    type: 'meeting',
    category: 'team',
    priority: 'medium',
    status: 'planned',
    ownerId: 'user-1',
    assigneeIds: ['user-1', 'user-2', 'user-3'],
    teamId: 'team-123',
    projectId: undefined,
    color: '#F59E0B',
    tags: ['standup', 'daily'],
    location: 'Conference Room A',
    meetingUrl: 'https://meet.google.com/abc-defg-hij',
    attachments: [],
    editable: true,
    deletable: true,
    createdAt: new Date('2024-01-10T10:00:00'),
    updatedAt: new Date('2024-01-10T10:00:00'),
    createdBy: 'user-1',
    updatedBy: 'user-1',
  },
  {
    id: '2',
    title: 'Project Milestone Review',
    description: 'Review project milestones and deliverables',
    start: new Date('2024-01-18T14:00:00'),
    end: new Date('2024-01-18T16:00:00'),
    allDay: false,
    type: 'milestone',
    category: 'project',
    priority: 'high',
    status: 'planned',
    ownerId: 'user-2',
    assigneeIds: ['user-2', 'user-4'],
    teamId: 'team-123',
    projectId: 'project-456',
    color: '#8B5CF6',
    tags: ['milestone', 'review'],
    location: 'Main Conference Room',
    attachments: [],
    editable: true,
    deletable: true,
    createdAt: new Date('2024-01-12T11:00:00'),
    updatedAt: new Date('2024-01-12T11:00:00'),
    createdBy: 'user-2',
    updatedBy: 'user-2',
  },
  {
    id: '3',
    title: 'Client Presentation',
    description: 'Present quarterly results to client',
    start: new Date('2024-01-22T10:00:00'),
    end: new Date('2024-01-22T11:30:00'),
    allDay: false,
    type: 'meeting',
    category: 'client',
    priority: 'critical',
    status: 'planned',
    ownerId: 'user-3',
    assigneeIds: ['user-3', 'user-1'],
    teamId: 'team-123',
    color: '#EF4444',
    tags: ['client', 'presentation'],
    location: 'Client Office',
    attachments: [],
    editable: true,
    deletable: true,
    createdAt: new Date('2024-01-08T09:00:00'),
    updatedAt: new Date('2024-01-08T09:00:00'),
    createdBy: 'user-3',
    updatedBy: 'user-3',
  },
  {
    id: '4',
    title: 'Code Review Session',
    description: 'Review recent code changes and improvements',
    start: new Date('2024-01-19T15:00:00'),
    end: new Date('2024-01-19T16:00:00'),
    allDay: false,
    type: 'task',
    category: 'team',
    priority: 'medium',
    status: 'planned',
    ownerId: 'user-4',
    assigneeIds: ['user-4', 'user-2'],
    teamId: 'team-123',
    color: '#10B981',
    tags: ['code-review', 'development'],
    location: 'Dev Room',
    attachments: [],
    editable: true,
    deletable: true,
    createdAt: new Date('2024-01-14T14:00:00'),
    updatedAt: new Date('2024-01-14T14:00:00'),
    createdBy: 'user-4',
    updatedBy: 'user-4',
  },
  {
    id: '5',
    title: 'Vacation',
    description: 'Annual leave',
    start: new Date('2024-01-25T00:00:00'),
    end: new Date('2024-01-26T23:59:59'),
    allDay: true,
    type: 'vacation',
    category: 'personal',
    priority: 'low',
    status: 'planned',
    ownerId: 'user-1',
    assigneeIds: ['user-1'],
    color: '#FB923C',
    tags: ['vacation', 'personal'],
    attachments: [],
    editable: true,
    deletable: true,
    createdAt: new Date('2024-01-05T10:00:00'),
    updatedAt: new Date('2024-01-05T10:00:00'),
    createdBy: 'user-1',
    updatedBy: 'user-1',
  },
];

// GET /api/calendar/events
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const query = searchParams.get('q') || '';
    const startParam = searchParams.get('start');
    const endParam = searchParams.get('end');
    const filtersParam = searchParams.get('filters');
    const sortBy = searchParams.get('sortBy') || 'start';
    const sortOrder = searchParams.get('sortOrder') || 'asc';
    
    let filteredEvents = [...MOCK_EVENTS];
    
    // Apply date range filter
    if (startParam && endParam) {
      const startDate = new Date(startParam);
      const endDate = new Date(endParam);
      
      filteredEvents = filteredEvents.filter(event => {
        return event.start >= startDate && event.start <= endDate;
      });
    }
    
    // Apply search query
    if (query) {
      const searchQuery = query.toLowerCase();
      filteredEvents = filteredEvents.filter(event =>
        event.title.toLowerCase().includes(searchQuery) ||
        event.description?.toLowerCase().includes(searchQuery) ||
        event.tags.some(tag => tag.toLowerCase().includes(searchQuery))
      );
    }
    
    // Apply filters
    if (filtersParam) {
      try {
        const filters = JSON.parse(filtersParam);
        const activeFilters = filters.filter((f: any) => f.active);
        
        if (activeFilters.length > 0) {
          filteredEvents = filteredEvents.filter(event => {
            return activeFilters.some((filter: any) => {
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
                  return event.assigneeIds.some((id: string) => filter.values.includes(id));
                case 'team':
                  return event.teamId && filter.values.includes(event.teamId);
                case 'project':
                  return event.projectId && filter.values.includes(event.projectId);
                default:
                  return true;
              }
            });
          });
        }
      } catch (error) {
        console.warn('Failed to parse filters:', error);
      }
    }
    
    // Apply sorting
    filteredEvents.sort((a, b) => {
      let aValue: any;
      let bValue: any;
      
      switch (sortBy) {
        case 'start':
          aValue = a.start.getTime();
          bValue = b.start.getTime();
          break;
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'priority':
          const priorityOrder = { low: 1, medium: 2, high: 3, critical: 4 };
          aValue = priorityOrder[a.priority];
          bValue = priorityOrder[b.priority];
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          aValue = a.start.getTime();
          bValue = b.start.getTime();
      }
      
      if (sortOrder === 'desc') {
        return aValue < bValue ? 1 : -1;
      }
      return aValue > bValue ? 1 : -1;
    });
    
    // Simulate pagination (for future use)
    const response = {
      events: filteredEvents,
      total: filteredEvents.length,
      hasMore: false,
      nextCursor: null,
    };
    
    // Add delay to simulate real API
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Calendar events API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calendar events' },
      { status: 500 }
    );
  }
}

// POST /api/calendar/events - Create new event
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Create new event with generated ID
    const newEvent: CalendarEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...body,
      start: new Date(body.start),
      end: body.end ? new Date(body.end) : undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'current-user', // In real app, get from auth
      updatedBy: 'current-user',
      ownerId: 'current-user',
      editable: true,
      deletable: true,
      attachments: [],
    };
    
    // In real app, save to database
    MOCK_EVENTS.push(newEvent);
    
    return NextResponse.json(newEvent, { status: 201 });
    
  } catch (error) {
    console.error('Create event API error:', error);
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
}