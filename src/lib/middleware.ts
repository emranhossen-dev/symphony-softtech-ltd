import { NextRequest, NextResponse } from 'next/server';
import { withAuth, withAdminAuth, withMentorAuth, withEmployeeAuth, withStudentAuth, withPermission, withPermissions } from '@/lib/rbac';

// Middleware wrapper for API routes
export function withMiddleware(middleware: Function) {
  return async (request: NextRequest, ...args: any[]) => {
    try {
      // Apply the middleware
      const result = await middleware(request, ...args);
      
      // If middleware returns a NextResponse, return it (error case)
      if (result instanceof NextResponse) {
        return result;
      }
      
      // If middleware returns user data, add it to request headers
      if (result.user) {
        const requestHeaders = new Headers();
        requestHeaders.set('x-user-id', result.user.id);
        requestHeaders.set('x-user-email', result.user.email);
        requestHeaders.set('x-user-role', result.user.role);
        requestHeaders.set('x-user-name', `${result.user.firstName} ${result.user.lastName}`);
        
        return {
          user: result.user,
          headers: requestHeaders
        };
      }
      
      return result;
    } catch (error) {
      console.error('Middleware error:', error);
      return NextResponse.json(
        { error: 'Middleware execution failed' },
        { status: 500 }
      );
    }
  };
}

// Higher-order function for API route handlers
export function withRouteHandler(handler: Function, middleware?: Function) {
  return async (request: NextRequest, ...args: any[]) => {
    try {
      // Apply middleware if provided
      if (middleware) {
        const middlewareResult = await middleware(request, ...args);
        
        // If middleware returns a NextResponse, return it (error case)
        if (middlewareResult instanceof NextResponse) {
          return middlewareResult;
        }
        
        // If middleware returns user data, proceed with handler
        if (middlewareResult.user) {
          // Add user context to request
          (request as any).user = middlewareResult.user;
        }
      }
      
      // Call the original handler
      return await handler(request, ...args);
    } catch (error) {
      console.error('Route handler error:', error);
      return NextResponse.json(
        { error: 'Route handler execution failed' },
        { status: 500 }
      );
    }
  };
}

// Admin route protection
export const withAdminRoute = withRouteHandler(withAdminAuth());

// Mentor route protection
export const withMentorRoute = withRouteHandler(withMentorAuth());

// Employee route protection
export const withEmployeeRoute = withRouteHandler(withEmployeeAuth());

// Student route protection
export const withStudentRoute = withRouteHandler(withStudentAuth());

// Permission-based route protection
export function withPermissionRoute(permission: string) {
  return withRouteHandler(withPermission(permission));
}

// Multiple permissions route protection
export function withPermissionsRoute(permissions: string[]) {
  return withRouteHandler(withPermissions(permissions));
}

// Custom middleware for specific requirements
export function withCustomMiddleware(middlewareFunction: Function) {
  return withRouteHandler(middlewareFunction);
}

// Helper to extract user from request
export function extractUserFromRequest(request: NextRequest) {
  return (request as any).user || null;
}
