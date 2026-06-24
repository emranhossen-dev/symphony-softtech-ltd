import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequestLight, handleApiError, successResponse } from '@/lib/api-utils';

export async function POST(request: NextRequest) {
  try {
    const auth = authenticateRequestLight(request, ['ADMIN']);
    if (!auth.success) return auth.response;

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Current password and new password are required' },
        { status: 400 }
      );
    }

    // TODO: verify current password and update in production
    return successResponse({ message: 'Password changed successfully' });
  } catch (error) {
    return handleApiError(error, 'change password');
  }
}
