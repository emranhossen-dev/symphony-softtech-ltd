import { NextRequest } from 'next/server';
import { authenticateRequestLight, handleApiError, successResponse } from '@/lib/api-utils';

export async function GET(request: NextRequest) {
  try {
    const auth = authenticateRequestLight(request, ['ADMIN', 'EMPLOYEE']);
    if (!auth.success) return auth.response;

    const userProfile = {
      id: auth.payload.id,
      name: auth.payload.name || 'Admin User',
      email: auth.payload.email || 'admin@example.com',
      role: auth.payload.role,
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

    return successResponse({ user: userProfile });
  } catch (error) {
    return handleApiError(error, 'fetch user profile');
  }
}
