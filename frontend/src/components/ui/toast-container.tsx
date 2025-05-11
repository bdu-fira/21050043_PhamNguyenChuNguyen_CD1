import { useNotification } from '@/lib/notification-context';
import { Toast } from './toast';
import { AnimatePresence, motion } from 'framer-motion';

export function ToastContainer() {
  const { notifications, hideNotification } = useNotification();

  if (notifications.length === 0) return null;

  return (
    <div
      aria-live="assertive"
      className="fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 sm:items-start z-50"
    >
      <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
        <AnimatePresence>
          {notifications.map((notification) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 50, scale: 0.3 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
              className="w-full flex justify-end"
            >
              <Toast
                notification={notification}
                onClose={hideNotification}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
} 