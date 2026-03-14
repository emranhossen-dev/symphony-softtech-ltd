import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';



export async function POST(request: NextRequest) {
  try {
    const { studentId, courseId } = await request.json();

    if (!studentId || !courseId) {
      return NextResponse.json(
        { error: 'Student ID and Course ID are required' },
        { status: 400 }
      );
    }

    // Check if student is already enrolled in this course
    const existingEnrollment = await (prisma as any).enrollment.findFirst({
      where: {
        userId: studentId,
        courseId: courseId
      }
    });

    if (existingEnrollment) {
      return NextResponse.json(
        { error: 'Student is already enrolled in this course' },
        { status: 400 }
      );
    }

    // Get course details
    const course = await (prisma as any).course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Create new enrollment
    const enrollment = await (prisma as any).enrollment.create({
      data: {
        userId: studentId,
        courseId: courseId,
        courseName: course.title,
        category: course.category,
        fullName: 'Student Name', // This should come from the user data
        phoneNumber: 'N/A',
        email: 'student@example.com', // This should come from the user data
        address: 'N/A',
        enrollmentStatus: 'APPROVED'
      }
    });

    return NextResponse.json({
      success: true,
      enrollment: enrollment
    });
  } catch (error) {
    console.error('Error assigning course:', error);
    return NextResponse.json(
      { error: 'Failed to assign course' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
