import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest, handleApiError, successResponse } from '@/lib/api-utils';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request, ['MENTOR']);
    if (!auth.success) return auth.response;

    const submissions = await (prisma as any).homeworkSubmission.findMany({
      where: {
        course: {
          mentorId: auth.user.id
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

    const transformedSubmissions = submissions.map((submission: any) => ({
      id: submission.id,
      homeworkId: `hw-${submission.moduleId}`,
      homeworkTitle: submission.module.homework || `Homework - ${submission.module.title}`,
      studentId: submission.userId,
      studentName: submission.user.name || 'Unknown Student',
      studentEmail: submission.user.email,
      submittedAt: submission.createdAt.toISOString(),
      status: submission.status,
      marks: submission.marks,
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
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    return handleApiError(error, 'fetch homework submissions');
  }
}
