import { NextRequest, NextResponse } from 'next/server';

// Authentication helper function for the new backend-only auth system
async function validateAuthentication(request: NextRequest) {
  try {
    // Get backend base URL
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080';

    // Forward the cookies from the request to validate authentication
    const cookieHeader = request.headers.get('cookie');

    const response = await fetch(`${backendUrl}/api/user-profiles/me`, {
      method: 'GET',
      headers: {
        'Cookie': cookieHeader || '',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return { authenticated: false, user: null };
    }

    const userData = await response.json();
    return { authenticated: true, user: userData };
  } catch (error) {
    console.error('Authentication validation failed:', error);
    return { authenticated: false, user: null };
  }
}

export async function GET(request: NextRequest) {
  try {
    // Validate authentication using the new system
    const { authenticated, user } = await validateAuthentication(request);

    if (!authenticated || !user) {
      return NextResponse.json(
        { error: 'Authentication required' }, 
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

    console.log('📤 [Projects] Proxying to backend:', url);

    // Forward request to backend with cookies for authentication
    const cookieHeader = request.headers.get('cookie');

    const backendResponse = await fetch(url, {
      method: 'GET',
      headers: {
        'Cookie': cookieHeader || '',
        'Content-Type': 'application/json',
      },
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error('❌ [Projects] Backend error:', backendResponse.status, errorText);

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
    console.log('✅ [Projects] Successfully fetched projects');

    return NextResponse.json(data);
    
  } catch (error: unknown) {
    console.error('❌ [Projects] API Error:', error);

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
    // Validate authentication using the new system
    const { authenticated, user } = await validateAuthentication(request);

    if (!authenticated || !user) {
      return NextResponse.json(
        { error: 'Authentication required' }, 
        { status: 401 }
      );
    }

    // Get backend base URL
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080';
    const url = `${backendUrl}/api/projects`;

    console.log('📤 [Projects] Creating project, proxying to backend:', url);

    // Get request body
    const body = await request.text();

    // Forward request to backend with cookies for authentication
    const cookieHeader = request.headers.get('cookie');

    const backendResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Cookie': cookieHeader || '',
        'Content-Type': 'application/json',
      },
      body: body,
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error('❌ [Projects] Backend error:', backendResponse.status, errorText);

      return NextResponse.json(
        { 
          error: 'Failed to create project on backend',
          details: errorText,
          status: backendResponse.status 
        }, 
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();
    console.log('✅ [Projects] Successfully created project');

    return NextResponse.json(data);
    
  } catch (error: unknown) {
    console.error('❌ [Projects] API Error:', error);

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