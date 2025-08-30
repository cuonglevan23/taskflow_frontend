import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileKey: string[] }> }
) {
  try {
    // Await params before accessing its properties (Next.js 15+ requirement)
    const resolvedParams = await params;
    const fileKey = resolvedParams.fileKey.join('/');

    console.log('🔗 Proxying file download for:', fileKey);
    console.log('📡 Request URL:', request.url);
    console.log('🎯 Resolved file key segments:', resolvedParams.fileKey);

    // Get the backend API URL
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

    // Don't double-encode if already encoded
    const backendRequestUrl = `${backendUrl}/api/files/download/${fileKey}`;

    console.log('🌐 Backend request URL:', backendRequestUrl);

    // Get all cookies from the request
    const cookies = request.headers.get('cookie') || '';
    console.log('🍪 Forwarding cookies:', cookies ? 'Present' : 'None');

    // Make request to backend with credentials
    const response = await fetch(backendRequestUrl, {
      method: 'GET',
      headers: {
        'Cookie': cookies,
        'User-Agent': request.headers.get('user-agent') || 'NextJS-Proxy',
        'Accept': '*/*',
        'Cache-Control': 'no-cache',
      },
    });

    console.log('📡 Backend response status:', response.status);
    console.log('📡 Backend response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorBody = await response.text().catch(() => 'No response body');
      console.error('❌ Backend file request failed:', {
        status: response.status,
        statusText: response.statusText,
        body: errorBody.substring(0, 500),
        url: backendRequestUrl
      });

      return NextResponse.json(
        {
          error: 'Failed to fetch file from backend',
          details: {
            status: response.status,
            statusText: response.statusText,
            url: backendRequestUrl,
            body: errorBody.substring(0, 200)
          }
        },
        { status: response.status }
      );
    }

    // Get the response body as a stream
    const fileStream = response.body;

    if (!fileStream) {
      console.error('❌ No file content received from backend');
      return NextResponse.json(
        { error: 'No file content received' },
        { status: 404 }
      );
    }

    // Forward the response headers
    const headers = new Headers();

    // Copy relevant headers from backend response
    const contentType = response.headers.get('content-type');
    const contentLength = response.headers.get('content-length');
    const contentDisposition = response.headers.get('content-disposition');
    const cacheControl = response.headers.get('cache-control');

    if (contentType) headers.set('content-type', contentType);
    if (contentLength) headers.set('content-length', contentLength);
    if (contentDisposition) headers.set('content-disposition', contentDisposition);
    if (cacheControl) headers.set('cache-control', cacheControl);

    // Add CORS headers
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET');
    headers.set('Access-Control-Allow-Headers', 'Content-Type');

    console.log('✅ File proxied successfully');
    console.log('📋 Response headers:', Object.fromEntries(headers.entries()));

    // Return the file stream
    return new NextResponse(fileStream, {
      status: 200,
      headers,
    });

  } catch (error) {
    console.error('💥 File proxy error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
