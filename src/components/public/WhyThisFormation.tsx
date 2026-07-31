import { Briefcase, FileText, Building2, Scale, TrendingUp, Users } from 'lucide-react';

const benefits = [
  {
    icon: Briefcase,
    title: 'Insertion professionnelle',
    description: '90% de nos certifiés décrochent un emploi dans les 3 mois suivant leur certification.',
  },
  {
    icon: FileText,
    title: 'Pratique réelle',
    description: 'Rédaction d\'actes juridiques, contrats, conclusions et mémoires comme en cabinet.',
  },
  {
    icon: Building2,
    title: 'Réseau professionnel',
    description: 'Accès à un réseau de magistrats, avocats, notaires et commissaires de justice.',
  },
  {
    icon: Scale,
    title: 'Certification reconnue',
    description: 'Une certification qui valorise votre CV auprès des recruteurs du secteur juridique.',
  },
  {
    icon: TrendingUp,
    title: '15 ans d\'expertise',
    description: 'Une méthode éprouvée par plus de 1000 auditeurs depuis 15 ans.',
  },
  {
    icon: Users,
    title: 'Bourse accessible',
    description: 'Jusqu\'à 50% de réduction grâce à la Bourse Mamadou TOURÉ.',
  },
];

export default function WhyThisFormation() {
  return (
    <section className="py-16 md:py-20 px-4 max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 font-['Playfair_Display']">
          Pourquoi choisir cette formation ?
        </h2>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Tout ce que vous devez savoir avant de rejoindre l&apos;Université d&apos;Été 2026
        </p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {benefits.map((benefit, index) => (
          <div
            key={index}
            className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 hover:border-[#D4AF37]/20 transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mb-4 group-hover:bg-amber-500/20 transition-colors">
              <benefit.icon className="w-6 h-6 text-amber-400" />
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">{benefit.title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">{benefit.description}</p>
          </div>
        ))}
      </div>
      <div className="text-center mt-10">
        <a
          href="#registration-form"
          className="inline-flex items-center gap-2 px-8 py-4 bg-[#D4AF37] text-[#0B0F19] rounded-xl font-semibold hover:bg-[#C5A028] transition-all text-lg shadow-lg shadow-[#D4AF37]/20"
        >
          Je m&apos;inscris maintenant
        </a>
      </div>
    </section>
  );
}