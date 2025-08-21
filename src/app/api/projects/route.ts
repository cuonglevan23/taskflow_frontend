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
      return NextResponse.json(
        { error: 'No access token available' }, 
        { status: 401 }
      );
    }



    // Get query parameters
    const { searchParams } = new URL(request.url);
    const params = new URLSearchParams();
    
    // Forward all query parameters
    searchParams.forEach((value, key) => {
      params.append(key, value);
    });

    // Get backend base URL
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080';
    const url = `${backendUrl}/api/projects?${params.toString()}`;

    console.log('📤 Proxying to backend:', url);

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
      console.error('❌ Backend error:', backendResponse.status, errorText);
      
      return NextResponse.json(
        { 
          error: 'Failed to fetch projects from backend',
          details: errorText,
          status: backendResponse.status 
        }, 
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();


    return NextResponse.json(data);
    
  } catch (error: unknown) {
    console.error('❌ API Error in GET /api/projects:', error);
    
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

export async function POST(request: NextRequest) {
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



    // Get request body
    const body = await request.json();


    // Get backend base URL
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080';
    const url = `${backendUrl}/api/projects`;

    console.log('📤 Proxying to backend:', url);

    // Forward request to backend with user's JWT token
    const backendResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.user.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error('❌ Backend error:', {
        status: backendResponse.status,
        statusText: backendResponse.statusText,
        url: url,
        errorText: errorText,
      });
      
      return NextResponse.json(
        { 
          error: 'Failed to create project in backend',
          details: errorText,
          status: backendResponse.status 
        }, 
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();


    return NextResponse.json(data);
    
  } catch (error: unknown) {
    console.error('❌ API Error in POST /api/projects:', error);
    
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