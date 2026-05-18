import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';



export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // In a real application, you'd get user ID from the session/auth token
    const userId = 'current-user-id';

    let whereClause: any = {
      studentId: userId
    };

    if (type !== 'all') {
      whereClause.type = type;
    }

    const notifications = await (prisma as any).notification.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      skip: offset,
      include: {
        student: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    // Get notification statistics
    const [totalStats, unreadStats, typeStats] = await Promise.all([
      (prisma as any).notification.count({
        where: { studentId: userId }
      }),
      (prisma as any).notification.count({
        where: { 
          studentId: userId,
          read: false 
        }
      }),
      (prisma as any).notification.groupBy({
        by: ['type'],
        where: { studentId: userId },
        _count: {
          type: true
        }
      })
    ]);

    const byType = typeStats.reduce((acc: Record<string, number>, stat: any) => {
      acc[stat.type] = stat._count.type;
      return acc;
    }, {});

    const stats = {
      total: totalStats,
      unread: unreadStats,
      byType
    };

    // Transform notifications
    const formattedNotifications = notifications.map((notification: any) => ({
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      studentId: notification.studentId,
      read: notification.read,
      createdAt: notification.createdAt.toISOString(),
      actionUrl: notification.actionUrl,
      metadata: notification.metadata || {}
    }));

    return NextResponse.json({
      success: true,
      notifications: formattedNotifications,
      stats
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

export async function POST(request: NextRequest) {
  try {
    const { type, title, message, studentIds, actionUrl, metadata } = await request.json();

    if (!type || !title || !message || !studentIds) {
      return NextResponse.json(
        { error: 'Type, title, message, and student IDs are required' },
        { status: 400 }
      );
    }

    // Create notifications for multiple students
    const notifications = await Promise.all(
      studentIds.map((studentId: string) =>
        (prisma as any).notification.create({
          data: {
            type,
            title,
            message,
            studentId,
            actionUrl,
            metadata: metadata || {},
            read: false
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
        studentId: n.studentId,
        read: n.read,
        createdAt: n.createdAt.toISOString(),
        actionUrl: n.actionUrl,
        metadata: n.metadata || {}
      }))
    });
  } catch (error) {
    console.error('Error creating notifications:', error);
    return NextResponse.json(
      { error: 'Failed to create notifications' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
