'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCheck, Bell, Loader2 } from 'lucide-react';
import { getAllNotifications, markAsRead, markAllAsRead } from '@/lib/notifications';

interface NotificationDropdownProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationDropdown({ userId, isOpen, onClose }: NotificationDropdownProps) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  const loadNotifications = async () => {
    setLoading(true);
    const data = await getAllNotifications(userId);
    setNotifications(data);
    setLoading(false);
  };

  const handleMarkAsRead = async (id: number) => {
    await markAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead(userId);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-500';
      case 'warning': return 'bg-amber-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-blue-500';
    }
  };

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diff = now.getTime() - notifDate.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "À l'instant";
    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24) return `Il y a ${hours}h`;
    if (days < 7) return `Il y a ${days}j`;
    return notifDate.toLocaleDateString('fr-FR');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="absolute right-0 top-12 w-80 sm:w-96 bg-[#0f172a] border border-[#1e293b] rounded-2xl shadow-2xl shadow-black/50 z-50 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#1e293b]">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#D4AF37]" />
            <h3 className="text-white font-semibold">Notifications</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleMarkAllAsRead}
              className="text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-1"
            >
              <CheckCheck className="w-4 h-4" />
              Tout lu
            </button>
            <button
              onClick={onClose}
              className="p-1 hover:bg-[#1e293b] rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Liste */}
        <div className="max-h-[400px] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-[#D4AF37] animate-spin" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="w-10 h-10 text-gray-600 mb-3" />
              <p className="text-gray-400 text-sm">Aucune notification</p>
              <p className="text-gray-600 text-xs mt-1">Vous êtes à jour !</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`relative p-4 border-b border-[#1e293b]/50 hover:bg-[#1e293b]/30 transition-colors cursor-pointer ${
                  !notif.read ? 'bg-[#1e293b]/20' : ''
                }`}
                onClick={() => {
                  if (!notif.read) handleMarkAsRead(notif.id);
                  if (notif.link) window.location.href = notif.link;
                }}
              >
                <div className="flex gap-3">
                  {/* Point coloré */}
                  <div className="mt-1.5 flex-shrink-0">
                    <div className={`w-2.5 h-2.5 rounded-full ${getTypeColor(notif.type)} ${!notif.read ? 'animate-pulse' : 'opacity-40'}`} />
                  </div>
                  
                  {/* Contenu */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm ${!notif.read ? 'text-white font-semibold' : 'text-gray-400'}`}>
                        {notif.title}
                      </p>
                      <span className="text-[10px] text-gray-600 flex-shrink-0">
                        {getTimeAgo(notif.created_at)}
                      </span>
                    </div>
                    <p className={`text-xs mt-1 ${!notif.read ? 'text-gray-300' : 'text-gray-500'}`}>
                      {notif.message}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-3 border-t border-[#1e293b] text-center">
            <span className="text-xs text-gray-500">
              {notifications.filter((n) => !n.read).length} non lue{notifications.filter((n) => !n.read).length > 1 ? 's' : ''}
            </span>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}