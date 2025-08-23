/**
 * Calendar Events API - Individual event operations
 * Handles GET, PUT, DELETE for specific events
 */

import { NextRequest, NextResponse } from 'next/server';
import { CalendarEvent } from '@/lib/calendar/types';

// This would normally come from a database
// For demo, we'll use a simple in-memory store
let MOCK_EVENTS: CalendarEvent[] = [
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
];

// GET /api/calendar/events/[id] - Get single event
export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const params = await context.params;
    const { id } = params;
    
    const event = MOCK_EVENTS.find(e => e.id === id);
    
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(event);
    
  } catch (error) {
    console.error('Get event API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch event' },
      { status: 500 }
    );
  }
}

// PUT /api/calendar/events/[id] - Update event
export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const params = await context.params;
    const { id } = params;
    const body = await request.json();
    
    const eventIndex = MOCK_EVENTS.findIndex(e => e.id === id);
    
    if (eventIndex === -1) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }
    
    // Update the event
    const updatedEvent: CalendarEvent = {
      ...MOCK_EVENTS[eventIndex],
      ...body,
      id, // Ensure ID doesn't change
      start: body.start ? new Date(body.start) : MOCK_EVENTS[eventIndex].start,
      end: body.end ? new Date(body.end) : MOCK_EVENTS[eventIndex].end,
      updatedAt: new Date(),
      updatedBy: 'current-user', // In real app, get from auth
    };
    
    MOCK_EVENTS[eventIndex] = updatedEvent;
    
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 50));
    
    return NextResponse.json(updatedEvent);
    
  } catch (error) {
    console.error('Update event API error:', error);
    return NextResponse.json(
      { error: 'Failed to update event' },
      { status: 500 }
    );
  }
}

// DELETE /api/calendar/events/[id] - Delete event
export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const params = await context.params;
    const { id } = params;
    
    const eventIndex = MOCK_EVENTS.findIndex(e => e.id === id);
    
    if (eventIndex === -1) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }
    
    // Check if user has permission to delete (in real app)
    const event = MOCK_EVENTS[eventIndex];
    if (!event.deletable) {
      return NextResponse.json(
        { error: 'Event cannot be deleted' },
        { status: 403 }
      );
    }
    
    // Remove the event
    MOCK_EVENTS.splice(eventIndex, 1);
    
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 50));
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Delete event API error:', error);
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    );
  }
}