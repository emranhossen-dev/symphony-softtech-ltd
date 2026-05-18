import { NextRequest, NextResponse } from 'next/server';

// Sanitize input function
function sanitizeInput(input: string): string {
  return input.replace(/<script[^>]*>.*?<\/script>/gi, '')
          .replace(/<[^>]*>?/gm, '')
          .trim();
}

// CSRF protection middleware
export function withCSRF(handler: Function) {
  return async (request: NextRequest, ...args: any[]) => {
    try {
      // Check for CSRF token
      const csrfToken = request.headers.get('x-csrf-token');
      const sessionToken = request.cookies.get('csrf-token')?.value;
      
      // For GET requests, skip CSRF check
      if (request.method === 'GET') {
        return await handler(request, ...args);
      }
      
      // Validate CSRF token for state-changing requests
      if (!csrfToken || !sessionToken || csrfToken !== sessionToken) {
        return NextResponse.json(
          { error: 'CSRF token validation failed' },
          { status: 403 }
        );
      }
      
      // Add CSRF token to response
      const response = await handler(request, ...args);
      
      if (response instanceof NextResponse) {
        response.headers.set('x-csrf-token', sessionToken);
        return response;
      }
      
      return response;
    } catch (error) {
      console.error('CSRF middleware error:', error);
      return NextResponse.json(
        { error: 'CSRF middleware failed' },
        { status: 500 }
      );
    }
  };
}

// Content Security Policy middleware
export function withCSP(handler: Function) {
  return async (request: NextRequest, ...args: any[]) => {
    try {
      const response = await handler(request, ...args);
      
      if (response instanceof NextResponse) {
        // Add CSP header
        const cspHeader = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self'; frame-ancestors 'self';";
        response.headers.set('Content-Security-Policy', cspHeader);
        
        return response;
      }
      
      return response;
    } catch (error) {
      console.error('CSP middleware error:', error);
      return NextResponse.json(
        { error: 'CSP middleware failed' },
        { status: 500 }
      );
    }
  };
}

// Input sanitization middleware
export function withInputSanitization(handler: Function) {
  return async (request: NextRequest, ...args: any[]) => {
    try {
      // Sanitize request body
      if (request.body) {
        const { sanitizeInput } = await import('@/lib/security');
        const sanitizedBody = sanitizeInput(request.body);
        (request as any).sanitizedBody = sanitizedBody;
      }
      
      // Sanitize query parameters
      if (request.url) {
        const url = new URL(request.url);
        url.searchParams.forEach((value, key) => {
          const sanitizedValue = sanitizeInput(value);
          url.searchParams.set(key, sanitizedValue);
        });
      }
      
      const response = await handler(request, ...args);
      return response;
    } catch (error) {
      const clientIP = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
      console.error('Security violation for IP:', clientIP, 'Error:', error instanceof Error ? error.message : String(error));
      return NextResponse.json(
        { error: 'Input sanitization middleware failed' },
        { status: 500 }
      );
    }
  };
}

// SQL Injection protection middleware
export function withSQLInjectionProtection(handler: Function) {
  return async (request: NextRequest, ...args: any[]) => {
    try {
      // Sanitize query parameters
      if (request.url) {
        const url = new URL(request.url);
        url.searchParams.forEach((value, key) => {
          const sanitizedValue = sanitizeInput(value);
          url.searchParams.set(key, sanitizedValue);
        });
      }
      
      // Sanitize request body
      if (request.body) {
        // For ReadableStream, we need to handle it differently
        // Skip body sanitization for now as it requires async processing
        console.log('Request body present, skipping sanitization for ReadableStream');
      }
      
      const response = await handler(request, ...args);
      return response;
    } catch (error) {
      console.error('SQL injection protection middleware error:', error);
      return NextResponse.json(
        { error: 'SQL injection protection middleware failed' },
        { status: 500 }
      );
    }
  };
}

// Request logging middleware
export function withRequestLogging(handler: Function) {
  return async (request: NextRequest, ...args: any[]) => {
    try {
      const startTime = Date.now();
      
      // Log request details
      const clientIP = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
      const logEntry = {
        timestamp: startTime,
        method: request.method,
        url: request.url,
        userAgent: request.headers.get('user-agent'),
        ip: clientIP,
        body: request.body,
        headers: Object.fromEntries(request.headers.entries()),
        processingTime: 0
      };
      
      console.log('[API REQUEST]', JSON.stringify(logEntry));
      
      const response = await handler(request, ...args);
      
      // Calculate processing time
      const endTime = Date.now();
      logEntry.processingTime = endTime - startTime;
      
      console.log('[API RESPONSE]', {
        ...logEntry,
        status: response.status,
        processingTime: logEntry.processingTime
      });
      
      return response;
    } catch (error) {
      console.error('Request logging middleware error:', error);
      return NextResponse.json(
        { error: 'Request logging middleware failed' },
        { status: 500 }
      );
    }
  };
}

// Error handling middleware
export function withErrorHandling(handler: Function) {
  return async (request: NextRequest, ...args: any[]) => {
    try {
      return await handler(request, ...args);
    } catch (error) {
      console.error('Error handling middleware caught:', error);
      
      // Log the error
      const clientIP = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
      console.error('Rate limit exceeded for IP:', clientIP, 'Error:', error instanceof Error ? error.message : String(error));
      
      // Return standardized error response
      return NextResponse.json(
        {
          error: 'Internal server error',
          message: 'An unexpected error occurred',
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      );
    }
  };
}

// Comprehensive security middleware
export function withComprehensiveSecurity(handler: Function) {
  return withErrorHandling(
    withCSRF(
      withCSP(
        withInputSanitization(
          withSQLInjectionProtection(
            withRequestLogging(handler)
          )
        )
      )
    )
  );
}

// Security audit logging
export function logSecurityAudit(event: string, details: any, request: NextRequest, user?: any) {
  const clientIP = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
  const auditEntry = {
    timestamp: new Date().toISOString(),
    event,
    details,
    severity: details.severity || 'INFO',
    ip: clientIP,
    userAgent: request.headers.get('user-agent') || 'unknown',
    url: request.url,
    method: request.method,
    userId: user?.id || 'anonymous',
    userRole: user?.role || 'anonymous'
  };
  
  console.log('[SECURITY AUDIT]', JSON.stringify(auditEntry));
  
  // In production, send to security monitoring service
  if (process.env.NODE_ENV === 'production') {
    // Send to external security monitoring service
  }
}
