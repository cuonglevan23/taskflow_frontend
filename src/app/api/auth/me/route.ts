/**
 * Current User API - Mock implementation for development
 */

import { NextRequest, NextResponse } from 'next/server';
import { CalendarUser } from '@/lib/calendar/types';

// Mock current user data
const CURRENT_USER: CalendarUser = {
  id: 'user-1',
  name: 'John Doe',
  email: 'john.doe@company.com',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
  role: 'manager',
  teamIds: ['team-123'],
  permissions: [
    { resource: 'event', action: 'create', scope: 'team' },
    { resource: 'event', action: 'read', scope: 'all' },
    { resource: 'event', action: 'update', scope: 'team' },
    { resource: 'event', action: 'delete', scope: 'own' },
    { resource: 'calendar', action: 'read', scope: 'team' },
    { resource: 'team', action: 'read', scope: 'own' },
    { resource: 'project', action: 'read', scope: 'team' },
  ],
};

// GET /api/auth/me
export async function GET(request: NextRequest) {
  try {
    // In real app, get user from authentication token
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return NextResponse.json(CURRENT_USER);
    
  } catch (error) {
    console.error('Current user API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch current user' },
      { status: 500 }
    );
  }
}