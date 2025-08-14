/**
 * Individual Team API - Mock implementation
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
];

// GET /api/teams/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    const team = MOCK_TEAMS.find(t => t.id === id);
    
    if (!team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(team);
    
  } catch (error) {
    console.error('Get team API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch team' },
      { status: 500 }
    );
  }
}