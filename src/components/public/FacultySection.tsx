'use client';

import Image from 'next/image';
import { Quote } from 'lucide-react';

const faculty = [
  {
    id: 1,
    name: 'Me Paul Ephrem Gnaleko',
    role: 'Intervenant & Parrain',
    credentials: 'Avocat de Droit Anglais — Directeur Juridique de Air-Côte d\'Ivoire',
    image: '/images/faculty/paul-ephrem-gnaleko.jpeg',
    quote: 'Outre mon parrainage, je partagerai avec les auditeurs mon expérience en matière de rédaction de contrat et l\'urgente nécessité de savoir rédiger un contrat.',
  },
  {
    id: 2,
    name: 'Dr. Jean-Louis LOBÉ',
    role: 'Fondateur & Directeur Académique',
    credentials: 'Docteur en Droit spécialisé en Droit Immobilier, Foncier et droit des contrats — Expert Immobilier certifié par le Centre National de l\'Expertise de France — Rattaché à l\'Université de Toulouse et de Nantes',
    image: '/images/faculty/jean-louis-lobe.jpeg',
    quote: 'Le pont direct entre la théorie universitaire et la pratique d\'élite. 15 ans d\'expérience, plus de 1 000 auditeurs formés et insérés dans les plus prestigieuses institutions juridiques et immobilières.',
  },
  
  {
    id: 3,
    name: 'Dr Kévin DIZO',
    role: 'Formateur',
    credentials: 'Docteur en Droit Privé et Sciences criminelles de l\'Université de Nantes — ATER à Paris 10 Nanterre',
    image: '/images/faculty/kevin-dizo.jpeg',
    quote: 'J\'aurai à charge votre Certification Pratique de la Rédaction des contrats et des Actes de justice.',
  },
  {
    id: 4,
    name: 'M. Armand ATTIGNON',
    role: 'Intervenant',
    credentials: 'Responsable Copropriété FONCIA - PARIS',
    image: '/images/faculty/armand-attignon.jpeg',
    quote: 'Je serai en charge de votre formation au métier de Syndic Copropriété aux côtés du Docteur Jean-Louis LOBÉ.',
  },
  {
    id: 5,
    name: 'M. TANGARA Mamoutou',
    role: 'Intervenant',
    credentials: 'Enseignant (Vacataire) — Gérant N-Presta-Com. Sarl Bamako (Mali) — Président du Club OHADA Mali',
    image: '/images/faculty/tangara-mamoutou.jpeg',
    quote: 'J\'interviendrai au côté du Dr LOBÉ dans votre certification sur la pratique de la constitution des sociétés.',
  },
  {
    id: 6,
    name: 'M. René KESSE',
    role: 'Formateur',
    credentials: 'Promoteur et investisseur immobilier (14è Mini-Cité en cours en Mars 2026 + 9 accompagnements)',
    image: '/images/faculty/rene-kesse.jpeg',
    quote: 'Je vous partagerai mon expérience en matière de réalisation de mini-cité.',
  },
  {
    id: 7,
    name: 'M. Magnigui Patrice DIABATÉ',
    role: 'Intervenant',
    credentials: 'Magistrat, Juge au Tribunal de Première Instance de Man – Côte d\'Ivoire',
    image: '/images/faculty/magnigui-patrice-diabate.jpeg',
    quote: 'Je partagerai mon expérience et vous instruirai sur la nécessité de bien rédiger un acte de justice.',
  },
  {
    id: 8,
    name: 'Me Uriel OUATTARA',
    role: 'Formateur',
    credentials: 'Avocat Stagiaire au Barreau de Côte d\'Ivoire',
    image: '/images/faculty/uriel-ouattara.jpeg',
    quote: 'J\'interviendrai en qualité de formateur dans la pratique de la rédaction des actes de justice et des actes de plaidoirie.',
  },
  {
    id: 9,
    name: 'Dr Éric TAPÉ',
    role: 'Intervenant',
    credentials: 'Docteur en Droit Public de l\'Université Félix Houphouët-Boigny — Spécialisé en Marchés Publics et en Droit de la Promotion immobilière',
    image: '/images/faculty/eric-tape.jpeg',
    quote: 'J\'aurai à charge l\'aspect juridique de votre certification en pratique de la promotion immobilière.',
  },
  {
    id: 10,
    name: 'M. Fauchard Hervé KONAN',
    role: 'Intervenant',
    credentials: 'Ingénieur Génie Civil',
    image: '/images/faculty/fauchard-herve-konan.jpeg',
    quote: 'Je partagerai avec vous les aspects techniques de la promotion immobilière.',
  },
  {
  id: 11,
  name: 'M. ASSANDÉ Francis',
  role: 'Formateur',
  credentials: 'Clerc Assermenté habilité de commissaire de justice',
  image: '/images/faculty/assande-francis.jpeg',
  quote: 'Je vous apprendrai à rédiger les actes extrajudiciaires tels que les mises en demeure, les exploits de remise de lettre... Et découvrir des actes comme le procès-verbal.',
}
];

export default function FacultySection() {
  return (
    <section id="faculty" className="py-20 px-4 md:px-8 max-w-7xl mx-auto">
      {/* En-tête */}
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-['Playfair_Display'] text-white mb-4">
          Corps Enseignant
        </h2>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Une faculté d'exception composée de praticiens et d'universitaires de renom
        </p>
      </div>

      {/* Grille */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {faculty.map((member) => (
          <div
            key={member.id}
            className="bg-[#0f172a] border border-[#1E293B] rounded-xl overflow-hidden group hover:border-[#D4AF37]/20 transition-colors"
          >
            {/* Photo */}
            <div className="relative h-64 bg-[#1E293B]">
              <Image
                src={member.image}
                alt={member.name}
                fill
                className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] to-transparent" />
            </div>

            {/* Infos */}
            <div className="p-6">
              <h3 className="text-lg font-semibold text-white mb-1">
                {member.name}
              </h3>
              <p className="text-[#D4AF37] text-sm font-medium mb-3">
                {member.role}
              </p>
              <p className="text-gray-500 text-xs leading-relaxed mb-4">
                {member.credentials}
              </p>
              
              {/* Citation */}
              <div className="border-t border-[#1E293B] pt-4">
                <Quote className="w-4 h-4 text-[#D4AF37]/40 mb-2" />
                <p className="text-gray-400 text-sm italic leading-relaxed">
                  "{member.quote}"
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}