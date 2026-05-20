import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET user permissions
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    // Try both Authorization header and cookie
    const authHeader = request.headers.get('Authorization')?.replace('Bearer ', '');
    const cookieToken = request.cookies.get('auth-token')?.value;
    const token = authHeader && authHeader !== 'null' && authHeader !== 'undefined' ? authHeader : cookieToken;

    // Fetch user permissions
    const userPermissions = await prisma.userPermission.findMany({
      where: { userId },
      include: {
        permission: true
      }
    });

    const permissionKeys = userPermissions.map(up => up.permission.key);

    return NextResponse.json({
      success: true,
      data: {
        permissionKeys,
        permissions: userPermissions.map(up => up.permission)
      }
    });
  } catch (error) {
    console.error('Error fetching user permissions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user permissions' },
      { status: 500 }
    );
  }
}

// POST/UPDATE user permissions
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const body = await request.json();
    const { permissionKeys } = body;

    // Try both Authorization header and cookie
    const authHeader = request.headers.get('Authorization')?.replace('Bearer ', '');
    const cookieToken = request.cookies.get('auth-token')?.value;
    const token = authHeader && authHeader !== 'null' && authHeader !== 'undefined' ? authHeader : cookieToken;

    // Delete existing permissions
    await prisma.userPermission.deleteMany({
      where: { userId }
    });

    // Create new permissions
    if (permissionKeys && permissionKeys.length > 0) {
      const permissions = await prisma.permission.findMany({
        where: {
          key: { in: permissionKeys }
        }
      });

      for (const permission of permissions) {
        await prisma.userPermission.create({
          data: {
            userId,
            permissionId: permission.id
          }
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Permissions updated successfully'
    });
  } catch (error) {
    console.error('Error updating user permissions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update user permissions' },
      { status: 500 }
    );
  }
}
