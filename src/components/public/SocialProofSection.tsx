'use client';

import { Award, Users, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { motion } from 'framer-motion';

const moments = [
  {
    image: '/images/groupe1(1).jpeg',
    title: 'Session de formation pratique',
    description: 'Des auditeurs immergés dans la pratique du droit',
  },
  {
    image: '/images/groupe1(2).jpeg',
    title: 'Atelier de rédaction d\'actes',
    description: 'Apprendre en faisant, sous la direction du Dr. LOBÉ',
  },
  {
    image: '/images/groupe1(3).jpeg',
    title: 'Cérémonie de certification',
    description: 'Nos certifiés prêts à intégrer les plus grands cabinets',
  },
];

export function FacultySection() {
  return (
    <section id="faculty" className="py-20 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-5xl font-['Playfair_Display'] text-white mb-4">
          15 ans d&apos;expertise. Des milliers de carrières transformées.
        </h2>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Sous la direction du Dr. Jean-Louis LOBÉ, chaque session est une immersion dans la pratique d&apos;élite.
        </p>
      </div>

      {/* Grande image de fond avec overlay */}
      <div className="relative rounded-3xl overflow-hidden mb-12 h-[400px] md:h-[500px] group">
        <Image
          src="/images/dr-lobe-portrait.jpeg"
          alt="Dr. Jean-Louis LOBÉ avec ses étudiants"
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-[#0B0F19]/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-full mb-4">
            <Award className="w-4 h-4 text-[#D4AF37]" />
            <span className="text-sm text-[#D4AF37] font-medium">Directeur Académique</span>
          </div>
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Dr. Jean-Louis LOBÉ
          </h3>
          <p className="text-gray-300 text-sm md:text-base max-w-xl">
            Docteur en Droit, fondateur de la méthode qui a déjà transformé plus de 1000 carrières juridiques et immobilières.
          </p>
        </div>
      </div>

      {/* Appel à rejoindre */}
      <div className="text-center">
        <a
          href="#registration-form"
          className="inline-flex items-center gap-2 px-8 py-4 bg-[#D4AF37] text-[#0B0F19] rounded-xl font-semibold hover:bg-[#C5A028] transition-all text-lg"
        >
          Rejoindre la session 2026
          <ArrowRight className="w-5 h-5" />
        </a>
        <p className="text-gray-500 text-sm mt-3">
          🎓 Université d&apos;Été — Début le 08 Août 2026
        </p>
      </div>
    </section>
  );
}

export function SocialProofSection() {
  return (
    <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-5xl font-['Playfair_Display'] text-white mb-4">
          Ils l&apos;ont fait. Pourquoi pas vous ?
        </h2>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Rejoignez une communauté d&apos;élite qui a transformé sa carrière grâce à la pratique.
        </p>
      </div>

      {/* Galerie de moments forts */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        {moments.map((moment, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.15 }}
            className="group relative rounded-2xl overflow-hidden h-80 cursor-pointer"
          >
            <Image
              src={moment.image}
              alt={moment.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-[#0B0F19]/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <h3 className="text-white font-bold text-lg mb-1">{moment.title}</h3>
              <p className="text-gray-300 text-sm">{moment.description}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Statistiques rassurantes */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
        {[
          { value: '1000+', label: 'Auditeurs formés' },
          { value: '15 ans', label: 'D\'expertise' },
          { value: '90%', label: 'De réussite' },
          { value: '9', label: 'Certifications' },
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="text-center p-6 bg-[#0f172a] border border-[#1E293B] rounded-2xl hover:border-[#D4AF37]/20 transition-all"
          >
            <div className="text-3xl md:text-4xl font-bold text-[#D4AF37] mb-2">{stat.value}</div>
            <div className="text-gray-400 text-sm">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* CTA final */}
      <div className="text-center">
        <a
          href="#registration-form"
          className="inline-flex items-center gap-2 px-8 py-4 bg-[#D4AF37] text-[#0B0F19] rounded-xl font-semibold hover:bg-[#C5A028] transition-all text-lg"
        >
          <Users className="w-5 h-5" />
          Je rejoins la promotion 2026
          <ArrowRight className="w-5 h-5" />
        </a>
      </div>
    </section>
  );
}