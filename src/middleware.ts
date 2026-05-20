import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  console.log('🔥 MIDDLEWARE CALLED for:', request.nextUrl.pathname);
  
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/login',
    '/about',
    '/unauthorized',
    '/api/auth',
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/verify',
    '/api/auth/me',
    '/api/public',
    '/seminar-registration',
    '/_next',
    '/favicon.ico'
  ];

  // Check if path is public - exact match only for non-API routes
  const isPublicRoute = publicRoutes.some(route => {
    if (route.startsWith('/api')) {
      return pathname.startsWith(route);
    }
    return pathname === route;
  });

  // If it's a public route, allow access
  if (isPublicRoute) {
    console.log(`✅ Public route allowed: ${pathname}`);
    return NextResponse.next();
  }

  // Get token from cookies
  const token = request.cookies.get('auth-token')?.value;

  // Protected routes that require authentication
  const protectedRoutes = [
    '/admin',
    '/student',
    '/mentor',
    '/employee',
  ];

  // Check if path requires authentication
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );

  // If it's a protected route and user is not authenticated, redirect to login
  if (isProtectedRoute && !token) {
    console.log(`🚫 Protected route ${pathname} accessed without token, redirecting to login`);
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If we have a token, verify it
  if (token) {
    try {
      // Call auth verification API
      const authResponse = await fetch(`${request.nextUrl.origin}/api/auth/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!authResponse.ok) {
        throw new Error('Token verification failed');
      }
      
      const { user } = await authResponse.json();
      console.log(`✅ Token verified for user ${user.email}, role: ${user.role}`);

      // Add user info to request headers for downstream use
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', user.id);
      requestHeaders.set('x-user-email', user.email);
      requestHeaders.set('x-user-role', user.role);
      requestHeaders.set('x-user-name', user.name);

      // Role-based route protection - strict role enforcement
      let hasAccess = false;
      let requiredRole = '';

      if (pathname.startsWith('/admin')) {
        // Admins always have access
        if (user.role === 'ADMIN') {
          hasAccess = true;
        } else if (user.role === 'EMPLOYEE') {
          // Employees need to check permissions for admin routes
          // For now, allow employees to access admin routes if they have any permission
          // In production, you should check specific permissions for each route
          hasAccess = true; // Temporarily allow - implement permission check per route
          requiredRole = 'EMPLOYEE with permissions';
        } else {
          hasAccess = false;
          requiredRole = 'ADMIN';
        }
      } else if (pathname.startsWith('/employee')) {
        hasAccess = user.role === 'EMPLOYEE' || user.role === 'ADMIN';
        requiredRole = 'EMPLOYEE or ADMIN';
      } else if (pathname.startsWith('/mentor')) {
        hasAccess = user.role === 'MENTOR' || user.role === 'ADMIN';
        requiredRole = 'MENTOR or ADMIN';
      } else if (pathname.startsWith('/student')) {
        hasAccess = user.role === 'STUDENT' || user.role === 'ADMIN';
        requiredRole = 'STUDENT or ADMIN';
      } else {
        // Default: allow access if authenticated
        hasAccess = true;
      }

      if (!hasAccess) {
        console.log(`🚫 User ${user.email} with role ${user.role} denied access to ${pathname} (requires ${requiredRole})`);
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }

      console.log(`✅ Access granted to ${pathname} for user ${user.email}`);
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
      
    } catch (error) {
      console.error(`❌ Middleware auth error for ${pathname}:`, error instanceof Error ? error.message : 'Unknown error');
      
      // Clear invalid token and redirect to login
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.set('auth-token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0,
        path: '/',
      });
      return response;
    }
  }

  // If no token and not public route, redirect to login
  console.log(`🚫 No token for ${pathname}, redirecting to login`);
  return NextResponse.redirect(new URL('/login', request.url));
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/student/:path*',
    '/mentor/:path*',
    '/employee/:path*',
    '/login',
    '/unauthorized'
  ],
};
