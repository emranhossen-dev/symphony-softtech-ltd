import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all permissions
export async function GET(request: NextRequest) {
  try {
    // Try both Authorization header and cookie
    const authHeader = request.headers.get('Authorization')?.replace('Bearer ', '');
    const cookieToken = request.cookies.get('auth-token')?.value;
    const token = authHeader && authHeader !== 'null' && authHeader !== 'undefined' ? authHeader : cookieToken;

    // For now, allow fetching permissions without strict auth check for development
    // In production, you should verify the token here

    // Fetch all permissions grouped by category
    const permissions = await prisma.permission.findMany({
      where: { isActive: true },
      orderBy: [{ category: 'asc' }, { name: 'asc' }]
    });

    // Group by category
    const grouped = permissions.reduce((acc: any, permission) => {
      const category = permission.category || 'Other';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(permission);
      return acc;
    }, {});

    return NextResponse.json({
      success: true,
      data: grouped,
      all: permissions
    });
  } catch (error) {
    console.error('Error fetching permissions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch permissions' },
      { status: 500 }
    );
  }
}
