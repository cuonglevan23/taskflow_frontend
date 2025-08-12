/**
 * Current User API - NextAuth.js integration
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

// GET /api/auth/me
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
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

    // Transform NextAuth user to our format
    const user = {
      id: session.user.id || session.user.email || 'unknown',
      name: session.user.name || 'Unknown User',
      email: session.user.email || '',
      avatar: session.user.image || null,
      role: session.user.role || 'member',
      teamIds: [],
      permissions: session.user.permissions || [
        { resource: 'event', action: 'create', scope: 'own' },
        { resource: 'event', action: 'read', scope: 'own' },
        { resource: 'event', action: 'update', scope: 'own' },
        { resource: 'event', action: 'delete', scope: 'own' },
        { resource: 'calendar', action: 'read', scope: 'own' },
        { resource: 'task', action: 'create', scope: 'own' },
        { resource: 'task', action: 'read', scope: 'own' },
        { resource: 'task', action: 'update', scope: 'own' },
        { resource: 'task', action: 'delete', scope: 'own' },
      ],
    };
    
    return NextResponse.json(user, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
  } catch (error) {
    console.error('Current user API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch current user' },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  }
}