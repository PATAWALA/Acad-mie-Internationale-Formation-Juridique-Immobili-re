import { Users, ArrowRight, Shield } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="pt-28 lg:pt-36 pb-16 px-4 md:px-8 max-w-7xl mx-auto text-center">
      {/* Badge Urgence */}
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-full mb-6 motion-safe:animate-fade-in">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4AF37] opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D4AF37]" />
        </span>
        <span className="text-sm text-[#D4AF37] font-medium">
          Bourse Mamadou TOURÉ — Places Limitées Session 2026
        </span>
      </div>

      {/* Titre */}
      <h1 className="text-4xl md:text-6xl lg:text-7xl font-display text-white leading-tight mb-6 motion-safe:animate-fade-in">
        Le pont direct entre la{' '}
        <span className="text-[#D4AF37]">théorie universitaire</span> et la{' '}
        <span className="text-[#D4AF37]">pratique d&apos;élite</span>
      </h1>

      {/* Subtitle */}
      <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto mb-8 motion-safe:animate-fade-in">
        15 ans d&apos;expérience, 500+ auditeurs formés et insérés dans les plus
        prestigieuses institutions juridiques et immobilières.
      </p>

      {/* CTA Principal */}
      <div className="mb-10 motion-safe:animate-fade-in">
        <a
          href="#registration-form"
          className="inline-flex items-center gap-2 px-8 py-4 bg-[#D4AF37] text-[#0B0F19] rounded-2xl font-bold text-lg hover:bg-[#C5A028] transition-all hover:shadow-2xl hover:shadow-[#D4AF37]/30 hover:scale-105 group"
        >
          <Shield className="w-5 h-5" />
          Postuler à la Bourse maintenant
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </a>
        <p className="text-gray-500 text-sm mt-3">
          Économisez jusqu&apos;à 40% sur votre certification
        </p>
      </div>

      {/* Social Proof */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 motion-safe:animate-fade-in">
        <div className="flex -space-x-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-10 h-10 rounded-full bg-[#1E293B] border-2 border-[#0B0F19] flex items-center justify-center text-[#D4AF37] text-xs font-bold"
            >
              {String.fromCharCode(64 + i)}
            </div>
          ))}
          <div className="w-10 h-10 rounded-full bg-[#D4AF37]/10 border-2 border-[#0B0F19] flex items-center justify-center text-[#D4AF37] text-xs font-bold">
            +500
          </div>
        </div>
        <div>
          <div className="flex items-center gap-0.5 justify-center sm:justify-start mb-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg key={star} className="w-4 h-4 text-[#D4AF37]" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <p className="text-sm text-gray-400">
            <span className="text-white font-semibold">500+</span> Magistrats, Avocats et Directeurs Juridiques formés
          </p>
        </div>
      </div>
    </section>
  );
}