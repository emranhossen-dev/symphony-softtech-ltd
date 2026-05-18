import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';



export async function PATCH(request: NextRequest) {
  try {
    // Check if prisma is available
    if (!prisma) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 503 }
      );
    }

    const { courseId, isActive } = await request.json();

    if (!courseId || typeof isActive !== 'boolean') {
      return NextResponse.json(
        { error: 'Course ID and active status are required' },
        { status: 400 }
      );
    }

    const updatedCourse = await (prisma as any).course.update({
      where: { id: courseId },
      data: { isActive }
    });

    return NextResponse.json({
      success: true,
      batch: updatedCourse // Keep as batch for frontend compatibility
    });
  } catch (error) {
    console.error('Error updating batch status:', error);
    return NextResponse.json(
      { error: 'Failed to update batch status' },
      { status: 500 }
    );
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
}
