'use client';

import { ArrowRight, Shield } from 'lucide-react';

export default function StickyMobileCTA() {
  return (
    <div className="fixed bottom-0 inset-x-0 z-50 lg:hidden bg-[#0B0F19]/95 backdrop-blur-xl border-t border-[#1E293B] p-4 pb-safe">
      <a
        href="#registration-form"
        className="flex items-center justify-center gap-2 w-full py-4 bg-gradient-to-r from-[#D4AF37] to-amber-500 text-[#0B0F19] font-bold rounded-2xl hover:from-[#C5A028] hover:to-amber-600 transition-all active:scale-[0.98] shadow-lg shadow-[#D4AF37]/20"
      >
        <Shield className="w-5 h-5" />
        Postuler maintenant (Bourse -40%)
        <ArrowRight className="w-5 h-5" />
      </a>
    </div>
  );
}