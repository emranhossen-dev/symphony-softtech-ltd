import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';



export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // End the attendance session
    const session = await (prisma as any).attendanceSession.update({
      where: { id: sessionId },
      data: {
        isActive: false,
        endTime: new Date().toTimeString().slice(0, 5)
      },
      include: {
        records: {
          include: {
            student: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        }
      }
    });

    // Calculate final attendance statistics
    const presentCount = session.records.filter((r: any) => r.status === 'PRESENT').length;
    const absentCount = session.records.filter((r: any) => r.status === 'ABSENT').length;
    const lateCount = session.records.filter((r: any) => r.status === 'LATE').length;
    const totalStudents = session.records.length;
    const attendanceRate = totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0;

    // Update session with final statistics
    await (prisma as any).attendanceSession.update({
      where: { id: sessionId },
      data: {
        presentCount,
        absentCount,
        lateCount,
        attendanceRate
      }
    });

    // Send notifications to absent students
    const absentStudents = session.records.filter((r: any) => r.status === 'ABSENT');
    await Promise.all(
      absentStudents.map((record: any) =>
        (prisma as any).notification.create({
          data: {
            type: 'ATTENDANCE',
            title: 'Attendance Marked',
            message: `You were marked absent for today's session`,
            studentId: record.studentId,
            read: false
          }
        })
      )
    );

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        presentCount,
        absentCount,
        lateCount,
        attendanceRate
      }
    });
  } catch (error) {
    console.error('Error ending attendance session:', error);
    return NextResponse.json(
      { error: 'Failed to end attendance session' },
      { status: 500 }
    );
  } finally {
    await (prisma as any).$disconnect();
  }
}
