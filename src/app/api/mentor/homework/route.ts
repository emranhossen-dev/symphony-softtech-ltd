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
            mentorId
          }
        }
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
    const transformedSubmissions = submissions.map((submission: any) => ({
      id: submission.id,
      homeworkId: submission.homeworkId,
      homeworkTitle: submission.homework.title,
      studentId: submission.studentId, // In real schema, this would be from student relation
      studentName: 'Student Name', // In real schema, this would be from student relation
      submittedAt: submission.submittedAt.toISOString(),
      status: submission.review?.status || 'SUBMITTED',
      grade: submission.review?.grade,
      feedback: submission.review?.feedback,
      files: submission.files.map((file: any) => ({
        name: file.name,
        language: file.language,
        size: file.size
      })),
      courseName: submission.homework.course.name
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
