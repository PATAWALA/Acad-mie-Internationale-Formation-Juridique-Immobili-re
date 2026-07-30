'use client';

import { Quote, Star } from 'lucide-react';
import Image from 'next/image';

const testimonials = [
  {
    name: 'Maître Koné A.',
    role: 'Avocat au Barreau de Côte d\'Ivoire',
    quote: 'Cette formation a transformé ma pratique. Les cas pratiques m\'ont permis de décrocher mes premiers dossiers en droit OHADA.',
    image: 'https://images.pexels.com/photos/3778603/pexels-photo-3778603.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    rating: 5,
  },
  {
    name: 'Mme Traoré F.',
    role: 'Directrice Juridique, Air Côte d\'Ivoire',
    quote: 'Un programme d\'une qualité exceptionnelle. Je recommande à tous les jeunes juristes de saisir cette opportunité.',
    image: 'https://images.pexels.com/photos/3778606/pexels-photo-3778606.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    rating: 5,
  },
  {
    name: 'M. Bamba K.',
    role: 'Magistrat, Cour d\'Appel d\'Abidjan',
    quote: 'Le certificat en droit immobilier m\'a ouvert les portes de la magistrature. La bourse a rendu cela possible.',
    image: 'https://images.pexels.com/photos/3778612/pexels-photo-3778612.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    rating: 5,
  },
];

export default function SocialProofSection() {
  return (
    <section id="testimonials" className="py-20 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-['Playfair_Display'] text-white mb-4">
          Ils nous font confiance
        </h2>
        <p className="text-gray-400 text-lg">
          Découvrez les témoignages de nos anciens auditeurs
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {testimonials.map((t, i) => (
          <div
            key={i}
            className="bg-[#0f172a] border border-[#1E293B] rounded-2xl p-6 hover:border-[#D4AF37]/20 transition-all group"
          >
            {/* Photo + Étoiles */}
            <div className="flex items-center gap-4 mb-6">
              <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-[#1E293B] group-hover:border-[#D4AF37]/30 transition-colors flex-shrink-0">
                <Image
                  src={t.image}
                  alt={t.name}
                  fill
                  className="object-cover"
                  sizes="56px"
                />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{t.name}</p>
                <p className="text-gray-500 text-xs">{t.role}</p>
                <div className="flex items-center gap-0.5 mt-1">
                  {[...Array(t.rating)].map((_, star) => (
                    <Star key={star} className="w-3 h-3 text-[#D4AF37] fill-[#D4AF37]" />
                  ))}
                </div>
              </div>
            </div>

            {/* Citation */}
            <div className="relative">
              <Quote className="w-6 h-6 text-[#D4AF37] mb-3 opacity-30" />
              <p className="text-gray-300 text-sm italic leading-relaxed">
                &ldquo;{t.quote}&rdquo;
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}