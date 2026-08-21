'use client';

import { useEffect } from 'react';

export default function PwaRegister() {
  useEffect(() => {
    const isMobile = window.innerWidth <= 768 || window.matchMedia('(pointer: coarse)').matches;

    if ('serviceWorker' in navigator) {
      if (isMobile) {
        // Enregistrer le service worker uniquement sur mobile
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('✅ Service Worker enregistré :', registration.scope);
          })
          .catch((error) => {
            console.error('❌ Erreur d’enregistrement du Service Worker :', error);
          });
      } else {
        // Désactiver tout service worker existant sur desktop
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          if (registrations.length > 0) {
            for (const registration of registrations) {
              registration.unregister();
            }
            // Forcer le rechargement sans cache
            window.location.reload();
          }
        });
      }
    }
  }, []);

  return null;
}