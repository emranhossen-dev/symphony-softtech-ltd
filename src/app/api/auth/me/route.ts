import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken, AuthError } from '@/lib/auth';

// Force Node.js runtime for JWT
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    // Try to get token from cookie first, then from header
    const cookieToken = request.cookies.get('auth_token')?.value;
    const oldCookieToken = request.cookies.get('auth-token')?.value;
    const headerToken = request.headers.get('Authorization')?.replace('Bearer ', '');
    const token = cookieToken || oldCookieToken || headerToken;

    console.log('🔐 /api/auth/me - Token sources:');
    console.log('  - Cookie (auth_token):', !!cookieToken);
    console.log('  - Cookie (auth-token):', !!oldCookieToken);
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
    console.error('❌ /api/auth/me - Error:', error);
    return NextResponse.json(
      { error: 'Invalid or expired token' },
      { status: 401 }
    );
  }
}
