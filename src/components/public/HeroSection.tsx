'use client';

import { ArrowRight, Shield, Users, Award } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HeroSection() {
  return (
    <section className="relative pt-24 lg:pt-32 pb-16 lg:pb-20 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        {/* Colonne Texte */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center lg:text-left"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-full mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4AF37] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D4AF37]" />
            </span>
            <span className="text-xs md:text-sm text-[#D4AF37] font-medium">
              🎓 Université d'Été 2026 — Début le 08 Août
            </span>
          </div>

          {/* Titre */}
          <h1 className="font-['Playfair_Display'] text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-white leading-tight mb-5">
            Devenez un praticien d'élite en{' '}
            <span className="text-[#D4AF37]">Droit</span> et{' '}
            <span className="text-[#D4AF37]">Immobilier</span>
          </h1>

          {/* Sous-titre */}
          <p className="text-base md:text-lg text-gray-300 mb-6 max-w-xl mx-auto lg:mx-0 leading-relaxed">
            Plus de <span className="text-white font-semibold">1000 auditeurs</span> formés
            en 15 ans d'expertise par le Dr. Jean-Louis LOBÉ.
            La pratique qui fait la différence.
          </p>

          {/* Preuves sociales */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-5 mb-8">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-[#D4AF37]" />
              <span className="text-sm text-gray-300">
                <span className="text-white font-semibold">1000+</span> auditeurs
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-[#D4AF37]" />
              <span className="text-sm text-gray-300">
                <span className="text-white font-semibold">9</span> certifications
              </span>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
            <a
              href="#registration-form"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#D4AF37] text-[#0B0F19] rounded-xl font-semibold hover:bg-[#C5A028] transition-all hover:shadow-lg hover:shadow-[#D4AF37]/20 text-sm md:text-base"
            >
              <Shield className="w-5 h-5" />
              Je m'inscris maintenant
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="#certificates"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-white/20 text-white rounded-xl font-semibold hover:bg-white/10 transition-all text-sm md:text-base"
            >
              <Users className="w-5 h-5" />
              Voir les certifications
            </a>
          </div>
        </motion.div>

        {/* Colonne Image */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex justify-center lg:justify-end order-first lg:order-last"
        >
          <div className="relative w-64 h-64 md:w-80 md:h-80 lg:w-[420px] lg:h-[500px] rounded-2xl overflow-hidden border border-[#D4AF37]/20 shadow-2xl">
            <img
              src="/images/dr-lobe-portrait.jpeg"
              alt="Dr. Jean-Louis LOBÉ - Fondateur"
              className="w-full h-full object-cover object-top"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19]/30 to-transparent" />
            {/* Badge sur l'image */}
            <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-sm rounded-xl px-4 py-3 border border-[#D4AF37]/20">
              <p className="text-[#D4AF37] text-xs md:text-sm font-semibold">Dr. Jean-Louis LOBÉ</p>
              <p className="text-gray-300 text-xs">Fondateur & Directeur Académique</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}