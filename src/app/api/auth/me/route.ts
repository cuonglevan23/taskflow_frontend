import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth';

// GET /api/auth/me
export async function GET(request: NextRequest) {
  try {
    // Add more detailed error tracking
    console.log('🔍 Fetching auth session...');
    
    let session;
    try {
      // Use getServerSession instead of auth() for API routes
      session = await getServerSession(authOptions);

      
      if (session) {
        console.log('📋 Session details:', {
          hasUser: !!session.user,
          userEmail: session.user?.email,
          userRole: session.user?.role,
        });
      }
    } catch (authError) {
      console.error('❌ Auth function error:', authError);
      return NextResponse.json(
        { error: 'Authentication system error', details: authError instanceof Error ? authError.message : 'Unknown auth error' },
        { status: 500 }
      );
    }
    
    if (!session || !session.user) {
      console.log('🔐 No session or user found');
      return NextResponse.json(
        { error: 'Not authenticated' },
        { 
          status: 401,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }

    console.log('👤 Building user object from session...');

    // Transform NextAuth user to our format with better error handling
    const user = {
      id: session.user.id || session.user.email || `user_${Date.now()}`,
      name: session.user.name || 'Unknown User',
      email: session.user.email || '',
      avatar: session.user.image || null,
      role: session.user.role || 'MEMBER',
      permissions: session.user.permissions || [],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      // Additional fields for compatibility
      teamIds: [],
      preferences: {
        theme: 'dark',
        language: 'en',
        timezone: 'UTC',
        emailNotifications: true,
        pushNotifications: true,
        defaultView: 'list',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '24h',
      },
    };
    

    
    return NextResponse.json(user, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
  } catch (error) {
    console.error('❌ Unexpected error in /api/auth/me:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack available');
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch current user', 
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  }
}