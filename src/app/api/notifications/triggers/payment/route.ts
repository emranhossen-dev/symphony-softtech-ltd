import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendRealTimeNotification } from '@/lib/realtime';
import { handleApiError, successResponse } from '@/lib/api-utils';

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

    await sendRealTimeNotification(studentId, {
      type: 'PAYMENT',
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
    return handleApiError(error, 'create payment notification');
  }
}
