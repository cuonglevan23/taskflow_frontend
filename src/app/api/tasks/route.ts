// Tasks API Route - Refactored with reusable middleware
import { NextRequest, NextResponse } from 'next/server';
import { withAuthHandler, withTaskPermissions } from '@/lib/middleware';
import { tasksService } from '@/services';
import type { AuthenticatedUser } from '@/lib/middleware/auth';

// GET /api/tasks - Get user's tasks with pagination
export const GET = withAuthHandler(
  async (request: NextRequest, user: AuthenticatedUser): Promise<NextResponse> => {
    try {
      const { searchParams } = new URL(request.url);
      const page = parseInt(searchParams.get('page') || '0');
      const size = parseInt(searchParams.get('size') || '20');
      const sortBy = searchParams.get('sortBy') || 'updatedAt';
      const sortDir = (searchParams.get('sortDir') || 'desc') as 'asc' | 'desc';

      const result = await tasksService.getMyTasksSummary({
        page,
        size,
        sortBy,
        sortDir
      });

      return NextResponse.json(result);
    } catch (error) {
      console.error('GET /api/tasks error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch tasks' },
        { status: 500 }
      );
    }
  },
  withTaskPermissions
);

// POST /api/tasks - Create new task
export const POST = withAuthHandler(
  async (request: NextRequest, user: AuthenticatedUser): Promise<NextResponse> => {
    try {
      const body = await request.json();
      
      // Add creator ID from authenticated user
      const taskData = {
        ...body,
        creatorId: parseInt(user.id)
      };

      const task = await tasksService.createTask(taskData);

      return NextResponse.json(task, { status: 201 });
    } catch (error) {
      console.error('POST /api/tasks error:', error);
      return NextResponse.json(
        { error: 'Failed to create task' },
        { status: 500 }
      );
    }
  },
  withTaskPermissions
);