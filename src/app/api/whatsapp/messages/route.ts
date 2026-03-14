import { NextRequest, NextResponse } from 'next/server';
import { messageStore } from '@/lib/messageStore';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const unread = searchParams.get('unread') === 'true';

    const result = messageStore.getPaginatedMessages(page, limit, unread);

    return NextResponse.json({
      success: true,
      ...result,
    });

  } catch (error) {
    console.error('Error fetching WhatsApp messages:', error);
    return NextResponse.json({
      success: true,
      messages: [],
      pagination: {
        page: 1,
        limit: 50,
        total: 0,
        pages: 0,
      },
    });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { messageIds, isRead } = await request.json();

    if (!messageIds || !Array.isArray(messageIds)) {
      return NextResponse.json(
        { error: 'Message IDs are required' },
        { status: 400 }
      );
    }

    const updated = messageStore.markAsRead(messageIds);

    return NextResponse.json({
      success: true,
      message: `Messages marked as ${isRead ? 'read' : 'unread'}`,
    });

  } catch (error) {
    console.error('Error updating WhatsApp messages:', error);
    return NextResponse.json(
      { error: 'Failed to update messages' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const messageId = searchParams.get('id');

    if (!messageId) {
      return NextResponse.json(
        { error: 'Message ID is required' },
        { status: 400 }
      );
    }

    const deleted = messageStore.deleteMessage(messageId);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Message deleted successfully',
    });

  } catch (error) {
    console.error('Error deleting WhatsApp message:', error);
    return NextResponse.json(
      { error: 'Failed to delete message' },
      { status: 500 }
    );
  }
}
