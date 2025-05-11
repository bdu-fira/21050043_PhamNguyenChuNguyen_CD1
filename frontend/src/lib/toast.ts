import { useNotification } from './notification-context';

// Hàm helper để hiển thị thông báo mà không cần sử dụng hook
export const showToast = (type: 'success' | 'error' | 'warning' | 'info', message: string, duration = 4000) => {
  try {
    // Sử dụng window.__notification nếu đã được thiết lập từ NotificationProvider
    if (window.__notification && window.__notification.showNotification) {
      return window.__notification.showNotification(type, message, duration);
    }
    // Nếu không, hiện console
    console.log(`Toast ${type}: ${message}`);
    return '';
  } catch (error) {
    console.error('Không thể hiển thị thông báo:', error);
    return '';
  }
};

// Hook để sử dụng trong component React
export const useToast = () => {
  const notification = useNotification();
  
  return {
    showToast: notification.showNotification,
    toast: {
      success: (message: string, duration?: number) => notification.showNotification('success', message, duration),
      error: (message: string, duration?: number) => notification.showNotification('error', message, duration),
      warning: (message: string, duration?: number) => notification.showNotification('warning', message, duration),
      info: (message: string, duration?: number) => notification.showNotification('info', message, duration),
    }
  };
};

// Thêm vào window để có thể gọi từ bất kỳ đâu
declare global {
  interface Window {
    __notification?: {
      showNotification: (type: 'success' | 'error' | 'warning' | 'info', message: string, duration?: number) => string;
    };
  }
} 