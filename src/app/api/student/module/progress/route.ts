import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { 
  requireRole, 
  withRateLimit, 
  withActivityLogging,
  sanitizeVideoUrl,
  sanitizeSensitiveData,
  logSecurityEvent 
} from '@/lib/security';

export const GET = withRateLimit(
  requireRole(['STUDENT'])(
    withActivityLogging('MODULE_PROGRESS_ACCESS')(
      async (request: NextRequest) => {
        try {
          const user = (request as any).user;
          const { searchParams } = new URL(request.url);
          const courseId = searchParams.get('courseId');

          if (!courseId) {
            return NextResponse.json({ error: 'Course ID is required' }, { status: 400 });
          }

          // Check if user is enrolled in this course
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
            logSecurityEvent('UNAUTHORIZED_COURSE_ACCESS', { courseId, userId: user.id }, request);
            return NextResponse.json({ error: 'Not enrolled in this course' }, { status: 403 });
          }

          // Get course with modules and progress
          const course = await prisma.course.findUnique({
            where: { id: courseId },
            include: {
              modules: {
                orderBy: { order: 'asc' }
              }
            }
          });

          if (!course) {
            return NextResponse.json({ error: 'Course not found' }, { status: 404 });
          }

          // Get user's progress for all modules in this course
          const moduleProgress = await prisma.moduleProgress.findMany({
            where: {
              userId: user.id,
              courseId: courseId
            }
          });

          // Create a map of moduleId -> progress
          const progressMap = new Map();
          moduleProgress.forEach(progress => {
            progressMap.set(progress.moduleId, progress);
          });

          // Determine which modules are unlocked
          const modulesWithStatus = course.modules.map((module, index) => {
            const progress = progressMap.get(module.id);
            const isCompleted = progress?.completed || false;
            
            // First module is always unlocked
            // A module is unlocked if:
            // 1. It's the first module, OR
            // 2. The previous module is completed
            let isUnlocked = index === 0;
            
            if (index > 0) {
              const previousModule = course.modules[index - 1];
              const previousProgress = progressMap.get(previousModule.id);
              isUnlocked = previousProgress?.completed || false;
            }

            // Sanitize video URL to hide sensitive information
            const sanitizedVideoUrl = module.videoUrl ? sanitizeVideoUrl(module.videoUrl) : null;

            return {
              ...module,
              isCompleted,
              isUnlocked,
              completedAt: progress?.completedAt,
              videoUrl: sanitizedVideoUrl // Use sanitized URL
            };
          });

          // Calculate overall progress
          const totalModules = course.modules.length;
          const completedModules = modulesWithStatus.filter(m => m.isCompleted).length;
          const progressPercentage = Math.round((completedModules / totalModules) * 100);

          const sanitizedData = sanitizeSensitiveData({
            success: true,
            course: {
              ...course,
              modules: modulesWithStatus
            },
            progressPercentage,
            totalModules,
            completedModules
          });

          return NextResponse.json(sanitizedData);

        } catch (error) {
          logSecurityEvent('MODULE_PROGRESS_ERROR', { 
            error: error instanceof Error ? error.message : 'Unknown error',
            userId: (request as any).user?.id 
          }, request);
          
          return NextResponse.json(
            { error: 'Failed to fetch module progress' },
            { status: 500 }
          );
        }
      }
    )
  )
);
