import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const { id } = params;
    const { searchParams } = new URL(request.url);
    
    // Get backend base URL
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080';
    
    // Handle different activity endpoints based on query params
    const limit = searchParams.get('limit');
    const page = searchParams.get('page');
    const size = searchParams.get('size');
    const sortBy = searchParams.get('sortBy');
    const sortDirection = searchParams.get('sortDirection');
    
    let url = `${backendUrl}/api/tasks/${id}/activities`;
    
    // Determine which endpoint to call based on query parameters
    if (limit && !page) {
      // Recent activities endpoint
      url = `${backendUrl}/api/tasks/${id}/activities/recent?limit=${limit}`;
    } else if (page !== null || size !== null) {
      // Paginated activities endpoint
      const params = new URLSearchParams();
      if (page) params.append('page', page);
      if (size) params.append('size', size);
      if (sortBy) params.append('sortBy', sortBy);
      if (sortDirection) params.append('sortDirection', sortDirection);
      url = `${backendUrl}/api/tasks/${id}/activities/paginated?${params.toString()}`;
    }

    console.log('🔗 Proxying activities request to backend:', url);

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
      console.error('❌ Backend error response:', backendResponse.status, errorText);
      
      return NextResponse.json(
        { 
          error: `Backend error: ${backendResponse.statusText}`,
          details: errorText,
          status: backendResponse.status
        },
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();
    return NextResponse.json(data);

  } catch (error: unknown) {
    console.error('❌ Error in activities API route:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}
