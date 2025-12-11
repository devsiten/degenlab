'use client';

import { FC, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle, ExternalLink } from 'lucide-react';
import { useAppStore, useNotifications } from '@/lib/store';

export const Notifications: FC = () => {
  const notifications = useNotifications();
  const removeNotification = useAppStore((state) => state.removeNotification);

  return (
    <div className="fixed top-20 right-4 z-50 space-y-3 max-w-sm w-full">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
};

interface NotificationItemProps {
  notification: {
    id: string;
    type: 'success' | 'error' | 'info' | 'warning';
    title: string;
    message: string;
    txSignature?: string;
  };
  onClose: () => void;
}

const NotificationItem: FC<NotificationItemProps> = ({ notification, onClose }) => {
  // Auto-dismiss after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-primary-400" />,
    error: <AlertCircle className="w-5 h-5 text-red-400" />,
    info: <Info className="w-5 h-5 text-blue-400" />,
    warning: <AlertTriangle className="w-5 h-5 text-yellow-400" />,
  };

  const bgColors = {
    success: 'bg-primary-500/10 border-primary-500/20',
    error: 'bg-red-500/10 border-red-500/20',
    info: 'bg-blue-500/10 border-blue-500/20',
    warning: 'bg-yellow-500/10 border-yellow-500/20',
  };

  return (
    <div
      className={`glass ${bgColors[notification.type]} border rounded-xl p-4 shadow-lg animate-slide-in`}
      style={{
        animation: 'slideIn 0.3s ease-out',
      }}
    >
      <div className="flex items-start gap-3">
        {icons[notification.type]}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white">{notification.title}</p>
          <p className="text-sm text-gray-400 mt-0.5">{notification.message}</p>
          
          {notification.txSignature && (
            <a
              href={`https://solscan.io/tx/${notification.txSignature}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-primary-400 hover:text-primary-300 mt-2"
            >
              View Transaction
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-white/10 rounded-lg transition-colors"
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};
