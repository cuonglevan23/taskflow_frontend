// API Route for team progress following v1f guidelines
// GET /api/teams/[id]/progress - Returns team progress data

import { NextRequest, NextResponse } from 'next/server';
import { TeamProgressResponseDto } from '@/types/progress';

type RouteParams = {
  params: Promise<{ id: string }>
}

// Mock data matching the API documentation example
const mockTeamProgress: TeamProgressResponseDto = {
  id: 1,
  teamId: 123,
  teamName: "Backend Team",
  totalTasks: 45,
  completedTasks: 32,
  completionPercentage: 71.11,
  lastUpdated: "2024-08-25T01:54:09.209",
  createdAt: "2024-08-20T10:00:00",
  updatedAt: "2024-08-25T01:54:09.209",
  
  teamOwner: {
    userId: 456,
    email: "john.doe@company.com",
    firstName: "John",
    lastName: "Doe",
    username: "john.doe",
    jobTitle: "Team Lead",
    department: "Engineering",
    aboutMe: "Experienced team leader with 5 years in backend development",
    status: "Active",
    avatarUrl: "https://example.com/avatars/john.jpg",
    isUpgraded: true,
    displayName: "John Doe",
    initials: "JD"
  },
  teamMembers: [
    {
      userId: 456,
      email: "john.doe@company.com",
      firstName: "John",
      lastName: "Doe",
      username: "john.doe",
      displayName: "John Doe",
      initials: "JD",
      avatarUrl: "https://example.com/avatars/john.jpg",
      jobTitle: "Team Lead",
      department: "Engineering",
      status: "Active",
      isUpgraded: true
    },
    {
      userId: 789,
      email: "jane.smith@company.com",
      firstName: "Jane",
      lastName: "Smith",
      username: "jane.smith",
      displayName: "Jane Smith",
      initials: "JS",
      avatarUrl: "https://example.com/avatars/jane.jpg",
      jobTitle: "Senior Developer",
      department: "Engineering",
      status: "Active",
      isUpgraded: false
    }
  ],
  lastUpdatedBy: {
    userId: 789,
    email: "jane.smith@company.com",
    firstName: "Jane",
    lastName: "Smith",
    username: "jane.smith",
    displayName: "Jane Smith",
    initials: "JS",
    avatarUrl: "https://example.com/avatars/jane.jpg",
    jobTitle: "Senior Developer",
    department: "Engineering",
    status: "Active",
    isUpgraded: false
  }
};

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: teamId } = await params;
    
    // In development, return mock data
    if (process.env.NODE_ENV === 'development') {
      // Customize mock data based on teamId
      const customMockData = {
        ...mockTeamProgress,
        teamId: parseInt(teamId),
        teamName: teamId === '123' ? 'Backend Team' : `Team ${teamId}`,
      };
      
      return NextResponse.json(customMockData);
    }

    // In production, this would call the actual backend
    // const session = await auth();
    // if (!session?.user?.accessToken) {
    //   return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    // }

    // const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080';
    // const response = await fetch(`${backendUrl}/api/teams/${teamId}/progress`, {
    //   headers: {
    //     'Authorization': `Bearer ${session.user.accessToken}`,
    //     'Content-Type': 'application/json',
    //   },
    // });

    // if (!response.ok) {
    //   throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    // }

    // return NextResponse.json(await response.json());

    // For now, return mock data even in production
    const customMockData = {
      ...mockTeamProgress,
      teamId: parseInt(teamId),
      teamName: teamId === '123' ? 'Backend Team' : `Team ${teamId}`,
    };
    
    return NextResponse.json(customMockData);
    
  } catch (error) {
    console.error('Team progress API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch team progress' }, 
      { status: 500 }
    );
  }
}

// POST endpoint for refreshing team progress
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: teamId } = await params;
    
    // In development, return updated mock data
    if (process.env.NODE_ENV === 'development') {
      const refreshedMockData = {
        ...mockTeamProgress,
        teamId: parseInt(teamId),
        teamName: teamId === '123' ? 'Backend Team' : `Team ${teamId}`,
        lastUpdated: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        // Simulate slight progress update
        completedTasks: mockTeamProgress.completedTasks + 1,
        completionPercentage: Math.round(((mockTeamProgress.completedTasks + 1) / mockTeamProgress.totalTasks) * 100 * 100) / 100
      };
      
      return NextResponse.json(refreshedMockData);
    }

    // Production implementation would go here
    return NextResponse.json({ error: 'Not implemented' }, { status: 501 });
    
  } catch (error) {
    console.error('Team progress refresh API error:', error);
    return NextResponse.json(
      { error: 'Failed to refresh team progress' }, 
      { status: 500 }
    );
  }
}
