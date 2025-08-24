import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';

class APIError extends Error {
  constructor(public message: string, public status: number) {
    super(message);
    this.name = 'APIError';
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { teamId, userEmail } = body;

    if (!teamId || !userEmail) {
      return NextResponse.json(
        { error: 'teamId and userEmail are required' },
        { status: 400 }
      );
    }

    console.log('🔑 Auth token exists:', !!token);
    console.log('🔑 Auth token preview:', token?.substring(0, 20) + '...');

    const requestBody = { 
      teamId, 
      userEmail  // Backend expects 'userEmail' field per validation errors
    };
    const requestBodyString = JSON.stringify(requestBody);
    
    // Call backend API to add team member
    console.log(`🔄 Calling backend: ${BACKEND_URL}/api/team-members`);
    console.log('📤 Request data:', requestBody);
    console.log('📤 Request body string:', requestBodyString);
    
    // Try both JSON body and query params to see which works
    const backendResponse = await fetch(`${BACKEND_URL}/api/team-members?teamId=${teamId}&userEmail=${encodeURIComponent(userEmail)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: requestBodyString,
    });

    console.log(`📥 Backend response status: ${backendResponse.status}`);
    console.log(`📥 Backend response headers:`, Object.fromEntries(backendResponse.headers.entries()));

    if (!backendResponse.ok) {
      let errorData;
      const responseText = await backendResponse.text();
      console.log(`📥 Backend response body: "${responseText}"`);
      
      try {
        errorData = JSON.parse(responseText);
      } catch {
        errorData = { message: responseText || 'Unknown error' };
      }

      // Handle specific 404 case
      if (backendResponse.status === 404) {
        console.error('🔍 Backend endpoint not found - check if backend is running and endpoint exists');
        return NextResponse.json(
          { error: 'Team member API endpoint not found. Please check if the backend is running.' },
          { status: 404 }
        );
      }
      
      throw new APIError(
        errorData.message || 'Failed to add team member',
        backendResponse.status
      );
    }

    const data = await backendResponse.json();
    console.log('✅ Successfully added team member:', data);
    
    return NextResponse.json(data, { status: 201 });

  } catch (error) {
    console.error('❌ Failed to add team member:', error);
    console.error('❌ Error type:', typeof error);
    console.error('❌ Error constructor:', error?.constructor?.name);
    
    if (error instanceof APIError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    // Handle fetch/network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('🌐 Network error - backend might be down');
      return NextResponse.json(
        { error: 'Cannot connect to backend server. Please check if the backend is running.' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('memberId');
    const teamId = searchParams.get('teamId');

    if (!memberId || !teamId) {
      return NextResponse.json(
        { error: 'memberId and teamId are required' },
        { status: 400 }
      );
    }

    // Call backend API to remove team member
    const backendResponse = await fetch(`${BACKEND_URL}/api/team-members/${memberId}?teamId=${teamId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({}));
      throw new APIError(
        errorData.message || 'Failed to remove team member',
        backendResponse.status
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
    console.error('❌ Failed to remove team member:', error);
    console.error('❌ Error type:', typeof error);
    console.error('❌ Error constructor:', error?.constructor?.name);
    
    if (error instanceof APIError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    // Handle fetch/network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('🌐 Network error - backend might be down');
      return NextResponse.json(
        { error: 'Cannot connect to backend server. Please check if the backend is running.' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
