import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandling, UnauthorizedError } from '@/lib/error-handler';
import { logActivity, ActivityType, extractRequestInfo } from '@/lib/activity-logger';
import { verifyToken } from '@/lib/auth';

async function checkCourseAccessHandler(request: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  const requestInfo = extractRequestInfo(request);
  const { id: courseId } = await params;

  try {
    // Get token from cookies
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      throw new UnauthorizedError('Authentication required');
    }

    // Verify token and get user
    const user = verifyToken(token);

    if (user.role !== 'STUDENT') {
      throw new UnauthorizedError('Access denied. Student access required.');
    }

    // Check if user has approved enrollment for this course
    const prisma = await import('@prisma/client').then(m => new m.PrismaClient());
    
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        userId: user.id,
        courseId: courseId,
        enrollmentStatus: 'ADMITTED'
      },
      include: {
        course: {
          select: {
            title: true,
            description: true
          }
        }
      }
    });

    if (!enrollment) {
      // Log unauthorized access attempt
      await logActivity({
        userId: user.id,
        type: ActivityType.UNAUTHORIZED_ACCESS,
        action: `Student ${user.email} attempted to access course ${courseId} without enrollment`,
        metadata: {
          courseId,
          userRole: user.role,
          reason: 'No approved enrollment found',
          timestamp: new Date().toISOString()
        },
        ...requestInfo
      });

      throw new UnauthorizedError('Access denied. You must be enrolled in this course to access it.');
    }

    // Log successful course access
    await logActivity({
      userId: user.id,
      type: ActivityType.API_ACCESS,
      action: `Student ${user.email} accessed course ${courseId}`,
      metadata: {
        courseId,
        enrollmentId: enrollment.id,
        timestamp: new Date().toISOString()
      },
      ...requestInfo
    });

    return NextResponse.json({
      success: true,
      message: 'Course access granted',
      data: {
        course: {
          id: courseId,
          title: enrollment.course?.title || `Course ${courseId}`,
          description: enrollment.course?.description || 'Course description',
          modules: [
            {
              id: 'module-1',
              title: 'Module 1',
              order: 1,
              isLocked: false,
              isCompleted: false
            }
          ]
        },
        enrollment: {
          id: enrollment.id,
          enrollmentStatus: enrollment.enrollmentStatus,
          enrolledAt: enrollment.createdAt.toISOString()
        },
        progress: {
          totalModules: 1,
          completedModules: 0,
          progressPercentage: 0
        }
      }
    });

  } catch (error) {
    console.error('Course access check error:', error);
    throw error;
  }
}

// Export handler with error wrapping
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  return withErrorHandling((req) => checkCourseAccessHandler(req, { params: Promise.resolve(params) }), request);
}
