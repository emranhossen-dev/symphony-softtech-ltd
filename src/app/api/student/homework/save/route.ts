import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { homeworkId, code } = await request.json();
    
    if (!homeworkId || !code) {
      return NextResponse.json(
        { error: 'Homework ID and code are required' },
        { status: 400 }
      );
    }

    // Get user from auth token
    const token = request.headers.get('Authorization')?.replace('Bearer ', '') || 
                  request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user from token
    const { getUserFromToken } = await import('@/lib/auth');
    const user = await getUserFromToken(token);

    // Extract moduleId from homeworkId (format: hw-moduleId)
    const moduleId = homeworkId.replace('hw-', '');
    
    // Get module information to get courseId
    const module = await (prisma as any).module.findUnique({
      where: { id: moduleId },
      select: { courseId: true }
    });

    if (!module) {
      return NextResponse.json(
        { error: 'Module not found' },
        { status: 404 }
      );
    }

    // Check if user is enrolled in the course
    const enrollment = await (prisma as any).enrollment.findFirst({
      where: {
        userId: user.id,
        courseId: module.courseId,
        enrollmentStatus: 'ADMITTED'
      }
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: 'Not enrolled in this course' },
        { status: 403 }
      );
    }

    // Check if there's an existing submission
    const existingSubmission = await (prisma as any).homeworkSubmission.findFirst({
      where: {
        userId: user.id,
        moduleId: moduleId
      }
    });

    if (existingSubmission) {
      // Update existing submission
      await (prisma as any).homeworkSubmission.update({
        where: { id: existingSubmission.id },
        data: {
          code: code,
          updatedAt: new Date()
        }
      });
    } else {
      // Create new submission as draft
      await (prisma as any).homeworkSubmission.create({
        data: {
          userId: user.id,
          moduleId: moduleId,
          courseId: module.courseId,
          code: code,
          status: 'PENDING',
          submittedAt: new Date()
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Code saved successfully'
    });

  } catch (error) {
    console.error('Error saving homework code:', error);
    return NextResponse.json(
      { error: 'Failed to save code' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
