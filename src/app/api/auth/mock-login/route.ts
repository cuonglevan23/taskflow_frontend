import { NextRequest, NextResponse } from 'next/server';

// Mock login endpoint để tạo JWT token tạm thời
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, provider } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Tạo một JWT token giả để test
    // Trong thực tế, đây sẽ là nơi bạn tạo JWT token thật
    const mockJwtToken = Buffer.from(JSON.stringify({
      sub: email,
      email: email,
      name: name || email,
      role: 'MEMBER',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
    })).toString('base64');

    const response = {
      accessToken: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${mockJwtToken}.mock_signature`,
      token: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${mockJwtToken}.mock_signature`,
      user: {
        id: email,
        email: email,
        name: name || email,
        role: 'MEMBER',
        provider: provider || 'google'
      }
    };

    console.log('🔧 Mock login response generated for:', email);
    return NextResponse.json(response);

  } catch (error) {
    console.error('Mock login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
