import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';



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

    // Create homework approval notification
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

    // Send real-time notification via WebSocket
    await sendRealTimeNotification(studentId, {
      type: 'HOMEWORK',
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
    console.error('Error creating homework notification:', error);
    return NextResponse.json(
      { error: 'Failed to create homework notification' },
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
