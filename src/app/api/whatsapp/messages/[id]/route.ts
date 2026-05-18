import { NextResponse } from 'next/server';
import { messageStore } from '@/lib/messageStore';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: messageId } = await params;

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
    console.error('Error deleting message:', error);
    return NextResponse.json(
      { error: 'Failed to delete message' },
      { status: 500 }
    );
  }
}
