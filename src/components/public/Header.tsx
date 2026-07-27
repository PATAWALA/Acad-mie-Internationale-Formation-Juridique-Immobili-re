'use client';

import { useState } from 'react';
import { Menu, X, Award } from 'lucide-react';

const navLinks = [
  { label: 'Programmes', href: '#certificates' },
  { label: 'Bourse', href: '#bourse' },
  { label: 'Témoignages', href: '#testimonials' },
  { label: 'Corps enseignant', href: '#faculty' },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const scrollToForm = () => {
    document.getElementById('registration-form')?.scrollIntoView({ behavior: 'smooth' });
    setMobileOpen(false);
  };

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-[#0B0F19]/90 backdrop-blur-xl border-b border-[#1E293B]">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16 lg:h-20">
        {/* Logo & Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Award className="w-6 h-6 text-[#D4AF37]" />
            <span className="text-white font-display text-lg lg:text-xl tracking-tight">
              Académie<span className="text-[#D4AF37]">Internationale</span>
            </span>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-full text-xs text-[#D4AF37]">
            🏆 Accréditation 2026
          </span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              {link.label}
            </a>
          ))}
          <button
            onClick={scrollToForm}
            className="px-5 py-2.5 bg-[#D4AF37] text-[#0B0F19] text-sm font-semibold rounded-xl hover:bg-[#C5A028] transition-all hover:shadow-lg hover:shadow-[#D4AF37]/20"
          >
            Postuler à la Bourse
          </button>
        </nav>

        {/* Mobile Toggle */}
        <button
          className="lg:hidden text-white"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Menu"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-[#0B0F19] border-t border-[#1E293B] px-6 py-4 space-y-3">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block py-2 text-gray-400 hover:text-white"
            >
              {link.label}
            </a>
          ))}
          <button
            onClick={scrollToForm}
            className="w-full py-3 bg-[#D4AF37] text-[#0B0F19] font-semibold rounded-xl"
          >
            Postuler à la Bourse
          </button>
        </div>
      )}
    </header>
  );
}