import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken, AuthError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Force Node.js runtime for JWT
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    // Try to get token from cookie first, then from header
    const cookieToken = request.cookies.get('auth-token')?.value;
    const headerToken = request.headers.get('Authorization')?.replace('Bearer ', '');
    const token = cookieToken || headerToken;

    console.log('🔐 /api/auth/me - Token sources:');
    console.log('  - Cookie (auth-token):', !!cookieToken);
    console.log('  - Header:', !!headerToken);

    if (!token) {
      console.log('❌ No token found');
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    console.log('✅ Token found, verifying...');
    const user = await getUserFromToken(token);

    // Fetch user permissions if not admin
    let permissions: string[] = [];
    if (user.role !== 'ADMIN') {
      const userPermissions = await (prisma as any).userPermission.findMany({
        where: { userId: user.id },
        include: {
          permission: true
        }
      });
      permissions = userPermissions.map((up: any) => up.permission.key);
    } else {
      // Admins get all permissions
      const allPermissions = await (prisma as any).permission.findMany({
        where: { isActive: true }
      });
      permissions = allPermissions.map((p: any) => p.key);
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
        isActive: user.isActive,
        permissions
      }
    });

  } catch (error) {
    console.error('❌ /api/auth/me - Error:', error);
    return NextResponse.json(
      { error: 'Invalid or expired token' },
      { status: 401 }
    );
  }
}
