import { useState, useEffect } from 'react';
import { X, CheckCircle, AlertTriangle, Info, AlertOctagon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Notification, NotificationType } from '@/lib/utils';

interface ToastProps {
  notification: Notification;
  onClose: (id: string) => void;
}

export function Toast({ notification, onClose }: ToastProps) {
  const { id, type, message, duration = 4000 } = notification;
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 100) {
          clearInterval(timer);
          return 0;
        }
        return prev - 100;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [isPaused]);

  useEffect(() => {
    if (timeLeft === 0) {
      onClose(id);
    }
  }, [timeLeft, id, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-white" />;
      case 'error':
        return <AlertOctagon className="h-5 w-5 text-white" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-white" />;
      case 'info':
        return <Info className="h-5 w-5 text-white" />;
      default:
        return null;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'warning':
        return 'bg-amber-500';
      case 'info':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div
      className="max-w-xs w-full bg-white shadow-lg rounded-lg pointer-events-auto overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className={cn("flex-shrink-0 p-1 rounded-full", getBgColor())}>
            {getIcon()}
          </div>
          <div className="ml-3 w-0 flex-1 pt-0.5">
            <p className="text-sm font-medium text-gray-900">{message}</p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
              onClick={() => onClose(id)}
            >
              <span className="sr-only">Đóng</span>
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
      <div
        className={cn("h-1 transition-all ease-linear", getBgColor())}
        style={{ width: `${(timeLeft / duration) * 100}%` }}
      />
    </div>
  );
} 