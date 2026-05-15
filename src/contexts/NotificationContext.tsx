"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
}

interface NotificationContextType {
  showNotification: (type: NotificationType, title: string, message?: string, duration?: number) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = useCallback((type: NotificationType, title: string, message?: string, duration = 3000) => {
    const id = Date.now().toString();
    const notification: Notification = { id, type, title, message, duration };
    
    setNotifications(prev => [...prev, notification]);
    
    if (duration > 0) {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, duration);
    }
  }, []);

  const success = useCallback((title: string, message?: string) => {
    showNotification('success', title, message);
  }, [showNotification]);

  const error = useCallback((title: string, message?: string) => {
    showNotification('error', title, message, 5000);
  }, [showNotification]);

  const warning = useCallback((title: string, message?: string) => {
    showNotification('warning', title, message, 4000);
  }, [showNotification]);

  const info = useCallback((title: string, message?: string) => {
    showNotification('info', title, message);
  }, [showNotification]);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ showNotification, success, error, warning, info }}>
      {children}
      
      {/* Notification Container */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onRemove={removeNotification}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

function NotificationItem({ notification, onRemove }: { notification: Notification; onRemove: (id: string) => void }) {
  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBorderColor = () => {
    switch (notification.type) {
      case 'success':
        return 'border-green-500';
      case 'error':
        return 'border-red-500';
      case 'warning':
        return 'border-yellow-500';
      case 'info':
        return 'border-blue-500';
    }
  };

  const getBackgroundColor = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20';
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20';
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20';
      case 'info':
        return 'bg-blue-50 dark:bg-blue-900/20';
    }
  };

  return (
    <div className={`pointer-events-auto animate-slide-in-right max-w-md w-full`}>
      <div className={`${getBackgroundColor()} border-l-4 ${getBorderColor()} rounded-lg shadow-lg p-4 flex items-start gap-3`}>
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
            {notification.title}
          </h4>
          {notification.message && (
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              {notification.message}
            </p>
          )}
        </div>
        <button
          onClick={() => onRemove(notification.id)}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}
