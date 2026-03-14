import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';



export async function GET() {
  try {
    // In a real application, you'd get the student ID from the session/auth token
    const studentId = 'current-student-id'; // This would come from auth

    // Fetch student's homework assignments
    const homeworkAssignments = await (prisma as any).homework.findMany({
      where: {
        studentId,
        isActive: true
      },
      include: {
        course: {
          select: {
            id: true,
            name: true,
            category: true
          }
        },
        submissions: {
          where: {
            studentId
          },
          orderBy: {
            submittedAt: 'desc'
          },
          include: {
            files: true,
            review: true
          }
        }
      },
      orderBy: {
        dueDate: 'asc'
      }
    });

    // Transform data to match expected format
    const transformedHomework = homeworkAssignments.map((assignment: any) => {
      const latestSubmission = assignment.submissions[0];
      const latestReview = latestSubmission?.review;
      
      return {
        id: assignment.id,
        title: assignment.title,
        description: assignment.description,
        dueDate: assignment.dueDate.toISOString(),
        status: latestReview ? latestReview.status : (
          latestSubmission ? 'SUBMITTED' : 'PENDING'
        ),
        grade: latestReview?.grade,
        feedback: latestReview?.feedback,
        submittedAt: latestSubmission?.submittedAt.toISOString(),
        reviewedAt: latestReview?.reviewedAt?.toISOString(),
        reviewedBy: latestReview?.reviewedBy,
        requirements: {
          languages: assignment.requirements?.languages || ['HTML', 'CSS', 'JavaScript'],
          files: assignment.requirements?.files || ['index.html', 'style.css', 'script.js'],
          description: assignment.requirements?.description || 'Complete the assigned task'
        },
        course: assignment.course,
        submissions: assignment.submissions.map((submission: any) => ({
          id: submission.id,
          submittedAt: submission.submittedAt.toISOString(),
          files: submission.files.map((file: any) => ({
            name: file.name,
            content: file.content,
            language: file.language,
            size: file.size
          })),
          status: submission.review?.status || 'SUBMITTED',
          grade: submission.review?.grade,
          feedback: submission.review?.feedback
        }))
      };
    });

    return NextResponse.json({
      success: true,
      homework: transformedHomework
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
