import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequestLight, handleApiError, successResponse } from '@/lib/api-utils';

export const runtime = 'nodejs';

// GET /api/mentor/live-classes — fetch all live sessions for mentor's courses
export async function GET(request: NextRequest) {
  try {
    const auth = authenticateRequestLight(request, ['MENTOR']);
    if (!auth.success) return auth.response;

    const sessions = await prisma.attendanceSession.findMany({
      where: {
        mentorId: auth.payload.id
      },
      include: {
        course: {
          select: {
            title: true,
            slug: true
          }
        }
      },
      orderBy: {
        sessionDate: 'desc'
      }
    });

    const classes = sessions.map(session => ({
      id: session.id,
      title: session.title || `${session.course.title} - Live Session`,
      description: session.description || '',
      courseId: session.courseId,
      courseName: session.course.title,
      scheduledAt: session.sessionDate,
      endTime: session.endTime,
      isActive: session.isActive,
      meetingLink: session.meetingLink || ''
    }));

    return successResponse({ classes });
  } catch (error) {
    return handleApiError(error, 'fetch live classes');
  }
}

// POST /api/mentor/live-classes — create/schedule a live class
export async function POST(request: NextRequest) {
  try {
    const auth = authenticateRequestLight(request, ['MENTOR']);
    if (!auth.success) return auth.response;

    const body = await request.json();
    const { courseId, title, description, sessionDate, duration, meetingLink } = body;

    if (!courseId || !title || !sessionDate) {
      return NextResponse.json({ error: 'Course, title, and session date are required' }, { status: 400 });
    }

    // Verify course belongs to mentor
    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        mentorId: auth.payload.id
      }
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found or not assigned to you' }, { status: 404 });
    }

    // Calculate end time
    const start = new Date(sessionDate);
    const durMin = parseInt(duration) || 60;
    const end = new Date(start.getTime() + durMin * 60 * 1000);

    const session = await prisma.attendanceSession.create({
      data: {
        courseId,
        mentorId: auth.payload.id,
        sessionDate: start,
        endTime: end,
        title: title.trim(),
        description: description?.trim() || '',
        meetingLink: meetingLink?.trim() || '',
        isActive: false
      }
    });

    return successResponse({
      message: 'Live session scheduled successfully',
      session
    });
  } catch (error) {
    return handleApiError(error, 'schedule live class');
  }
}

// PATCH /api/mentor/live-classes — start or stop a live class
export async function PATCH(request: NextRequest) {
  try {
    const auth = authenticateRequestLight(request, ['MENTOR']);
    if (!auth.success) return auth.response;

    const { sessionId, isActive } = await request.json();

    if (!sessionId || isActive === undefined) {
      return NextResponse.json({ error: 'Session ID and status are required' }, { status: 400 });
    }

    const session = await prisma.attendanceSession.findUnique({
      where: { id: sessionId },
      include: {
        course: true
      }
    });

    if (!session || session.mentorId !== auth.payload.id) {
      return NextResponse.json({ error: 'Live session not found or access denied' }, { status: 404 });
    }

    const updated = await prisma.attendanceSession.update({
      where: { id: sessionId },
      data: {
        isActive,
        sessionDate: isActive ? new Date() : undefined
      }
    });

    // If session is being started, trigger notifications to all admitted students
    if (isActive) {
      const enrollments = await prisma.enrollment.findMany({
        where: {
          courseId: session.courseId,
          enrollmentStatus: 'ADMITTED'
        },
        select: {
          userId: true
        }
      });

      const studentIds = enrollments
        .map(e => e.userId)
        .filter((id): id is string => id !== null);

      if (studentIds.length > 0) {
        await prisma.notification.createMany({
          data: studentIds.map(studentId => ({
            userId: studentId,
            type: 'LIVE_CLASS_STARTED',
            title: 'Live Class Started!',
            message: `Your live class "${session.title || 'Live Session'}" for "${session.course.title}" has started. Join now!`,
            actionUrl: session.meetingLink || `/student/online-classes`,
            isRead: false
          }))
        });
      }
    }

    return successResponse({
      message: isActive ? 'Session started successfully' : 'Session ended successfully',
      session: updated
    });
  } catch (error) {
    return handleApiError(error, 'update live class state');
  }
}

// DELETE /api/mentor/live-classes — delete/cancel live class
export async function DELETE(request: NextRequest) {
  try {
    const auth = authenticateRequestLight(request, ['MENTOR']);
    if (!auth.success) return auth.response;

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('id');

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    const session = await prisma.attendanceSession.findUnique({
      where: { id: sessionId }
    });

    if (!session || session.mentorId !== auth.payload.id) {
      return NextResponse.json({ error: 'Live session not found or access denied' }, { status: 404 });
    }

    await prisma.attendanceSession.delete({
      where: { id: sessionId }
    });

    return successResponse({ message: 'Live class session cancelled successfully' });
  } catch (error) {
    return handleApiError(error, 'delete live class');
  }
}
