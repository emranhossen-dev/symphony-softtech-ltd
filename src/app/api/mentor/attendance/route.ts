import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Get mentor ID from auth token
    const token = request.headers.get('Authorization')?.replace('Bearer ', '') ||
                  request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user from token
    const { getUserFromToken } = await import('@/lib/auth');
    const user = await getUserFromToken(token);

    if (!user || user.role !== 'MENTOR') {
      return NextResponse.json(
        { error: 'Mentor access required' },
        { status: 403 }
      );
    }

    const courseId = request.nextUrl.searchParams.get('courseId');
    const date = request.nextUrl.searchParams.get('date');

    const whereClause: any = {
      session: {
        course: {
          mentorId: user.id
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

    // Fetch attendance records from database for mentor's courses
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

    // Transform data to match expected format
    const formattedRecords = attendances.map((att: any) => ({
      id: att.id,
      studentId: att.studentId,
      studentName: att.student.name || 'Student',
      courseId: att.session.courseId,
      courseName: att.session.course.title,
      date: att.session.sessionDate.toISOString().split('T')[0],
      status: att.status, // 'PRESENT' or 'ABSENT'
      checkInTime: att.markedAt ? new Date(att.markedAt).toTimeString().slice(0, 5) : undefined,
      notes: att.status === 'PRESENT' && new Date(att.markedAt).getTime() > new Date(att.session.sessionDate).getTime() + 15 * 60 * 1000 
        ? 'Late arrival' 
        : undefined
    }));

    return NextResponse.json({
      success: true,
      records: formattedRecords
    });
  } catch (error) {
    console.error('Error fetching attendance records:', error);
    return NextResponse.json(
      { error: 'Failed to fetch attendance records' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
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

    // Get mentor ID from auth token
    const token = request.headers.get('Authorization')?.replace('Bearer ', '') ||
                  request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user from token
    const { getUserFromToken } = await import('@/lib/auth');
    const user = await getUserFromToken(token);

    if (!user || user.role !== 'MENTOR') {
      return NextResponse.json(
        { error: 'Mentor access required' },
        { status: 403 }
      );
    }

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

      // 1. Find or create the attendance session for this date & course
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

      // 2. Upsert attendance record for each student in the group
      for (const record of group.records) {
        // Map LATE to PRESENT to respect the Prisma Enum limits
        const dbStatus = record.status === 'LATE' ? 'PRESENT' : record.status;
        if (dbStatus !== 'PRESENT' && dbStatus !== 'ABSENT') {
          continue; // Ignore invalid status values
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

        // 3. Send notification to student in background
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

    return NextResponse.json({
      success: true,
      records: updatedRecords
    });
  } catch (error) {
    console.error('Error marking attendance:', error);
    return NextResponse.json(
      { error: 'Failed to mark attendance' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
