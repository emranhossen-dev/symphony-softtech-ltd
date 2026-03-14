import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Authentication check
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = verifyToken(token);
    
    if (user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const moduleId = searchParams.get('moduleId');

    if (!moduleId) {
      return NextResponse.json({ error: 'Module ID is required' }, { status: 400 });
    }

    // Get homework submission with mentor details
    const submission = await prisma.homeworkSubmission.findUnique({
      where: {
        userId_moduleId: {
          userId: user.id,
          moduleId: moduleId
        }
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

    if (!submission) {
      return NextResponse.json({
        success: true,
        submission: null
      });
    }

    return NextResponse.json({
      success: true,
      submission: {
        id: submission.id,
        status: submission.status,
        code: submission.code,
        fileUrl: submission.fileUrl,
        feedback: submission.feedback,
        mentor: submission.mentor,
        submittedAt: submission.createdAt,
        reviewedAt: submission.reviewedAt
      }
    });

  } catch (error) {
    console.error('Error fetching homework status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch homework status' },
      { status: 500 }
    );
  }
}
