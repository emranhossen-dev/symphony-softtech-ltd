import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, hasRole } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!hasRole(payload.role, 'ADMIN')) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Mock user profile data
    const userProfile = {
      id: payload.id,
      name: payload.name || 'Admin User',
      email: payload.email || 'admin@example.com',
      role: payload.role,
      avatar: null,
      phone: null,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      permissions: [
        'manage_users',
        'manage_courses',
        'manage_enrollments',
        'manage_settings',
        'view_analytics'
      ]
    };

    return NextResponse.json({
      success: true,
      user: userProfile
    });

  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    );
  }
}
