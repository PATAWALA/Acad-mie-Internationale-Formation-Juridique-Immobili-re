'use client';

import { ArrowRight, Shield } from 'lucide-react';

export default function StickyMobileCTA() {
  return (
    <div className="fixed bottom-0 inset-x-0 z-50 lg:hidden bg-[#0B0F19]/95 backdrop-blur-xl border-t border-[#1E293B] p-3">
      <a
        href="#registration-form"
        className="flex items-center justify-center gap-2 w-full py-3.5 bg-gradient-to-r from-[#D4AF37] to-amber-500 text-[#0B0F19] font-semibold rounded-xl hover:from-[#C5A028] hover:to-amber-600 transition-all active:scale-[0.98] shadow-lg shadow-[#D4AF37]/20 text-sm sm:text-base"
      >
        <Shield className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
        <span className="whitespace-nowrap">Postuler maintenant</span>
        <span className="hidden sm:inline whitespace-nowrap">(Bourse -40%)</span>
        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
      </a>
    </div>
  );
}