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

    // Fetch attendance records for mentor's courses
    const attendanceRecords = await (prisma as any).attendanceSession.findMany({
      where: {
        course: {
          mentorId: user.id
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
        scheduledAt: 'desc'
      }
    });

    // Transform data to match expected format
    const formattedRecords = attendanceRecords.map((record: any) => ({
      id: record.id,
      studentId: record.mentorId || user.id,
      studentName: 'Student', // Would be from attendance records in real implementation
      courseId: record.courseId,
      courseName: record.course.title,
      date: record.sessionDate.toISOString().split('T')[0],
      status: record.status,
      checkInTime: record.sessionDate?.toTimeString().slice(0, 5),
      notes: record.description
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

    // Update attendance sessions
    const updatedRecords = await Promise.all(
      records.map((record: any) =>
        (prisma as any).attendanceSession.update({
          where: {
            id: record.id
          },
          data: {
            status: record.status,
            description: record.notes
          }
        })
      )
    );

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
