import { NextRequest, NextResponse } from 'next/server';


const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.accessToken) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id: taskId } = await params;


    const response = await fetch(`${BACKEND_URL}/api/project-tasks/${taskId}`, {
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
    console.error('❌ Project task GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project task', details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.accessToken) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id: taskId } = await params;
    const body = await request.json();


    const response = await fetch(`${BACKEND_URL}/api/project-tasks/${taskId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${session.user.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
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
    console.error('❌ Project task update error:', error);
    return NextResponse.json(
      { error: 'Failed to update project task', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.accessToken) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id: taskId } = await params;
    console.log('🗑️ Deleting project task:', taskId);

    const response = await fetch(`${BACKEND_URL}/api/project-tasks/${taskId}`, {
      method: 'DELETE',
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

    console.log('✅ Project task deleted:', taskId);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('❌ Project task delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete project task', details: error.message },
      { status: 500 }
    );
  }
}