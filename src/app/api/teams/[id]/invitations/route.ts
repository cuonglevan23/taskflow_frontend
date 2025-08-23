import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

type RouteParams = {
  params: Promise<{ id: string }>
}

// POST /api/teams/[id]/invitations - Invite member by email
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    
    if (!session?.user?.accessToken) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id: teamId } = await params;
    const body = await request.json();
    
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080';
    const url = `${backendUrl}/api/teams/${teamId}/invitations`;

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
      return NextResponse.json(
        { error: 'Failed to send invitation', details: errorText }, 
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();
    return NextResponse.json(data);
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Internal server error', details: errorMessage }, { status: 500 });
  }
}

// GET /api/teams/[id]/invitations - Get team invitations
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    
    if (!session?.user?.accessToken) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id: teamId } = await params;
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080';
    const url = `${backendUrl}/api/teams/${teamId}/invitations`;

    const backendResponse = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.user.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      return NextResponse.json(
        { error: 'Failed to fetch invitations', details: errorText }, 
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();
    return NextResponse.json(data);
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Internal server error', details: errorMessage }, { status: 500 });
  }
}