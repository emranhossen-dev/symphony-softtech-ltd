'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, BellRing, Check, X, CheckCircle, ExternalLink, Archive, Trash2, Clock, BookOpen, Users, Star, AlertCircle, Calendar, FileText, Award, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';

interface Notification {
  id: string;
  type: 'ASSIGNMENT' | 'PAYMENT' | 'LIVE_CLASS' | 'HOMEWORK' | 'SYSTEM' | 'ENROLLMENT' | 'CERTIFICATE';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
  metadata?: {
    courseName?: string;
    mentorName?: string;
    studentName?: string;
    amount?: number;
    dueDate?: string;
  };
}

interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<string, number>;
}

export default function NotificationSystem() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'ASSIGNMENT' | 'PAYMENT' | 'LIVE_CLASS' | 'HOMEWORK' | 'SYSTEM' | 'ENROLLMENT' | 'CERTIFICATE'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNotifications();
    fetchStats();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications');
      const data = await response.json();
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/notifications/stats');
      const data = await response.json();
      setStats(data.stats);
    } catch (error) {
      console.error('Error fetching notification stats:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch('/api/notifications/read', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId })
      });

      if (response.ok) {
        setNotifications(prev => prev.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        ));
        fetchStats();
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/read-all', {
        method: 'PATCH'
      });

      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        fetchStats();
        toast.success('All notifications marked as read');
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch('/api/notifications/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId })
      });

      if (response.ok) {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        fetchStats();
        toast.success('Notification deleted');
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const archiveNotification = async (notificationId: string) => {
    try {
      const response = await fetch('/api/notifications/archive', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId })
      });

      if (response.ok) {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        fetchStats();
        toast.success('Notification archived');
      }
    } catch (error) {
      console.error('Error archiving notification:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'ASSIGNMENT': return <FileText className="w-4 h-4" />;
      case 'PAYMENT': return <DollarSign className="w-4 h-4" />;
      case 'LIVE_CLASS': return <Calendar className="w-4 h-4" />;
      case 'HOMEWORK': return <BookOpen className="w-4 h-4" />;
      case 'SYSTEM': return <AlertCircle className="w-4 h-4" />;
      case 'ENROLLMENT': return <Users className="w-4 h-4" />;
      case 'CERTIFICATE': return <Award className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'ASSIGNMENT': return 'bg-blue-100 text-blue-600';
      case 'PAYMENT': return 'bg-green-100 text-green-600';
      case 'LIVE_CLASS': return 'bg-purple-100 text-purple-600';
      case 'HOMEWORK': return 'bg-orange-100 text-orange-600';
      case 'SYSTEM': return 'bg-gray-100 text-gray-600';
      case 'ENROLLMENT': return 'bg-indigo-100 text-indigo-600';
      case 'CERTIFICATE': return 'bg-yellow-100 text-yellow-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    return notification.type === filter;
  });

  const unreadCount = stats?.unread || 0;

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        {unreadCount > 0 ? (
          <BellRing className="w-6 h-6 animate-pulse" />
        ) : (
          <Bell className="w-6 h-6" />
        )}
        
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden"
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <Check className="w-4 h-4" />
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setShowDropdown(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex border-b border-gray-200">
            {[
              { id: 'all', label: 'All', count: stats?.total || 0 },
              { id: 'unread', label: 'Unread', count: stats?.unread || 0 },
              { id: 'ASSIGNMENT', label: 'Assignments', count: stats?.byType?.ASSIGNMENT || 0 },
              { id: 'PAYMENT', label: 'Payments', count: stats?.byType?.PAYMENT || 0 },
              { id: 'LIVE_CLASS', label: 'Live Classes', count: stats?.byType?.LIVE_CLASS || 0 },
              { id: 'HOMEWORK', label: 'Homework', count: stats?.byType?.HOMEWORK || 0 }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as any)}
                className={`flex-1 px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                  filter === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className="ml-1 bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="overflow-y-auto max-h-64">
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 transition-colors ${
                      !notification.read ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${getNotificationColor(notification.type)}`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className={`text-sm font-medium ${
                              !notification.read ? 'text-gray-900' : 'text-gray-700'
                            }`}>
                              {notification.title}
                            </h4>
                            <p className={`text-sm mt-1 ${
                              !notification.read ? 'text-gray-600' : 'text-gray-500'
                            }`}>
                              {notification.message}
                            </p>
                            
                            {notification.metadata && (
                              <div className="mt-2 text-xs text-gray-500 space-y-1">
                                {notification.metadata.courseName && (
                                  <p>Course: {notification.metadata.courseName}</p>
                                )}
                                {notification.metadata.mentorName && (
                                  <p>Mentor: {notification.metadata.mentorName}</p>
                                )}
                                {notification.metadata.studentName && (
                                  <p>Student: {notification.metadata.studentName}</p>
                                )}
                                {notification.metadata.amount && (
                                  <p>Amount: ${notification.metadata.amount}</p>
                                )}
                                {notification.metadata.dueDate && (
                                  <p>Due: {new Date(notification.metadata.dueDate).toLocaleDateString()}</p>
                                )}
                              </div>
                            )}
                            
                            <div className="flex items-center gap-2 mt-2">
                              <Clock className="w-3 h-3 text-gray-400" />
                              <span className="text-xs text-gray-500">
                                {new Date(notification.createdAt).toLocaleDateString()} at {new Date(notification.createdAt).toLocaleTimeString()}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1 ml-2">
                            {!notification.read && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="text-blue-600 hover:text-blue-800"
                                title="Mark as read"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}
                            
                            {notification.actionUrl && (
                              <button
                                onClick={() => {
                                  window.open(notification.actionUrl, '_blank');
                                  markAsRead(notification.id);
                                }}
                                className="text-green-600 hover:text-green-800"
                                title="View details"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </button>
                            )}
                            
                            <button
                              onClick={() => archiveNotification(notification.id)}
                              className="text-yellow-600 hover:text-yellow-800"
                              title="Archive"
                            >
                              <Archive className="w-4 h-4" />
                            </button>
                            
                            <button
                              onClick={() => deleteNotification(notification.id)}
                              className="text-red-600 hover:text-red-800"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 text-center">
              <button
                onClick={() => {
                  window.location.href = '/notifications';
                  setShowDropdown(false);
                }}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
