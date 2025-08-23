import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

type RouteParams = {
  params: Promise<{ id: string }>
}

// GET /api/teams/[id]/all-tasks - Get all tasks from all projects of a team
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    
    if (!session?.user?.accessToken) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id: teamId } = await params;
    
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080';
    // Use exact endpoint as documented in TEAM_API_DOCUMENTATION.md
    const url = `${backendUrl}/api/teams/${teamId}/all-tasks`;

    console.log('🔍 API Route: Fetching team all-tasks from:', url);

    const backendResponse = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.user.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error('❌ API Route: Backend error:', {
        status: backendResponse.status,
        statusText: backendResponse.statusText,
        error: errorText
      });
      
      return NextResponse.json(
        { error: 'Failed to fetch team tasks', details: errorText }, 
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();
    console.log('✅ API Route: Backend response:', {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
      dataType: typeof data,
      isArray: Array.isArray(data),
      taskCount: Array.isArray(data) ? data.length : 'Unknown',
      rawData: data,
      sample: Array.isArray(data) ? data.slice(0, 2) : data
    });
    
    return NextResponse.json(data);
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ API Route: Internal error:', errorMessage);
    return NextResponse.json({ error: 'Internal server error', details: errorMessage }, { status: 500 });
  }
}