'use client';

const institutions = [
  "Barreau de Côte d'Ivoire",
  'Magistrature',
  "Air Côte d'Ivoire",
  'Cabinet Notarial',
  'Banque Atlantique',
  'Ministère de la Justice',
  "Cour d'Appel d'Abidjan",
  'Conseil National des Barreaux',
];

export default function PartnersMarquee() {
  return (
    <section className="py-12 border-y border-[#1E293B] overflow-hidden bg-[#0B0F19]/50">
      <p className="text-center text-gray-500 text-sm mb-8">
        Nos anciens auditeurs exercent dans les institutions les plus prestigieuses
      </p>
      
      <div className="relative">
        {/* Dégradés de fondu sur les bords */}
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[#0B0F19] to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-r from-transparent to-[#0B0F19] z-10" />
        
        {/* Ligne de logos */}
        <div className="flex gap-16 animate-scroll">
          {[...institutions, ...institutions].map((inst, i) => (
            <span 
              key={i} 
              className="text-gray-400 hover:text-[#D4AF37] text-sm whitespace-nowrap font-medium transition-colors cursor-default"
            >
              {inst}
            </span>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 30s linear infinite;
          width: max-content;
        }
      `}</style>
    </section>
  );
}