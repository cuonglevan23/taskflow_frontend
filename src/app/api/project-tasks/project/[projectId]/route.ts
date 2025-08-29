import { NextRequest, NextResponse } from 'next/server';


const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.accessToken) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { projectId } = await params;
    
    // Forward query parameters to backend
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    const backendUrl = `${BACKEND_URL}/api/project-tasks/project/${projectId}${queryString ? `?${queryString}` : ''}`;



    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.user.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('❌ Backend error:', response.status, response.statusText);
      const errorData = await response.text();
      return NextResponse.json(
        { error: `Backend error: ${response.statusText}`, details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();

    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('❌ Project tasks by project GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project tasks', details: error.message },
      { status: 500 }
    );
  }
}