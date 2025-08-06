/**
 * Projects API - Mock implementation for development
 */

import { NextRequest, NextResponse } from 'next/server';
import { Project } from '@/lib/calendar/types';

// Mock projects data - sync with ProjectsContext
const MOCK_PROJECTS: Project[] = [
  {
    id: '1',
    name: 'Website Redesign',
    description: 'Complete redesign of company website',
    color: '#e91e63',
    teamId: 'team-123',
    managerId: 'user-1',
    status: 'active',
    startDate: new Date('2024-01-15'),
    endDate: new Date('2024-06-30'),
  },
  {
    id: '2',
    name: 'Mobile App Development',
    description: 'Native iOS and Android app',
    color: '#3f51b5',
    teamId: 'team-123',
    managerId: 'user-2',
    status: 'active',
    startDate: new Date('2024-01-10'),
    endDate: new Date('2024-08-31'),
  },
  {
    id: '3',
    name: 'Marketing Campaign Q1',
    description: 'Digital marketing campaign for Q1',
    color: '#10b981',
    teamId: 'team-123',
    managerId: 'user-3',
    status: 'active',
    startDate: new Date('2024-01-12'),
    endDate: new Date('2024-05-31'),
  },
  {
    id: '4',
    name: 'User Research Study',
    description: 'Comprehensive user experience research',
    color: '#8b5cf6',
    teamId: 'team-123',
    managerId: 'user-4',
    status: 'active',
    startDate: new Date('2024-01-08'),
    endDate: new Date('2024-04-30'),
  },
  {
    id: '5',
    name: 'Request Tracking System',
    description: 'Internal request management system',
    color: '#2196f3',
    teamId: 'team-123',
    managerId: 'user-5',
    status: 'active',
    startDate: new Date('2024-01-05'),
    endDate: new Date('2024-07-31'),
  },
];

// GET /api/projects
export async function GET(request: NextRequest) {
  try {
    // In real app, filter based on user permissions
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return NextResponse.json(MOCK_PROJECTS);
    
  } catch (error) {
    console.error('Projects API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}