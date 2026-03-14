import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';



// Trigger notification for payment verification
export async function POST(request: NextRequest) {
  try {
    const { paymentId, studentId, courseName, amount, paymentMethod } = await request.json();

    if (!paymentId || !studentId || !courseName || !amount) {
      return NextResponse.json(
        { error: 'Payment ID, student ID, course name, and amount are required' },
        { status: 400 }
      );
    }

    // Create payment verification notification
    const notification = await (prisma as any).notification.create({
      data: {
        type: 'PAYMENT',
        title: 'Payment Verified!',
        message: `Your payment of $${amount} for "${courseName}" has been verified and processed successfully.`,
        studentId,
        actionUrl: `/student/payments/${paymentId}`,
        metadata: {
          courseName,
          amount,
          paymentMethod,
          paymentId
        },
        read: false
      }
    });

    // Send real-time notification via WebSocket
    await sendRealTimeNotification(studentId, {
      type: 'PAYMENT',
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
    console.error('Error creating payment notification:', error);
    return NextResponse.json(
      { error: 'Failed to create payment notification' },
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
