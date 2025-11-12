import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { track } from '../utils/analytics';

type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (type: NotificationType, message: string, duration?: number) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

const defaultNotificationContext: NotificationContextType = {
  notifications: [],
  addNotification: () => {},
  removeNotification: () => {},
  clearNotifications: () => {}
};

export const NotificationContext = createContext<NotificationContextType>(defaultNotificationContext);

export const useNotification = () => useContext(NotificationContext);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((type: NotificationType, message: string, duration = 5000) => {
    const id = Date.now().toString();
    const newNotification = { id, type, message, duration };
    
    setNotifications(prev => [...prev, newNotification]);
    track.action('notification_shown', type);
    
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }
    
    return id;
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const value = {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      {notifications.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {notifications.map(notification => (
            <div 
              key={notification.id}
              className={`px-4 py-3 rounded shadow-md flex justify-between items-center ${getNotificationClass(notification.type)}`}
            >
              <span>{notification.message}</span>
              <button 
                onClick={() => removeNotification(notification.id)}
                className="ml-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </NotificationContext.Provider>
  );
};

function getNotificationClass(type: NotificationType): string {
  switch (type) {
    case 'success':
      return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100';
    case 'error':
      return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100';
    case 'warning':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100';
    case 'info':
    default:
      return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100';
  }
}