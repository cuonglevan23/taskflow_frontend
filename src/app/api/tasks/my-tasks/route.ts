import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function GET(request: NextRequest) {
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
      console.error('❌ No access token found in session');
      return NextResponse.json(
        { error: 'No access token available' }, 
        { status: 401 }
      );
    }



    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '0');
    const size = parseInt(searchParams.get('size') || '20');
    const sortBy = searchParams.get('sortBy') || 'updatedAt';
    const sortDir = searchParams.get('sortDir') || 'desc';
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const search = searchParams.get('search') || searchParams.get('q');

    // Build query parameters for backend
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sortBy,
      sortDir,
    });
    
    if (status) params.append('status', status);
    if (priority) params.append('priority', priority);
    if (search) params.append('q', search);

    // Get backend base URL
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080';
    const url = `${backendUrl}/api/tasks/my-tasks?${params.toString()}`;



    // Forward request to backend with user's JWT token
    const backendResponse = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.user.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error('❌ Backend error:', {
        status: backendResponse.status,
        statusText: backendResponse.statusText,
        url: url,
        errorText: errorText,
        headers: Object.fromEntries(backendResponse.headers.entries())
      });
      
      return NextResponse.json(
        { 
          error: 'Failed to fetch my tasks from backend',
          details: errorText,
          status: backendResponse.status 
        }, 
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();


    return NextResponse.json(data);
    
  } catch (error: unknown) {
    console.error('❌ API Error in /api/tasks/my-tasks:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: errorMessage 
      }, 
      { status: 500 }
    );
  }
}