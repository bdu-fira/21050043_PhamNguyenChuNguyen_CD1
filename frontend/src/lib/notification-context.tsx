import { createContext, useState, useContext, ReactNode, useEffect, useMemo } from 'react';
import { Notification, NotificationType, generateId } from './utils';

// Mở rộng interface Window để TypeScript hiểu thuộc tính __notification
declare global {
  interface Window {
    __notification?: {
      showNotification: (type: NotificationType, message: string, duration?: number) => string;
    };
  }
}

interface NotificationContextType {
  notifications: Notification[];
  showNotification: (type: NotificationType, message: string, duration?: number) => void;
  hideNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = (type: NotificationType, message: string, duration = 4000) => {
    const id = generateId();
    const notification: Notification = { id, type, message, duration };
    
    setNotifications(prev => [...prev, notification]);
    
    if (duration > 0) {
      setTimeout(() => {
        hideNotification(id);
      }, duration);
    }
    
    return id;
  };

  const hideNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  // Thiết lập window.__notification để có thể gọi từ bất kỳ đâu
  useEffect(() => {
    window.__notification = {
      showNotification
    };

    return () => {
      delete window.__notification;
    };
  }, []);

  const value = useMemo(() => ({
    notifications,
    showNotification,
    hideNotification,
  }), [notifications]);

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  
  return context;
}; 