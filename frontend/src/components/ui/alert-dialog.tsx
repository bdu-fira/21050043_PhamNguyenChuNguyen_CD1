import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface AlertDialogProps {
  title: string;
  description: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'default';
}

export function AlertDialog({
  title,
  description,
  open,
  onOpenChange,
  onConfirm,
  onCancel,
  confirmText = 'Tiếp tục',
  cancelText = 'Hủy',
  variant = 'default',
}: AlertDialogProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setIsVisible(true);
    } else {
      setTimeout(() => {
        setIsVisible(false);
      }, 200);
    }
  }, [open]);

  if (!isVisible && !open) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`}>
      <div
        className="fixed inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative bg-white rounded-lg shadow-lg max-w-md w-full mx-auto p-6 transition-all transform duration-200 ease-in-out">
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 focus:outline-none"
        >
          <X size={20} />
        </button>
        
        <div className="text-center sm:text-left">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">{title}</h2>
          <p className="text-sm text-gray-500 mb-6">{description}</p>
        </div>
        
        <div className="mt-4 flex justify-end space-x-3">
          <button
            onClick={() => {
              onOpenChange(false);
              onCancel?.();
            }}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onOpenChange(false);
              onConfirm();
            }}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              variant === 'danger'
                ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
} 