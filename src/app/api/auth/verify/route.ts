import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/auth';

// Force Node.js runtime for JWT
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    // Verify token and get user
    const user = await getUserFromToken(token);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
        isActive: user.isActive
      }
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid or expired token' },
      { status: 401 }
    );
  }
}
