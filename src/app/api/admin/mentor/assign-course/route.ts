import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { mentorId, courseId } = await request.json();

    if (!mentorId || !courseId) {
      return NextResponse.json(
        { error: 'Mentor ID and Course ID are required' },
        { status: 400 }
      );
    }

    // Update the course's mentorId field
    const course = await (prisma as any).course.update({
      where: {
        id: courseId
      },
      data: {
        mentorId: mentorId
      },
      include: {
        mentor: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      assignment: {
        id: course.id,
        mentorId,
        courseId: course.id,
        createdAt: new Date(),
        mentor: course.mentor,
        course: {
          id: course.id,
          title: course.title
        }
      }
    });
  } catch (error) {
    console.error('Error assigning course to mentor:', error);
    return NextResponse.json(
      { error: 'Failed to assign course to mentor' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
