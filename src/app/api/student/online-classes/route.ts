import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, AuthError } from '@/lib/auth';

export const runtime = 'nodejs';

// GET /api/student/online-classes — fetch active and upcoming live classes for student's enrolled courses
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Student access required' }, { status: 403 });
    }

    // 1. Fetch the student's active course enrollments
    const enrollments = await prisma.enrollment.findMany({
      where: {
        userId: user.id,
        enrollmentStatus: 'ADMITTED'
      },
      select: {
        courseId: true
      }
    });

    const courseIds = enrollments
      .map(e => e.courseId)
      .filter((id): id is string => id !== null);

    if (courseIds.length === 0) {
      return NextResponse.json({ success: true, classes: [] });
    }

    // 2. Fetch attendance sessions (live classes) for these courses
    const sessions = await prisma.attendanceSession.findMany({
      where: {
        courseId: {
          in: courseIds
        }
      },
      include: {
        course: {
          select: {
            title: true,
            slug: true
          }
        },
        mentor: {
          select: {
            name: true,
            avatar: true
          }
        },
        attendances: {
          where: {
            studentId: user.id
          },
          select: {
            status: true
          }
        }
      },
      orderBy: {
        sessionDate: 'desc'
      },
      take: 20
    });

    // 3. Format data for the frontend
    const classes = sessions.map(session => {
      const attendance = session.attendances[0];
      const hasJoined = attendance?.status === 'PRESENT';

      return {
        id: session.id,
        title: session.title || `${session.course.title} - Live Session`,
        description: session.description || 'Interactive live session with your mentor.',
        courseName: session.course.title,
        mentorName: session.mentor.name,
        mentorAvatar: session.mentor.avatar || '',
        scheduledAt: session.sessionDate,
        endTime: session.endTime,
        isActive: session.isActive,
        meetingLink: session.meetingLink || '',
        attendanceStatus: attendance?.status || 'NOT_MARKED',
        hasJoined
      };
    });

    return NextResponse.json({
      success: true,
      classes
    });

  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    console.error('Error fetching student online classes:', error);
    return NextResponse.json({ error: 'Failed to fetch online classes' }, { status: 500 });
  }
}

// POST /api/student/online-classes — mark attendance automatically when student clicks join
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Student access required' }, { status: 403 });
    }

    const { sessionId } = await request.json();
    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    // Verify session exists
    const session = await prisma.attendanceSession.findUnique({
      where: { id: sessionId }
    });

    if (!session) {
      return NextResponse.json({ error: 'Live session not found' }, { status: 404 });
    }

    // Auto-mark student attendance as PRESENT
    await prisma.attendance.upsert({
      where: {
        sessionId_studentId: {
          sessionId,
          studentId: user.id
        }
      },
      update: {
        status: 'PRESENT',
        markedAt: new Date(),
        markedBy: 'SYSTEM_AUTOMATIC'
      },
      create: {
        sessionId,
        studentId: user.id,
        status: 'PRESENT',
        markedAt: new Date(),
        markedBy: 'SYSTEM_AUTOMATIC'
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Attendance marked as present'
    });

  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    console.error('Error marking attendance for live class:', error);
    return NextResponse.json({ error: 'Failed to join live session' }, { status: 500 });
  }
}
