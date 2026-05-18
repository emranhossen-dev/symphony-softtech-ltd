import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';



export async function GET() {
  try {
    // In a real application, you'd get the mentor ID from the session/auth token
    const mentorId = 'current-mentor-id'; // This would come from auth

    // Fetch homework submissions for mentor's courses
    const submissions = await (prisma as any).homeworkSubmission.findMany({
      where: {
        homework: {
          course: {
            mentorId: mentorId
          }
        },
        status: 'SUBMITTED'
      },
      include: {
        homework: {
          include: {
            course: {
              select: {
                id: true,
                name: true,
                category: true
              }
            },
            student: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        },
        files: true,
        review: true
      },
      orderBy: {
        submittedAt: 'desc'
      }
    });

    // Transform data to match expected format
    const formattedSubmissions = submissions.map((submission: any) => ({
      id: submission.id,
      homeworkId: submission.homeworkId,
      submittedAt: submission.submittedAt.toISOString(),
      status: submission.review?.status || 'SUBMITTED',
      grade: submission.review?.grade,
      feedback: submission.review?.feedback,
      reviewedAt: submission.review?.reviewedAt?.toISOString(),
      homework: {
        id: submission.homework.id,
        title: submission.homework.title,
        description: submission.homework.description,
        dueDate: submission.homework.dueDate.toISOString(),
        requirements: submission.homework.requirements,
        course: submission.homework.course,
        student: submission.homework.student
      },
      files: submission.files.map((file: any) => ({
        id: file.id,
        name: file.name,
        content: file.content,
        language: file.language,
        size: file.size
      }))
    }));

    return NextResponse.json({
      success: true,
      submissions: formattedSubmissions
    });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch submissions' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
