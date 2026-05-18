import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';



export async function GET() {
  try {
    // In a real application, you'd get the mentor ID from the session/auth token
    const mentorId = 'current-mentor-id'; // This would come from auth

    // Fetch attendance records for mentor's courses
    const attendanceRecords = await (prisma as any).attendanceRecord.findMany({
      where: {
        course: {
          mentorId
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
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    });

    // Transform data to match expected format
    const formattedRecords = attendanceRecords.map((record: any) => ({
      id: record.id,
      studentId: record.studentId,
      studentName: `${record.student.firstName} ${record.student.lastName}`,
      courseId: record.courseId,
      courseName: record.course.name,
      date: record.date.toISOString().split('T')[0],
      status: record.status,
      checkInTime: record.checkInTime?.toTimeString().slice(0, 5),
      notes: record.notes
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

    // In a real application, you'd get the mentor ID from the session/auth token
    const mentorId = 'current-mentor-id'; // This would come from auth

    // Create attendance records
    const createdRecords = await Promise.all(
      records.map((record: any) =>
        (prisma as any).attendanceRecord.create({
          data: {
            studentId: record.studentId,
            courseId: record.courseId,
            date: new Date(record.date),
            status: record.status,
            checkInTime: record.status === 'PRESENT' ? new Date() : null,
            notes: record.notes,
            markedBy: mentorId
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
