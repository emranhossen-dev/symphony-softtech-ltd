"use client";

import { useState, useEffect, useRef } from 'react';
import { Send, X, MessageCircle, Phone, Mail, Paperclip, Smile, MoreVertical, Video, Image as ImageIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'admin';
  timestamp: Date;
  status?: 'sent' | 'delivered' | 'read';
}

interface LiveChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  contactInfo?: {
    name: string;
    phone: string;
    email: string;
  };
}

const LiveChatPanel = ({ isOpen, onClose, contactInfo }: LiveChatPanelProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contactInfo) {
      // Load existing messages
      loadMessages();
    }
  }, [contactInfo]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = () => {
    // Simulate loading messages from backend
    setMessages([
      {
        id: '1',
        text: 'Hello! I am interested in your courses.',
        sender: 'user',
        timestamp: new Date(Date.now() - 3600000),
        status: 'read'
      },
      {
        id: '2',
        text: 'Hi! Thank you for your interest. Which course are you looking for?',
        sender: 'admin',
        timestamp: new Date(Date.now() - 3500000),
        status: 'read'
      },
      {
        id: '3',
        text: 'I want to know about the web development course.',
        sender: 'user',
        timestamp: new Date(Date.now() - 3000000),
        status: 'read'
      }
    ]);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      text: newMessage,
      sender: 'admin',
      timestamp: new Date(),
      status: 'sent'
    };

    setMessages(prev => [...prev, message]);
    const messageToSend = newMessage;
    setNewMessage('');

    // Try to send via API first, fallback to WhatsApp Web
    try {
      const response = await fetch('/api/whatsapp/send-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: contactInfo?.phone,
          message: messageToSend
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        if (data.method === 'api') {
          // Update message status to delivered
          setMessages(prev => 
            prev.map(m => m.id === message.id ? { ...m, status: 'delivered' as const } : m)
          );
          toast.success('Message sent via WhatsApp API');
        } else if (data.method === 'web' && data.link) {
          // Open WhatsApp Web with the message
          window.open(data.link, '_blank');
          toast.success('Opening WhatsApp Web to send message');
        }
      } else {
        // Fallback to WhatsApp Web
        fallbackToWhatsAppWeb(messageToSend);
      }
    } catch (error) {
      console.error('Error sending message via API, using WhatsApp Web:', error);
      // Fallback to WhatsApp Web
      fallbackToWhatsAppWeb(messageToSend);
    }
  };

  const fallbackToWhatsAppWeb = (message: string) => {
    if (!contactInfo?.phone) return;
    const cleanPhone = contactInfo.phone.replace(/[^0-9]/g, '');
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
    toast.success('Opening WhatsApp Web to send message');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-0 right-6 w-full max-w-lg bg-white rounded-t-2xl shadow-2xl z-50 animate-in slide-in-from-bottom-5 duration-300">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-700 to-indigo-700 text-white p-4 rounded-t-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold">{contactInfo?.name || 'Chat'}</h3>
              <p className="text-xs text-white/70">{contactInfo?.phone}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.open(`tel:${contactInfo?.phone}`, '_blank')}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
              title="Call"
            >
              <Phone className="w-5 h-5" />
            </button>
            <button
              onClick={() => window.location.href = `mailto:${contactInfo?.email}`}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
              title="Email"
            >
              <Mail className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="h-96 overflow-y-auto p-4 bg-gray-50">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                  message.sender === 'admin'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-br-sm'
                    : 'bg-white text-gray-900 border border-gray-200 rounded-bl-sm shadow-sm'
                }`}
              >
                <p className="text-sm leading-relaxed">{message.text}</p>
                <div className={`flex items-center gap-1 mt-1 text-xs ${
                  message.sender === 'admin' ? 'text-emerald-100' : 'text-gray-500'
                }`}>
                  <span>{formatTime(message.timestamp)}</span>
                  {message.sender === 'admin' && message.status === 'read' && (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                    </svg>
                  )}
                  {message.sender === 'admin' && message.status === 'delivered' && (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18 7l-1.41-1.41-6.34 6.34 1.41 1.41L18 7zm4.24-1.41L11.66 16.17 7.48 12l-1.41 1.41L11.66 19l12-12-1.42-1.41zM.41 13.41L6 19l1.41-1.41L1.83 13H.41v.41z"/>
                    </svg>
                  )}
                </div>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white text-gray-900 border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-2 shadow-sm">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex items-center gap-2">
          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
            <Paperclip className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
            <ImageIcon className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
          />
          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
            <Smile className="w-5 h-5" />
          </button>
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="p-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-full hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LiveChatPanel;
