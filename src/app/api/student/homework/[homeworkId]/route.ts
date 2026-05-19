import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ homeworkId: string }> }
) {
  try {
    const { homeworkId } = await params;
    
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
    
    if (!moduleId) {
      return NextResponse.json(
        { error: 'Invalid homework ID' },
        { status: 400 }
      );
    }

    // Get module information
    const module = await (prisma as any).module.findUnique({
      where: { id: moduleId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            categoryId: true
          }
        }
      }
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
        courseId: module.course.id,
        enrollmentStatus: 'ADMITTED'
      }
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: 'Not enrolled in this course' },
        { status: 403 }
      );
    }

    // Return homework information
    const homework = {
      id: homeworkId,
      title: `Homework - ${module.title}`,
      description: module.homework || 'Complete the assignment for this module.',
      moduleId: module.id,
      courseId: module.course.id,
      dueDate: null // Could be added to module schema if needed
    };

    return NextResponse.json({
      success: true,
      homework
    });

  } catch (error) {
    console.error('Error fetching homework:', error);
    return NextResponse.json(
      { error: 'Failed to fetch homework' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
