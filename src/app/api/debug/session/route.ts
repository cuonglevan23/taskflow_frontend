import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { CookieAuth } from '@/utils/cookieAuth';

export async function GET(request: NextRequest) {
  try {
    // Get session from NextAuth
    const session = await auth();
    
    // Get token from cookies
    const cookieToken = CookieAuth.getAccessToken();
    
    const debugInfo = {
      timestamp: new Date().toISOString(),
      session: {
        exists: !!session,
        user: session?.user ? {
          id: session.user.id,
          email: session.user.email,
          name: session.user.name,
          role: session.user.role,
          hasAccessToken: !!session.user.accessToken,
          accessTokenLength: session.user.accessToken?.length || 0,
          accessTokenPreview: session.user.accessToken ? 
            session.user.accessToken.substring(0, 20) + '...' : null,
        } : null,
      },
      cookies: {
        hasAccessToken: !!cookieToken,
        accessTokenLength: cookieToken?.length || 0,
        accessTokenPreview: cookieToken ? 
          cookieToken.substring(0, 20) + '...' : null,
      },
      headers: {
        authorization: request.headers.get('authorization'),
        userAgent: request.headers.get('user-agent'),
        origin: request.headers.get('origin'),
      },
      environment: {
        backendUrl: process.env.BACKEND_URL || 'http://localhost:8080',
        nodeEnv: process.env.NODE_ENV,
      }
    };

    console.log('🔍 Debug session info:', debugInfo);

    return NextResponse.json(debugInfo);
    
  } catch (error: unknown) {
    console.error('❌ Debug session error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { 
        error: 'Debug session failed',
        details: errorMessage,
        timestamp: new Date().toISOString(),
      }, 
      { status: 500 }
    );
  }
}