'use client';

import { useState, useEffect } from 'react';
import { Menu, X, LogIn, PenLine } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const navLinks = [
  { label: 'Programmes', href: '#certificates' },
  { label: 'Bourse', href: '#registration-form' },
  { label: 'Corps enseignant', href: '#faculty' },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToForm = () => {
    document.getElementById('registration-form')?.scrollIntoView({ behavior: 'smooth' });
    setMobileOpen(false);
  };

  return (
    <header 
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-[#0B0F19]/95 backdrop-blur-xl shadow-2xl shadow-black/40 border-b border-[#1E293B]' 
          : 'bg-[#0B0F19]/90 backdrop-blur-xl border-b border-[#1E293B]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16 lg:h-20">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 flex-shrink-0 group">
          <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-[#1E293B] group-hover:border-[#D4AF37]/30 transition-colors">
            <Image
              src="/images/logo.jpeg"
              alt="Université d'Été de Droit et de l'Immobilier"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="text-white font-['Playfair_Display'] text-sm sm:text-base lg:text-lg leading-tight tracking-tight">
              Université d&apos;Été
            </span>
            <span className="text-[#D4AF37] font-['Playfair_Display'] text-xs sm:text-sm leading-tight tracking-tight">
              Droit &amp; Immobilier
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="relative px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors whitespace-nowrap group"
            >
              {link.label}
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-[#D4AF37] group-hover:w-3/4 transition-all duration-300" />
            </a>
          ))}

          <div className="flex items-center gap-3 ml-6 pl-6 border-l border-[#1E293B]">
            <Link
              href="/login"
              className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors border border-[#1E293B] hover:border-[#D4AF37]/30 rounded-xl whitespace-nowrap"
            >
              <LogIn className="w-4 h-4" />
              <span className="hidden xl:inline">Espace Auditeur</span>
              <span className="xl:hidden">Connexion</span>
            </Link>

            <button
              onClick={scrollToForm}
              className="relative flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-[#D4AF37] to-amber-500 text-[#0B0F19] text-sm font-semibold rounded-xl overflow-hidden group whitespace-nowrap shadow-lg shadow-[#D4AF37]/20 hover:shadow-[#D4AF37]/40 transition-shadow"
            >
              <span className="relative z-10 flex items-center gap-1.5">
                <PenLine className="w-4 h-4" />
                <span className="hidden xl:inline">S&apos;inscrire / Postuler</span>
                <span className="xl:hidden">Bourse</span>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-[#D4AF37] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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
              className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-[#D4AF37] to-amber-500 text-[#0B0F19] font-semibold rounded-xl shadow-lg"
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