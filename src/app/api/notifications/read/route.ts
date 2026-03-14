import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';



export async function PATCH(request: NextRequest) {
  try {
    const { notificationId } = await request.json();

    if (!notificationId) {
      return NextResponse.json(
        { error: 'Notification ID is required' },
        { status: 400 }
      );
    }

    // Mark notification as read
    const notification = await (prisma as any).notification.update({
      where: { id: notificationId },
      data: {
        read: true,
        readAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      notification: {
        id: notification.id,
        read: notification.read,
        readAt: notification.readAt?.toISOString()
      }
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark notification as read' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
