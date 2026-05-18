import { NextRequest, NextResponse } from 'next/server';
import { withSecurity } from '@/lib/security';

// Protected route example with security middleware
export async function GET(request: NextRequest) {
  try {
    // This would typically fetch from database
    const securityMetrics = {
      totalRequests: 1250,
      blockedRequests: 45,
      suspiciousActivity: 12,
      failedLogins: 8,
      unusualPatterns: 3,
      lastSecurityUpdate: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      metrics: securityMetrics,
      message: 'Security metrics retrieved successfully'
    });
  } catch (error) {
    console.error('Security metrics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch security metrics' },
      { status: 500 }
    );
  }
}

// Security event logging
export async function POST(request: NextRequest) {
  try {
    const { event, details } = await request.json();
    
    // Log security event (in real app, save to security log)
    const { logSecurityEvent } = await import('@/lib/security');
    await logSecurityEvent(event, details, request);

    return NextResponse.json({
      success: true,
      message: 'Security event logged successfully'
    });
  } catch (error) {
    console.error('Security logging error:', error);
    return NextResponse.json(
      { error: 'Failed to log security event' },
      { status: 500 }
    );
  }
}

// Rate limiting status
export async function GET_RATE_LIMIT(request: NextRequest) {
  try {
    const user = (request as any).user;
    
    // This would typically fetch rate limit status from database
    const rateLimitStatus = {
      currentLimit: 100,
      windowMs: 15 * 60 * 1000,
      remainingRequests: 87,
      resetTime: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      ip: request.headers.get('x-forwarded-for') || 'unknown'
    };

    return NextResponse.json({
      success: true,
      status: rateLimitStatus
    });
  } catch (error) {
    console.error('Rate limit status error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rate limit status' },
      { status: 500 }
    );
  }
}

// Block/unblock IP addresses
export async function POST_IP_BLOCK(request: NextRequest) {
  try {
    const { ip, action, reason } = await request.json();
    
    // Validate input
    if (!ip || !action) {
      return NextResponse.json(
        { error: 'IP address and action are required' },
        { status: 400 }
      );
    }

    if (!['block', 'unblock'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

    // Update blocked IPs (in real app, save to database)
    const blockedIP = {
      ip,
      action,
      reason: reason || 'Manual block',
      createdAt: new Date().toISOString(),
      createdBy: (request as any).user?.id || 'system'
    };

    return NextResponse.json({
      success: true,
      blockedIP,
      message: `IP ${action}ed successfully`
    });
  } catch (error) {
    console.error('IP blocking error:', error);
    return NextResponse.json(
      { error: 'Failed to block IP' },
      { status: 500 }
    );
  }
}

// Security configuration
export async function GET_config(request: NextRequest) {
  try {
    const user = (request as any).user;
    
    // This would typically fetch security config from database
    const securityConfig = {
      rateLimitEnabled: true,
      rateLimitPerMinute: 100,
      rateLimitWindow: 15,
      maxFileSize: 10 * 1024 * 1024, // 10MB
      allowedFileTypes: ['image/jpeg', 'image/png', 'application/pdf'],
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true
      },
      sessionTimeout: 30 * 60, // 30 minutes
      maxLoginAttempts: 5,
      lockoutDuration: 15 * 60, // 15 minutes
      twoFactorAuthEnabled: true,
      corsEnabled: true,
      securityHeadersEnabled: true,
      monitoringEnabled: true
    };

    return NextResponse.json({
      success: true,
      config: securityConfig
    });
  } catch (error) {
    console.error('Security config error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch security config' },
      { status: 500 }
    );
  }
}

// Update security configuration
export async function PUT_config(request: NextRequest) {
  try {
    const user = (request as any).user;
    const { config } = await request.json();
    
    // Validate admin access
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Update security config (in real app, save to database)
    const updatedConfig = {
      ...config,
      updatedAt: new Date().toISOString(),
      updatedBy: user.id
    };

    return NextResponse.json({
      success: true,
      config: updatedConfig,
      message: 'Security configuration updated successfully'
    });
  } catch (error) {
    console.error('Security config update error:', error);
    return NextResponse.json(
      { error: 'Failed to update security config' },
      { status: 500 }
    );
  }
}
