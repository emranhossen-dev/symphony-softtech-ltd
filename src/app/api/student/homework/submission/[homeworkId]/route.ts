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

    // Get homework submission
    const submission = await (prisma as any).homeworkSubmission.findFirst({
      where: {
        userId: user.id,
        moduleId: moduleId
      },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!submission) {
      return NextResponse.json({
        success: true,
        submission: null
      });
    }

    const submissionData = {
      id: submission.id,
      code: submission.code,
      status: submission.status,
      feedback: submission.feedback,
      submittedAt: submission.createdAt.toISOString(),
      reviewedAt: submission.reviewedAt?.toISOString() || null,
      mentor: submission.reviewer
    };

    return NextResponse.json({
      success: true,
      submission: submissionData
    });

  } catch (error) {
    console.error('Error fetching homework submission:', error);
    return NextResponse.json(
      { error: 'Failed to fetch homework submission' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
