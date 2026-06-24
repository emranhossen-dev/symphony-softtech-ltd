import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendRealTimeNotification } from '@/lib/realtime';
import { handleApiError, successResponse } from '@/lib/api-utils';

// Trigger notification for live class start
export async function POST(request: NextRequest) {
  try {
    const { classId, studentIds, courseName, className, mentorName, meetingLink } = await request.json();

    if (!classId || !studentIds || !courseName || !className) {
      return NextResponse.json(
        { error: 'Class ID, student IDs, course name, and class name are required' },
        { status: 400 }
      );
    }

    // Create notifications for all enrolled students
    const notifications = await Promise.all(
      studentIds.map((studentId: string) =>
        prisma.notification.create({
          data: {
            type: 'LIVE_CLASS_STARTED',
            title: 'Live Class Started!',
            message: `Your live class "${className}" for "${courseName}" has started. Join now!`,
            userId: studentId,
            actionUrl: meetingLink || `/student/online-classes`,
            metadata: {
              courseName,
              className,
              mentorName,
              classId,
              meetingLink
            },
            isRead: false
          }
        })
      )
    );

    // Send real-time notifications via WebSocket
    await Promise.all(
      studentIds.map((studentId: string) =>
        sendRealTimeNotification(studentId, {
          type: 'LIVE_CLASS_STARTED',
          title: 'Live Class Started!',
          message: `Your live class "${className}" for "${courseName}" has started. Join now!`,
          actionUrl: meetingLink || `/student/online-classes`,
          metadata: {
            courseName,
            className,
            mentorName,
            classId,
            meetingLink
          }
        })
      )
    );

    return successResponse({
      notifications: notifications.map(n => ({
        id: n.id,
        type: n.type,
        title: n.title,
        message: n.message,
        userId: n.userId,
        isRead: n.isRead,
        createdAt: n.createdAt.toISOString(),
        actionUrl: n.actionUrl,
        metadata: n.metadata as any
      })),
      count: notifications.length
    });
  } catch (error) {
    return handleApiError(error, 'create live class notifications');
  }
}
