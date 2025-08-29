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

// GET /api/teams/[id]/progress - Lấy progress của team cụ thể
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate authentication using the new system
    const { authenticated, user } = await validateAuthentication(request);

    if (!authenticated || !user) {
      console.error('❌ [Team Progress] Authentication failed');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const teamId = params.id;

    // Get backend base URL
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080';
    const url = `${backendUrl}/api/teams/${teamId}/progress`;

    console.log('📤 [Team Progress] Proxying to backend:', url);

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
          error: 'Failed to fetch team progress from backend',
          details: errorText,
          status: backendResponse.status
        },
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();
    console.log('✅ [Team Progress] Successfully fetched team progress for teamId:', teamId);

    return NextResponse.json(data);

  } catch (error: unknown) {
    console.error('❌ API Error in GET /api/teams/[id]/progress:', error);

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

// POST /api/teams/[id]/progress - Refresh team progress manually
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate authentication using the new system
    const { authenticated, user } = await validateAuthentication(request);

    if (!authenticated || !user) {
      console.error('❌ [Team Progress Refresh] Authentication failed');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const teamId = params.id;

    // Get backend base URL
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080';
    const url = `${backendUrl}/api/teams/${teamId}/progress`;

    console.log('📤 [Team Progress Refresh] Proxying to backend:', url);

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
          error: 'Failed to refresh team progress from backend',
          details: errorText,
          status: backendResponse.status
        },
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();
    console.log('✅ [Team Progress Refresh] Successfully refreshed team progress for teamId:', teamId);

    return NextResponse.json(data);

  } catch (error: unknown) {
    console.error('❌ API Error in POST /api/teams/[id]/progress:', error);

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
