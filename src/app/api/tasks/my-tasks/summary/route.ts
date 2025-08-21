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

    // Build query parameters for backend
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sortBy,
      sortDir,
    });

    // Get backend base URL
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080';
    const url = `${backendUrl}/api/tasks/my-tasks/summary?${params.toString()}`;



    // Forward request to backend with user's JWT token
    const backendResponse = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.user.accessToken}`,
        'Content-Type': 'application/json',
      },
      // Add timeout to prevent hanging requests
      signal: AbortSignal.timeout(10000), // 10 second timeout
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
      
      // If backend endpoint doesn't exist (404) or server error (500), return mock data
      if (backendResponse.status === 404 || backendResponse.status === 500) {
        console.warn('🚧 Backend endpoint not available, returning mock data');
        return NextResponse.json({
          content: [], // Service expects 'content' field
          totalElements: 0,
          totalPages: 0,
          number: 0,
          size: 20,
          numberOfElements: 0,
          first: true,
          last: true,
          empty: true
        });
      }
      
      return NextResponse.json(
        { 
          error: 'Failed to fetch my tasks summary from backend',
          details: errorText,
          status: backendResponse.status 
        }, 
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();


    return NextResponse.json(data);
    
  } catch (error: unknown) {
    console.error('❌ API Error in /api/tasks/my-tasks/summary:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // If there's a connection error or timeout, return empty data instead of 500
    if (errorMessage.includes('fetch') || errorMessage.includes('timeout') || errorMessage.includes('ECONNREFUSED')) {
      console.warn('🚧 Backend connection failed, returning empty data');
      return NextResponse.json({
        content: [], // Service expects 'content' field
        totalElements: 0,
        totalPages: 0,
        number: 0,
        size: 20,
        numberOfElements: 0,
        first: true,
        last: true,
        empty: true
      });
    }
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: errorMessage 
      }, 
      { status: 500 }
    );
  }
}