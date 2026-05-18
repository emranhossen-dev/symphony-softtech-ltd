import { NextResponse } from 'next/server';

interface LiveChatMessage {
  id: string;
  name: string;
  phone: string;
  email: string;
  text: string;
  sender: 'user' | 'support';
  timestamp: string;
  isRead: boolean;
  source: 'livechat' | 'whatsapp' | 'facebook' | 'email';
  platformMessageId?: string;
}

// In-memory storage (use database in production)
const liveChatStore: {
  messages: LiveChatMessage[];
} = {
  messages: []
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const unread = searchParams.get('unread');
    const source = searchParams.get('source');
    
    let messages = liveChatStore.messages;
    
    if (unread === 'true') {
      messages = messages.filter(m => !m.isRead && m.sender === 'user');
    }
    
    if (source) {
      messages = messages.filter(m => m.source === source);
    }
    
    // Sort by timestamp (newest first)
    messages = [...messages].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return NextResponse.json({
      success: true,
      messages
    });
  } catch (error) {
    console.error('Error fetching live chat messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { name, phone, email, text, sender, source, platformMessageId } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: 'Message text is required' },
        { status: 400 }
      );
    }

    const newMessage: LiveChatMessage = {
      id: Date.now().toString(),
      name: name || '',
      phone: phone || '',
      email: email || '',
      text,
      sender: sender || 'user',
      timestamp: new Date().toISOString(),
      isRead: false,
      source: source || 'livechat',
      platformMessageId
    };

    liveChatStore.messages.push(newMessage);

    return NextResponse.json({
      success: true,
      message: newMessage
    });
  } catch (error) {
    console.error('Error saving live chat message:', error);
    return NextResponse.json(
      { error: 'Failed to save message' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { messageIds, isRead } = await request.json();

    if (!messageIds || !Array.isArray(messageIds)) {
      return NextResponse.json(
        { error: 'Message IDs are required' },
        { status: 400 }
      );
    }

    liveChatStore.messages = liveChatStore.messages.map(msg =>
      messageIds.includes(msg.id) ? { ...msg, isRead } : msg
    );

    return NextResponse.json({
      success: true,
      message: 'Messages updated successfully'
    });
  } catch (error) {
    console.error('Error updating live chat messages:', error);
    return NextResponse.json(
      { error: 'Failed to update messages' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Message ID is required' },
        { status: 400 }
      );
    }

    liveChatStore.messages = liveChatStore.messages.filter(msg => msg.id !== id);

    return NextResponse.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting live chat message:', error);
    return NextResponse.json(
      { error: 'Failed to delete message' },
      { status: 500 }
    );
  }
}
