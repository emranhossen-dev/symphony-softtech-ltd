import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { 
  requireRole, 
  withRateLimit, 
  withActivityLogging, 
  sanitizeSensitiveData,
  logSecurityEvent 
} from '@/lib/security';

// Get student dashboard data
export const GET = withRateLimit(
  requireRole(['STUDENT'])(
    withActivityLogging('STUDENT_DASHBOARD_ACCESS')(
      async (request: NextRequest) => {
        try {
          const user = (request as any).user;
          
          // Get student's enrollments with course data
          console.log('Fetching enrollments for userId:', user.id);
          
          const enrollments = await prisma.enrollment.findMany({
            where: {
              userId: user.id
            },
            include: {
              course: {
                include: {
                  modules: {
                    orderBy: { order: 'asc' }
                }
              }
            },
              user: {
                select: {
                  name: true,
                  email: true
                }
              }
            },
            orderBy: {
              createdAt: 'desc'
            }
          });

          // Calculate stats and progress for each course
          const courses = await Promise.all(
            enrollments.map(async (enrollment) => {
              const totalModules = enrollment.course?.modules?.length || 0;
              let progress = 0;
              let completedModules = 0;
              let attendancePercentage = 0;
              let canReceiveCertificate = true;
              let certificateEligible = false;
              let certificate = null;
              
              if ((enrollment.enrollmentStatus === 'ADMITTED' || enrollment.enrollmentStatus === 'APPROVED') && enrollment.courseId) {
                // Get actual progress from ModuleProgress
                try {
                  const moduleProgress = await prisma.moduleProgress.findMany({
                    where: {
                      userId: user.id,
                      courseId: enrollment.courseId,
                      completed: true
                    }
                  });
                  
                  completedModules = moduleProgress.length;
                  progress = Math.round((completedModules / totalModules) * 100);

                  // Get attendance statistics
                  const totalSessions = await prisma.attendanceSession.count({
                    where: {
                      courseId: enrollment.courseId,
                      isActive: true
                    }
                  });

                  if (totalSessions > 0) {
                    const attendanceRecords = await prisma.attendance.findMany({
                      where: {
                        studentId: user.id,
                        session: {
                          courseId: enrollment.courseId,
                          isActive: true
                        }
                      }
                    });

                    const presentCount = attendanceRecords.filter(record => record.status === 'PRESENT').length;
                    attendancePercentage = Math.round((presentCount / totalSessions) * 100);
                    
                    // Check if attendance meets threshold (70%)
                    const attendanceThreshold = 70;
                    canReceiveCertificate = attendancePercentage >= attendanceThreshold;
                  }

                  // Check homework approval
                  const approvedHomework = await prisma.homeworkSubmission.count({
                    where: {
                      userId: user.id,
                      courseId: enrollment.courseId,
                      status: 'APPROVED'
                    }
                  });

                  const allModulesCompleted = completedModules === totalModules;
                  const homeworkApproved = approvedHomework > 0;
                  const attendanceSufficient = attendancePercentage >= 70;

                  // Check certificate eligibility
                  certificateEligible = allModulesCompleted && homeworkApproved && attendanceSufficient;

                  // Check if certificate already exists
                  if (certificateEligible) {
                    const existingCertificate = await prisma.certificate.findUnique({
                      where: {
                        userId_courseId: {
                          userId: user.id,
                          courseId: enrollment.courseId
                        }
                      }
                    });

                    if (existingCertificate) {
                      certificate = {
                        id: existingCertificate.id,
                        certificateUrl: existingCertificate.certificateUrl,
                        verificationId: existingCertificate.verificationId,
                        issuedAt: existingCertificate.issuedAt
                      };
                    }
                  }
                } catch (error) {
                  console.error('Error fetching course progress:', error);
                }
              }

              return {
                id: enrollment.course?.id || enrollment.id,
                title: enrollment.course?.title || enrollment.courseName,
                slug: enrollment.course?.slug || `course-${enrollment.id}`,
                description: enrollment.course?.description || '',
                thumbnail: enrollment.course?.thumbnail || undefined,
                category: enrollment.course?.category || enrollment.categoryId || 'UNKNOWN',
                duration: enrollment.course?.duration || 'Not specified',
                progress,
                completedModules,
                totalModules,
                attendancePercentage,
                canReceiveCertificate,
                certificateEligible,
                certificate,
                enrolledAt: enrollment.createdAt.toISOString(),
                lastAccessed: enrollment.updatedAt.toISOString(),
                enrollmentStatus: enrollment.enrollmentStatus
              };
            })
          );

          console.log(`Found ${enrollments.length} enrollments for user ${user.id}, returning ${courses.length} courses`);

          // Calculate overall stats with real data
          const totalCourses = courses.length;
          const completedCourses = courses.filter(c => c.progress === 100).length;
          const averageProgress = totalCourses > 0 
            ? Math.round(courses.reduce((sum, course) => sum + course.progress, 0) / totalCourses)
            : 0;

          // Calculate additional stats
          const totalModulesCount = courses.reduce((sum, course) => sum + (course.totalModules || 0), 0);
          const completedModulesCount = courses.reduce((sum, course) => sum + (course.completedModules || 0), 0);
          const totalHours = Math.round(totalModulesCount * 0.5); // Assuming 30 min per module
          const upcomingClasses = 0; // Would be calculated from attendance sessions

          const stats = {
            totalCourses,
            completedCourses,
            averageProgress,
            totalHours,
            completedModules: completedModulesCount,
            totalModules: totalModulesCount,
            upcomingClasses,
            unreadNotifications: 0
          };

          // Get user information
          const userInfo = {
            name: user.name,
            email: user.email,
            role: user.role
          };

          // Sanitize sensitive data before returning
          const sanitizedData = sanitizeSensitiveData({
            success: true,
            user: userInfo,
            courses,
            stats
          });

          return NextResponse.json(sanitizedData);

        } catch (error) {
          logSecurityEvent('STUDENT_DASHBOARD_ERROR', { 
            error: error instanceof Error ? error.message : 'Unknown error',
            userId: (request as any).user?.id 
          }, request);
          
          return NextResponse.json(
            { error: 'Failed to fetch dashboard data' },
            { status: 500 }
          );
        }
      }
    )
  )
);
