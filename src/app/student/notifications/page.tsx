'use client';

import { useState } from 'react';
import { Bell, CheckCircle, Clock, Award, Calendar, BookOpen, User, Check, X } from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
}

export default function StudentNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Course Completed!',
      message: 'Congratulations! You have successfully completed Web Development Basics course.',
      type: 'success',
      isRead: false,
      createdAt: '2024-01-15T10:30:00Z',
      actionUrl: '/student/certificates'
    },
    {
      id: '2',
      title: 'New Homework Assignment',
      message: 'A new assignment "React Component Library" has been posted for your React Advanced Concepts course.',
      type: 'info',
      isRead: false,
      createdAt: '2024-01-14T16:45:00Z',
      actionUrl: '/student/homework'
    },
    {
      id: '3',
      title: 'Homework Graded',
      message: 'Your submission for "JavaScript Calculator" has been graded. You scored 92%!',
      type: 'success',
      isRead: true,
      createdAt: '2024-01-13T11:20:00Z',
      actionUrl: '/student/homework'
    },
    {
      id: '4',
      title: 'Live Class Reminder',
      message: 'Don\'t forget! Live class for Node.js Backend Development starts in 1 hour.',
      type: 'warning',
      isRead: true,
      createdAt: '2024-01-12T14:30:00Z'
    },
    {
      id: '5',
      title: 'Certificate Available',
      message: 'Your certificate for CSS & Responsive Design is ready for download.',
      type: 'info',
      isRead: true,
      createdAt: '2024-01-11T09:15:00Z',
      actionUrl: '/student/certificates'
    },
    {
      id: '6',
      title: 'Payment Received',
      message: 'We have received your payment for React Advanced Concepts course.',
      type: 'success',
      isRead: true,
      createdAt: '2024-01-10T13:00:00Z'
    },
    {
      id: '7',
      title: 'Profile Update Required',
      message: 'Please update your profile information to ensure smooth communication.',
      type: 'warning',
      isRead: false,
      createdAt: '2024-01-09T08:30:00Z',
      actionUrl: '/student/profile'
    },
    {
      id: '8',
      title: 'Course Enrollment Confirmed',
      message: 'Your enrollment for Python Programming has been confirmed.',
      type: 'success',
      isRead: true,
      createdAt: '2024-01-08T15:45:00Z'
    }
  ]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'error':
        return <X className="w-5 h-5 text-red-600" />;
      case 'info':
      default:
        return <Bell className="w-5 h-5 text-blue-600" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'info':
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  const handleDeleteNotification = (notificationId: string) => {
    setNotifications(prev =>
      prev.filter(notification => notification.id !== notificationId)
    );
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-1">Stay updated with your latest activities and announcements.</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Check className="w-4 h-4" />
            Mark All as Read
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Notifications</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{notifications.length}</p>
            </div>
            <Bell className="w-6 h-6 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Unread</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">{unreadCount}</p>
            </div>
            <Clock className="w-6 h-6 text-orange-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Course Updates</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {notifications.filter(n => n.title.toLowerCase().includes('course')).length}
              </p>
            </div>
            <BookOpen className="w-6 h-6 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Achievements</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">
                {notifications.filter(n => n.type === 'success').length}
              </p>
            </div>
            <Award className="w-6 h-6 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">All Notifications</h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-6 hover:bg-gray-50 transition-colors ${
                !notification.isRead ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className={`text-lg font-medium ${
                        !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                      }`}>
                        {notification.title}
                      </h3>
                      {!notification.isRead && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          New
                        </span>
                      )}
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getNotificationColor(notification.type)}`}>
                        {notification.type}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">{notification.message}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(notification.createdAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{new Date(notification.createdAt).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  {!notification.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      title="Mark as read"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteNotification(notification.id)}
                    className="flex items-center gap-1 px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                    title="Delete"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {notifications.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
          <p className="text-gray-600">You're all caught up! No new notifications.</p>
        </div>
      )}
    </div>
  );
}
