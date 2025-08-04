/**
 * Users API - Mock implementation for development
 */

import { NextRequest, NextResponse } from 'next/server';
import { CalendarUser } from '@/lib/calendar/types';

// Mock users data
const MOCK_USERS: CalendarUser[] = [
  {
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
    ],
  },
  {
    id: 'user-2',
    name: 'Jane Smith',
    email: 'jane.smith@company.com',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    role: 'member',
    teamIds: ['team-123'],
    permissions: [
      { resource: 'event', action: 'create', scope: 'own' },
      { resource: 'event', action: 'read', scope: 'team' },
      { resource: 'event', action: 'update', scope: 'own' },
      { resource: 'event', action: 'delete', scope: 'own' },
    ],
  },
  {
    id: 'user-3',
    name: 'Mike Johnson',
    email: 'mike.johnson@company.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    role: 'member',
    teamIds: ['team-123'],
    permissions: [
      { resource: 'event', action: 'create', scope: 'own' },
      { resource: 'event', action: 'read', scope: 'team' },
      { resource: 'event', action: 'update', scope: 'own' },
      { resource: 'event', action: 'delete', scope: 'own' },
    ],
  },
  {
    id: 'user-4',
    name: 'Sarah Wilson',
    email: 'sarah.wilson@company.com',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    role: 'member',
    teamIds: ['team-123'],
    permissions: [
      { resource: 'event', action: 'create', scope: 'own' },
      { resource: 'event', action: 'read', scope: 'team' },
      { resource: 'event', action: 'update', scope: 'own' },
      { resource: 'event', action: 'delete', scope: 'own' },
    ],
  },
];

// GET /api/users
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    
    let filteredUsers = [...MOCK_USERS];
    
    // Apply search query
    if (query) {
      const searchQuery = query.toLowerCase();
      filteredUsers = filteredUsers.filter(user =>
        user.name.toLowerCase().includes(searchQuery) ||
        user.email.toLowerCase().includes(searchQuery)
      );
    }
    
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return NextResponse.json(filteredUsers);
    
  } catch (error) {
    console.error('Users API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}