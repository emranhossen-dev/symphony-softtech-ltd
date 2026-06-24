"use client";

import { useState, useEffect } from 'react';
import { MessageCircle, Phone, Mail, User, Clock, Check, CheckCheck, Reply, ExternalLink } from 'lucide-react';
import { generateWhatsAppLink } from '@/lib/whatsapp';
import toast from 'react-hot-toast';

interface WhatsAppMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}

const WhatsAppMessages = () => {
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<WhatsAppMessage | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  useEffect(() => {
    fetchMessages();
  }, [filter]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/whatsapp/messages?unread=${filter === 'unread'}&limit=50`);
      const data = await response.json();
      
      if (data.success) {
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (messageIds: string[]) => {
    try {
      const response = await fetch('/api/whatsapp/messages', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messageIds,
          isRead: true,
        }),
      });

      if (response.ok) {
        fetchMessages();
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
      toast.error('Failed to mark messages as read');
    }
  };

  const unreadCount = messages.filter(msg => !msg.isRead).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageCircle className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">Customer Messages</h2>
              <p className="text-green-100">
                {unreadCount > 0 && `${unreadCount} unread message${unreadCount > 1 ? 's' : ''}`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'all' 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({messages.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'unread' 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Unread ({unreadCount})
          </button>
          <button
            onClick={() => setFilter('read')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'read' 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Read ({messages.length - unreadCount})
          </button>
        </div>
      </div>

      <div className="flex h-[600px]">
        {/* Messages List */}
        <div className="w-1/2 border-r border-gray-200 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No messages found</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                onClick={() => setSelectedMessage(message)}
                className={`p-4 border-b border-gray-100 cursor-pointer transition-colors hover:bg-gray-50 ${
                  selectedMessage?.id === message.id ? 'bg-green-50' : ''
                } ${!message.isRead ? 'bg-blue-50' : ''}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{message.name}</h4>
                      <p className="text-sm text-gray-500">{message.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!message.isRead && (
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    )}
                    {message.isRead ? (
                      <CheckCheck className="w-4 h-4 text-green-500" />
                    ) : (
                      <Check className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2 mb-2">{message.message}</p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  {new Date(message.timestamp).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Message Details */}
        <div className="w-1/2 p-6">
          {selectedMessage ? (
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Message Details</h3>
                <div className="flex gap-2">
                  <a
                    href={generateWhatsAppLink(selectedMessage.phone, `Hello ${selectedMessage.name}, I received your message: "${selectedMessage.message}". How can I help you?`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg transition-colors flex items-center gap-2"
                    title="Reply on WhatsApp"
                  >
                    <Reply className="w-4 h-4" />
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              <div className="space-y-4 flex-1">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <User className="w-4 h-4 text-green-600" />
                    Customer Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-600">Name:</span>
                      <span>{selectedMessage.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span>{selectedMessage.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{selectedMessage.phone}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-3">Message</h4>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedMessage.message}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-600" />
                    Timestamp
                  </h4>
                  <p className="text-sm text-gray-600">
                    {new Date(selectedMessage.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>

              {!selectedMessage.isRead && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => markAsRead([selectedMessage.id])}
                    className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg transition-colors"
                  >
                    Mark as Read
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              <div className="text-center">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Select a message to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WhatsAppMessages;
