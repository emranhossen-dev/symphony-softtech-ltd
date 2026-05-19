"use client";

import { useState, useEffect, useRef, createContext, useContext } from 'react';
import { MessageCircle, X, Send, Minimize2, Maximize2, User, Clock, Phone, Mail } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface LiveChatContextType {
  openChat: () => void;
  closeChat: () => void;
}

const LiveChatContext = createContext<LiveChatContextType | undefined>(undefined);

export const useLiveChat = () => {
  const context = useContext(LiveChatContext);
  if (!context) {
    // Return no-op functions if context is not available
    return {
      openChat: () => console.log('LiveChatWidget not available'),
      closeChat: () => console.log('LiveChatWidget not available')
    };
  }
  return context;
};

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'support';
  timestamp: Date;
}

interface UserInfo {
  name: string;
  phone: string;
  email: string;
}

interface LiveChatMessage {
  id: string;
  name: string;
  phone: string;
  email: string;
  text: string;
  sender: 'user' | 'support';
  timestamp: string;
  isRead: boolean;
}

const LiveChatWidget = ({ children }: { children?: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const openChat = () => setIsOpen(true);
  const closeChat = () => setIsOpen(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);
  const [greetingDismissed, setGreetingDismissed] = useState(false);

  // Auto-show greeting popup after 3 seconds
  useEffect(() => {
    if (greetingDismissed || isOpen) return;
    const timer = setTimeout(() => {
      setShowGreeting(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, [greetingDismissed, isOpen]);

  // Hide greeting when chat opens
  useEffect(() => {
    if (isOpen) setShowGreeting(false);
  }, [isOpen]);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInfo, setUserInfo] = useState<UserInfo>({ name: '', phone: '', email: '' });
  const [showForm, setShowForm] = useState(true);
  const [userSessionId, setUserSessionId] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Poll for new support replies
  useEffect(() => {
    if (!showForm && userSessionId) {
      const interval = setInterval(async () => {
        try {
          const response = await fetch('/api/livechat/messages');
          const data = await response.json();
          
          if (data.success) {
            // Filter messages for this user's email from support
            const userMessages = data.messages.filter((m: LiveChatMessage) => 
              m.email === userInfo.email && m.sender === 'support'
            );
            
            setMessages(prev => {
              const existingSupportIds = prev.filter(m => m.sender === 'support').map(m => m.id);
              const newSupportMessages = userMessages.filter((m: LiveChatMessage) => 
                !existingSupportIds.includes(m.id)
              );
              
              if (newSupportMessages.length > 0) {
                toast.success('New message from support!');
                return [...prev, ...newSupportMessages.map((m: LiveChatMessage) => ({
                  id: m.id,
                  text: m.text,
                  sender: 'support' as const,
                  timestamp: new Date(m.timestamp)
                }))];
              }
              return prev;
            });
          }
        } catch (error) {
          console.error('Error polling for messages:', error);
        }
      }, 3000); // Poll every 3 seconds
      
      return () => clearInterval(interval);
    }
  }, [showForm, userSessionId, userInfo.email]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInfo.name || !userInfo.phone || !userInfo.email) {
      toast.error('Please fill in all fields');
      return;
    }
    
    // Generate session ID
    const sessionId = `${userInfo.email}-${Date.now()}`;
    setUserSessionId(sessionId);
    setShowForm(false);
    toast.success('Welcome to live chat!');
    
    // Send welcome message to backend
    try {
      await fetch('/api/livechat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: userInfo.name,
          phone: userInfo.phone,
          email: userInfo.email,
          text: `User joined live chat - ${userInfo.name}`,
          sender: 'user',
          source: 'livechat'
        })
      });
    } catch (error) {
      console.error('Error sending join message:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: message,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageToSend = message;
    setMessage('');

    // Send message to backend
    try {
      await fetch('/api/livechat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: userInfo.name,
          phone: userInfo.phone,
          email: userInfo.email,
          text: messageToSend,
          sender: 'user',
          source: 'livechat'
        })
      });
    } catch (error) {
      console.error('Error sending message to backend:', error);
    }
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

  if (!isOpen) {
    return (
      <LiveChatContext.Provider value={{ openChat, closeChat }}>
        {children}
        {/* Greeting Popup Bubble */}
        {showGreeting && !greetingDismissed && (
          <div className="fixed bottom-24 right-6 z-50 animate-in slide-in-from-bottom-3 fade-in duration-500">
            <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 max-w-[260px]" style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}>
              <button
                onClick={(e) => { e.stopPropagation(); setGreetingDismissed(true); setShowGreeting(false); }}
                className="absolute -top-2 -right-2 w-6 h-6 bg-gray-200 hover:bg-red-500 hover:text-white text-gray-500 rounded-full flex items-center justify-center transition-all duration-200 shadow-md text-xs font-bold"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-gradient-to-r from-slate-700 to-indigo-700 rounded-full flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800 leading-snug">Symphony Institute-এ স্বাগতম! 👋</p>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">কিছু জানতে চাইলে আমাদের বলুন</p>
                </div>
              </div>
              {/* Speech bubble arrow */}
              <div className="absolute -bottom-2 right-8 w-4 h-4 bg-white border-r border-b border-gray-200 transform rotate-45"></div>
            </div>
          </div>
        )}

        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-slate-700 to-indigo-700 rounded-full shadow-2xl hover:shadow-indigo-500/40 transition-all duration-300 hover:scale-110 flex items-center justify-center group z-50"
        >
          <MessageCircle className="w-6 h-6 text-white" />
          <span className="absolute inset-0 rounded-full bg-indigo-400 animate-ping opacity-20"></span>
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white animate-bounce">
            1
          </span>
          <div className="absolute bottom-16 right-0 bg-gray-900 text-white px-3 py-1.5 rounded-lg text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Live Chat
          </div>
        </button>
      </LiveChatContext.Provider>
    );
  }

  return (
    <LiveChatContext.Provider value={{ openChat, closeChat }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50">
      {!isMinimized && (
        <div className="absolute bottom-16 right-0 w-80 bg-gradient-to-br from-slate-800 via-indigo-900 to-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-indigo-500 animate-in slide-in-from-bottom-5 duration-300 flex flex-col" style={{ height: showForm ? '400px' : '500px' }}>
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-700 to-indigo-700 p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Live Support</h3>
                  <p className="text-xs text-white/70 flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    Online
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsMinimized(true)}
                  className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-full transition-all"
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-full transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Form - Show first */}
          {showForm ? (
            <div className="flex-1 p-4 bg-slate-900 overflow-y-auto">
              <p className="text-sm font-semibold text-white mb-3">Please provide your details</p>
              <form onSubmit={handleFormSubmit} className="space-y-3">
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-indigo-300" />
                  <input
                    type="text"
                    value={userInfo.name}
                    onChange={(e) => setUserInfo(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Your Name *"
                    required
                    className="w-full pl-9 pr-3 py-2 border border-indigo-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm bg-slate-800 text-white shadow-sm placeholder-gray-400"
                  />
                </div>

                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 w-4 h-4 text-indigo-300" />
                  <input
                    type="tel"
                    value={userInfo.phone}
                    onChange={(e) => setUserInfo(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Your Phone *"
                    required
                    className="w-full pl-9 pr-3 py-2 border border-indigo-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm bg-slate-800 text-white shadow-sm placeholder-gray-400"
                  />
                </div>

                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-indigo-300" />
                  <input
                    type="email"
                    value={userInfo.email}
                    onChange={(e) => setUserInfo(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Your Email *"
                    required
                    className="w-full pl-9 pr-3 py-2 border border-indigo-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm bg-slate-800 text-white shadow-sm placeholder-gray-400"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-slate-700 to-indigo-700 text-white py-2.5 rounded-lg hover:from-slate-800 hover:to-indigo-800 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-indigo-500/25"
                >
                  <Send className="w-4 h-4" />
                  <span className="font-medium text-sm">Start Chat</span>
                </button>
              </form>
            </div>
          ) : (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 bg-slate-900">
                <div className="space-y-4">
                  {/* Welcome Message */}
                  <div className="flex justify-start">
                    <div className="bg-indigo-600 border border-indigo-500 rounded-2xl rounded-bl-none px-4 py-2 max-w-[80%] shadow-sm">
                      <p className="text-sm text-white">
                        👋 Hello {userInfo.name}! Welcome to Symphony Institute. How can I help you today?
                      </p>
                      <div className="flex items-center gap-1 mt-1 text-xs text-indigo-200">
                        <Clock className="w-2 h-2" />
                        <span>Just now</span>
                      </div>
                    </div>
                  </div>

                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                          msg.sender === 'user'
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-sm'
                            : 'bg-indigo-800 border border-indigo-500 text-white rounded-bl-sm shadow-sm'
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{msg.text}</p>
                        <div className={`flex items-center gap-1 mt-1 text-xs ${
                          msg.sender === 'user' ? 'text-white/70' : 'text-gray-400'
                        }`}>
                          <Clock className="w-2 h-2" />
                          <span>{formatTime(msg.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Input */}
              <div className="p-4 bg-slate-900 border-t border-indigo-500">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-2 bg-slate-800 text-white rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm placeholder-gray-400 border border-indigo-500"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!message.trim()}
                    className="p-2 bg-gradient-to-r from-slate-700 to-indigo-700 text-white rounded-full hover:from-slate-800 hover:to-indigo-800 disabled:opacity-50 transition-all"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Minimized Button */}
      {isMinimized && (
        <button
          onClick={() => setIsMinimized(false)}
          className="absolute bottom-16 right-0 bg-gradient-to-r from-slate-700 to-indigo-700 text-white px-4 py-2 rounded-full shadow-lg hover:shadow-indigo-500/40 transition-all flex items-center gap-2"
        >
          <MessageCircle className="w-4 h-4" />
          <span className="text-sm font-medium">Chat</span>
          <Maximize2 className="w-4 h-4" />
        </button>
      )}

      {/* Main Toggle Button (when chat is open) */}
      <button
        onClick={() => setIsOpen(false)}
        className="w-14 h-14 bg-gradient-to-r from-slate-700 to-indigo-700 rounded-full shadow-2xl hover:shadow-indigo-500/40 transition-all duration-300 hover:scale-110 flex items-center justify-center"
      >
        <X className="w-6 h-6 text-white" />
      </button>
    </div>
    </LiveChatContext.Provider>
  );
};

export default LiveChatWidget;
