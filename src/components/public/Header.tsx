'use client';

import { useState } from 'react';
import { Menu, X, Award, LogIn, PenLine } from 'lucide-react';
import Link from 'next/link';

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16 lg:h-20">
        {/* Logo & Badge */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <Link href="/" className="flex items-center gap-2">
            <Award className="w-6 h-6 text-[#D4AF37]" />
            <span className="text-white font-display text-base sm:text-lg lg:text-xl tracking-tight whitespace-nowrap">
              Académie<span className="text-[#D4AF37]">Internationale</span>
            </span>
          </Link>
          <span className="hidden md:inline-flex items-center gap-1 px-3 py-1 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-full text-xs text-[#D4AF37]">
            🏆 Accréditation 2026
          </span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-gray-400 hover:text-white transition-colors whitespace-nowrap"
            >
              {link.label}
            </a>
          ))}

          <div className="flex items-center gap-3 ml-2">
            {/* Bouton Espace Auditeur (connexion) */}
            <Link
              href="/login"
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-300 hover:text-white transition-colors border border-transparent hover:border-[#D4AF37]/20 rounded-xl whitespace-nowrap"
            >
              <LogIn className="w-4 h-4" />
              <span className="hidden xl:inline">Espace Auditeur</span>
              <span className="xl:hidden">Connexion</span>
            </Link>

            {/* Bouton S'inscrire / Postuler */}
            <button
              onClick={scrollToForm}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-[#D4AF37] text-[#0B0F19] text-sm font-semibold rounded-xl hover:bg-[#C5A028] transition-all hover:shadow-lg hover:shadow-[#D4AF37]/20 whitespace-nowrap"
            >
              <PenLine className="w-4 h-4" />
              <span className="hidden xl:inline">S&apos;inscrire / Postuler</span>
              <span className="xl:hidden">Bourse</span>
            </button>
          </div>
        </nav>

        {/* Mobile Toggle */}
        <button
          className="lg:hidden text-white p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Menu"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-[#0B0F19] border-t border-[#1E293B] px-6 py-4 space-y-2">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block py-3 text-gray-400 hover:text-white transition-colors"
            >
              {link.label}
            </a>
          ))}
          <div className="pt-3 border-t border-[#1E293B] space-y-3">
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-3 border border-[#1E293B] text-gray-300 rounded-xl hover:bg-[#1E293B]/50 transition"
            >
              <LogIn className="w-4 h-4" />
              Espace Auditeur (Connexion)
            </Link>
            <button
              onClick={scrollToForm}
              className="flex items-center justify-center gap-2 w-full py-3 bg-[#D4AF37] text-[#0B0F19] font-semibold rounded-xl"
            >
              <PenLine className="w-4 h-4" />
              S&apos;inscrire / Postuler
            </button>
          </div>
        </div>
      )}
    </header>
  );
}