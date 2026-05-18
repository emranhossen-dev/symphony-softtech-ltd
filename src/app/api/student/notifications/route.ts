import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';



export async function GET() {
  try {
    // In a real application, you'd get the student ID from the session/auth token
    const studentId = 'current-student-id'; // This would come from auth

    // Fetch student notifications
    const notifications = await (prisma as any).notification.findMany({
      where: {
        studentId
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 20
    });

    // Transform data to match expected format
    const transformedNotifications = notifications.map((notification: any) => ({
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      createdAt: notification.createdAt.toISOString(),
      read: notification.read,
      actionUrl: notification.actionUrl
    }));

    return NextResponse.json({
      success: true,
      notifications: transformedNotifications
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
