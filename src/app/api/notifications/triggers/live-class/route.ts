import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';



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

    return NextResponse.json({
      success: true,
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
    console.error('Error creating live class notifications:', error);
    return NextResponse.json(
      { error: 'Failed to create live class notifications' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Helper function to send real-time notifications
async function sendRealTimeNotification(studentId: string, notificationData: any) {
  // In a real application, this would connect to a WebSocket server
  // and send the notification to the specific student
  console.log(`Sending notification to student ${studentId}:`, notificationData);
  
  // Mock WebSocket implementation
  const ws = new WebSocket('ws://localhost:3001/notifications');
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({
      type: 'NOTIFICATION',
      studentId,
      data: notificationData
    }));
  }
}
