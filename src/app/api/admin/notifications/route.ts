import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, hasRole } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!hasRole(payload.role, 'ADMIN') && !hasRole(payload.role, 'EMPLOYEE')) {
      return NextResponse.json(
        { error: 'Admin or Employee access required' },
        { status: 403 }
      );
    }

    let notifications = [];
    let stats = {
      totalNotifications: 0,
      unreadNotifications: 0,
      sentNotifications: 0,
      draftNotifications: 0
    };

    try {
      // Try to get notifications from database
      // Assuming a notifications table exists
      const dbNotifications = await (prisma as any).notification?.findMany?.({
        where: {
          // Get notifications for the last 30 days
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 50
      });

      if (dbNotifications) {
        notifications = dbNotifications.map((notif: any) => ({
          id: notif.id,
          title: notif.title,
          message: notif.message,
          type: notif.type || 'info',
          isRead: notif.isRead || false,
          sentAt: notif.sentAt,
          createdAt: notif.createdAt
        }));

        stats = {
          totalNotifications: notifications.length,
          unreadNotifications: notifications.filter((n: any) => !n.isRead).length,
          sentNotifications: notifications.filter((n: any) => n.sentAt).length,
          draftNotifications: notifications.filter((n: any) => !n.sentAt).length
        };
      } else {
        // Fallback to mock data if no notifications table
        const mockNotifications = [
          {
            id: 'notif-1',
            title: 'Welcome to Symphony Training Centre',
            message: 'Your admin account has been successfully created',
            type: 'info',
            isRead: false,
            sentAt: new Date().toISOString(),
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 'notif-2',
            title: 'New Enrollment Received',
            message: 'A new student has enrolled in BCS Preparation course',
            type: 'success',
            isRead: false,
            sentAt: new Date().toISOString(),
            createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 'notif-3',
            title: 'Payment Confirmation',
            message: 'Payment received for course enrollment',
            type: 'success',
            isRead: true,
            sentAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
            createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
          }
        ];

        notifications = mockNotifications;
        stats = {
          totalNotifications: mockNotifications.length,
          unreadNotifications: mockNotifications.filter(n => !n.isRead).length,
          sentNotifications: mockNotifications.filter(n => n.sentAt).length,
          draftNotifications: mockNotifications.filter(n => !n.sentAt).length
        };
      }
    } catch (dbError) {
      console.log('Notifications table not found, using mock data');
      
      // Use mock data as fallback
      const mockNotifications = [
        {
          id: 'notif-1',
          title: 'Welcome to Symphony Training Centre',
          message: 'Your admin account has been successfully created',
          type: 'info',
          isRead: false,
          sentAt: new Date().toISOString(),
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'notif-2',
          title: 'New Enrollment Received',
          message: 'A new student has enrolled in BCS Preparation course',
          type: 'success',
          isRead: false,
          sentAt: new Date().toISOString(),
          createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'notif-3',
          title: 'Payment Confirmation',
          message: 'Payment received for course enrollment',
          type: 'success',
          isRead: true,
          sentAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
        }
      ];

      notifications = mockNotifications;
      stats = {
        totalNotifications: mockNotifications.length,
        unreadNotifications: mockNotifications.filter(n => !n.isRead).length,
        sentNotifications: mockNotifications.filter(n => n.sentAt).length,
        draftNotifications: mockNotifications.filter(n => !n.sentAt).length
      };
    }

    return NextResponse.json({
      success: true,
      notifications,
      stats
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, message, type, targetAudience } = await request.json();

    if (!title || !message) {
      return NextResponse.json(
        { error: 'Title and message are required' },
        { status: 400 }
      );
    }

    // Mock notification creation
    const newNotification = {
      id: `notif-${Date.now()}`,
      title,
      message,
      type: type || 'INFO',
      targetAudience: targetAudience || 'ALL',
      isRead: false,
      sentAt: null,
      createdAt: new Date().toISOString(),
      createdBy: 'Admin'
    };

    return NextResponse.json({
      success: true,
      notification: newNotification
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    );
  }
}
