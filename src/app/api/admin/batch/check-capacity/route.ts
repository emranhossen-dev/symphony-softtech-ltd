import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';



export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{}> }
) {
  try {
    // Check if prisma is available
    if (!prisma) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 503 }
      );
    }

    const { courseId, studentCount = 1 } = await request.json();

    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      );
    }

    // Get course details with current enrollment count
    const course = await (prisma as any).course.findUnique({
      where: { id: courseId },
      include: {
        enrollments: {
          select: { id: true }
        }
      }
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    const currentStudents = course.enrollments.length;
    const maxStudents = 50; // Default max capacity
    const availableSlots = maxStudents - currentStudents;
    const canEnroll = availableSlots >= studentCount;

    return NextResponse.json({
      success: true,
      capacity: {
        maxStudents,
        currentStudents,
        availableSlots,
        canEnroll,
        status: canEnroll ? 'available' : 'full',
        percentage: (currentStudents / maxStudents) * 100
      }
    });
  } catch (error) {
    console.error('Error checking batch capacity:', error);
    return NextResponse.json(
      { error: 'Failed to check batch capacity' },
      { status: 500 }
    );
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
}
