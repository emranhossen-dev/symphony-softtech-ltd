import { NextResponse, NextRequest } from 'next/server';
import { logActivity, ActivityType, extractRequestInfo } from './activity-logger';

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string,
    public isOperational: boolean = true
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, field?: string) {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized access') {
    super(message, 401, 'UNAUTHORIZED');
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Access forbidden') {
    super(message, 403, 'FORBIDDEN');
    this.name = 'ForbiddenError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT');
    this.name = 'ConflictError';
  }
}

export function handleApiError(error: unknown, request?: Request): NextResponse {
  console.error('API Error:', error);

  // Log the error
  if (request) {
    logActivity({
      type: ActivityType.SECURITY_VIOLATION,
      action: `API Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      metadata: {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        url: request.url,
        method: request.method,
        timestamp: new Date().toISOString()
      },
      ...extractRequestInfo(request)
    }).catch(logError => {
      console.error('Failed to log error:', logError);
    });
  }

  // Handle known error types
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        code: error.code,
        statusCode: error.statusCode
      },
      { status: error.statusCode }
    );
  }

  // Handle Prisma errors
  if (error && typeof error === 'object' && 'code' in error) {
    const prismaError = error as any;
    
    switch (prismaError.code) {
      case 'P2002':
        return NextResponse.json(
          {
            success: false,
            error: 'Resource already exists',
            code: 'DUPLICATE_RESOURCE',
            statusCode: 409
          },
          { status: 409 }
        );
      
      case 'P2025':
        return NextResponse.json(
          {
            success: false,
            error: 'Resource not found',
            code: 'NOT_FOUND',
            statusCode: 404
          },
          { status: 404 }
        );
      
      case 'P2003':
        return NextResponse.json(
          {
            success: false,
            error: 'Foreign key constraint violation',
            code: 'FOREIGN_KEY_VIOLATION',
            statusCode: 400
          },
          { status: 400 }
        );
      
      default:
        return NextResponse.json(
          {
            success: false,
            error: 'Database operation failed',
            code: 'DATABASE_ERROR',
            statusCode: 500
          },
          { status: 500 }
        );
    }
  }

  // Handle unknown errors
  return NextResponse.json(
    {
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
      statusCode: 500
    },
    { status: 500 }
  );
}

export async function withErrorHandling(
  handler: (request: NextRequest, ...args: any[]) => Promise<NextResponse>,
  request: NextRequest,
  ...args: any[]
): Promise<NextResponse> {
  try {
    return await handler(request, ...args);
  } catch (error) {
    return handleApiError(error, request);
  }
}

// Validation helper
export function validateRequired(data: Record<string, any>, requiredFields: string[]): void {
  const missing = requiredFields.filter(field => !data[field]);
  if (missing.length > 0) {
    throw new ValidationError(`Missing required fields: ${missing.join(', ')}`);
  }
}

// Email validation
export function validateEmail(email: string): void {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ValidationError('Invalid email format');
  }
}

// Password validation
export function validatePassword(password: string): void {
  if (password.length < 6) {
    throw new ValidationError('Password must be at least 6 characters long');
  }
  
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    throw new ValidationError('Password must contain at least one uppercase letter, one lowercase letter, and one number');
  }
}

// Phone validation
export function validatePhone(phone: string): void {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  if (!phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))) {
    throw new ValidationError('Invalid phone number format');
  }
}

// Role validation
export function validateRole(role: string, allowedRoles: string[]): void {
  if (!allowedRoles.includes(role)) {
    throw new ValidationError(`Invalid role. Allowed roles: ${allowedRoles.join(', ')}`);
  }
}
