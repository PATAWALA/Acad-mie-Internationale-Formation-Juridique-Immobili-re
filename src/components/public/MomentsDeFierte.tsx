'use client';

import { motion } from 'framer-motion';
import { Award, Heart, Users, Sparkles, ArrowRight } from 'lucide-react';
import Image from 'next/image';

const moments = [
  {
    image: '/images/2.jpeg',
    title: 'Session de formation pratique',
    description: 'Des auditeurs immergés dans la pratique du droit',
  },
  {
    image: '/images/1.jpeg',
    title: 'Atelier de rédaction d\'actes',
    description: 'Apprendre en faisant, sous la direction du Dr. LOBÉ',
  },
  {
    image: '/images/3.jpeg',
    title: 'Cérémonie de certification',
    description: 'Nos certifiés prêts à intégrer les plus grands cabinets',
  },
];

export function MomentsDeFierte() {
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
          <Heart className="w-4 h-4 text-[#D4AF37]" />
          <span className="text-sm text-[#D4AF37] font-medium">Moments de Fierté</span>
        </motion.div>
        
        <h2 className="text-3xl md:text-5xl lg:text-6xl font-['Playfair_Display'] text-white mb-6 leading-tight">
          Plus qu&apos;une formation,<br />
          <span className="text-[#D4AF37]">une aventure humaine</span>
        </h2>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Des femmes et des hommes qui partagent, apprennent et grandissent ensemble. 
          Voici les moments qui font la fierté de notre Université d&apos;Été.
        </p>
      </div>

      {/* Galerie avec effet hover élégant */}
      <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mb-16">
        {moments.map((moment, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.2 }}
            className="group relative rounded-3xl overflow-hidden h-[450px] cursor-pointer"
          >
            <Image
              src={moment.image}
              alt={moment.title}
              fill
              className="object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-1"
            />
            
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-[#0B0F19]/40 via-40% to-transparent" />
            <div className="absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-[#D4AF37]/40 transition-all duration-500" />
            
            <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="mb-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center group-hover:bg-[#D4AF37]/20 transition-all duration-300">
                  {index === 0 && <Users className="w-6 h-6 text-[#D4AF37]" />}
                  {index === 1 && <Award className="w-6 h-6 text-[#D4AF37]" />}
                  {index === 2 && <Sparkles className="w-6 h-6 text-[#D4AF37]" />}
                </div>
              </motion.div>
              
              <h3 className="text-xl lg:text-2xl font-bold text-white mb-3 group-hover:text-[#D4AF37] transition-colors duration-300">
                {moment.title}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity duration-300">
                {moment.description}
              </p>
              
              <div className="mt-4 w-0 group-hover:w-16 h-0.5 bg-[#D4AF37] transition-all duration-500 rounded-full" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Citation + CTA */}
      <div className="text-center space-y-10">
        {/* Citation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto bg-gradient-to-r from-[#D4AF37]/5 via-[#D4AF37]/10 to-[#D4AF37]/5 border border-[#D4AF37]/10 rounded-3xl p-8 lg:p-10"
        >
          <Heart className="w-8 h-8 text-[#D4AF37] mx-auto mb-4" />
          <p className="text-white text-lg lg:text-xl font-['Playfair_Display'] italic mb-3">
            &ldquo;Au-delà des écrans, ce sont des liens qui se créent et des destins qui se transforment.&rdquo;
          </p>
          <p className="text-[#D4AF37] text-sm font-medium">— Dr. Jean-Louis LOBÉ</p>
        </motion.div>

        {/* 🆕 CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <a
            href="#registration-form"
            className="inline-flex items-center gap-3 px-10 py-5 bg-[#D4AF37] text-[#0B0F19] rounded-2xl font-bold text-lg hover:bg-[#C5A028] transition-all shadow-2xl shadow-[#D4AF37]/20 hover:shadow-[#D4AF37]/30 hover:scale-105"
          >
            <Users className="w-6 h-6" />
            Rejoindre cette aventure humaine
            <ArrowRight className="w-6 h-6" />
          </a>
          <p className="text-gray-500 text-sm mt-4">
            🎓 Prochaine session — 08 Août 2026 • Places limitées
          </p>
        </motion.div>
      </div>
    </section>
  );
}