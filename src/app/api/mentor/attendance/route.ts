import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest, handleApiError, successResponse } from '@/lib/api-utils';

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request, ['MENTOR']);
    if (!auth.success) return auth.response;

    const courseId = request.nextUrl.searchParams.get('courseId');
    const date = request.nextUrl.searchParams.get('date');

    const whereClause: any = {
      session: {
        course: {
          mentorId: auth.user.id
        }
      }
    };

    if (courseId) {
      whereClause.session.courseId = courseId;
    }

    if (date) {
      const targetDate = new Date(date);
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);

      whereClause.session.sessionDate = {
        gte: startOfDay,
        lte: endOfDay
      };
    }

    const attendances = await prisma.attendance.findMany({
      where: whereClause,
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        session: {
          include: {
            course: {
              select: {
                id: true,
                title: true
              }
            }
          }
        }
      },
      orderBy: {
        markedAt: 'desc'
      }
    });

    const formattedRecords = attendances.map((att: any) => ({
      id: att.id,
      studentId: att.studentId,
      studentName: att.student.name || 'Student',
      courseId: att.session.courseId,
      courseName: att.session.course.title,
      date: att.session.sessionDate.toISOString().split('T')[0],
      status: att.status,
      checkInTime: att.markedAt ? new Date(att.markedAt).toTimeString().slice(0, 5) : undefined,
      notes: att.status === 'PRESENT' && new Date(att.markedAt).getTime() > new Date(att.session.sessionDate).getTime() + 15 * 60 * 1000
        ? 'Late arrival'
        : undefined
    }));

    return successResponse({ records: formattedRecords });
  } catch (error) {
    return handleApiError(error, 'fetch attendance records');
  }
}

export async function POST(request: NextRequest) {
  try {
    const { records } = await request.json();

    if (!records || !Array.isArray(records)) {
      return NextResponse.json(
        { error: 'Attendance records are required' },
        { status: 400 }
      );
    }

    const auth = await authenticateRequest(request, ['MENTOR']);
    if (!auth.success) return auth.response;

    const { createAttendanceMarkedNotification } = await import('@/lib/notifications');
    const updatedRecords: any[] = [];

    // Group records by courseId & date to find/create relevant AttendanceSession
    const groups: Record<string, { courseId: string; date: string; records: any[] }> = {};
    for (const record of records) {
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

    // Process each group
    for (const key of Object.keys(groups)) {
      const group = groups[key];
      const targetDate = new Date(group.date);

      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);

      // Find or create the attendance session for this date & course
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
            mentorId: auth.user.id,
            sessionDate: new Date(group.date),
            title: `Session on ${group.date}`,
            description: `Attendance taken on ${group.date}`
          }
        });
      }

      // Upsert attendance record for each student in the group
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
            markedBy: auth.user.id,
            updatedAt: new Date()
          },
          create: {
            sessionId: session.id,
            studentId: record.studentId,
            status: dbStatus,
            markedBy: auth.user.id
          }
        });

        // Send notification to student in background
        try {
          await createAttendanceMarkedNotification(
            record.studentId,
            dbStatus,
            new Date(group.date).toLocaleDateString(),
            group.courseId
          );
        } catch (notiErr) {
          console.error('Error sending attendance notification:', notiErr);
        }

        updatedRecords.push(attendance);
      }
    }

    return successResponse({ records: updatedRecords });
  } catch (error) {
    return handleApiError(error, 'mark attendance');
  }
}
