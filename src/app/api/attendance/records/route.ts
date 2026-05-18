import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';



export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
    const status = searchParams.get('status') || 'all';
    const search = searchParams.get('search') || '';

    // In a real application, you'd get user ID and role from the session/auth token
    const userId = 'current-user-id';
    const userRole = 'MENTOR'; // This would come from auth

    let whereClause: any = {};

    if (userRole === 'MENTOR') {
      // Mentors see attendance for their courses
      whereClause.session = {
        course: {
          mentorId: userId
        }
      };
    } else {
      // Students see their own attendance
      whereClause.studentId = userId;
    }

    if (date) {
      whereClause.session = {
        ...whereClause.session,
        date: new Date(date)
      };
    }

    if (status !== 'all') {
      whereClause.status = status;
    }

    if (search) {
      whereClause.OR = [
        {
          student: {
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } }
            ]
          }
        },
        {
          session: {
            course: {
              name: { contains: search, mode: 'insensitive' }
            }
          }
        }
      ];
    }

    const totalRecords = await (prisma as any).attendanceRecord.count({ where: whereClause });
    const attendanceRecords = await (prisma as any).attendanceRecord.findMany({
      where: whereClause,
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        session: {
          include: {
            course: {
              select: {
                id: true,
                name: true,
                category: true
              }
            }
          }
        },
        markedBy: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform data to match expected format
    const formattedRecords = attendanceRecords.map((record: any) => ({
      id: record.id,
      studentId: record.studentId,
      studentName: `${record.student.firstName} ${record.student.lastName}`,
      courseId: record.session.courseId,
      courseName: record.session.course.name,
      sessionId: record.sessionId,
      sessionDate: record.session.date.toISOString().split('T')[0],
      checkInTime: record.checkInTime?.toTimeString().slice(0, 5),
      checkOutTime: record.checkOutTime?.toTimeString().slice(0, 5),
      status: record.status,
      notes: record.notes,
      markedBy: `${record.markedBy?.firstName} ${record.markedBy?.lastName}`,
      createdAt: record.createdAt.toISOString()
    }));

    return NextResponse.json({
      success: true,
      records: formattedRecords,
      totalRecords
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
    const { sessionId, records, notes } = await request.json();

    if (!sessionId || !records || !Array.isArray(records)) {
      return NextResponse.json(
        { error: 'Session ID and attendance records are required' },
        { status: 400 }
      );
    }

    // In a real application, you'd get user ID from the session/auth token
    const markedBy = 'current-user-id';

    // Create attendance records
    const createdRecords = await Promise.all(
      records.map((record: any) =>
        (prisma as any).attendanceRecord.upsert({
          where: {
            sessionId_studentId: {
              sessionId,
              studentId: record.studentId
            }
          },
          update: {
            status: record.status,
            checkInTime: record.status === 'PRESENT' ? new Date() : null,
            notes: record.notes,
            markedBy
          },
          create: {
            sessionId,
            studentId: record.studentId,
            status: record.status,
            checkInTime: record.status === 'PRESENT' ? new Date() : null,
            notes: record.notes,
            markedBy
          }
        })
      )
    );

    // Update session with notes and mark as completed if all students are marked
    await (prisma as any).attendanceSession.update({
      where: { id: sessionId },
      data: {
        notes,
        // In a real app, you'd check if all enrolled students have been marked
        isActive: false
      }
    });

    // Create notifications for students
    await Promise.all(
      records.map((record: any) =>
        (prisma as any).notification.create({
          data: {
            type: 'ATTENDANCE',
            title: 'Attendance Marked',
            message: `Your attendance has been marked as ${record.status.toLowerCase()}`,
            studentId: record.studentId,
            read: false
          }
        })
      )
    );

    return NextResponse.json({
      success: true,
      records: createdRecords
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
