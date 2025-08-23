import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

type RouteParams = {
  params: Promise<{ id: string; memberId: string }>
}

// DELETE /api/teams/[id]/members/[memberId] - Remove member from team
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    
    if (!session?.user?.accessToken) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id: teamId, memberId } = await params;
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080';
    const url = `${backendUrl}/api/team-members/${memberId}`;

    const backendResponse = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${session.user.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      return NextResponse.json(
        { error: 'Failed to remove team member', details: errorText }, 
        { status: backendResponse.status }
      );
    }

    const result = await backendResponse.text();
    return NextResponse.json({ message: result || 'Member removed successfully' });
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Internal server error', details: errorMessage }, { status: 500 });
  }
}

// PUT /api/teams/[id]/members/[memberId] - Update member role/info
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    
    if (!session?.user?.accessToken) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id: teamId, memberId } = await params;
    const body = await request.json();
    
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080';
    const url = `${backendUrl}/api/team-members/${memberId}`;

    const backendResponse = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${session.user.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      return NextResponse.json(
        { error: 'Failed to update team member', details: errorText }, 
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