import { Award } from 'lucide-react';

const faculty = [
  {
    name: 'Dr. Jean-Louis LOBÉ',
    role: 'Fondateur & Directeur Académique',
    description: 'Docteur en Droit, 15 ans d\'expérience en formation juridique.',
    highlight: true,
  },
  {
    name: 'Me Kouassi A.',
    role: 'Avocat au Barreau, Médiateur Agréé',
    description: 'Spécialiste en droit des affaires et arbitrage international.',
    highlight: false,
  },
  {
    name: 'Pr. Yao K.',
    role: 'Commissaire de Justice',
    description: 'Ancien Président de la Chambre Nationale des Commissaires de Justice.',
    highlight: false,
  },
];

export default function FacultySection() {
  return (
    <section id="faculty" className="py-20 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-display text-white mb-4">
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
            className={`bg-[#0f172a] border rounded-2xl p-6 text-center ${
              member.highlight
                ? 'border-[#D4AF37]/40 shadow-lg shadow-[#D4AF37]/10'
                : 'border-[#1E293B]'
            }`}
          >
            <div className="w-20 h-20 rounded-full bg-[#1E293B] border-2 border-[#D4AF37]/20 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-display text-[#D4AF37]">
                {member.name.charAt(0)}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">{member.name}</h3>
            <p className="text-[#D4AF37] text-sm mb-3">{member.role}</p>
            <p className="text-gray-400 text-sm">{member.description}</p>
            {member.highlight && (
              <div className="mt-4 inline-flex items-center gap-1 px-3 py-1 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-full text-xs text-[#D4AF37]">
                <Award className="w-3 h-3" />
                Directeur
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}