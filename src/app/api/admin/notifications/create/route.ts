import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, hasRole } from '@/lib/auth';

export async function POST(request: NextRequest) {
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
    if (!hasRole(payload.role, 'ADMIN')) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, message, type, targetAudience } = body;

    if (!title || !message) {
      return NextResponse.json(
        { error: 'Title and message are required' },
        { status: 400 }
      );
    }

    // Mock notification creation (in real app, save to database)
    const newNotification = {
      id: `notif-${Date.now()}`,
      title,
      message,
      type: type || 'INFO',
      targetAudience: targetAudience || 'ALL',
      isRead: false,
      sentAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      createdBy: payload.id
    };

    return NextResponse.json({
      success: true,
      notification: newNotification,
      message: 'Notification created successfully'
    });

  } catch (error) {
    console.error('Create notification error:', error);
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    );
  }
}
