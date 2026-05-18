import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { 
  requireRole, 
  withRateLimit, 
  withActivityLogging, 
  withValidation,
  apiSchemas,
  sanitizeSensitiveData,
  logSecurityEvent 
} from '@/lib/security';
import { createAttendanceMarkedNotification } from '@/lib/notifications';

export const POST = withRateLimit(
  requireRole(['MENTOR'])(
    withValidation(apiSchemas.attendanceMarking)(
      withActivityLogging('ATTENDANCE_MARKED')(
        async (request: NextRequest) => {
          try {
            const user = (request as any).user;
            const validatedData = (request as any).validatedData;
            const { sessionId, studentId, status } = validatedData;

            // Verify the mentor owns this session
            const session = await prisma.attendanceSession.findUnique({
              where: { id: sessionId },
              include: {
                course: {
                  include: {
                    enrollments: {
                      include: {
                        user: {
                          select: {
                            id: true,
                            name: true,
                            email: true
                          }
                        }
                      }
                    }
                  }
                }
              }
            });

            if (!session) {
              logSecurityEvent('ATTENDANCE_SESSION_NOT_FOUND', { sessionId, mentorId: user.id }, request);
              return NextResponse.json({ error: 'Attendance session not found' }, { status: 404 });
            }

            if (session.mentorId !== user.id) {
              logSecurityEvent('UNAUTHORIZED_ATTENDANCE_ACCESS', { 
                sessionId, 
                sessionMentorId: session.mentorId, 
                requestMentorId: user.id 
              }, request);
              return NextResponse.json({ error: 'Access denied. You do not own this session' }, { status: 403 });
            }

            // Verify the student is enrolled in the course
            const enrollment = session.course.enrollments.find(e => e.user?.id === studentId);
            if (!enrollment) {
              logSecurityEvent('STUDENT_NOT_ENROLLED', { 
                sessionId, 
                studentId, 
                courseId: session.courseId,
                mentorId: user.id 
              }, request);
              return NextResponse.json({ error: 'Student not enrolled in this course' }, { status: 403 });
            }

            // Create or update attendance record
            const attendance = await prisma.attendance.upsert({
              where: {
                sessionId_studentId: {
                  sessionId: sessionId,
                  studentId: studentId
                }
              },
              update: {
                status: status,
                markedBy: user.id,
                updatedAt: new Date()
              },
              create: {
                sessionId: sessionId,
                studentId: studentId,
                status: status,
                markedBy: user.id
              }
            });

            // Send notification to student
            await createAttendanceMarkedNotification(
              studentId,
              status,
              session.sessionDate.toLocaleDateString(),
              session.courseId
            );

            const sanitizedData = sanitizeSensitiveData({
              success: true,
              attendance: {
                id: attendance.id,
                status: attendance.status,
                markedAt: attendance.markedAt
              }
            });

            return NextResponse.json(sanitizedData);

          } catch (error) {
            logSecurityEvent('ATTENDANCE_MARKING_ERROR', { 
              error: error instanceof Error ? error.message : 'Unknown error',
              mentorId: (request as any).user?.id 
            }, request);
            
            return NextResponse.json(
              { error: 'Failed to mark attendance' },
              { status: 500 }
            );
          }
        }
      )
    )
  )
);
