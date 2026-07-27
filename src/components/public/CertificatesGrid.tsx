'use client';

import { useState } from 'react';
import { Check, Clock, BookOpen } from 'lucide-react';

const certificates = [
  {
    id: 1,
    title: 'Certificat en Droit des Affaires OHADA',
    duration: '4 semaines',
    normalPrice: 50000,
    boursePrice: 30000,
    modules: ['Droit des sociétés', 'Contentieux commercial', 'Arbitrage OHADA'],
  },
  {
    id: 2,
    title: 'Certificat en Droit Immobilier',
    duration: '4 semaines',
    normalPrice: 50000,
    boursePrice: 30000,
    modules: ['Transaction immobilière', 'Copropriété', 'Financement immobilier'],
  },
  {
    id: 3,
    title: 'Certificat en Procédure Civile',
    duration: '4 semaines',
    normalPrice: 50000,
    boursePrice: 30000,
    modules: ['Voies d\'exécution', 'Saisies', 'Recouvrement'],
  },
  {
    id: 4,
    title: 'Certificat en Droit du Travail',
    duration: '4 semaines',
    normalPrice: 50000,
    boursePrice: 30000,
    modules: ['Contrat de travail', 'Licenciement', 'Prud\'hommes'],
  },
  {
    id: 5,
    title: 'Certificat en Droit Bancaire',
    duration: '4 semaines',
    normalPrice: 50000,
    boursePrice: 30000,
    modules: ['Garanties bancaires', 'Crédit', 'Contentieux bancaire'],
  },
  {
    id: 6,
    title: 'Certificat en Droit des Assurances',
    duration: '4 semaines',
    normalPrice: 50000,
    boursePrice: 30000,
    modules: ['Contrat d\'assurance', 'Indemnisation', 'Règlement des sinistres'],
  },
  {
    id: 7,
    title: 'Certificat en Fiscalité',
    duration: '4 semaines',
    normalPrice: 50000,
    boursePrice: 30000,
    modules: ['Impôt sur les sociétés', 'TVA', 'Contrôle fiscal'],
  },
  {
    id: 8,
    title: 'Certificat en Droit Pénal des Affaires',
    duration: '4 semaines',
    normalPrice: 50000,
    boursePrice: 30000,
    modules: ['Infractions économiques', 'Blanchiment', 'Responsabilité pénale'],
  },
  {
    id: 9,
    title: 'Certificat en Gestion Immobilière',
    duration: '4 semaines',
    normalPrice: 50000,
    boursePrice: 30000,
    modules: ['Gestion locative', 'Syndic', 'Valorisation immobilière'],
  },
];

export default function CertificatesGrid() {
  const [selected, setSelected] = useState<number[]>([]);

  const toggleCert = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
    // Scroller vers le formulaire et pré-remplir
    setTimeout(() => {
      document.getElementById('registration-form')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const totalNormal = selected.reduce((sum, id) => {
    const cert = certificates.find((c) => c.id === id);
    return sum + (cert?.normalPrice || 0);
  }, 0);

  const totalBourse = selected.reduce((sum, id) => {
    const cert = certificates.find((c) => c.id === id);
    return sum + (cert?.boursePrice || 0);
  }, 0);

  return (
    <section id="certificates" className="py-20 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-display text-white mb-4">
          Nos 9 Certifications d&apos;Excellence
        </h2>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Choisissez vos modules et bénéficiez de la Bourse Mamadou TOURÉ
        </p>
      </div>

      {/* Résumé sélection */}
      {selected.length > 0 && (
        <div className="sticky top-20 z-30 bg-[#0B0F19]/95 backdrop-blur-xl border border-[#1E293B] rounded-2xl p-4 mb-8 flex items-center justify-between flex-wrap gap-4">
          <span className="text-white">
            {selected.length} certificat(s) sélectionné(s)
          </span>
          <div className="flex items-center gap-4">
            <span className="text-gray-500 line-through text-sm">
              {totalNormal.toLocaleString()} FCFA
            </span>
            <span className="text-[#D4AF37] font-bold text-lg">
              {totalBourse.toLocaleString()} FCFA
            </span>
            <span className="text-green-400 text-sm font-semibold">
              -{totalNormal - totalBourse > 0 ? Math.round(((totalNormal - totalBourse) / totalNormal) * 100) : 0}%
            </span>
            <a
              href="#registration-form"
              className="px-5 py-2 bg-[#D4AF37] text-[#0B0F19] rounded-xl font-semibold text-sm hover:bg-[#C5A028] transition"
            >
              S&apos;inscrire
            </a>
          </div>
        </div>
      )}

      {/* Grille */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {certificates.map((cert) => (
          <div
            key={cert.id}
            className={`relative bg-[#0f172a] border rounded-2xl p-6 transition-all duration-300 cursor-pointer hover:shadow-xl ${
              selected.includes(cert.id)
                ? 'border-[#D4AF37]/40 shadow-lg shadow-[#D4AF37]/10'
                : 'border-[#1E293B] hover:border-[#D4AF37]/20'
            }`}
            onClick={() => toggleCert(cert.id)}
          >
            {selected.includes(cert.id) && (
              <div className="absolute top-4 right-4 w-6 h-6 bg-[#D4AF37] rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-[#0B0F19]" />
              </div>
            )}
            <BookOpen className="w-8 h-8 text-[#D4AF37] mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">{cert.title}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
              <Clock className="w-4 h-4" />
              {cert.duration}
            </div>
            <ul className="space-y-1 mb-6">
              {cert.modules.map((mod, i) => (
                <li key={i} className="text-xs text-gray-500 flex items-center gap-2">
                  <span className="w-1 h-1 bg-[#D4AF37] rounded-full" />
                  {mod}
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-3">
              <span className="text-gray-500 line-through text-sm">
                {cert.normalPrice.toLocaleString()} FCFA
              </span>
              <span className="text-[#D4AF37] font-bold">
                {cert.boursePrice.toLocaleString()} FCFA
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}