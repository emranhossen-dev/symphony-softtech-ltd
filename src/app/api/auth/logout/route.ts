import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken, AuthError } from '@/lib/auth'
import { logActivity, ActivityType, extractRequestInfo } from '@/lib/activity-logger'

export async function POST(request: NextRequest) {
  const requestInfo = extractRequestInfo(request)
  
  try {
    // Get token to identify user for logging
    const token = (await cookies()).get('auth-token')?.value
    let userId = null
    let userEmail = null
    
    if (token) {
      try {
        const payload = verifyToken(token)
        userId = payload.id
        userEmail = payload.email
      } catch (error) {
        // Token is invalid, continue with logout
      }
    }

    // Clear auth cookie
    const cookieStore = await cookies()
    cookieStore.delete('auth-token')

    // Log logout if we have user info
    if (userId) {
      await logActivity({
        userId,
        type: ActivityType.LOGOUT,
        action: `User ${userEmail} logged out`,
        metadata: {
          email: userEmail,
          logoutTime: new Date().toISOString()
        },
        ...requestInfo
      })
    }

    // Clear token cookie
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });

    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    return response

  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to logout' 
      },
      { status: 500 }
    )
  }
}
