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
    const updatedNotification = await (prisma as any).notification.update({
      where: { id: notificationId },
      data: { read: true }
    });

    return NextResponse.json({
      success: true,
      notification: updatedNotification
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
