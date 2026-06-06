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
    const existingEnrollment = await prisma.enrollment.findFirst({
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

    // Get student details
    const student = await prisma.user.findUnique({
      where: { id: studentId }
    });

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    // Get course details
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Create new enrollment
    const enrollment = await prisma.enrollment.create({
      data: {
        userId: studentId,
        courseId: courseId,
        courseName: course.title,
        categoryId: course.categoryId,
        fullName: student.name,
        phoneNumber: student.phone || 'N/A',
        email: student.email,
        address: 'N/A',
        enrollmentStatus: 'ADMITTED'
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
  }
}
