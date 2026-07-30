'use client';

import { Award } from 'lucide-react';
import Image from 'next/image';

const faculty = [
  {
    name: 'Dr. Jean-Louis LOBÉ',
    role: 'Fondateur & Directeur Académique',
    description: 'Docteur en Droit, 15 ans d\'expérience en formation juridique.',
    image: 'https://images.pexels.com/photos/3769021/pexels-photo-3769021.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    highlight: true,
  },
  {
    name: 'Me Kouassi A.',
    role: 'Avocat au Barreau, Médiateur Agréé',
    description: 'Spécialiste en droit des affaires et arbitrage international.',
    image: 'https://images.pexels.com/photos/3778603/pexels-photo-3778603.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    highlight: false,
  },
  {
    name: 'Pr. Yao K.',
    role: 'Commissaire de Justice',
    description: 'Ancien Président de la Chambre Nationale des Commissaires de Justice.',
    image: 'https://images.pexels.com/photos/3778612/pexels-photo-3778612.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    highlight: false,
  },
];

export default function FacultySection() {
  return (
    <section id="faculty" className="py-20 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-['Playfair_Display'] text-white mb-4">
          Un corps enseignant d&apos;élite
        </h2>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Apprenez auprès des meilleurs praticiens du droit en Côte d&apos;Ivoire
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {faculty.map((member, i) => (
          <div
            key={i}
            className={`bg-[#0f172a] border rounded-2xl p-6 text-center group transition-all hover:shadow-lg ${
              member.highlight
                ? 'border-[#D4AF37]/40 shadow-lg shadow-[#D4AF37]/5 hover:shadow-[#D4AF37]/10'
                : 'border-[#1E293B] hover:border-[#D4AF37]/20'
            }`}
          >
            {/* Photo */}
            <div className={`relative w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden border-2 transition-colors ${
              member.highlight
                ? 'border-[#D4AF37]'
                : 'border-[#1E293B] group-hover:border-[#D4AF37]/30'
            }`}>
              <Image
                src={member.image}
                alt={member.name}
                fill
                className="object-cover"
                sizes="96px"
              />
              {member.highlight && (
                <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#D4AF37] rounded-full flex items-center justify-center">
                  <Award className="w-4 h-4 text-[#0B0F19]" />
                </div>
              )}
            </div>

            {/* Info */}
            <h3 className="text-lg font-semibold text-white mb-1">{member.name}</h3>
            <p className="text-[#D4AF37] text-sm mb-3">{member.role}</p>
            <p className="text-gray-400 text-sm leading-relaxed">{member.description}</p>

            {/* Badge Directeur */}
            {member.highlight && (
              <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-full text-xs text-[#D4AF37]">
                <Award className="w-3 h-3" />
                Directeur Académique
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}