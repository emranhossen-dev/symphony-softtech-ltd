import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendRealTimeNotification } from '@/lib/realtime';
import { handleApiError, successResponse } from '@/lib/api-utils';

// Trigger notification for enrollment approval
export async function POST(request: NextRequest) {
  try {
    const { enrollmentId, studentId, courseName, mentorName } = await request.json();

    if (!enrollmentId || !studentId || !courseName) {
      return NextResponse.json(
        { error: 'Enrollment ID, student ID, and course name are required' },
        { status: 400 }
      );
    }

    const notification = await (prisma as any).notification.create({
      data: {
        type: 'ENROLLMENT',
        title: 'Enrollment Approved!',
        message: `Your enrollment in "${courseName}" has been approved. You can now access the course.`,
        studentId,
        actionUrl: `/student/courses/${enrollmentId}`,
        metadata: {
          courseName,
          mentorName,
          enrollmentId
        },
        read: false
      }
    });

    await sendRealTimeNotification(studentId, {
      type: 'ENROLLMENT',
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
    return handleApiError(error, 'create enrollment notification');
  }
}
