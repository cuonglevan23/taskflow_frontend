import { NextRequest, NextResponse } from 'next/server';


// Simple JWT decode function (without verification)
function decodeJWT(token: string) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }
    
    const header = JSON.parse(atob(parts[0]));
    const payload = JSON.parse(atob(parts[1]));
    
    return { header, payload };
  } catch (error) {
    return { error: 'Failed to decode JWT', details: error.message };
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get session from NextAuth
    const session = await auth();
    
    if (!session?.user?.accessToken) {
      return NextResponse.json(
        { error: 'No access token found' }, 
        { status: 401 }
      );
    }

    const decoded = decodeJWT(session.user.accessToken);
    
    const debugInfo = {
      timestamp: new Date().toISOString(),
      tokenInfo: {
        length: session.user.accessToken.length,
        preview: session.user.accessToken.substring(0, 50) + '...',
        decoded: decoded,
      },
      sessionUser: {
        id: session.user.id,
        email: session.user.email,
        role: session.user.role,
        permissions: session.user.permissions,
      }
    };

    console.log('🔍 JWT Debug info:', debugInfo);

    return NextResponse.json(debugInfo);
    
  } catch (error: unknown) {
    console.error('❌ JWT decode error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { 
        error: 'JWT decode failed',
        details: errorMessage,
        timestamp: new Date().toISOString(),
      }, 
      { status: 500 }
    );
  }
}