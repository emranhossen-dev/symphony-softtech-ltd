import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { 
  requireRole, 
  withRateLimit, 
  withActivityLogging, 
  sanitizeSensitiveData,
  logSecurityEvent 
} from '@/lib/security';

export const POST = withRateLimit(
  requireRole(['MENTOR'])(
    withActivityLogging('ATTENDANCE_MARKED')(
      async (request: NextRequest) => {
        try {
          const user = (request as any).user;
          const body = await request.json();

          // Check if it's a batch payload or single payload
          if (body.records && Array.isArray(body.records)) {
            // Batch process (from Dashboard)
            const { createAttendanceMarkedNotification } = await import('@/lib/notifications');
            const updatedRecords: any[] = [];
            
            // Group records by courseId & date
            const groups: Record<string, { courseId: string; date: string; records: any[] }> = {};
            for (const record of body.records) {
              const key = `${record.courseId}_${record.date}`;
              if (!groups[key]) {
                groups[key] = {
                  courseId: record.courseId,
                  date: record.date,
                  records: []
                };
              }
              groups[key].records.push(record);
            }
            
            for (const key of Object.keys(groups)) {
              const group = groups[key];
              const targetDate = new Date(group.date);
              
              const startOfDay = new Date(targetDate);
              startOfDay.setHours(0, 0, 0, 0);
              
              const endOfDay = new Date(targetDate);
              endOfDay.setHours(23, 59, 59, 999);

              // 1. Find or create the session
              let session = await prisma.attendanceSession.findFirst({
                where: {
                  courseId: group.courseId,
                  sessionDate: {
                    gte: startOfDay,
                    lte: endOfDay
                  }
                }
              });

              if (!session) {
                session = await prisma.attendanceSession.create({
                  data: {
                    courseId: group.courseId,
                    mentorId: user.id,
                    sessionDate: new Date(group.date),
                    title: `Session on ${group.date}`,
                    description: `Attendance taken on ${group.date}`
                  }
                });
              }

              // 2. Validate session belongs to mentor
              if (session.mentorId !== user.id) {
                logSecurityEvent('UNAUTHORIZED_ATTENDANCE_ACCESS', { 
                  sessionId: session.id, 
                  sessionMentorId: session.mentorId, 
                  requestMentorId: user.id 
                }, request);
                return NextResponse.json({ error: 'Access denied. You do not own this session' }, { status: 403 });
              }

              // 3. Upsert
              for (const record of group.records) {
                const dbStatus = record.status === 'LATE' ? 'PRESENT' : record.status;
                if (dbStatus !== 'PRESENT' && dbStatus !== 'ABSENT') {
                  continue;
                }

                const attendance = await prisma.attendance.upsert({
                  where: {
                    sessionId_studentId: {
                      sessionId: session.id,
                      studentId: record.studentId
                    }
                  },
                  update: {
                    status: dbStatus,
                    markedBy: user.id,
                    updatedAt: new Date()
                  },
                  create: {
                    sessionId: session.id,
                    studentId: record.studentId,
                    status: dbStatus,
                    markedBy: user.id
                  }
                });

                try {
                  await createAttendanceMarkedNotification(
                    record.studentId,
                    dbStatus,
                    new Date(group.date).toLocaleDateString(),
                    group.courseId
                  );
                } catch (notiErr) {
                  console.error('Error sending notification:', notiErr);
                }

                updatedRecords.push({
                  id: attendance.id,
                  status: attendance.status,
                  markedAt: attendance.markedAt
                });
              }
            }

            const sanitizedData = sanitizeSensitiveData({
              success: true,
              records: updatedRecords
            });
            return NextResponse.json(sanitizedData);
          } else {
            // Single process
            const { sessionId, studentId, status } = body;
            if (!sessionId || !studentId || !status) {
              return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
            }

            const dbStatus = status === 'LATE' ? 'PRESENT' : status;
            if (dbStatus !== 'PRESENT' && dbStatus !== 'ABSENT') {
              return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
            }

            const session = await prisma.attendanceSession.findUnique({
              where: { id: sessionId },
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

            const attendance = await prisma.attendance.upsert({
              where: {
                sessionId_studentId: {
                  sessionId: sessionId,
                  studentId: studentId
                }
              },
              update: {
                status: dbStatus,
                markedBy: user.id,
                updatedAt: new Date()
              },
              create: {
                sessionId: sessionId,
                studentId: studentId,
                status: dbStatus,
                markedBy: user.id
              }
            });

            try {
              const { createAttendanceMarkedNotification } = await import('@/lib/notifications');
              await createAttendanceMarkedNotification(
                studentId,
                dbStatus,
                session.sessionDate.toLocaleDateString(),
                session.courseId
              );
            } catch (notiErr) {
              console.error('Error sending notification:', notiErr);
            }

            const sanitizedData = sanitizeSensitiveData({
              success: true,
              attendance: {
                id: attendance.id,
                status: attendance.status,
                markedAt: attendance.markedAt
              }
            });
            return NextResponse.json(sanitizedData);
          }
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
);
