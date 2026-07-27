import { Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Maître Koné A.',
    role: 'Avocat au Barreau de Côte d\'Ivoire',
    quote: 'Cette formation a transformé ma pratique. Les cas pratiques m\'ont permis de décrocher mes premiers dossiers en droit OHADA.',
    image: null,
  },
  {
    name: 'Mme Traoré F.',
    role: 'Directrice Juridique, Air Côte d\'Ivoire',
    quote: 'Un programme d\'une qualité exceptionnelle. Je recommande à tous les jeunes juristes de saisir cette opportunité.',
    image: null,
  },
  {
    name: 'M. Bamba K.',
    role: 'Magistrat, Cour d\'Appel d\'Abidjan',
    quote: 'Le certificat en droit immobilier m\'a ouvert les portes de la magistrature. La bourse a rendu cela possible.',
    image: null,
  },
];

export default function SocialProofSection() {
  return (
    <section id="testimonials" className="py-20 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-display text-white mb-4">
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
            className="bg-[#0f172a] border border-[#1E293B] rounded-2xl p-6 hover:border-[#D4AF37]/20 transition-all"
          >
            <Quote className="w-8 h-8 text-[#D4AF37] mb-4 opacity-50" />
            <p className="text-gray-300 italic mb-6 leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
            <div>
              <p className="text-white font-semibold">{t.name}</p>
              <p className="text-gray-500 text-sm">{t.role}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}