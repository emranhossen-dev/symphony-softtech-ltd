import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';



export async function PATCH(request: NextRequest) {
  try {
    // In a real application, you'd get user ID from the session/auth token
    const userId = 'current-user-id';

    // Mark all notifications as read for the user
    const result = await (prisma as any).notification.updateMany({
      where: {
        studentId: userId,
        read: false
      },
      data: {
        read: true,
        readAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      markedCount: result.count
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark all notifications as read' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
