'use client';

import { useState, useEffect } from 'react';
import {
  Bell, CheckCircle, Clock, Award, BookOpen, Check, X, Loader2, Trash2, BellOff
} from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

const getTypeStyle = (type: string, isRead: boolean) => {
  const opacity = isRead ? '/60' : '';
  switch (type) {
    case 'HOMEWORK_APPROVED':
      return {
        icon: <CheckCircle className={`w-5 h-5 text-green-400${opacity}`} />,
        badge: 'bg-green-500/10 border-green-500/30 text-green-400',
        label: 'Approved',
        border: isRead ? 'border-white/10' : 'border-l-4 border-l-green-500 border-white/10'
      };
    case 'HOMEWORK_REJECTED':
      return {
        icon: <X className={`w-5 h-5 text-red-400${opacity}`} />,
        badge: 'bg-red-500/10 border-red-500/30 text-red-400',
        label: 'Revision',
        border: isRead ? 'border-white/10' : 'border-l-4 border-l-red-500 border-white/10'
      };
    case 'MODULE_UNLOCKED':
      return {
        icon: <BookOpen className={`w-5 h-5 text-blue-400${opacity}`} />,
        badge: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
        label: 'New Module',
        border: isRead ? 'border-white/10' : 'border-l-4 border-l-blue-500 border-white/10'
      };
    case 'CERTIFICATE_AVAILABLE':
      return {
        icon: <Award className={`w-5 h-5 text-yellow-400${opacity}`} />,
        badge: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
        label: 'Certificate',
        border: isRead ? 'border-white/10' : 'border-l-4 border-l-yellow-500 border-white/10'
      };
    case 'ENROLLMENT_APPROVED':
      return {
        icon: <CheckCircle className={`w-5 h-5 text-purple-400${opacity}`} />,
        badge: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
        label: 'Enrollment',
        border: isRead ? 'border-white/10' : 'border-l-4 border-l-purple-500 border-white/10'
      };
    default:
      return {
        icon: <Bell className={`w-5 h-5 text-blue-400${opacity}`} />,
        badge: 'bg-blue-500/10 border-blue-500/30 text-blue-300',
        label: 'Notification',
        border: isRead ? 'border-white/10' : 'border-l-4 border-l-blue-400 border-white/10'
      };
  }
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function StudentNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/student/notifications', { credentials: 'include' });
      const data = await res.json();
      if (data.success) setNotifications(data.notifications || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await fetch('/api/student/notifications/read', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ notificationId: id })
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await fetch('/api/student/notifications/read-all', {
        method: 'PATCH',
        credentials: 'include'
      });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/student/notifications?id=${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const filtered = filter === 'unread' ? notifications.filter(n => !n.isRead) : notifications;
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1a1f4c] to-[#0d1b3e] border border-blue-500/20 rounded-2xl p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2 flex items-center gap-3">
              <Bell className="w-8 h-8 text-blue-400" />
              Notifications
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 bg-blue-500 text-white text-sm rounded-full font-medium">
                  {unreadCount}
                </span>
              )}
            </h1>
            <p className="text-blue-200 text-sm sm:text-base">Stay updated with your latest activities.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchNotifications}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 border border-blue-500/30 text-blue-300 rounded-lg hover:bg-blue-600/40 hover:text-white transition-colors font-medium text-sm"
            >
              Refresh
            </button>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors font-medium text-sm shadow-lg shadow-blue-500/20"
              >
                <Check className="w-4 h-4" />
                Mark All Read
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: notifications.length, icon: <Bell className="w-5 h-5 text-blue-400" />, color: 'text-blue-400' },
          { label: 'Unread', value: unreadCount, icon: <Clock className="w-5 h-5 text-orange-400" />, color: 'text-orange-400' },
          { label: 'Homework', value: notifications.filter(n => n.type.startsWith('HOMEWORK')).length, icon: <CheckCircle className="w-5 h-5 text-green-400" />, color: 'text-green-400' },
          { label: 'Certificates', value: notifications.filter(n => n.type === 'CERTIFICATE_AVAILABLE').length, icon: <Award className="w-5 h-5 text-yellow-400" />, color: 'text-yellow-400' }
        ].map((stat) => (
          <div key={stat.label} className="bg-[#1a1f4c]/50 backdrop-blur-sm rounded-xl border border-blue-500/20 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 font-medium">{stat.label}</p>
                <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
              </div>
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(['all', 'unread'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
              filter === f
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                : 'bg-[#1a1f4c]/50 border border-blue-500/20 text-gray-300 hover:text-white hover:bg-[#1a1f4c]'
            }`}
          >
            {f === 'unread' ? `Unread (${unreadCount})` : `All (${notifications.length})`}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="bg-[#1a1f4c]/50 backdrop-blur-sm rounded-xl border border-blue-500/20 p-12 text-center">
          <Loader2 className="w-10 h-10 text-blue-400 mx-auto mb-3 animate-spin" />
          <p className="text-blue-200">Loading notifications...</p>
        </div>
      )}

      {/* Notifications List */}
      {!loading && filtered.length > 0 && (
        <div className="bg-[#1a1f4c]/30 backdrop-blur-sm rounded-xl border border-blue-500/20 overflow-hidden divide-y divide-white/5">
          {filtered.map((notification) => {
            const style = getTypeStyle(notification.type, notification.isRead);
            return (
              <div
                key={notification.id}
                className={`p-5 transition-all hover:bg-white/5 ${!notification.isRead ? 'bg-blue-500/5' : ''} ${notification.isRead ? '' : 'border-l-4 border-l-blue-500'}`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center mt-0.5 ${
                    notification.isRead ? 'bg-white/5' : 'bg-blue-500/10'
                  }`}>
                    {style.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className={`font-semibold ${notification.isRead ? 'text-gray-300' : 'text-white'}`}>
                          {notification.title}
                        </h3>
                        {!notification.isRead && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-500 text-white">
                            New
                          </span>
                        )}
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${style.badge}`}>
                          {style.label}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 whitespace-nowrap">{timeAgo(notification.createdAt)}</span>
                    </div>
                    <p className={`mt-1 text-sm leading-relaxed ${notification.isRead ? 'text-gray-400' : 'text-gray-200'}`}>
                      {notification.message}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {!notification.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="p-1.5 text-blue-400 hover:text-white bg-blue-500/10 hover:bg-blue-500/30 border border-blue-500/20 rounded-lg transition-all"
                        title="Mark as read"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notification.id)}
                      className="p-1.5 text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500/30 border border-red-500/20 rounded-lg transition-all"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!loading && filtered.length === 0 && (
        <div className="bg-[#1a1f4c]/50 backdrop-blur-sm rounded-xl border border-blue-500/20 p-12 sm:p-20 text-center flex flex-col items-center justify-center min-h-[40vh]">
          <div className="w-20 h-20 mx-auto bg-[#0a0e27] border border-blue-500/30 rounded-full flex items-center justify-center mb-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-blue-500/10 animate-pulse"></div>
            <BellOff className="w-10 h-10 text-blue-400 relative z-10" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">
            {filter === 'unread' ? 'All caught up!' : 'No notifications yet'}
          </h3>
          <p className="text-blue-200 max-w-sm mx-auto">
            {filter === 'unread'
              ? "You've read all your notifications. Great job staying on top of things!"
              : 'You\'ll receive notifications when your homework is graded or new modules are added.'}
          </p>
          {filter === 'unread' && (
            <button
              onClick={() => setFilter('all')}
              className="mt-4 px-4 py-2 bg-blue-600/20 border border-blue-500/30 text-blue-300 rounded-lg hover:bg-blue-600/40 hover:text-white transition-colors text-sm"
            >
              View All Notifications
            </button>
          )}
        </div>
      )}
    </div>
  );
}
