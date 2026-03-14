import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';



export async function PATCH(request: NextRequest) {
  try {
    const { courseId, isActive } = await request.json();

    if (!courseId || typeof isActive !== 'boolean') {
      return NextResponse.json(
        { error: 'Course ID and active status are required' },
        { status: 400 }
      );
    }

    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data: { isActive }
    });

    return NextResponse.json({
      success: true,
      course: updatedCourse
    });
  } catch (error) {
    console.error('Error updating course status:', error);
    return NextResponse.json(
      { error: 'Failed to update course status' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
