"use client";

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { toast } from 'react-hot-toast';
import { 
  MessageCircle, 
  RefreshCw,
  Trash2,
  Search,
  User,
  Mail,
  Phone,
  Clock,
  Eye,
  CheckCircle,
  XCircle,
  CheckCheck,
  Sparkles,
  Filter,
  Calendar,
  ArrowRight,
  Pin,
  Archive,
  Star,
  MoreVertical,
  Download,
  Volume2,
  VolumeX,
  MessageSquare,
  Reply,
  ExternalLink,
  MessageCircle as ChatIcon
} from 'lucide-react';
import LiveChatPanel from '@/components/admin/LiveChatPanel';

interface WhatsAppMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  isPinned?: boolean;
  isArchived?: boolean;
  priority?: 'high' | 'medium' | 'low';
}

export default function WhatsAppMessages() {
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<WhatsAppMessage | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'unread' | 'read'>('all');
  const [filterPriority, setFilterPriority] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showChatPanel, setShowChatPanel] = useState(false);
  const [chatContact, setChatContact] = useState<{ name: string; phone: string; email: string } | undefined>(undefined);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000); // Auto-refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  // Play notification sound
  useEffect(() => {
    if (soundEnabled && selectedIds.length === 0) {
      const unreadCount = messages.filter(m => !m.isRead).length;
      if (unreadCount > 0) {
        // Play notification sound
        try {
          const audio = new Audio('/notification.mp3');
          audio.volume = 0.5;
          audio.play().catch(() => {});
        } catch (e) {
          // Ignore audio errors
        }
      }
    }
  }, [messages]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/whatsapp/messages');
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

  const handleMarkAsRead = async (messageId: string) => {
    try {
      const response = await fetch(`/api/whatsapp/messages/${messageId}/read`, {
        method: 'POST'
      });
      
      if (response.ok) {
        toast.success('Message marked as read');
        fetchMessages();
      } else {
        toast.error('Failed to mark as read');
      }
    } catch (error) {
      console.error('Error marking as read:', error);
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const unreadIds = messages.filter(m => !m.isRead).map(m => m.id);
      if (unreadIds.length === 0) {
        toast.success('No unread messages');
        return;
      }

      const response = await fetch('/api/whatsapp/messages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageIds: unreadIds, isRead: true })
      });
      
      if (response.ok) {
        toast.success(`Marked ${unreadIds.length} messages as read`);
        fetchMessages();
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Failed to mark all as read');
    }
  };

  const handleDelete = async (messageId: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    
    try {
      const response = await fetch(`/api/whatsapp/messages/${messageId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        toast.success('Message deleted successfully');
        fetchMessages();
        if (selectedMessage?.id === messageId) {
          setSelectedMessage(null);
        }
      } else {
        toast.error('Failed to delete message');
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Failed to delete message');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      toast.success('No messages selected');
      return;
    }
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} messages?`)) return;
    
    try {
      await Promise.all(
        selectedIds.map(id => fetch(`/api/whatsapp/messages/${id}`, { method: 'DELETE' }))
      );
      toast.success(`Deleted ${selectedIds.length} messages`);
      setSelectedIds([]);
      setShowBulkActions(false);
      fetchMessages();
    } catch (error) {
      console.error('Error bulk deleting:', error);
      toast.error('Failed to delete messages');
    }
  };

  const handleBulkMarkAsRead = async () => {
    if (selectedIds.length === 0) {
      toast.success('No messages selected');
      return;
    }
    
    try {
      const response = await fetch('/api/whatsapp/messages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageIds: selectedIds, isRead: true })
      });
      
      if (response.ok) {
        toast.success(`Marked ${selectedIds.length} messages as read`);
        setSelectedIds([]);
        setShowBulkActions(false);
        fetchMessages();
      }
    } catch (error) {
      console.error('Error bulk marking:', error);
      toast.error('Failed to mark messages');
    }
  };

  const handleToggleSelect = (messageId: string) => {
    setSelectedIds(prev => 
      prev.includes(messageId) 
        ? prev.filter(id => id !== messageId)
        : [...prev, messageId]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredMessages.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredMessages.map(m => m.id));
    }
  };

  const handleExportCSV = () => {
    const csvContent = [
      ['Name', 'Email', 'Phone', 'Message', 'Date', 'Status'].join(','),
      ...filteredMessages.map(m => [
        m.name,
        m.email,
        m.phone,
        m.message.replace(/,/g, ' '),
        m.createdAt,
        m.isRead ? 'Read' : 'Unread'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `whatsapp-messages-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Messages exported successfully');
  };

  const openWhatsApp = (phone: string) => {
    const cleanedPhone = phone.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleanedPhone}`, '_blank');
  };

  const openLiveChat = (message: WhatsAppMessage) => {
    setChatContact({
      name: message.name,
      phone: message.phone,
      email: message.email
    });
    setShowChatPanel(true);
  };

  const closeChatPanel = () => {
    setShowChatPanel(false);
    setChatContact(undefined);
  };

  const filteredMessages = messages.filter(msg => {
    const matchesSearch = 
      msg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.phone.includes(searchTerm) ||
      msg.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      filterStatus === 'all' ||
      (filterStatus === 'unread' && !msg.isRead) ||
      (filterStatus === 'read' && msg.isRead);
    
    const matchesPriority = 
      filterPriority === 'all' ||
      filterPriority === msg.priority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const unreadCount = messages.filter(m => !m.isRead).length;
  const readCount = messages.filter(m => m.isRead).length;
  const highPriorityCount = messages.filter(m => m.priority === 'high').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-700 via-indigo-700 to-slate-800 shadow-2xl">
        <div className="px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <MessageCircle className="w-10 h-10" />
                WhatsApp Messages
              </h1>
              <p className="text-white/80">Manage messages from website contact form</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setSoundEnabled(!soundEnabled)}
                variant="outline"
                className="bg-white/20 border-white/30 text-white hover:bg-white/30"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </Button>
              <Button
                onClick={handleExportCSV}
                variant="outline"
                className="bg-white/20 border-white/30 text-white hover:bg-white/30 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export
              </Button>
              <Button
                onClick={handleMarkAllAsRead}
                variant="outline"
                className="bg-white/20 border-white/30 text-white hover:bg-white/30 flex items-center gap-2"
              >
                <CheckCheck className="w-4 h-4" />
                Mark All Read
              </Button>
              <Button
                onClick={fetchMessages}
                className="bg-white text-slate-700 hover:bg-white/90 flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/80 mb-1">Total Messages</p>
                    <p className="text-4xl font-bold text-white">{messages.length}</p>
                  </div>
                  <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                    <MessageCircle className="w-7 h-7 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/80 mb-1">Unread</p>
                    <p className="text-4xl font-bold text-amber-300">{unreadCount}</p>
                  </div>
                  <div className="w-14 h-14 bg-amber-500/30 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                    <Clock className="w-7 h-7 text-amber-300" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/80 mb-1">High Priority</p>
                    <p className="text-4xl font-bold text-rose-300">{highPriorityCount}</p>
                  </div>
                  <div className="w-14 h-14 bg-rose-500/30 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                    <Star className="w-7 h-7 text-rose-300" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/80 mb-1">Read</p>
                    <p className="text-4xl font-bold text-emerald-300">{readCount}</p>
                  </div>
                  <div className="w-14 h-14 bg-emerald-500/30 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                    <CheckCircle className="w-7 h-7 text-emerald-300" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {showBulkActions && (
        <div className="mx-6 mt-6 p-4 bg-white rounded-xl shadow-lg border border-slate-200 flex items-center justify-between animate-in slide-in-from-top-2">
          <div className="flex items-center gap-4">
            <span className="text-sm text-black">{selectedIds.length} messages selected</span>
            <Button
              onClick={handleSelectAll}
              variant="ghost"
              size="sm"
            >
              {selectedIds.length === filteredMessages.length ? 'Deselect All' : 'Select All'}
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleBulkMarkAsRead}
              size="sm"
              className="bg-emerald-600 text-white hover:bg-emerald-700"
            >
              <CheckCheck className="w-4 h-4 mr-2" />
              Mark Read
            </Button>
            <Button
              onClick={handleBulkDelete}
              size="sm"
              variant="destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
            <Button
              onClick={() => {
                setSelectedIds([]);
                setShowBulkActions(false);
              }}
              size="sm"
              variant="ghost"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Messages List */}
          <div className="lg:col-span-2">
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-indigo-50 border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-600" />
                    All Messages
                  </CardTitle>
                  <div className="flex items-center gap-3">
                    {/* Filter Buttons */}
                    <div className="flex items-center gap-2 bg-white rounded-lg p-1 shadow-sm">
                      <button
                        onClick={() => setFilterStatus('all')}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                          filterStatus === 'all' 
                            ? 'bg-slate-600 text-white shadow-md' 
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        All
                      </button>
                      <button
                        onClick={() => setFilterStatus('unread')}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                          filterStatus === 'unread' 
                            ? 'bg-amber-500 text-white shadow-md' 
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        Unread
                      </button>
                      <button
                        onClick={() => setFilterStatus('read')}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                          filterStatus === 'read' 
                            ? 'bg-emerald-500 text-white shadow-md' 
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        Read
                      </button>
                    </div>
                    <Button
                      onClick={() => setShowBulkActions(!showBulkActions)}
                      variant="ghost"
                      size="sm"
                    >
                      <Filter className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search messages..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                    />
                  </div>
                  <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value as any)}
                    className="px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white/50 backdrop-blur-sm"
                  >
                    <option value="all">All Priority</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  </div>
                ) : filteredMessages.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageCircle className="w-10 h-10 text-indigo-400" />
                    </div>
                    <p className="text-black text-lg font-medium">No messages found</p>
                    <p className="text-gray-600 text-sm mt-1">Try adjusting your search or filter</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {filteredMessages.map((message, index) => (
                      <div
                        key={message.id}
                        onClick={() => setSelectedMessage(message)}
                        className={`p-4 hover:bg-indigo-50/50 cursor-pointer transition-all duration-200 ${
                          !message.isRead ? 'bg-amber-50/30' : ''
                        } ${selectedMessage?.id === message.id ? 'bg-indigo-100/50 border-l-4 border-indigo-600' : ''}`}
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="flex items-start gap-4">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(message.id)}
                            onChange={() => handleToggleSelect(message.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="mt-1 flex-shrink-0"
                          />
                          <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold text-black">{message.name}</p>
                              {!message.isRead && (
                                <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                              )}
                              {message.priority === 'high' && (
                                <span className="px-2 py-0.5 bg-rose-100 text-rose-600 text-xs rounded-full font-medium">
                                  High
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-800 line-clamp-2">{message.message}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(message.createdAt).toLocaleDateString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(message.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                openLiveChat(message);
                              }}
                              className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700"
                            >
                              <ChatIcon className="w-4 h-4" />
                            </Button>
                            <ArrowRight className="w-5 h-5 text-gray-400" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Message Detail Panel */}
          <div className="lg:col-span-1">
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm sticky top-6">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-indigo-50 border-b">
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-indigo-600" />
                  Message Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {selectedMessage ? (
                  <div className="space-y-6">
                    {/* WhatsApp-style Message Bubble */}
                    <div className="flex justify-end">
                      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 max-w-[85%] shadow-lg">
                        <p className="text-sm leading-relaxed">{selectedMessage.message}</p>
                        <div className="flex items-center justify-end gap-1 mt-1">
                          <span className="text-xs text-emerald-100">
                            {new Date(selectedMessage.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                          <CheckCircle className="w-3 h-3 text-emerald-100" />
                        </div>
                      </div>
                    </div>

                    {/* Sender Info */}
                    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-slate-50 to-indigo-50 rounded-2xl">
                      <div className="w-14 h-14 bg-gradient-to-br from-slate-600 to-indigo-600 rounded-full flex items-center justify-center">
                        <User className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-black">{selectedMessage.name}</p>
                        <p className="text-sm text-gray-700">{selectedMessage.email}</p>
                      </div>
                    </div>

                    {/* Contact Details */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <Mail className="w-5 h-5 text-indigo-600" />
                        <div className="flex-1">
                          <p className="text-xs text-gray-600">Email</p>
                          <p className="font-medium text-black">{selectedMessage.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <Phone className="w-5 h-5 text-indigo-600" />
                        <div className="flex-1">
                          <p className="text-xs text-gray-600">Phone</p>
                          <p className="font-medium text-black">{selectedMessage.phone}</p>
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-black mb-2">Quick Actions</p>
                      <Button
                        onClick={() => openLiveChat(selectedMessage)}
                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 flex items-center justify-center gap-2"
                      >
                        <ChatIcon className="w-4 h-4" />
                        Live Chat
                      </Button>
                      <Button
                        onClick={() => openWhatsApp(selectedMessage.phone)}
                        className="w-full bg-gradient-to-r from-slate-600 to-indigo-600 text-white hover:from-slate-700 hover:to-indigo-700 flex items-center justify-center gap-2"
                      >
                        <MessageSquare className="w-4 h-4" />
                        Reply on WhatsApp
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => window.location.href = `mailto:${selectedMessage.email}`}
                        variant="outline"
                        className="w-full border-indigo-200 text-indigo-600 hover:bg-indigo-50 flex items-center justify-center gap-2"
                      >
                        <Mail className="w-4 h-4" />
                        Reply via Email
                      </Button>
                    </div>

                    {/* Timestamp */}
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      <p>Sent: {new Date(selectedMessage.createdAt).toLocaleString()}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      {!selectedMessage.isRead && (
                        <Button
                          onClick={() => handleMarkAsRead(selectedMessage.id)}
                          className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Mark as Read
                        </Button>
                      )}
                      <Button
                        onClick={() => handleDelete(selectedMessage.id)}
                        variant="outline"
                        className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Eye className="w-10 h-10 text-gray-400" />
                    </div>
                    <p className="text-black font-medium">Select a message</p>
                    <p className="text-gray-600 text-sm mt-1">Click on a message to view details</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Live Chat Panel */}
      <LiveChatPanel
        isOpen={showChatPanel}
        onClose={closeChatPanel}
        contactInfo={chatContact}
      />
    </div>
  );
}
