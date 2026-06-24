import { prisma } from '@/lib/prisma';



export enum ActivityType {
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  ENROLLMENT_CREATED = 'ENROLLMENT_CREATED',
  ENROLLMENT_APPROVED = 'ENROLLMENT_APPROVED',
  ENROLLMENT_REJECTED = 'ENROLLMENT_REJECTED',
  PAYMENT_VERIFIED = 'PAYMENT_VERIFIED',
  HOMEWORK_SUBMITTED = 'HOMEWORK_SUBMITTED',
  HOMEWORK_REVIEWED = 'HOMEWORK_REVIEWED',
  MODULE_COMPLETED = 'MODULE_COMPLETED',
  COURSE_COMPLETED = 'COURSE_COMPLETED',
  CERTIFICATE_ISSUED = 'CERTIFICATE_ISSUED',
  ATTENDANCE_MARKED = 'ATTENDANCE_MARKED',
  ROLE_CHANGED = 'ROLE_CHANGED',
  PASSWORD_CHANGED = 'PASSWORD_CHANGED',
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  API_ACCESS = 'API_ACCESS',
  SECURITY_VIOLATION = 'SECURITY_VIOLATION'
}

export interface ActivityLogData {
  userId?: string;
  type: ActivityType;
  action: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
}

export async function logActivity(data: ActivityLogData) {
  try {
    await prisma.activityLog.create({
      data: {
        userId: data.userId,
        type: data.type,
        action: data.action,
        metadata: data.metadata || {},
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        sessionId: data.sessionId,
        timestamp: new Date()
      }
    });

    console.log(`Activity logged: ${data.type} - ${data.action}`, {
      userId: data.userId,
      metadata: data.metadata
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
    // Non-critical: don't throw to avoid breaking the main flow,
    // but return null so callers can detect the failure if needed.
    return null;
  }
}

export async function logSecurityEvent(
  type: ActivityType.SECURITY_VIOLATION | ActivityType.UNAUTHORIZED_ACCESS,
  details: string,
  metadata?: Record<string, any>,
  request?: Request
) {
  await logActivity({
    type,
    action: details,
    metadata: {
      ...metadata,
      url: request?.url,
      method: request?.method,
      timestamp: new Date().toISOString()
    },
    ipAddress: request?.headers.get('x-forwarded-for') || request?.headers.get('x-real-ip') || undefined,
    userAgent: request?.headers.get('user-agent') || undefined
  });
}

export async function getUserActivityLogs(
  userId: string,
  limit: number = 50,
  offset: number = 0,
  type?: ActivityType
) {
  try {
    const where: any = { userId };
    if (type) {
      where.type = type;
    }

    return await prisma.activityLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: limit,
      skip: offset,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    });
  } catch (error) {
    console.error('Failed to get user activity logs:', error);
    throw new Error(
      `Failed to retrieve activity logs for user ${userId}: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
}

export async function getSystemActivityLogs(
  limit: number = 100,
  offset: number = 0,
  type?: ActivityType,
  startDate?: Date,
  endDate?: Date
) {
  try {
    const where: any = {};
    if (type) where.type = type;
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = startDate;
      if (endDate) where.timestamp.lte = endDate;
    }

    return await prisma.activityLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: limit,
      skip: offset,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    });
  } catch (error) {
    console.error('Failed to get system activity logs:', error);
    throw new Error(
      `Failed to retrieve system activity logs: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
}

// Helper function to extract request info
export function extractRequestInfo(request: Request) {
  return {
    ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
    userAgent: request.headers.get('user-agent') || undefined,
    url: request.url,
    method: request.method
  };
}
