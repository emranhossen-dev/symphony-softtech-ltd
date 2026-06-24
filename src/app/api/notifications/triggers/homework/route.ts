import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendRealTimeNotification } from '@/lib/realtime';
import { handleApiError, successResponse } from '@/lib/api-utils';

// Trigger notification for homework approval
export async function POST(request: NextRequest) {
  try {
    const { submissionId, studentId, homeworkTitle, courseName, grade, feedback } = await request.json();

    if (!submissionId || !studentId || !homeworkTitle || !courseName) {
      return NextResponse.json(
        { error: 'Submission ID, student ID, homework title, and course name are required' },
        { status: 400 }
      );
    }

    const notification = await (prisma as any).notification.create({
      data: {
        type: 'HOMEWORK',
        title: 'Homework Approved!',
        message: `Your homework submission for "${homeworkTitle}" in "${courseName}" has been approved. Grade: ${grade}%`,
        studentId,
        actionUrl: `/student/homework/${submissionId}`,
        metadata: {
          homeworkTitle,
          courseName,
          grade,
          feedback,
          submissionId
        },
        read: false
      }
    });

    await sendRealTimeNotification(studentId, {
      type: 'HOMEWORK',
      title: notification.title,
      message: notification.message,
      actionUrl: notification.actionUrl,
      metadata: notification.metadata
    });

    return successResponse({
      notification: {
        id: notification.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        studentId: notification.studentId,
        read: notification.read,
        createdAt: notification.createdAt.toISOString(),
        actionUrl: notification.actionUrl,
        metadata: notification.metadata
      }
    });
  } catch (error) {
    return handleApiError(error, 'create homework notification');
  }
}
