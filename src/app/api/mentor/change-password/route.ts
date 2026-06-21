import { NextRequest, NextResponse } from 'next/server';
import { comparePassword, hashPassword, AuthError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { authenticateRequest, handleApiError, successResponse } from '@/lib/api-utils';

export const runtime = 'nodejs';

// POST /api/mentor/change-password
export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request, ['MENTOR']);
    if (!auth.success) return auth.response;

    const body = await request.json();
    const { currentPassword, newPassword, confirmPassword } = body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json({ error: 'New passwords do not match' }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'New password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    if (newPassword === currentPassword) {
      return NextResponse.json(
        { error: 'New password must be different from the current password' },
        { status: 400 }
      );
    }

    // Fetch full user record with password
    const fullUser = await prisma.user.findUnique({
      where: { id: auth.user.id },
      select: { id: true, password: true },
    });

    if (!fullUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify current password
    const isValid = await comparePassword(currentPassword, fullUser.password);
    if (!isValid) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
    }

    // Hash new password and update
    const hashedPassword = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: fullUser.id },
      data: { password: hashedPassword },
    });

    return successResponse({ message: 'Password changed successfully' });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    return handleApiError(error, 'change password');
  }
}
