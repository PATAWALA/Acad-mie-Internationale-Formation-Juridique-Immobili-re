'use client';

import { useEffect } from 'react';

export default function PwaRegister() {
  useEffect(() => {
    // Vérifier si l'appareil est mobile (largeur ≤ 768px ou écran tactile)
    const isMobile = window.innerWidth <= 768 || window.matchMedia('(pointer: coarse)').matches;

    // N'enregistrer le Service Worker que sur mobile
    if ('serviceWorker' in navigator && isMobile) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('✅ Service Worker enregistré :', registration.scope);
        })
        .catch((error) => {
          console.error('❌ Erreur d’enregistrement du Service Worker :', error);
        });
    } else {
      console.log('ℹ️ Service Worker non enregistré sur desktop ou non supporté.');
    }
  }, []);

  return null;
}