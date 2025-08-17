// My Tasks Summary API Route - Match backend endpoint
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

// GET /api/tasks/my-tasks/summary - Get user's task summary with pagination
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    console.log('🔍 My Tasks Summary API called');
    
    // Get auth session using NextAuth
    let session;
    try {
      session = await auth();
      console.log('📋 Session check result:', session ? 'Found session' : 'No session', session?.user?.email);
    } catch (authError) {
      console.error('❌ Auth function error:', authError);
      return NextResponse.json(
        { error: 'Authentication system error' },
        { status: 500 }
      );
    }
    
    if (!session?.user) {
      console.log('🚨 No session found, returning 401');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    console.log('✅ My Tasks Summary for user:', session.user.email);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '0');
    const size = parseInt(searchParams.get('size') || '20');
    const sortBy = searchParams.get('sortBy') || 'updatedAt';
    const sortDir = searchParams.get('sortDir') || 'desc';

    // Mock data that matches backend MyTaskSummaryDto structure
    const mockTasks = [
      {
        id: 1,
        title: "Complete dashboard redesign",
        description: "Update the user interface with new design system",
        status: "IN_PROGRESS",
        priority: "HIGH",
        dueDate: "2024-01-20",
        assigneeId: parseInt(session.user.id),
        assigneeName: session.user.name,
        createdAt: "2024-01-15T10:00:00Z",
        updatedAt: "2024-01-16T14:30:00Z"
      },
      {
        id: 2,
        title: "Fix authentication bug",
        description: "Resolve 401 error in API calls",
        status: "TODO",
        priority: "MEDIUM",
        dueDate: "2024-01-18",
        assigneeId: parseInt(session.user.id),
        assigneeName: session.user.name,
        createdAt: "2024-01-16T09:00:00Z",
        updatedAt: "2024-01-16T09:00:00Z"
      }
    ];

    // Mock paginated response structure
    const mockResult = {
      content: mockTasks,
      totalElements: mockTasks.length,
      totalPages: 1,
      number: page,
      size: size,
      first: true,
      last: true,
      numberOfElements: mockTasks.length
    };

    console.log(`🔄 Returning ${mockTasks.length} mock tasks for user:`, session.user.email);
    return NextResponse.json(mockResult);

  } catch (error) {
    console.error('GET /api/tasks/my-tasks/summary error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch task summary' },
      { status: 500 }
    );
  }
}