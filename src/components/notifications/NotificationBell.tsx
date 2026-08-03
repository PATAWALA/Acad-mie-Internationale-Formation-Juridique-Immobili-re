'use client';

import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getUnreadCount, subscribeToNotifications } from '@/lib/notifications';

interface NotificationBellProps {
  userId: string;
  onClick: () => void;
}

export default function NotificationBell({ userId, onClick }: NotificationBellProps) {
  const [count, setCount] = useState(0);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    // Charger le compte initial
    getUnreadCount(userId).then(setCount);

    // S'abonner aux nouvelles notifications en temps réel
    const unsubscribe = subscribeToNotifications(userId, (notification) => {
      setCount((prev) => prev + 1);
      setAnimating(true);
      setTimeout(() => setAnimating(false), 1000);
    });

    return () => {
      unsubscribe();
    };
  }, [userId]);

  return (
    <button
      onClick={onClick}
      className="relative p-2 hover:bg-[#1e293b] rounded-xl transition-colors group"
      aria-label="Notifications"
    >
      <Bell className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
      
      {/* Badge */}
      <AnimatePresence>
        {count > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={animating ? { scale: [1, 1.3, 1] } : { scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg"
          >
            {count > 99 ? '99+' : count}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}