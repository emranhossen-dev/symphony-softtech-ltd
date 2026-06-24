import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Rate limiting configuration (simplified for Next.js)
const rateLimitStore = new Map();

// Simple rate limiting function
function checkRateLimit(ip: string, limit: number = 100, windowMs: number = 15 * 60 * 1000): boolean {
  const now = Date.now();
  const windowStart = now - windowMs;
  
  if (!rateLimitStore.has(ip)) {
    rateLimitStore.set(ip, []);
  }
  
  const requests = rateLimitStore.get(ip).filter((timestamp: number) => timestamp > windowStart);
  
  if (requests.length >= limit) {
    return false;
  }
  
  requests.push(now);
  rateLimitStore.set(ip, requests);
  return true;
}

// Security headers configuration
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self'; frame-ancestors 'self';",
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

// Input validation schemas
export const userSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  role: z.enum(['ADMIN', 'MENTOR', 'EMPLOYEE', 'STUDENT']),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
});

export const courseSchema = z.object({
  name: z.string().min(3, 'Course name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.string(),
  price: z.number().positive('Price must be a positive number'),
  duration: z.number().positive('Duration must be a positive number'),
});

export const enrollmentSchema = z.object({
  courseId: z.string().uuid('Invalid course ID'),
  studentId: z.string().uuid('Invalid student ID'),
  enrollmentStatus: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED']),
});

export const paymentSchema = z.object({
  amount: z.number().positive('Amount must be a positive number'),
  paymentMethod: z.string().min(1, 'Payment method is required'),
  transactionId: z.string().optional(),
  enrollmentId: z.string().uuid('Invalid enrollment ID'),
  status: z.enum(['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED']),
});

export const homeworkSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  courseId: z.string().uuid('Invalid course ID'),
  dueDate: z.string().datetime('Invalid due date'),
  maxScore: z.number().min(0).max(100, 'Max score must be between 0 and 100'),
});

export const liveClassSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  courseId: z.string().uuid('Invalid course ID'),
  scheduledAt: z.string().datetime('Invalid scheduled date'),
  duration: z.number().positive('Duration must be a positive number'),
  maxParticipants: z.number().positive('Max participants must be a positive number'),
});

// Password hashing
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 512, 'sha256');
  return hash.toString('hex');
}

// Verify password
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  const salt = hashedPassword.slice(0, 32); // Extract salt from stored hash
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 512, 'sha256');
  return hash.toString('hex') === hashedPassword.slice(32);
}

// Sanitize input to prevent XSS
export function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    return input
      .replace(/<\/?script[^>]*>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  }
  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {};
    for (const key in input) {
      if (input.hasOwnProperty(key)) {
        sanitized[key] = sanitizeInput(input[key]);
      }
    }
    return sanitized;
  }
  return input;
}

// Validate and sanitize request body
export function validateRequestBody<T>(schema: z.ZodSchema, data: unknown): { success: boolean; data?: T; errors?: any } {
  try {
    const validatedData = schema.parse(data) as T;
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        errors: error.issues
      };
    }
    return { 
      success: false, 
      errors: error
    };
  }
}

// Apply security headers to response
export function applySecurityHeaders(response: NextResponse): NextResponse {
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

// Rate limiting middleware
export function withRateLimit(handler: (request: NextRequest) => Promise<NextResponse>) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests, please try again later.' },
        { status: 429 }
      );
    }
    
    return handler(request);
  };
}

// Input validation middleware
export function withValidation<T>(schema: z.ZodSchema) {
  return (handler: (request: NextRequest) => Promise<NextResponse>) => {
    return async (request: NextRequest): Promise<NextResponse> => {
      try {
        const body = await request.json();
        const validation = validateRequestBody<T>(schema, body);
        
        if (!validation.success) {
          return NextResponse.json(
            { 
              error: 'Validation failed',
              errors: validation.errors
            },
            { status: 400 }
          );
        }
        
        // Add validated data to request
        (request as any).validatedData = validation.data;
        
        return handler(request);
      } catch (error) {
        return NextResponse.json(
          { error: 'Invalid request body' },
          { status: 400 }
        );
      }
    };
  };
}

// Security middleware for all routes
export function withSecurity(handler: Function) {
  return async (request: NextRequest, ...args: any[]) => {
    try {
      // Apply security headers
      const response = await handler(request, ...args);
      
      if (response instanceof NextResponse) {
        return applySecurityHeaders(response);
      }
      
      return response;
    } catch (error) {
      console.error('Security middleware error:', error);
      return NextResponse.json(
        { error: 'Security middleware failed' },
        { status: 500 }
      );
    }
  };
}

// Prevent video URL leaks
export function sanitizeVideoUrl(url: string): string {
  // Remove dangerous protocols
  const sanitizedUrl = url.replace(/javascript:/gi, '');
  
  // Only allow specific video platforms
  const allowedDomains = [
    'youtube.com',
    'vimeo.com',
    'wistia.com',
    'cloudflarestream.com'
  ];
  
  try {
    const urlObj = new URL(sanitizedUrl);
    if (allowedDomains.includes(urlObj.hostname)) {
      return sanitizedUrl;
    }
  } catch (error) {
    console.error('Invalid URL provided to sanitizeVideoUrl:', error instanceof Error ? error.message : error);
  }
  
  // URL is either unparseable or not from an allowed domain
  return '';
}

// Generate secure tokens
export function generateSecureToken(payload: any): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
  const payload64 = Buffer.from(JSON.stringify(payload)).toString('base64');
  const signature = crypto.createHmac('sha256', process.env.JWT_SECRET || 'fallback-secret')
    .update(`${header}.${payload64}`)
    .digest('base64');
  
  return `${header}.${signature}`;
}

// Verify secure token
export function verifySecureToken(token: string): any {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const header = Buffer.from(parts[0], 'base64').toString();
    const payload = Buffer.from(parts[1], 'base64').toString();
    const signature = parts[2];
    
    const expectedSignature = crypto.createHmac('sha256', process.env.JWT_SECRET || 'fallback-secret')
      .update(`${header}.${payload}`)
      .digest('base64');
    
    if (signature !== expectedSignature) return null;
    
    return JSON.parse(payload);
  } catch (error) {
    console.error('Secure token verification failed:', error instanceof Error ? error.message : error);
    return null;
  }
}

// CORS configuration
export const corsConfig = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

// SQL Injection prevention
export function sanitizeSqlQuery(query: string): string {
  // Remove dangerous SQL patterns
  const dangerousPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
    /(--|;|\/\*|\/\*|--)/gi,
    /(\b(OR|AND|NOT|IN|LIKE|ILIKE|REGEXP|RLIKE)\b)/gi
  ];
  
  let sanitizedQuery = query;
  dangerousPatterns.forEach(pattern => {
    sanitizedQuery = sanitizedQuery.replace(pattern, '');
  });
  
  return sanitizedQuery.trim();
}

// File upload security
export function validateFileUpload(file: File): { valid: boolean; error?: string } {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'text/plain',
    'application/json'
  ];
  
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  if (!allowedMimeTypes.includes(file.type)) {
    return { valid: false, error: 'Invalid file type' };
  }
  
  if (file.size > maxSize) {
    return { valid: false, error: 'File too large' };
  }
  
  // Check for malicious file names
  const maliciousPatterns = [
    /\.exe$/i,
    /\.bat$/i,
    /\.cmd$/i,
    /\.scr$/i,
    /\.pif$/i,
    /\.com$/i
  ];
  
  const isMalicious = maliciousPatterns.some(pattern => pattern.test(file.name));
  if (isMalicious) {
    return { valid: false, error: 'Suspicious file name' };
  }
  
  return { valid: true };
}

// Request logging for security monitoring
export function logSecurityEvent(event: string, details: any, request: NextRequest) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    details,
    ip: request.headers.get('x-forwarded-for') || 'unknown',
    userAgent: request.headers.get('user-agent') || 'unknown',
    url: request.url,
    method: request.method
  };
  
  console.log('[SECURITY]', JSON.stringify(logEntry));
  
  // In production, you'd send this to a security monitoring service
  if (process.env.NODE_ENV === 'production') {
    // Send to security monitoring service
  }
}

// Role-based access control
export function requireRole(allowedRoles: string[]) {
  return (handler: (request: NextRequest, ...args: any[]) => Promise<NextResponse>) => {
    return async (request: NextRequest, ...args: any[]) => {
      try {
        // Get token from cookie
        const token = request.cookies.get('auth-token')?.value;
        
        if (!token) {
          logSecurityEvent('UNAUTHORIZED_ACCESS', { reason: 'No token provided' }, request);
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify token and get user
        const { verifyToken } = await import('@/lib/auth');
        const user = verifyToken(token);
        
        if (!user || !allowedRoles.includes(user.role)) {
          logSecurityEvent('FORBIDDEN_ACCESS', { 
            userRole: user?.role, 
            requiredRoles: allowedRoles,
            userId: user?.id 
          }, request);
          return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        // Add user to request for use in handler
        (request as any).user = user;
        
        return handler(request, ...args);
      } catch (error) {
        logSecurityEvent('AUTH_ERROR', { error: error instanceof Error ? error.message : 'Unknown error' }, request);
        return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
      }
    };
  };
}

// Activity logging
export function logActivity(action: string, details: any, userId: string, request: NextRequest) {
  const activityLog = {
    timestamp: new Date().toISOString(),
    userId,
    action,
    details,
    ip: request.headers.get('x-forwarded-for') || 'unknown',
    userAgent: request.headers.get('user-agent') || 'unknown',
    url: request.url,
    method: request.method
  };
  
  console.log('[ACTIVITY]', JSON.stringify(activityLog));
  
  // In production, store in database or send to monitoring service
  if (process.env.NODE_ENV === 'production') {
    // Store activity log in database
  }
}

// Enhanced security middleware with activity logging
export function withActivityLogging(action: string) {
  return (handler: (request: NextRequest, ...args: any[]) => Promise<NextResponse>) => {
    return async (request: NextRequest, ...args: any[]) => {
      const startTime = Date.now();
      const user = (request as any).user;
      
      try {
        const response = await handler(request, ...args);
        
        // Log successful activity
        if (user) {
          logActivity(action, {
            success: true,
            duration: Date.now() - startTime,
            status: response.status
          }, user.id, request);
        }
        
        return response;
      } catch (error) {
        // Log failed activity
        if (user) {
          logActivity(action, {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            duration: Date.now() - startTime
          }, user.id, request);
        }
        
        throw error;
      }
    };
  };
}

// Data sanitization for sensitive information
export function sanitizeSensitiveData(data: any, excludeFields: string[] = []) {
  if (!data || typeof data !== 'object') return data;
  
  const sensitiveFields = [
    'password', 'token', 'secret', 'key', 'auth',
    'creditCard', 'ssn', 'socialSecurityNumber',
    'bankAccount', 'routingNumber', ...excludeFields
  ];
  
  const sanitized = { ...data };
  
  sensitiveFields.forEach(field => {
    if (field in sanitized) {
      sanitized[field] = '[REDACTED]';
    }
  });
  
  return sanitized;
}

// Enhanced input validation schemas for API endpoints
export const apiSchemas = {
  // Student APIs
  moduleProgress: z.object({
    moduleId: z.string().uuid('Invalid module ID'),
    courseId: z.string().uuid('Invalid course ID'),
    completed: z.boolean().optional()
  }),
  
  homeworkSubmission: z.object({
    moduleId: z.string().uuid('Invalid module ID'),
    courseId: z.string().uuid('Invalid course ID'),
    code: z.string().max(50000, 'Code too long').optional(),
    file: z.any().optional()
  }),
  
  // Mentor APIs
  attendanceMarking: z.object({
    sessionId: z.string().uuid('Invalid session ID'),
    studentId: z.string().uuid('Invalid student ID'),
    status: z.enum(['PRESENT', 'ABSENT'])
  }),
  
  homeworkReview: z.object({
    submissionId: z.string().uuid('Invalid submission ID'),
    status: z.enum(['APPROVED', 'REJECTED']),
    feedback: z.string().max(1000, 'Feedback too long').optional()
  }),
  
  // Admin APIs
  courseManagement: z.object({
    title: z.string().min(3).max(100),
    description: z.string().min(10).max(5000),
    category: z.string(),
    price: z.number().min(0),
    duration: z.string()
  }),
  
  userManagement: z.object({
    email: z.string().email(),
    name: z.string().min(2).max(100),
    role: z.enum(['ADMIN', 'MENTOR', 'EMPLOYEE', 'STUDENT']),
    isActive: z.boolean().optional()
  })
};
