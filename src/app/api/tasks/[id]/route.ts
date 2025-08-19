// Task by ID API Route - Refactored with reusable middleware
import { NextRequest, NextResponse } from 'next/server';
import { withAuthHandler, withTaskPermissions } from '@/lib/middleware';
import { tasksService } from '@/services';
import type { AuthenticatedUser } from '@/lib/middleware/auth';

interface RouteParams {
  params: { id: string };
}

// GET /api/tasks/[id] - Get task by ID
export const GET = withAuthHandler(
  async (request: NextRequest, user: AuthenticatedUser, { params }: RouteParams): Promise<NextResponse> => {
    try {
      const task = await tasksService.getTask(params.id);
      return NextResponse.json(task);
    } catch (error) {
      console.error(`GET /api/tasks/${params.id} error:`, error);
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }
  },
  withTaskPermissions
);

// PUT /api/tasks/[id] - Update task
export const PUT = withAuthHandler(
  async (request: NextRequest, user: AuthenticatedUser, { params }: RouteParams): Promise<NextResponse> => {
    try {
      const body = await request.json();
      const task = await tasksService.updateTask(params.id, body);
      return NextResponse.json(task);
    } catch (error) {
      console.error(`PUT /api/tasks/${params.id} error:`, error);
      return NextResponse.json(
        { error: 'Failed to update task' },
        { status: 500 }
      );
    }
  },
  withTaskPermissions
);

// PATCH /api/tasks/[id] - Update task status
export const PATCH = withAuthHandler(
  async (request: NextRequest, user: AuthenticatedUser, { params }: RouteParams): Promise<NextResponse> => {
    try {
      const body = await request.json();
      const task = await tasksService.updateTask(params.id, { status: body.status });
      return NextResponse.json(task);
    } catch (error) {
      console.error(`PATCH /api/tasks/${params.id} error:`, error);
      return NextResponse.json(
        { error: 'Failed to update task status' },
        { status: 500 }
      );
    }
  },
  withTaskPermissions
);

// DELETE /api/tasks/[id] - Delete task
export const DELETE = withAuthHandler(
  async (request: NextRequest, user: AuthenticatedUser, { params }: RouteParams): Promise<NextResponse> => {
    try {
      await tasksService.deleteTask(params.id);
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error(`DELETE /api/tasks/${params.id} error:`, error);
      return NextResponse.json(
        { error: 'Failed to delete task' },
        { status: 500 }
      );
    }
  },
  withTaskPermissions
);