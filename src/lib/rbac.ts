import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';



// Role-based route access control
export interface UserRole {
  ADMIN: string;
  MENTOR: string;
  EMPLOYEE: string;
  STUDENT: string;
}

export const ROLES: UserRole = {
  ADMIN: 'ADMIN',
  MENTOR: 'MENTOR', 
  EMPLOYEE: 'EMPLOYEE',
  STUDENT: 'STUDENT'
};

// Permission definitions
export interface Permission {
  // User Management
  USER_READ: string;
  USER_CREATE: string;
  USER_UPDATE: string;
  USER_DELETE: string;
  
  // Course Management
  COURSE_READ: string;
  COURSE_CREATE: string;
  COURSE_UPDATE: string;
  COURSE_DELETE: string;
  
  // Enrollment Management
  ENROLLMENT_READ: string;
  ENROLLMENT_UPDATE: string;
  ENROLLMENT_DELETE: string;
  
  // Payment Management
  PAYMENT_READ: string;
  PAYMENT_UPDATE: string;
  PAYMENT_PROCESS: string;
  PAYMENT_REFUND: string;
  
  // Analytics
  ANALYTICS_READ: string;
  ANALYTICS_EXPORT: string;
  
  // Live Classes
  LIVE_CLASS_CREATE: string;
  LIVE_CLASS_MANAGE: string;
  
  // Homework
  HOMEWORK_READ: string;
  HOMEWORK_REVIEW: string;
  HOMEWORK_GRADE: string;
  
  // Attendance
  ATTENDANCE_READ: string;
  ATTENDANCE_MARK: string;
  
  // Notifications
  NOTIFICATION_READ: string;
  NOTIFICATION_SEND: string;
}

export const PERMISSIONS: Permission = {
  // User Management
  USER_READ: 'user:read',
  USER_CREATE: 'user:create',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',
  
  // Course Management
  COURSE_READ: 'course:read',
  COURSE_CREATE: 'course:create',
  COURSE_UPDATE: 'course:update',
  COURSE_DELETE: 'course:delete',
  
  // Enrollment Management
  ENROLLMENT_READ: 'enrollment:read',
  ENROLLMENT_UPDATE: 'enrollment:update',
  ENROLLMENT_DELETE: 'enrollment:delete',
  
  // Payment Management
  PAYMENT_READ: 'payment:read',
  PAYMENT_UPDATE: 'payment:update',
  PAYMENT_PROCESS: 'payment:process',
  PAYMENT_REFUND: 'payment:refund',
  
  // Analytics
  ANALYTICS_READ: 'analytics:read',
  ANALYTICS_EXPORT: 'analytics:export',
  
  // Live Classes
  LIVE_CLASS_CREATE: 'live_class:create',
  LIVE_CLASS_MANAGE: 'live_class:manage',
  
  // Homework
  HOMEWORK_READ: 'homework:read',
  HOMEWORK_REVIEW: 'homework:review',
  HOMEWORK_GRADE: 'homework:grade',
  
  // Attendance
  ATTENDANCE_READ: 'attendance:read',
  ATTENDANCE_MARK: 'attendance:mark',
  
  // Notifications
  NOTIFICATION_READ: 'notification:read',
  NOTIFICATION_SEND: 'notification:send'
};

// Role-based permission mapping
export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [
    // User Management
    PERMISSIONS.USER_READ,
    PERMISSIONS.USER_CREATE,
    PERMISSIONS.USER_UPDATE,
    PERMISSIONS.USER_DELETE,
    
    // Course Management
    PERMISSIONS.COURSE_READ,
    PERMISSIONS.COURSE_CREATE,
    PERMISSIONS.COURSE_UPDATE,
    PERMISSIONS.COURSE_DELETE,
    
    // Enrollment Management
    PERMISSIONS.ENROLLMENT_READ,
    PERMISSIONS.ENROLLMENT_UPDATE,
    PERMISSIONS.ENROLLMENT_DELETE,
    
    // Payment Management
    PERMISSIONS.PAYMENT_READ,
    PERMISSIONS.PAYMENT_UPDATE,
    PERMISSIONS.PAYMENT_PROCESS,
    PERMISSIONS.PAYMENT_REFUND,
    
    // Analytics
    PERMISSIONS.ANALYTICS_READ,
    PERMISSIONS.ANALYTICS_EXPORT,
    
    // Live Classes
    PERMISSIONS.LIVE_CLASS_CREATE,
    PERMISSIONS.LIVE_CLASS_MANAGE,
    
    // Homework
    PERMISSIONS.HOMEWORK_READ,
    PERMISSIONS.HOMEWORK_REVIEW,
    PERMISSIONS.HOMEWORK_GRADE,
    
    // Attendance
    PERMISSIONS.ATTENDANCE_READ,
    PERMISSIONS.ATTENDANCE_MARK,
    
    // Notifications
    PERMISSIONS.NOTIFICATION_READ,
    PERMISSIONS.NOTIFICATION_SEND
  ],
  
  [ROLES.MENTOR]: [
    // Course Management (limited)
    PERMISSIONS.COURSE_READ,
    PERMISSIONS.COURSE_UPDATE,
    
    // Enrollment Management (limited)
    PERMISSIONS.ENROLLMENT_READ,
    PERMISSIONS.ENROLLMENT_UPDATE,
    
    // Live Classes
    PERMISSIONS.LIVE_CLASS_CREATE,
    PERMISSIONS.LIVE_CLASS_MANAGE,
    
    // Homework
    PERMISSIONS.HOMEWORK_READ,
    PERMISSIONS.HOMEWORK_REVIEW,
    PERMISSIONS.HOMEWORK_GRADE,
    
    // Attendance
    PERMISSIONS.ATTENDANCE_READ,
    PERMISSIONS.ATTENDANCE_MARK,
    
    // Notifications
    PERMISSIONS.NOTIFICATION_READ,
    PERMISSIONS.NOTIFICATION_SEND
  ],
  
  [ROLES.EMPLOYEE]: [
    // Enrollment Management
    PERMISSIONS.ENROLLMENT_READ,
    PERMISSIONS.ENROLLMENT_UPDATE,
    
    // Payment Management (limited)
    PERMISSIONS.PAYMENT_READ,
    PERMISSIONS.PAYMENT_UPDATE,
    
    // Analytics (limited)
    PERMISSIONS.ANALYTICS_READ,
    
    // Notifications
    PERMISSIONS.NOTIFICATION_READ,
    PERMISSIONS.NOTIFICATION_SEND
  ],
  
  [ROLES.STUDENT]: [
    // Course access
    PERMISSIONS.COURSE_READ,
    
    // Homework
    PERMISSIONS.HOMEWORK_READ,
    
    // Attendance
    PERMISSIONS.ATTENDANCE_READ,
    
    // Notifications
    PERMISSIONS.NOTIFICATION_READ
  ]
};

// JWT Secret key - must be set in environment variables
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error('FATAL: JWT_SECRET environment variable is not set');
}

// Verify JWT token
export async function verifyToken(token: string) {
  if (!JWT_SECRET) {
    console.error('JWT_SECRET is not configured');
    return null;
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    return payload;
  } catch (error) {
    console.error('JWT verification error:', error);
    return null;
  }
}

// Check if user has permission
export function hasPermission(userRole: string, permission: string): boolean {
  return ROLE_PERMISSIONS[userRole as keyof typeof ROLE_PERMISSIONS]?.includes(permission) || false;
}

// Check if user has any of the specified permissions
export function hasAnyPermission(userRole: string, permissions: string[]): boolean {
  return permissions.some(permission => hasPermission(userRole, permission));
}

// Get user permissions
export function getUserPermissions(userRole: string): string[] {
  return ROLE_PERMISSIONS[userRole as keyof typeof ROLE_PERMISSIONS] || [];
}

// Middleware for route protection
export function withAuth(requiredPermissions?: string[]) {
  return async (request: NextRequest) => {
    try {
      // Get token from Authorization header
      const authHeader = request.headers.get('authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json(
          { error: 'Authorization token required' },
          { status: 401 }
        );
      }

      const token = authHeader.substring(7);
      const payload = await verifyToken(token);

      if (!payload) {
        return NextResponse.json(
          { error: 'Invalid or expired token' },
          { status: 401 }
        );
      }

      // Check if user is active
      const user = await (prisma as any).user.findUnique({
        where: { id: payload.userId },
        select: {
          id: true,
          email: true,
          role: true,
          isActive: true,
          firstName: true,
          lastName: true
        }
      });

      if (!user || !user.isActive) {
        return NextResponse.json(
          { error: 'User not found or inactive' },
          { status: 401 }
        );
      }

      // Check permissions if required
      if (requiredPermissions && requiredPermissions.length > 0) {
        const userPermissions = getUserPermissions(user.role);
        const hasRequiredPermissions = requiredPermissions.every(permission => 
          userPermissions.includes(permission)
        );

        if (!hasRequiredPermissions) {
          return NextResponse.json(
            { 
              error: 'Insufficient permissions',
              required: requiredPermissions,
              userPermissions,
              userRole: user.role
            },
            { status: 403 }
          );
        }
      }

      // Add user info to request headers for downstream use
      const requestHeaders = new Headers();
      requestHeaders.set('x-user-id', user.id);
      requestHeaders.set('x-user-email', user.email);
      requestHeaders.set('x-user-role', user.role);
      requestHeaders.set('x-user-name', `${user.firstName} ${user.lastName}`);

      return {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName
        },
        headers: requestHeaders
      };
    } catch (error) {
      console.error('Auth middleware error:', error);
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 500 }
      );
    }
  };
}

// Role-based route protection middleware
export function withRoleProtection(allowedRoles: string[]) {
  return async (request: NextRequest) => {
    try {
      const authResult = await withAuth()(request);
      
      if (authResult instanceof NextResponse) {
        return authResult; // Error response
      }

      const { user } = authResult;
      
      // Check if user role is allowed
      if (!allowedRoles.includes(user.role)) {
        return NextResponse.json(
          { 
            error: 'Access denied',
            message: `Role ${user.role} is not allowed to access this resource`,
            allowedRoles,
            userRole: user.role
          },
          { status: 403 }
        );
      }

      return authResult;
    } catch (error) {
      console.error('Role protection middleware error:', error);
      return NextResponse.json(
        { error: 'Role verification failed' },
        { status: 500 }
      );
    }
  };
}

// Admin-only middleware
export function withAdminAuth() {
  return withRoleProtection([ROLES.ADMIN]);
}

// Mentor and Admin middleware
export function withMentorAuth() {
  return withRoleProtection([ROLES.ADMIN, ROLES.MENTOR]);
}

// Employee and above middleware
export function withEmployeeAuth() {
  return withRoleProtection([ROLES.ADMIN, ROLES.MENTOR, ROLES.EMPLOYEE]);
}

// Student and above middleware
export function withStudentAuth() {
  return withRoleProtection([ROLES.ADMIN, ROLES.MENTOR, ROLES.EMPLOYEE, ROLES.STUDENT]);
}

// Permission-based middleware
export function withPermission(permission: string) {
  return async (request: NextRequest) => {
    try {
      const authResult = await withAuth()(request);
      
      if (authResult instanceof NextResponse) {
        return authResult; // Error response
      }

      const { user } = authResult;
      
      // Check if user has the required permission
      if (!hasPermission(user.role, permission)) {
        return NextResponse.json(
          { 
            error: 'Insufficient permissions',
            message: `Permission ${permission} is required`,
            requiredPermission: permission,
            userRole: user.role,
            userPermissions: getUserPermissions(user.role)
          },
          { status: 403 }
        );
      }

      return authResult;
    } catch (error) {
      console.error('Permission middleware error:', error);
      return NextResponse.json(
        { error: 'Permission verification failed' },
        { status: 500 }
      );
    }
  };
}

// Multiple permissions middleware
export function withPermissions(permissions: string[]) {
  return async (request: NextRequest) => {
    try {
      const authResult = await withAuth()(request);
      
      if (authResult instanceof NextResponse) {
        return authResult; // Error response
      }

      const { user } = authResult;
      
      // Check if user has all required permissions
      if (!hasAnyPermission(user.role, permissions)) {
        return NextResponse.json(
          { 
            error: 'Insufficient permissions',
            message: 'One or more required permissions are missing',
            requiredPermissions: permissions,
            userRole: user.role,
            userPermissions: getUserPermissions(user.role)
          },
          { status: 403 }
        );
      }

      return authResult;
    } catch (error) {
      console.error('Permissions middleware error:', error);
      return NextResponse.json(
        { error: 'Permission verification failed' },
        { status: 500 }
      );
    }
  };
}

// Helper function to get user from request
export function getUserFromRequest(request: NextRequest) {
  const userId = request.headers.get('x-user-id');
  const userEmail = request.headers.get('x-user-email');
  const userRole = request.headers.get('x-user-role');
  const userName = request.headers.get('x-user-name');

  if (!userId || !userEmail || !userRole) {
    return null;
  }

  return {
    id: userId,
    email: userEmail,
    role: userRole,
    name: userName
  };
}
