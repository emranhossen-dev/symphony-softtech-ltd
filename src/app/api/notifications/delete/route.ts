import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';



export async function DELETE(request: NextRequest) {
  try {
    const { notificationId } = await request.json();

    if (!notificationId) {
      return NextResponse.json(
        { error: 'Notification ID is required' },
        { status: 400 }
      );
    }

    // Delete notification
    await (prisma as any).notification.delete({
      where: { id: notificationId }
    });

    return NextResponse.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    return NextResponse.json(
      { error: 'Failed to delete notification' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { notificationId } = await request.json();

    if (!notificationId) {
      return NextResponse.json(
        { error: 'Notification ID is required' },
        { status: 400 }
      );
    }

    // Archive notification (mark as archived)
    const notification = await (prisma as any).notification.update({
      where: { id: notificationId },
      data: {
        archived: true,
        archivedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      notification: {
        id: notification.id,
        archived: notification.archived,
        archivedAt: notification.archivedAt?.toISOString()
      }
    });
  } catch (error) {
    console.error('Error archiving notification:', error);
    return NextResponse.json(
      { error: 'Failed to archive notification' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
