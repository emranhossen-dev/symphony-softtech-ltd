import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';



export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    // In a real application, you'd get user ID from the session/auth token
    const userId = 'current-user-id';

    const sessions = await (prisma as any).attendanceSession.findMany({
      where: {
        date: new Date(date),
        course: {
          mentorId: userId // Only show sessions for mentor's courses
        }
      },
      include: {
        course: {
          select: {
            id: true,
            name: true,
            category: true
          }
        },
        records: {
          include: {
            student: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          }
        },
        _count: {
          select: {
            records: true
          }
        }
      },
      orderBy: {
        startTime: 'asc'
      }
    });

    // Transform data and calculate attendance statistics
    const formattedSessions = sessions.map((session: any) => ({
      id: session.id,
      date: session.date.toISOString().split('T')[0],
      courseId: session.courseId,
      courseName: session.course.name,
      startTime: session.startTime,
      endTime: session.endTime,
      isActive: session.isActive,
      totalStudents: session.records.length,
      presentStudents: session.records.filter((r: any) => r.status === 'PRESENT').length,
      absentStudents: session.records.filter((r: any) => r.status === 'ABSENT').length,
      lateStudents: session.records.filter((r: any) => r.status === 'LATE').length
    }));

    return NextResponse.json({
      success: true,
      sessions: formattedSessions
    });
  } catch (error) {
    console.error('Error fetching attendance sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch attendance sessions' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: NextRequest) {
  try {
    const { date, courseId, startTime, endTime } = await request.json();

    if (!date || !courseId || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Date, course ID, start time, and end time are required' },
        { status: 400 }
      );
    }

    // In a real application, you'd get user ID from the session/auth token
    const userId = 'current-user-id';

    // Create new attendance session
    const session = await (prisma as any).attendanceSession.create({
      data: {
        date: new Date(date),
        courseId,
        startTime,
        endTime,
        isActive: true,
        createdBy: userId
      },
      include: {
        course: {
          select: {
            name: true,
            category: true
          }
        }
      }
    });

    // Get enrolled students for this course
    const enrolledStudents = await (prisma as any).enrollment.findMany({
      where: {
        courseId: courseId
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phoneNumber: true
      }
    });

    // Create attendance records for all enrolled students (initially unmarked)
    await Promise.all(
      enrolledStudents.map((enrollment: any) =>
        (prisma as any).attendanceRecord.create({
          data: {
            sessionId: session.id,
            studentId: enrollment.id, // In real schema, this would be enrollment.studentId
            status: 'ABSENT', // Default to absent until marked
            markedBy: userId
          }
        })
      )
    );

    const newSession = {
      id: session.id,
      courseId: session.courseId,
      courseName: session.course.name,
      date: session.date.toISOString().split('T')[0],
      startTime: session.startTime,
      endTime: session.endTime,
      totalStudents: enrolledStudents.length,
      presentCount: 0,
      absentCount: enrolledStudents.length,
      lateCount: 0,
      attendanceRate: 0,
      isActive: true
    };

    return NextResponse.json({
      success: true,
      session: newSession
    });
  } catch (error) {
    console.error('Error creating attendance session:', error);
    return NextResponse.json(
      { error: 'Failed to create attendance session' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
