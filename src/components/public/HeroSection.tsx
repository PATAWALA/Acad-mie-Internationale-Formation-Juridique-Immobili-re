'use client';

import { ArrowRight, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HeroSection() {
  return (
    <section className="relative pt-28 lg:pt-36 pb-20 px-4 md:px-8 max-w-7xl mx-auto">
      {/* Image de fond */}
      <div className="absolute inset-0 max-w-7xl mx-auto overflow-hidden rounded-2xl">
        <img
          src="https://images.unsplash.com/photo-1523050854058-8df90110a5e6?q=80&w=2070&auto=format&fit=crop"
          alt="Étudiants en formation juridique"
          className="w-full h-full object-cover"
        />
        {/* Overlay pour lisibilité du texte */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B0F19] via-[#0B0F19]/90 to-[#0B0F19]/50" />
        <div className="absolute inset-0 bg-[#0B0F19]/20" />
      </div>

      {/* Contenu */}
      <div className="relative z-10">
        {/* Badge Urgence */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center lg:justify-start mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-full backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4AF37] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D4AF37]" />
            </span>
            <span className="text-sm text-[#D4AF37] font-medium">
              Bourse Mamadou TOURÉ — Places Limitées Session 2026
            </span>
          </div>
        </motion.div>

        {/* Titre */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="font-['Playfair_Display'] text-4xl md:text-6xl lg:text-7xl text-white leading-tight mb-6 text-center lg:text-left"
        >
          Le pont direct entre la{' '}
          <span className="text-[#D4AF37]">théorie universitaire</span> et la{' '}
          <span className="text-[#D4AF37]">pratique d&apos;élite</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-lg md:text-xl text-gray-300 max-w-3xl mb-10 text-center lg:text-left"
        >
          15 ans d&apos;expérience, 500+ auditeurs formés et insérés dans les plus
          prestigieuses institutions juridiques et immobilières.
        </motion.p>

        {/* CTA + Social Proof */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center gap-6 justify-center lg:justify-start"
        >
          <a
            href="#registration-form"
            className="group inline-flex items-center gap-2 px-6 py-3 bg-[#D4AF37] text-[#0B0F19] rounded-xl font-semibold hover:bg-[#C5A028] transition-all hover:shadow-lg hover:shadow-[#D4AF37]/20"
          >
            <Shield className="w-5 h-5" />
            Postuler à la Bourse
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </a>

          <div className="hidden sm:block w-px h-8 bg-[#1E293B]" />

          <div className="text-center sm:text-left">
            <div className="flex items-center gap-0.5 justify-center sm:justify-start mb-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg key={star} className="w-4 h-4 text-[#D4AF37]" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <p className="text-sm text-gray-400">
              <span className="text-white font-semibold">500+</span> professionnels formés
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}