import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { 
  requireRole, 
  withRateLimit, 
  withActivityLogging, 
  withValidation,
  apiSchemas,
  sanitizeSensitiveData,
  logSecurityEvent,
  logActivity
} from '@/lib/security';
import { logActivity as logActivityFromLogger, ActivityType } from '@/lib/activity-logger';
import { createModuleUnlockedNotification } from '@/lib/notifications';

export const POST = withRateLimit(
  requireRole(['STUDENT'])(
    withValidation(apiSchemas.moduleProgress)(
      withActivityLogging('MODULE_COMPLETE')(
        async (request: NextRequest) => {
          try {
            const user = (request as any).user;
            const validatedData = (request as any).validatedData;
            const { moduleId, courseId } = validatedData;

            // Get the module to check its order
            const module = await prisma.module.findUnique({
              where: { id: moduleId },
              include: {
                course: {
                  include: {
                    modules: {
                      orderBy: { order: 'asc' }
                    }
                  }
                }
              }
            });

            if (!module) {
              logSecurityEvent('MODULE_NOT_FOUND', { moduleId, userId: user.id }, request);
              return NextResponse.json({ error: 'Module not found' }, { status: 404 });
            }

            // Verify user is enrolled in this course
            const enrollment = await prisma.enrollment.findFirst({
              where: {
                user: {
                  id: user.id
                },
                courseId: courseId,
                enrollmentStatus: 'APPROVED'
              }
            });

            if (!enrollment) {
              logSecurityEvent('UNAUTHORIZED_MODULE_ACCESS', { moduleId, courseId, userId: user.id }, request);
              return NextResponse.json({ error: 'Not enrolled in this course' }, { status: 403 });
            }

            // Mark module as complete
            const moduleProgress = await prisma.moduleProgress.upsert({
              where: {
                userId_moduleId: {
                  userId: user.id,
                  moduleId: moduleId
                }
              },
              update: {
                completed: true,
                completedAt: new Date()
              },
              create: {
                userId: user.id,
                moduleId: moduleId,
                courseId: courseId,
                completed: true,
                completedAt: new Date()
              }
            });

            // Find and unlock the next module
            const currentModuleIndex = module.course.modules.findIndex(m => m.id === moduleId);
            const nextModule = module.course.modules[currentModuleIndex + 1];

            let unlockedModuleId = null;
            if (nextModule) {
              // Unlock the next module
              await prisma.moduleProgress.upsert({
                where: {
                  userId_moduleId: {
                    userId: user.id,
                    moduleId: nextModule.id
                  }
                },
                update: {
                  // Keep existing completion status but ensure the record exists
                },
                create: {
                  userId: user.id,
                  moduleId: nextModule.id,
                  courseId: courseId,
                  completed: false
                }
              });
              unlockedModuleId = nextModule.id;

              // Send notification for unlocked module
              await createModuleUnlockedNotification(
                user.id,
                nextModule.title,
                nextModule.id,
                courseId
              );
            }

            // Calculate overall progress
            const totalModules = module.course.modules.length;
            const completedModules = await prisma.moduleProgress.count({
              where: {
                userId: user.id,
                courseId: courseId,
                completed: true
              }
            });
            const progressPercentage = Math.round((completedModules / totalModules) * 100);

            // Check if course is completed
            const isCourseCompleted = completedModules === totalModules;
            if (isCourseCompleted) {
              // Could trigger course completion notification here
              await logActivityFromLogger({
                userId: user.id,
                type: ActivityType.COURSE_COMPLETED,
                action: `Course ${courseId} completed by ${user.email}`,
                metadata: { courseId, totalModules }
              });
            }

            const sanitizedData = sanitizeSensitiveData({
              success: true,
              moduleProgress: {
                id: moduleProgress.id,
                completed: moduleProgress.completed,
                completedAt: moduleProgress.completedAt
              },
              unlockedModuleId,
              progressPercentage,
              totalModules,
              completedModules
            });

            return NextResponse.json(sanitizedData);

          } catch (error) {
            logSecurityEvent('MODULE_COMPLETE_ERROR', { 
              error: error instanceof Error ? error.message : 'Unknown error',
              userId: (request as any).user?.id 
            }, request);
            
            return NextResponse.json(
              { error: 'Failed to mark module complete' },
              { status: 500 }
            );
          }
        }
      )
    )
  )
);
