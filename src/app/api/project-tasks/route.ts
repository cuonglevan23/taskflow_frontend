import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.accessToken) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Forward query parameters to backend
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    const backendUrl = `${BACKEND_URL}/api/project-tasks${queryString ? `?${queryString}` : ''}`;

    console.log('🔄 Proxying GET request to backend:', backendUrl);

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
    console.log('✅ Project tasks fetched:', data.content?.length || 0, 'tasks');
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('❌ Project tasks GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project tasks', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.accessToken) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    console.log('🚀 Creating project task:', body);

    const response = await fetch(`${BACKEND_URL}/api/project-tasks`, {
      method: 'POST',
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
    console.log('✅ Project task created:', data);
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('❌ Project task creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create project task', details: error.message },
      { status: 500 }
    );
  }
}