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

// GET /api/projects/[id]/progress - Lấy progress của project cụ thể
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate authentication using the new system
    const { authenticated, user } = await validateAuthentication(request);

    if (!authenticated || !user) {
      console.error('❌ [Project Progress] Authentication failed');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const projectId = params.id;

    // Get backend base URL
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080';
    const url = `${backendUrl}/api/projects/${projectId}/progress`;

    console.log('📤 [Project Progress] Proxying to backend:', url);

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
      console.error('❌ Backend error:', backendResponse.status, errorText);

      return NextResponse.json(
        {
          error: 'Failed to fetch project progress from backend',
          details: errorText,
          status: backendResponse.status
        },
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();
    console.log('✅ [Project Progress] Successfully fetched project progress for projectId:', projectId);

    return NextResponse.json(data);

  } catch (error: unknown) {
    console.error('❌ API Error in GET /api/projects/[id]/progress:', error);

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

// POST /api/projects/[id]/progress - Refresh project progress (auto-updates team)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate authentication using the new system
    const { authenticated, user } = await validateAuthentication(request);

    if (!authenticated || !user) {
      console.error('❌ [Project Progress Refresh] Authentication failed');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const projectId = params.id;

    // Get backend base URL
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080';
    const url = `${backendUrl}/api/projects/${projectId}/progress`;

    console.log('📤 [Project Progress Refresh] Proxying to backend:', url);

    // Forward request to backend with cookies for authentication
    const cookieHeader = request.headers.get('cookie');

    const backendResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Cookie': cookieHeader || '',
        'Content-Type': 'application/json',
      },
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error('❌ Backend error:', backendResponse.status, errorText);

      return NextResponse.json(
        {
          error: 'Failed to refresh project progress from backend',
          details: errorText,
          status: backendResponse.status
        },
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();
    console.log('✅ [Project Progress Refresh] Successfully refreshed project progress for projectId:', projectId);

    return NextResponse.json(data);

  } catch (error: unknown) {
    console.error('❌ API Error in POST /api/projects/[id]/progress:', error);

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
