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
    <section className="py-12 border-y border-[#1E293B] overflow-hidden">
      <p className="text-center text-gray-500 text-sm mb-6">
        Nos anciens auditeurs exercent dans les institutions les plus prestigieuses
      </p>
      <div className="flex gap-12 animate-scroll">
        {[...institutions, ...institutions].map((inst, i) => (
          <span key={i} className="text-gray-400 text-sm whitespace-nowrap font-medium">
            {inst}
          </span>
        ))}
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