import { NextResponse } from 'next/server';
import { messageStore } from '@/lib/messageStore';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: messageId } = await params;

    const updated = messageStore.markAsRead([messageId]);

    if (!updated) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Message marked as read',
    });

  } catch (error) {
    console.error('Error marking message as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark as read' },
      { status: 500 }
    );
  }
}
