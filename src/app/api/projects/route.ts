/**
 * Projects API - Mock implementation for development
 */

import { NextRequest, NextResponse } from 'next/server';
import { Project } from '@/lib/calendar/types';

// Mock projects data
const MOCK_PROJECTS: Project[] = [
  {
    id: 'project-456',
    name: 'Task Management System',
    description: 'Next.js task management application',
    color: '#8B5CF6',
    teamId: 'team-123',
    managerId: 'user-1',
    status: 'active',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-06-30'),
  },
  {
    id: 'project-789',
    name: 'Mobile App Development',
    description: 'React Native mobile application',
    color: '#EF4444',
    teamId: 'team-123',
    managerId: 'user-2',
    status: 'active',
    startDate: new Date('2024-02-01'),
    endDate: new Date('2024-08-31'),
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