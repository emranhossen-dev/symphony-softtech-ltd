import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';



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

    // Create enrollment approval notification
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

    // Send real-time notification via WebSocket
    await sendRealTimeNotification(studentId, {
      type: 'ENROLLMENT',
      title: notification.title,
      message: notification.message,
      actionUrl: notification.actionUrl,
      metadata: notification.metadata
    });

    return NextResponse.json({
      success: true,
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
    console.error('Error creating enrollment notification:', error);
    return NextResponse.json(
      { error: 'Failed to create enrollment notification' },
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
