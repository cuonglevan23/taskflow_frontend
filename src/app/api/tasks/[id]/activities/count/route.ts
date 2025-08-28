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
    
    // Get backend base URL
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080';
    const url = `${backendUrl}/api/tasks/${id}/activities/count`;

    console.log('🔗 Proxying activities count request to backend:', url);

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
    console.error('❌ Error in activities count API route:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}
