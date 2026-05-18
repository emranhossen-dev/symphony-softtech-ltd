import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getUserFromToken } from '@/lib/auth';

// Force Node.js runtime for JWT
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  console.log('🔐 /api/auth/verify - Endpoint called');
  
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    
    console.log('🔐 /api/auth/verify - Token received:', !!token);
    console.log('🔐 /api/auth/verify - Token preview:', token?.substring(0, 20) + '...');

    if (!token) {
      console.log('❌ /api/auth/verify - No token provided');
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    // Verify token and get user
    console.log('🔐 /api/auth/verify - Calling getUserFromToken...');
    const user = await getUserFromToken(token);
    console.log('✅ /api/auth/verify - User verified:', user.email);

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
    console.error('❌ /api/auth/verify - Token verification failed:', error);
    return NextResponse.json(
      { error: 'Invalid or expired token' },
      { status: 401 }
    );
  }
}
