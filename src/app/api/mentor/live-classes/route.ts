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

    // Fetch live classes for mentor's courses
    const attendanceSessions = await (prisma as any).attendanceSession.findMany({
      where: {
        course: {
          mentorId: user.id
        },
        sessionDate: {
          gte: new Date()
        }
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            category: true,
            slug: true
          }
        }
      },
      orderBy: {
        sessionDate: 'asc'
      }
    });

    // Transform data to match expected format
    const classes = attendanceSessions.map((session: any) => ({
      id: session.id,
      title: session.title || `${session.course.title} - Live Session`,
      courseName: session.course.title,
      scheduledAt: session.sessionDate,
      duration: session.duration || 60,
      status: session.sessionDate > new Date() ? 'SCHEDULED' : 'ENDED',
      participants: 0, // Would be calculated from attendance records
      maxParticipants: session.maxParticipants || 50,
      meetingLink: session.meetingLink
    }));

    return NextResponse.json({
      success: true,
      classes
    });
  } catch (error) {
    console.error('Error fetching live classes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch live classes' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
