import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Get mentor ID from auth token
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

    if (!user || user.role !== 'MENTOR') {
      return NextResponse.json(
        { error: 'Mentor access required' },
        { status: 403 }
      );
    }

    // Fetch homework submissions for courses where this mentor is assigned
    const submissions = await (prisma as any).homeworkSubmission.findMany({
      where: {
        course: {
          mentorId: user.id
        }
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            category: true,
            slug: true
          }
        },
        module: {
          select: {
            id: true,
            title: true,
            homework: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform data to match expected format
    const transformedSubmissions = submissions.map((submission: any) => ({
      id: submission.id,
      homeworkId: `hw-${submission.moduleId}`,
      homeworkTitle: submission.module.homework || `Homework - ${submission.module.title}`,
      studentId: submission.userId,
      studentName: submission.user.name || 'Unknown Student',
      studentEmail: submission.user.email,
      submittedAt: submission.createdAt.toISOString(),
      status: submission.status,
      grade: submission.feedback ? (submission.status === 'APPROVED' ? 85 : 0) : undefined,
      feedback: submission.feedback,
      code: submission.code,
      fileUrl: submission.fileUrl,
      courseName: submission.course.title,
      courseSlug: submission.course.slug,
      moduleId: submission.moduleId,
      courseId: submission.courseId,
      mentorId: submission.mentorId
    }));

    return NextResponse.json({
      success: true,
      submissions: transformedSubmissions
    });
  } catch (error) {
    console.error('Error fetching homework submissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch homework submissions' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
