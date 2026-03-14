import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Authentication check
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = verifyToken(token);
    
    if (user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');

    if (!courseId) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 });
    }

    // Check if student is enrolled in this course
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
      return NextResponse.json({ error: 'Not enrolled in this course' }, { status: 403 });
    }

    // Get all attendance sessions for this course
    const totalSessions = await prisma.attendanceSession.count({
      where: {
        courseId: courseId,
        isActive: true
      }
    });

    // Get student's attendance records for this course
    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        studentId: user.id,
        session: {
          courseId: courseId,
          isActive: true
        }
      },
      include: {
        session: {
          select: {
            id: true,
            sessionDate: true,
            title: true
          }
        }
      }
    });

    // Calculate attendance statistics
    const presentCount = attendanceRecords.filter(record => record.status === 'PRESENT').length;
    const absentCount = attendanceRecords.filter(record => record.status === 'ABSENT').length;
    const attendancePercentage = totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : 0;

    // Define attendance threshold (e.g., 75%)
    const attendanceThreshold = 75;
    const canReceiveCertificate = attendancePercentage >= attendanceThreshold;

    return NextResponse.json({
      success: true,
      attendanceStats: {
        totalSessions,
        presentCount,
        absentCount,
        attendancePercentage,
        attendanceThreshold,
        canReceiveCertificate,
        attendanceRecords: attendanceRecords.map(record => ({
          sessionId: record.sessionId,
          sessionDate: record.session.sessionDate,
          sessionTitle: record.session.title,
          status: record.status,
          markedAt: record.markedAt
        }))
      }
    });

  } catch (error) {
    console.error('Error fetching attendance stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch attendance stats' },
      { status: 500 }
    );
  }
}
