import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

type RouteParams = {
  params: Promise<{ taskId: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    
    if (!session?.user?.accessToken) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const resolvedParams = await params;
    const taskId = resolvedParams.taskId;
    
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080';
    const url = `${backendUrl}/api/task-comments/task/${taskId}/count`;

    console.log('📤 Proxying request to:', url);

    const backendResponse = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.user.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error('❌ Backend error:', backendResponse.status, errorText);
      return NextResponse.json(
        { error: 'Failed to fetch comment count', details: errorText }, 
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();
    return NextResponse.json(data);
    
  } catch (error: unknown) {
    console.error('❌ API Error in GET /api/task-comments/task/[taskId]/count:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Internal server error', details: errorMessage }, { status: 500 });
  }
}
