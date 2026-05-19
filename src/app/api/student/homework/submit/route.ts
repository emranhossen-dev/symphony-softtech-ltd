import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { 
  requireRole, 
  withRateLimit, 
  withActivityLogging, 
  sanitizeSensitiveData,
  logSecurityEvent 
} from '@/lib/security';

// Submit homework for a module
export const POST = withRateLimit(
  requireRole(['STUDENT'])(
    withActivityLogging('STUDENT_HOMEWORK_SUBMIT')(
      async (request: NextRequest) => {
        try {
          const user = (request as any).user;
          const { homeworkId, code, moduleId: directModuleId } = await request.json();

          // Support both homeworkId (from playground) and moduleId (direct submission)
          let moduleId = directModuleId;
          if (homeworkId && !moduleId) {
            moduleId = homeworkId.replace('hw-', '');
          }

          if (!moduleId || !code) {
            return NextResponse.json(
              { error: 'Module ID and code are required' },
              { status: 400 }
            );
          }

          // Get the module to verify course enrollment
          const module = await prisma.module.findUnique({
            where: { id: moduleId },
            include: {
              course: {
                include: {
                  enrollments: {
                    where: {
                      userId: user.id,
                      enrollmentStatus: 'ADMITTED'
                    }
                  }
                }
              }
            }
          });

          if (!module) {
            return NextResponse.json(
              { error: 'Module not found' },
              { status: 404 }
            );
          }

          if (module.course.enrollments.length === 0) {
            return NextResponse.json(
              { error: 'Not enrolled in this course' },
              { status: 403 }
            );
          }

          // Create or update homework submission
          const submission = await prisma.homeworkSubmission.upsert({
            where: {
              userId_moduleId: {
                userId: user.id,
                moduleId: moduleId
              }
            },
            update: {
              code: code,
              status: 'PENDING',
              createdAt: new Date()
            },
            create: {
              userId: user.id,
              moduleId: moduleId,
              courseId: module.courseId,
              code: code,
              status: 'PENDING'
            }
          });

          const sanitizedData = sanitizeSensitiveData({
            success: true,
            submission: {
              id: submission.id,
              moduleId: submission.moduleId,
              status: submission.status,
              submittedAt: submission.createdAt.toISOString()
            }
          });

          return NextResponse.json(sanitizedData);

        } catch (error) {
          logSecurityEvent('STUDENT_HOMEWORK_SUBMIT_ERROR', { 
            error: error instanceof Error ? error.message : 'Unknown error',
            userId: (request as any).user?.id
          }, request);
          
          return NextResponse.json(
            { error: 'Failed to submit homework' },
            { status: 500 }
          );
        }
      }
    )
  )
);
