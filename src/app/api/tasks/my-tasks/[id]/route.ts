import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // Get session from NextAuth
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' }, 
        { status: 401 }
      );
    }

    // Check if accessToken exists
    if (!session.user.accessToken) {
      return NextResponse.json(
        { error: 'No access token available' }, 
        { status: 401 }
      );
    }

    // Await params to fix Next.js 15 requirement
    const params = await context.params;
    const { id } = params;

    // Get backend base URL
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080';
    const url = `${backendUrl}/api/tasks/my-tasks/${id}`;

    console.log('🔗 Proxying GET request to backend:', url);

    // Make request to backend
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.user.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Backend error response:', response.status, errorText);
      return NextResponse.json(
        { error: `Backend error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('❌ API route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // Get session from NextAuth
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' }, 
        { status: 401 }
      );
    }

    // Check if accessToken exists
    if (!session.user.accessToken) {
      return NextResponse.json(
        { error: 'No access token available' }, 
        { status: 401 }
      );
    }

    // Await params to fix Next.js 15 requirement
    const params = await context.params;
    const { id } = params;
    const body = await request.json();

    // Get backend base URL
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080';
    const url = `${backendUrl}/api/tasks/my-tasks/${id}`;

    console.log('🔗 Proxying PUT request to backend:', url);
    console.log('📦 Request body:', JSON.stringify(body, null, 2));

    // Make request to backend
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${session.user.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Backend error response:', response.status, errorText);
      return NextResponse.json(
        { error: `Backend error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('❌ API route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // Get session from NextAuth
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' }, 
        { status: 401 }
      );
    }

    // Check if accessToken exists
    if (!session.user.accessToken) {
      return NextResponse.json(
        { error: 'No access token available' }, 
        { status: 401 }
      );
    }

    // Await params to fix Next.js 15 requirement
    const params = await context.params;
    const { id } = params;

    // Get backend base URL
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080';
    const url = `${backendUrl}/api/tasks/my-tasks/${id}`;

    console.log('🔗 Proxying DELETE request to backend:', url);

    // Make request to backend
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${session.user.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Backend error response:', response.status, errorText);
      return NextResponse.json(
        { error: `Backend error: ${response.status}` },
        { status: response.status }
      );
    }

    // DELETE operations typically return 204 No Content
    if (response.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('❌ API route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
