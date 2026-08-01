'use client';

import { Award, Users, ArrowRight, Star, Quote, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { motion } from 'framer-motion';

export function SocialProofSection() {
  return (
    <section className="py-20 lg:py-28 px-4 md:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-full mb-6"
        >
          <Sparkles className="w-4 h-4 text-[#D4AF37]" />
          <span className="text-sm text-[#D4AF37] font-medium">Témoignages & Réussites</span>
        </motion.div>
        
        <h2 className="text-3xl md:text-5xl lg:text-6xl font-['Playfair_Display'] text-white mb-6 leading-tight">
          Ils ont osé. Ils ont réussi.<br />
          <span className="text-[#D4AF37]">Pourquoi pas vous ?</span>
        </h2>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Rejoignez une communauté d&apos;élite qui a transformé sa carrière grâce à la pratique 
          du droit et de l&apos;immobilier.
        </p>
      </div>

      {/* PYRAMIDE DESKTOP */}
      <div className="hidden lg:block relative mb-20">
        {/* Lignes SVG - PLUS VISIBLES */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 1000 700" preserveAspectRatio="none">
          <defs>
            <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          
          {/* Lignes principales */}
          <line x1="500" y1="100" x2="180" y2="580" stroke="url(#goldGradient)" strokeWidth="2" strokeOpacity="0.5" strokeDasharray="8 6" />
          <line x1="500" y1="100" x2="500" y2="580" stroke="url(#goldGradient)" strokeWidth="2" strokeOpacity="0.5" strokeDasharray="8 6" />
          <line x1="500" y1="100" x2="820" y2="580" stroke="url(#goldGradient)" strokeWidth="2" strokeOpacity="0.5" strokeDasharray="8 6" />
          
          {/* Lignes secondaires (horizontales) */}
          <line x1="180" y1="580" x2="500" y2="580" stroke="#D4AF37" strokeWidth="1" strokeOpacity="0.15" strokeDasharray="4 8" />
          <line x1="500" y1="580" x2="820" y2="580" stroke="#D4AF37" strokeWidth="1" strokeOpacity="0.15" strokeDasharray="4 8" />
          
          {/* Points de connexion - PLUS GROS */}
          <circle cx="500" cy="100" r="8" fill="#0B0F19" stroke="#D4AF37" strokeWidth="2.5" />
          <circle cx="500" cy="100" r="3" fill="#D4AF37" />
          
          <circle cx="180" cy="580" r="8" fill="#0B0F19" stroke="#D4AF37" strokeWidth="2.5" />
          <circle cx="180" cy="580" r="3" fill="#D4AF37" />
          
          <circle cx="500" cy="580" r="8" fill="#0B0F19" stroke="#D4AF37" strokeWidth="2.5" />
          <circle cx="500" cy="580" r="3" fill="#D4AF37" />
          
          <circle cx="820" cy="580" r="8" fill="#0B0F19" stroke="#D4AF37" strokeWidth="2.5" />
          <circle cx="820" cy="580" r="3" fill="#D4AF37" />
        </svg>

        {/* Image du haut - PLUS ESPACÉE */}
        <div className="flex justify-center mb-16 relative z-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative w-72 h-72 rounded-3xl overflow-hidden border-2 border-[#D4AF37]/40 shadow-2xl shadow-[#D4AF37]/10 group"
          >
            <Image
              src="/images/faculty/haut.jpeg"
              alt="Diplômés de l'Université d'Été célébrant leur réussite"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19]/90 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5 text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#D4AF37]/20 border border-[#D4AF37]/30 rounded-full mb-3">
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span className="text-xs text-[#D4AF37] font-semibold">Promotion 2025</span>
              </div>
              <h3 className="text-white font-bold text-lg">Ils ont réussi</h3>
              <p className="text-gray-300 text-xs">Diplômés de l&apos;Université d&apos;Été</p>
            </div>
          </motion.div>
        </div>

        {/* 3 Anciens auditeurs - PLUS ESPACÉS */}
        <div className="grid grid-cols-3 gap-12 max-w-4xl mx-auto relative z-20">
          {[
            {
              image: '/images/faculty/assande-francis.jpeg',
              name: 'M. ASSANDÉ Francis',
              subtitle: 'Ancien auditeur devenu praticien',
            },
            {
              image: '/images/faculty/uriel-ouattara.jpeg',
              name: 'Me Uriel OUATTARA',
              subtitle: 'Avocat Stagiaire au Barreau de Côte d\'Ivoire',
            },
            {
              image: '/images/faculty/magnigui-patrice-diabate.jpeg',
              name: 'M. Magnigui Patrice DIABATÉ',
              subtitle: 'Ancien auditeur devenu praticien d\'élite',
            },
          ].map((person, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="relative group"
            >
              <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden border border-[#D4AF37]/20 shadow-xl group-hover:border-[#D4AF37]/40 transition-all duration-500">
                <Image
                  src={person.image}
                  alt={person.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-[#0B0F19]/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Quote className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span className="text-[10px] text-[#D4AF37] uppercase tracking-wider font-semibold">Témoignage</span>
                  </div>
                  <h4 className="text-white font-bold text-sm leading-tight">{person.name}</h4>
                  <p className="text-gray-400 text-xs mt-1">{person.subtitle}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* VERSION MOBILE */}
      <div className="lg:hidden space-y-6 mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden border-2 border-[#D4AF37]/30 shadow-xl"
        >
          <Image src="/images/faculty/haut.jpeg" alt="Diplômés" fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19]/90 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#D4AF37]/20 border border-[#D4AF37]/30 rounded-full mb-3">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span className="text-xs text-[#D4AF37] font-semibold">Promotion 2025</span>
            </div>
            <h3 className="text-white font-bold text-xl">Ils ont réussi</h3>
            <p className="text-gray-300 text-sm">Diplômés de l&apos;Université d&apos;Été</p>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 gap-4">
          {[
            { image: '/images/faculty/assande-francis.jpeg', name: 'M. ASSANDÉ Francis', subtitle: 'Devenu praticien' },
            { image: '/images/faculty/uriel-ouattara.jpeg', name: 'Me Uriel OUATTARA', subtitle: 'Avocat Stagiaire' },
          ].map((person, index) => (
            <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.15 }}
              className="relative aspect-[3/4] rounded-xl overflow-hidden border border-[#D4AF37]/20">
              <Image src={person.image} alt={person.name} fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19]/90 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h4 className="text-white font-bold text-xs">{person.name}</h4>
                <p className="text-gray-400 text-[10px]">{person.subtitle}</p>
              </div>
            </motion.div>
          ))}
        </div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="relative w-full aspect-[16/9] rounded-xl overflow-hidden border border-[#D4AF37]/20">
          <Image src="/images/faculty/magnigui-patrice-diabate.jpeg" alt="M. Magnigui Patrice DIABATÉ" fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19]/90 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <h4 className="text-white font-bold text-sm">M. Magnigui Patrice DIABATÉ</h4>
            <p className="text-gray-400 text-xs">Ancien auditeur • Devenu praticien d&apos;élite</p>
          </div>
        </motion.div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-16">
        {[
          { value: '1000+', label: 'Auditeurs formés', icon: Users },
          { value: '15 ans', label: 'D\'expertise', icon: Star },
          { value: '90%', label: 'De réussite', icon: Award },
          { value: '9', label: 'Certifications', icon: Sparkles },
        ].map((stat, index) => (
          <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: index * 0.1 }}
            className="text-center p-6 bg-[#0f172a] border border-[#1E293B] rounded-2xl hover:border-[#D4AF37]/20 transition-all group">
            <stat.icon className="w-5 h-5 text-[#D4AF37]/50 mx-auto mb-3 group-hover:text-[#D4AF37] transition-colors" />
            <div className="text-3xl md:text-4xl font-bold text-[#D4AF37] mb-2">{stat.value}</div>
            <div className="text-gray-400 text-sm">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* CTA */}
      <div className="text-center">
        <motion.a whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} href="#registration-form"
          className="inline-flex items-center gap-3 px-8 py-4 bg-[#D4AF37] text-[#0B0F19] rounded-xl font-semibold hover:bg-[#C5A028] transition-all text-lg shadow-xl shadow-[#D4AF37]/20">
          <Users className="w-5 h-5" />
          Je rejoins la promotion 2026
          <ArrowRight className="w-5 h-5" />
        </motion.a>
        <p className="text-gray-500 text-sm mt-4">🎓 Université d&apos;Été — Début le 08 Août 2026</p>
      </div>
    </section>
  );
}