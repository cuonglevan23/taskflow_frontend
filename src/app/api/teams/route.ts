/**
 * Teams API - Mock implementation for development
 */

import { NextRequest, NextResponse } from 'next/server';
import { Team } from '@/lib/calendar/types';

// Mock teams data
const MOCK_TEAMS: Team[] = [
  {
    id: 'team-123',
    name: 'Development Team',
    description: 'Main development team for the projects',
    color: '#3B82F6',
    memberIds: ['user-1', 'user-2', 'user-3', 'user-4'],
    managerId: 'user-1',
    projectIds: ['projects-456', 'projects-789'],
  },
  {
    id: 'team-456',
    name: 'Design Team',
    description: 'UI/UX design team',
    color: '#10B981',
    memberIds: ['user-5', 'user-6', 'user-7'],
    managerId: 'user-5',
    projectIds: ['projects-456'],
  },
  {
    id: 'team-789',
    name: 'Marketing Team',
    description: 'Marketing and growth team',
    color: '#F59E0B',
    memberIds: ['user-8', 'user-9'],
    managerId: 'user-8',
    projectIds: [],
  },
];

// GET /api/teams
export async function GET(request: NextRequest) {
  try {
    // In real app, filter based on user permissions
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return NextResponse.json(MOCK_TEAMS);
    
  } catch (error) {
    console.error('Teams API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch teams' },
      { status: 500 }
    );
  }
}