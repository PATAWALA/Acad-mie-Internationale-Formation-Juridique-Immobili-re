export default function StickyMobileCTA() {
  return (
    <div className="fixed bottom-0 inset-x-0 z-50 lg:hidden bg-[#0B0F19]/95 backdrop-blur-xl border-t border-[#1E293B] p-4">
      <a
        href="#registration-form"
        className="flex items-center justify-center gap-2 w-full py-4 bg-[#D4AF37] text-[#0B0F19] font-bold rounded-2xl hover:bg-[#C5A028] transition-all active:scale-95"
      >
        Postuler maintenant (Bourse -40%)
      </a>
    </div>
  );
}