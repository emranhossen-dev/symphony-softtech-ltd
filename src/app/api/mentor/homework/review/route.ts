import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';



export async function POST(request: NextRequest) {
  try {
    const { submissionId, status, grade, feedback } = await request.json();

    if (!submissionId || !status) {
      return NextResponse.json(
        { error: 'Submission ID and status are required' },
        { status: 400 }
      );
    }

    // In a real application, you'd get the mentor ID from the session/auth token
    const mentorId = 'current-mentor-id'; // This would come from auth

    // Get submission details
    const submission = await (prisma as any).homeworkSubmission.findUnique({
      where: { id: submissionId },
      include: {
        homework: {
          include: {
            student: true
          }
        }
      }
    });

    if (!submission) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      );
    }

    // Create or update review
    const review = await (prisma as any).homeworkReview.upsert({
      where: {
        submissionId
      },
      update: {
        status,
        grade: grade || 0,
        feedback: feedback || '',
        reviewedAt: new Date(),
        reviewedBy: mentorId
      },
      create: {
        submissionId,
        status,
        grade: grade || 0,
        feedback: feedback || '',
        reviewedAt: new Date(),
        reviewedBy: mentorId
      }
    });

    // Update homework status
    await (prisma as any).homeworkSubmission.update({
      where: { id: submission.homeworkId },
      data: {
        status: status
      }
    });

    // If approved, unlock next module
    if (status === 'APPROVED') {
      // Find the next module in the course
      const nextModule = await (prisma as any).module.findFirst({
        where: {
          courseId: submission.homework.courseId,
          order: {
            gt: submission.homework.moduleOrder || 0
          },
          isActive: true
        },
        orderBy: {
          order: 'asc'
        }
      });

      if (nextModule) {
        // Unlock the next module for the student
        await (prisma as any).moduleProgress.update({
          where: {
            moduleId_studentId: {
              moduleId: nextModule.id,
              studentId: submission.homework.studentId
            }
          },
          data: {
            isUnlocked: true
          }
        });

        // Create notification for student
        await (prisma as any).notification.create({
          data: {
            type: 'GRADE',
            title: 'Homework Approved!',
            message: `Your homework "${submission.homework.title}" has been approved. Next module unlocked!`,
            studentId: submission.homework.studentId,
            read: false
          }
        });
      } else {
        // Create notification for course completion
        await (prisma as any).notification.create({
          data: {
            type: 'GRADE',
            title: 'Course Completed!',
            message: `Congratulations! You have completed all modules in the course.`,
            studentId: submission.homework.studentId,
            read: false
          }
        });
      }
    } else {
      // Create notification for rejection or needs revision
      await (prisma as any).notification.create({
        data: {
          type: 'GRADE',
          title: `Homework ${status}`,
          message: `Your homework "${submission.homework.title}" has been ${status.toLowerCase()}. ${feedback ? 'Feedback: ' + feedback : ''}`,
          studentId: submission.homework.studentId,
          read: false
        }
      });
    }

    return NextResponse.json({
      success: true,
      review: {
        id: review.id,
        submissionId: review.submissionId,
        status: review.status,
        grade: review.grade,
        feedback: review.feedback,
        reviewedAt: review.reviewedAt.toISOString(),
        nextModuleUnlocked: status === 'APPROVED'
      }
    });
  } catch (error) {
    console.error('Error reviewing homework:', error);
    return NextResponse.json(
      { error: 'Failed to review homework' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
