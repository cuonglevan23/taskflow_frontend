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

// GET /api/teams/progress/all - Lấy progress của tất cả teams mà user tham gia
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [Teams Progress All] Starting request...');

    // Validate authentication using the new system
    const { authenticated, user } = await validateAuthentication(request);

    if (!authenticated || !user) {
      console.error('❌ [Teams Progress All] Authentication failed');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    console.log('🔍 [Teams Progress All] Authentication successful for user:', user.email);

    // Get backend base URL
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080';
    const url = `${backendUrl}/api/teams/progress/all`;

    console.log('📤 [Teams Progress All] Proxying to backend:', url);

    // Forward request to backend with cookies for authentication
    const cookieHeader = request.headers.get('cookie');

    const backendResponse = await fetch(url, {
      method: 'GET',
      headers: {
        'Cookie': cookieHeader || '',
        'Content-Type': 'application/json',
      },
    });

    console.log('📥 [Teams Progress All] Backend response status:', backendResponse.status);

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error('❌ [Teams Progress All] Backend error:', {
        status: backendResponse.status,
        statusText: backendResponse.statusText,
        error: errorText
      });

      return NextResponse.json(
        {
          error: 'Failed to fetch teams progress from backend',
          details: errorText,
          status: backendResponse.status
        },
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();
    console.log('✅ [Teams Progress All] Successfully fetched teams progress:', {
      teamsCount: Array.isArray(data) ? data.length : 'unknown',
      dataKeys: typeof data === 'object' ? Object.keys(data) : 'not object'
    });

    return NextResponse.json(data);

  } catch (error: unknown) {
    console.error('❌ [Teams Progress All] API Error:', error);

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
