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

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay pour fermer en cliquant dehors */}
          <div className="fixed inset-0 z-40" onClick={onClose} />
          
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed right-4 lg:right-8 top-16 lg:top-20 w-[calc(100vw-32px)] sm:w-96 bg-[#0f172a] border border-[#1e293b] rounded-2xl shadow-2xl shadow-black/50 z-[100] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#1e293b] bg-[#0f172a]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <Bell className="w-4 h-4 text-amber-400" />
                </div>
                <h3 className="text-white font-bold">Notifications</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-[#1e293b]"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Tout lu
                </button>
                <button
                  onClick={onClose}
                  className="p-1.5 hover:bg-[#1e293b] rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </div>

            {/* Liste */}
            <div className="max-h-[60vh] overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                  <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-3">
                    <Bell className="w-6 h-6 text-slate-600" />
                  </div>
                  <p className="text-slate-400 text-sm font-medium">Aucune notification</p>
                  <p className="text-slate-600 text-xs mt-1">Vous êtes à jour !</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <motion.div
                    key={notif.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`relative p-4 border-b border-[#1e293b]/50 hover:bg-[#1e293b]/30 transition-colors cursor-pointer ${
                      !notif.read ? 'bg-amber-500/5' : ''
                    }`}
                    onClick={() => {
                      if (!notif.read) handleMarkAsRead(notif.id);
                      if (notif.link) window.location.href = notif.link;
                    }}
                  >
                    <div className="flex gap-3">
                      {/* Point coloré */}
                      <div className="mt-1.5 flex-shrink-0">
                        <div className={`w-2.5 h-2.5 rounded-full ${getTypeColor(notif.type)} ${!notif.read ? 'animate-pulse shadow-lg' : 'opacity-40'}`} 
                          style={{ boxShadow: !notif.read ? `0 0 8px currentColor` : 'none' }} />
                      </div>
                      
                      {/* Contenu */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm ${!notif.read ? 'text-white font-semibold' : 'text-slate-400'}`}>
                            {notif.title}
                          </p>
                          <span className="text-[10px] text-slate-600 flex-shrink-0 mt-0.5">
                            {getTimeAgo(notif.created_at)}
                          </span>
                        </div>
                        <p className={`text-xs mt-1 ${!notif.read ? 'text-slate-300' : 'text-slate-500'}`}>
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
              <div className="p-3 border-t border-[#1e293b] bg-[#0f172a] text-center">
                <span className="text-xs text-slate-500">
                  {notifications.filter((n) => !n.read).length} non lue{notifications.filter((n) => !n.read).length > 1 ? 's' : ''}
                </span>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}