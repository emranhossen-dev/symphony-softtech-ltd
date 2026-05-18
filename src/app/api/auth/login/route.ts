import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { authenticateUser, AuthError } from '@/lib/auth'
import { logActivity, ActivityType, extractRequestInfo } from '@/lib/activity-logger'

// Force Node.js runtime for JWT
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const requestInfo = extractRequestInfo(request)
  
  try {
    const { email, password } = await request.json()

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Email and password are required' 
        },
        { status: 400 }
      )
    }

    // Authenticate user
    const { user, token } = await authenticateUser(email, password)

    // Log successful login
    await logActivity({
      userId: user.id,
      type: ActivityType.LOGIN,
      action: `User ${user.email} logged in successfully`,
      metadata: {
        email,
        role: user.role,
        loginTime: new Date().toISOString()
      },
      ...requestInfo
    })

    // Determine redirect URL based on role
    let redirectUrl = '/admin/dashboard'
    switch (user.role) {
      case 'ADMIN':
        redirectUrl = '/admin/dashboard'
        break
      case 'STUDENT':
        redirectUrl = '/student/dashboard'
        break
      case 'MENTOR':
        redirectUrl = '/mentor/dashboard'
        break
      case 'EMPLOYEE':
        redirectUrl = '/employee/dashboard'
        break
    }

    // Create response with cookie
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      redirect: redirectUrl
    })

    console.log('🔐 LOGIN - Setting auth token cookie...');
    console.log('🔐 LOGIN - Token length:', token.length);
    console.log('🔐 LOGIN - Token preview:', token.substring(0, 20) + '...');

    // Clear old cookie if exists
    response.cookies.set("auth-token", '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: "lax",
      path: "/",
      maxAge: 0
    })

    // Set new auth-token cookie using NextResponse
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 // 7 days
    })

    console.log('🔐 LOGIN - Cookie set in response');
    console.log('🔐 LOGIN - Response headers being sent:', Object.fromEntries(response.headers.entries()));

    return response

  } catch (error) {
    console.error('Login error:', error)
    
    // Log failed login attempt
    await logActivity({
      type: ActivityType.SECURITY_VIOLATION,
      action: `Failed login attempt for email: ${await request.json().then(data => data.email).catch(() => 'unknown')}`,
      metadata: {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      ...requestInfo
    })
    
    if (error instanceof AuthError) {
      return NextResponse.json(
        { 
          success: false,
          error: error.message 
        },
        { status: error.statusCode }
      )
    }

    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to login' 
      },
      { status: 500 }
    )
  }
}
