"use client";

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { toast } from 'react-hot-toast';
import { 
  MessageCircle, 
  RefreshCw,
  Send,
  User,
  Mail,
  Phone,
  Clock,
  CheckCircle,
  Sparkles,
  MessageSquare,
  Facebook,
  AtSign,
  Search,
  Trash2,
  Download,
  Moon,
  Sun,
  StickyNote,
  Star,
  X,
  Zap
} from 'lucide-react';

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

export default function LiveChatManagement() {
  const [messages, setMessages] = useState<LiveChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserEmail, setSelectedUserEmail] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sourceFilter, setSourceFilter] = useState<'all' | 'livechat' | 'whatsapp' | 'facebook' | 'email'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [userNotes, setUserNotes] = useState<Record<string, string>>({});
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [currentNote, setCurrentNote] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000); // Auto-refresh every 5 seconds
    return () => clearInterval(interval);
  }, [sourceFilter]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedUserEmail, messages]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const url = sourceFilter === 'all' 
        ? '/api/livechat/messages'
        : `/api/livechat/messages?source=${sourceFilter}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setMessages(data.messages);
      } else {
        toast.error('Failed to fetch messages');
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (messageIds: string[]) => {
    try {
      const response = await fetch('/api/livechat/messages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageIds, isRead: true })
      });
      
      if (response.ok) {
        toast.success('Messages marked as read');
        fetchMessages();
      }
    } catch (error) {
      console.error('Error marking as read:', error);
      toast.error('Failed to mark as read');
    }
  };

  const handleSendReply = async () => {
    if (!replyMessage.trim() || !selectedUserEmail) {
      toast.error('Please select a user and enter a message');
      return;
    }

    // Get user details from messages
    const userMessage = messages.find(m => m.email === selectedUserEmail);
    if (!userMessage) {
      toast.error('User not found');
      return;
    }

    setSending(true);

    try {
      // Send reply to backend with source
      await fetch('/api/livechat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Support Team',
          phone: userMessage.phone,
          email: userMessage.email,
          text: replyMessage,
          sender: 'support',
          source: userMessage.source
        })
      });

      toast.success('Reply sent successfully');
      setReplyMessage('');
      fetchMessages();
    } catch (error) {
      console.error('Error sending reply:', error);
      toast.error('Failed to send reply');
    } finally {
      setSending(false);
    }
  };

  const unreadCount = messages.filter(m => !m.isRead && m.sender === 'user').length;
  const uniqueUsers = Array.from(new Set(messages.map(m => m.email)));
  
  // Get unique users with their last message
  const getUserList = () => {
    const userMap = new Map<string, any>();
    messages.forEach(msg => {
      if (msg.sender === 'user') {
        if (!userMap.has(msg.email)) {
          userMap.set(msg.email, {
            email: msg.email,
            name: msg.name,
            phone: msg.phone,
            source: msg.source,
            lastMessage: msg.text,
            lastTime: msg.timestamp,
            unread: !msg.isRead
          });
        } else {
          const existing = userMap.get(msg.email);
          if (new Date(msg.timestamp) > new Date(existing.lastTime)) {
            userMap.set(msg.email, {
              ...existing,
              lastMessage: msg.text,
              lastTime: msg.timestamp,
              unread: existing.unread || !msg.isRead
            });
          }
        }
      }
    });
    return Array.from(userMap.values()).sort((a, b) => 
      new Date(b.lastTime).getTime() - new Date(a.lastTime).getTime()
    );
  };
  
  const userList = getUserList();
  
  // Get conversation for selected user
  const getConversation = (email: string) => {
    return messages.filter(m => m.email === email).sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  };
  
  const selectedConversation = selectedUserEmail ? getConversation(selectedUserEmail) : [];
  
  // Filter conversation by search query
  const filteredConversation = selectedConversation.filter(msg =>
    msg.text.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Quick reply templates
  const quickReplies = [
    "Thank you for contacting us! How can I help you today?",
    "I'll check that for you right away.",
    "Could you please provide more details?",
    "Thank you for your patience. I'm looking into this.",
    "Is there anything else I can help you with?",
    "We appreciate your feedback!",
    "This has been resolved. Let me know if you need anything else.",
    "Welcome! I'm here to assist you."
  ];
  
  const handleDeleteMessage = async (messageId: string) => {
    try {
      await fetch(`/api/livechat/messages?id=${messageId}`, {
        method: 'DELETE'
      });
      toast.success('Message deleted');
      fetchMessages();
    } catch (error) {
      toast.error('Failed to delete message');
    }
  };
  
  const handleExportConversation = () => {
    if (!selectedUserEmail || filteredConversation.length === 0) return;
    
    const user = userList.find(u => u.email === selectedUserEmail);
    const content = filteredConversation.map(msg => {
      const time = new Date(msg.timestamp).toLocaleString();
      return `[${time}] ${msg.sender === 'user' ? user?.name : 'Support'}: ${msg.text}`;
    }).join('\n\n');
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversation-${user?.name || 'user'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Conversation exported');
  };
  
  const handleSaveNote = () => {
    if (selectedUserEmail) {
      setUserNotes(prev => ({ ...prev, [selectedUserEmail]: currentNote }));
      setShowNoteModal(false);
      setCurrentNote('');
      toast.success('Note saved');
    }
  };
  
  const handleQuickReply = (reply: string) => {
    setReplyMessage(reply);
    setShowQuickReplies(false);
  };

  return (
    <div className={`min-h-screen p-6 transition-colors duration-300 bg-gray-950`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-2xl rounded-3xl p-8 mb-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-pink-500/20"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24 blur-2xl"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-3 flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
                  <MessageCircle className="w-8 h-8 text-white" />
                </div>
                Live Chat Management
              </h1>
              <p className="text-white/90 text-lg">Manage and respond to customer messages in real-time</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30 p-3 rounded-2xl transition-all hover:scale-105 shadow-lg"
                title="Toggle Dark Mode"
              >
                {darkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
              </button>
              <Button
                onClick={() => {
                  const unreadIds = messages.filter(m => !m.isRead && m.sender === 'user').map(m => m.id);
                  if (unreadIds.length > 0) handleMarkAsRead(unreadIds);
                }}
                variant="outline"
                className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30 flex items-center gap-2 rounded-2xl hover:scale-105 transition-all shadow-lg"
              >
                <CheckCircle className="w-5 h-5" />
                Mark All Read
              </Button>
              <Button
                onClick={fetchMessages}
                className="bg-white text-indigo-600 hover:bg-white/90 flex items-center gap-2 rounded-2xl hover:scale-105 transition-all shadow-lg font-semibold"
              >
                <RefreshCw className="w-5 h-5" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="shadow-2xl border-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 blur-2xl"></div>
          <CardContent className="p-8 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm font-medium mb-2 uppercase tracking-wide">Total Messages</p>
                <p className="text-4xl font-bold text-white">{messages.length}</p>
              </div>
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-2xl border-0 bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 blur-2xl"></div>
          <CardContent className="p-8 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm font-medium mb-2 uppercase tracking-wide">Unread</p>
                <p className="text-4xl font-bold text-white">{unreadCount}</p>
              </div>
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
                <Clock className="w-8 h-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-2xl border-0 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 blur-2xl"></div>
          <CardContent className="p-8 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm font-medium mb-2 uppercase tracking-wide">Unique Users</p>
                <p className="text-4xl font-bold text-white">{uniqueUsers.length}</p>
              </div>
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
                <User className="w-8 h-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Source Filter */}
      <Card className={`shadow-2xl border-0 mb-8 bg-white/80 backdrop-blur-sm rounded-3xl overflow-hidden`}>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-bold text-gray-700 uppercase tracking-wide">Filter by Source:</span>
            <button
              onClick={() => setSourceFilter('all')}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all hover:scale-105 shadow-md ${
                sourceFilter === 'all'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSourceFilter('livechat')}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all hover:scale-105 shadow-md flex items-center gap-2 ${
                sourceFilter === 'livechat'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              Live Chat
            </button>
            <button
              onClick={() => setSourceFilter('whatsapp')}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all hover:scale-105 shadow-md flex items-center gap-2 ${
                sourceFilter === 'whatsapp'
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </button>
            <button
              onClick={() => setSourceFilter('facebook')}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all hover:scale-105 shadow-md flex items-center gap-2 ${
                sourceFilter === 'facebook'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <Facebook className="w-4 h-4" />
              Facebook
            </button>
            <button
              onClick={() => setSourceFilter('email')}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all hover:scale-105 shadow-md flex items-center gap-2 ${
                sourceFilter === 'email'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <AtSign className="w-4 h-4" />
              Email
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side - User List */}
        <div className="lg:col-span-4">
          <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm h-full flex flex-col rounded-3xl overflow-hidden" style={{ height: 'calc(100vh - 350px)' }}>
            <CardHeader className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 border-b flex-shrink-0 p-6">
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                  <User className="w-5 h-5 text-white" />
                </div>
                <span className="text-white font-bold text-lg">Users ({userList.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-hidden flex flex-col">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : userList.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-black font-medium">No users yet</p>
                  <p className="text-gray-600 text-sm mt-1">Messages will appear here</p>
                </div>
              ) : (
                <div className="overflow-y-auto flex-1">
                  {userList.map((user) => (
                    <div
                      key={user.email}
                      onClick={() => setSelectedUserEmail(user.email)}
                      className={`p-5 border-b border-gray-100 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 cursor-pointer transition-all duration-300 ${
                        selectedUserEmail === user.email ? 'bg-gradient-to-r from-indigo-100 to-purple-100 border-l-4 border-l-indigo-600' : ''
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/30">
                          <span className="text-white font-bold text-lg">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-bold text-gray-900 text-base truncate">{user.name}</p>
                            <span className="text-xs text-gray-500 font-medium">
                              {new Date(user.lastTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2 mb-2">{user.lastMessage}</p>
                          <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                              user.source === 'livechat' ? 'bg-blue-100 text-blue-700' :
                              user.source === 'whatsapp' ? 'bg-green-100 text-green-700' :
                              user.source === 'facebook' ? 'bg-blue-100 text-blue-800' :
                              'bg-purple-100 text-purple-700'
                            }`}>
                              {user.source === 'livechat' ? 'Live Chat' :
                               user.source === 'whatsapp' ? 'WhatsApp' :
                               user.source === 'facebook' ? 'Facebook' :
                               'Email'}
                            </span>
                            {user.unread && (
                              <span className="w-3 h-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-full animate-pulse shadow-lg shadow-red-500/30"></span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Side - Chat Conversation */}
        <div className="lg:col-span-8">
          <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm h-full flex flex-col rounded-3xl overflow-hidden" style={{ height: 'calc(100vh - 350px)' }}>
            <CardHeader className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 border-b flex-shrink-0 p-6">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-white font-bold text-lg">Conversation</span>
                </CardTitle>
                {selectedUserEmail && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowQuickReplies(!showQuickReplies)}
                      className="p-2.5 bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-xl hover:bg-white/30 transition-all hover:scale-105 shadow-lg"
                      title="Quick Replies"
                    >
                      <Zap className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {
                        setCurrentNote(userNotes[selectedUserEmail] || '');
                        setShowNoteModal(true);
                      }}
                      className="p-2.5 bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-xl hover:bg-white/30 transition-all hover:scale-105 shadow-lg"
                      title="Add Note"
                    >
                      <StickyNote className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleExportConversation}
                      className="p-2.5 bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-xl hover:bg-white/30 transition-all hover:scale-105 shadow-lg"
                      title="Export Conversation"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
              {selectedUserEmail && (
                <div className="flex items-center gap-3 mt-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search messages..."
                      className="w-full pl-11 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm font-medium"
                    />
                  </div>
                </div>
              )}
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-hidden flex flex-col">
              {!selectedUserEmail ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageCircle className="w-10 h-10 text-gray-400" />
                    </div>
                    <p className="text-black font-medium">Select a user</p>
                    <p className="text-gray-600 text-sm mt-1">Click on a user to view conversation</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Chat Messages */}
                  <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-purple-300 scrollbar-track-purple-100 bg-gradient-to-br from-indigo-50/50 to-purple-50/50">
                    {filteredConversation.length === 0 ? (
                      <div className="text-center py-16">
                        <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <MessageCircle className="w-12 h-12 text-indigo-400" />
                        </div>
                        <p className="text-gray-600 font-medium">No messages yet</p>
                        <p className="text-gray-500 text-sm mt-2">Start a conversation by sending a message</p>
                      </div>
                    ) : (
                      <>
                        {userNotes[selectedUserEmail!] && (
                          <div className="mb-4 p-4 bg-gradient-to-r from-yellow-100 to-amber-100 border border-yellow-300 rounded-2xl shadow-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <StickyNote className="w-5 h-5 text-yellow-600" />
                              <span className="text-sm font-bold text-yellow-800 uppercase tracking-wide">Note</span>
                            </div>
                            <p className="text-sm text-yellow-700 font-medium">{userNotes[selectedUserEmail!]}</p>
                          </div>
                        )}
                        {showQuickReplies && (
                          <div className="mb-4 p-4 bg-gradient-to-r from-indigo-100 to-purple-100 border border-indigo-300 rounded-2xl shadow-lg">
                            <p className="text-xs font-bold text-indigo-800 uppercase tracking-wide mb-3">Quick Replies</p>
                            <div className="flex flex-wrap gap-2">
                              {quickReplies.map((reply, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => handleQuickReply(reply)}
                                  className="px-4 py-2 bg-white border border-indigo-200 text-indigo-700 rounded-full text-sm font-semibold hover:bg-indigo-50 hover:scale-105 transition-all shadow-md"
                                >
                                  {reply.substring(0, 35)}...
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="space-y-4">
                          {filteredConversation.map((msg) => (
                            <div
                              key={msg.id}
                              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} group`}
                            >
                              <div
                                className={`max-w-[75%] rounded-2xl px-5 py-4 relative shadow-lg ${
                                  msg.sender === 'user'
                                    ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-br-2xl shadow-indigo-500/30'
                                    : 'bg-white border border-gray-200 text-gray-800 rounded-bl-2xl'
                                }`}
                              >
                                <p className="text-base leading-relaxed font-medium">{msg.text}</p>
                                <div className={`flex items-center justify-between mt-2 text-xs ${
                                  msg.sender === 'user' ? 'text-white/80' : 'text-gray-400'
                                }`}>
                                  <div className="flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span className="font-medium">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                  </div>
                                  <button
                                    onClick={() => handleDeleteMessage(msg.id)}
                                    className="opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all hover:scale-110"
                                    title="Delete message"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                          <div ref={messagesEndRef} />
                        </div>
                      </>
                    )}
                  </div>

                  {/* Reply Input */}
                  <div className="p-5 bg-gradient-to-r from-white to-indigo-50 border-t border-indigo-100 flex-shrink-0">
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendReply()}
                        placeholder="Type your reply..."
                        className="flex-1 px-5 py-4 border-2 border-indigo-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm font-medium shadow-md"
                      />
                      <Button
                        onClick={handleSendReply}
                        disabled={sending || !replyMessage.trim()}
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 flex items-center gap-2 rounded-2xl px-6 py-4 shadow-lg hover:shadow-xl hover:scale-105 transition-all font-semibold"
                      >
                        {sending ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Sending...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-5 h-5" />
                            <span>Send</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <StickyNote className="w-5 h-5 text-yellow-600" />
                Add Note
              </h3>
              <button
                onClick={() => setShowNoteModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-all"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <textarea
              value={currentNote}
              onChange={(e) => setCurrentNote(e.target.value)}
              placeholder="Add a note about this user..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
            />
            <div className="flex gap-3 mt-4">
              <Button
                onClick={() => setShowNoteModal(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveNote}
                className="flex-1 bg-gradient-to-r from-slate-700 to-indigo-700 text-white hover:from-slate-800 hover:to-indigo-800"
              >
                Save Note
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
