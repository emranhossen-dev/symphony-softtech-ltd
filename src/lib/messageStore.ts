// Temporary in-memory storage for WhatsApp messages
// This will be replaced with Prisma database once the client is properly regenerated

export interface WhatsAppMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  isRead: boolean;
  timestamp: string;
}

class MessageStore {
  private messages: WhatsAppMessage[] = [];

  // Add a new message
  addMessage(message: Omit<WhatsAppMessage, 'id' | 'timestamp' | 'isRead'>): WhatsAppMessage {
    const newMessage: WhatsAppMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...message,
      isRead: false,
      timestamp: new Date().toISOString(),
    };
    
    this.messages.push(newMessage);
    return newMessage;
  }

  // Get all messages
  getMessages(): WhatsAppMessage[] {
    return this.messages.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  // Get filtered messages
  getFilteredMessages(unreadOnly: boolean = false): WhatsAppMessage[] {
    let filtered = this.messages;
    if (unreadOnly) {
      filtered = filtered.filter(msg => !msg.isRead);
    }
    return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  // Get paginated messages
  getPaginatedMessages(page: number = 1, limit: number = 50, unreadOnly: boolean = false) {
    let filtered = this.getFilteredMessages(unreadOnly);
    const startIndex = (page - 1) * limit;
    const paginatedMessages = filtered.slice(startIndex, startIndex + limit);
    
    return {
      messages: paginatedMessages,
      pagination: {
        page,
        limit,
        total: filtered.length,
        pages: Math.ceil(filtered.length / limit),
      },
    };
  }

  // Mark messages as read
  markAsRead(messageIds: string[]): boolean {
    let updated = false;
    this.messages = this.messages.map(msg => {
      if (messageIds.includes(msg.id) && !msg.isRead) {
        updated = true;
        return { ...msg, isRead: true };
      }
      return msg;
    });
    return updated;
  }

  // Delete a message
  deleteMessage(messageId: string): boolean {
    const initialLength = this.messages.length;
    this.messages = this.messages.filter(msg => msg.id !== messageId);
    return this.messages.length < initialLength;
  }

  // Get unread count
  getUnreadCount(): number {
    return this.messages.filter(msg => !msg.isRead).length;
  }

  // Clear all messages (for testing)
  clearMessages(): void {
    this.messages = [];
  }
}

// Export singleton instance
export const messageStore = new MessageStore();
