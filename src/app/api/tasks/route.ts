// Tasks API Route - Simplified with NextAuth
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { tasksService } from '@/services';

// GET /api/tasks - Get user's tasks with pagination  
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Get auth session using NextAuth
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    console.log('✅ Authenticated user:', session.user.email);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '0');
    const size = parseInt(searchParams.get('size') || '20');
    const sortBy = searchParams.get('sortBy') || 'updatedAt';
    const sortDir = (searchParams.get('sortDir') || 'desc') as 'asc' | 'desc';

    // For now, return mock data since backend may not be available
    const mockResult = {
      tasks: [],
      totalElements: 0,
      totalPages: 0,
      currentPage: page,
      pageSize: size,
    };

    console.log('🔄 Returning mock tasks data for user:', session.user.email);
    return NextResponse.json(mockResult);

  } catch (error) {
    console.error('GET /api/tasks error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

// POST /api/tasks - Create new task
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Get auth session using NextAuth
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    console.log('✅ Creating task for user:', session.user.email);

    const body = await request.json();
    
    // Add creator ID from authenticated user
    const taskData = {
      ...body,
      creatorId: session.user.id
    };

    // For now, return mock created task
    const mockTask = {
      id: Date.now().toString(),
      ...taskData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    console.log('🔄 Returning mock created task');
    return NextResponse.json(mockTask, { status: 201 });

  } catch (error) {
    console.error('POST /api/tasks error:', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}