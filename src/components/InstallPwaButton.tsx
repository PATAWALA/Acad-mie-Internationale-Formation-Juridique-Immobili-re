'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

type NavigatorWithStandalone = Navigator & { standalone?: boolean };

export default function InstallPwaButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    let isSubscribed = true;

    const checkMobile = () => {
      const mobile = window.innerWidth <= 768 || window.matchMedia('(pointer: coarse)').matches;
      if (isSubscribed) setIsMobile(mobile);
    };

    const checkStandalone = () => {
      const standalone = window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as NavigatorWithStandalone).standalone === true;
      return standalone;
    };

    const checkDismissed = () => {
      try {
        return localStorage.getItem('pwa-install-dismissed') === 'true';
      } catch {
        return false;
      }
    };

    // Différer les setState initiaux pour éviter les cascades synchrones
    const timeoutId = setTimeout(() => {
      if (!isSubscribed) return;

      if (checkStandalone() || !window.matchMedia('(max-width: 768px), (pointer: coarse)').matches) {
        setIsVisible(false);
        return;
      }

      if (checkDismissed()) {
        setIsDismissed(true);
        return;
      }

      checkMobile();
      const handler = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e as BeforeInstallPromptEvent);
        setIsVisible(true);
      };

      window.addEventListener('beforeinstallprompt', handler);
      window.addEventListener('appinstalled', () => {
        setIsVisible(false);
        setDeferredPrompt(null);
        localStorage.setItem('pwa-install-dismissed', 'true');
      });

      // Nettoyer si l'effet est démonté avant la fin du timeout
      if (!isSubscribed) {
        window.removeEventListener('beforeinstallprompt', handler);
      }
    }, 0);

    return () => {
      isSubscribed = false;
      clearTimeout(timeoutId);
      window.removeEventListener('beforeinstallprompt', () => {});
      window.removeEventListener('appinstalled', () => {});
    };
  }, []);

  // Gérer le redimensionnement après montage
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768 || window.matchMedia('(pointer: coarse)').matches;
      setIsMobile(mobile);
      if (!mobile) setIsVisible(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    if (result.outcome === 'accepted') {
      setIsVisible(false);
      setDeferredPrompt(null);
      localStorage.setItem('pwa-install-dismissed', 'true');
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    setIsVisible(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  if (!isVisible || isDismissed || !isMobile) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -100 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed top-0 left-0 right-0 z-[9999] px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-500 shadow-2xl shadow-blue-500/30"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm lg:text-base leading-tight">
                📱 Installez l&lsquo;application APIAD
              </p>
              <p className="text-blue-100 text-xs lg:text-sm">
                Accès rapide à vos formations, même hors ligne
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleInstall}
              className="flex items-center gap-2 px-4 lg:px-6 py-2.5 bg-white text-blue-600 rounded-xl font-bold text-sm lg:text-base hover:bg-blue-50 transition-colors shadow-lg"
            >
              <Download className="w-4 h-4" />
              Installer
            </button>
            <button
              onClick={handleDismiss}
              className="p-2 text-blue-100 hover:text-white transition-colors"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}