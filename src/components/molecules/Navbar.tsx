'use client';

import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="fixed top-0 inset-x-0 z-50 bg-dark-900/90 backdrop-blur-xl border-b border-dark-700">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
        <Link href="/" className="text-gold-400 font-display text-2xl">
          Académie<span className="text-white">Internationale</span>
        </Link>
        <div className="flex items-center gap-4">
          <a
            href="#registration-form"
            className="px-4 py-2 bg-gold-400 text-dark-900 text-sm font-semibold rounded-xl hover:bg-gold-500 transition"
          >
            Postuler à la Bourse
          </a>
        </div>
      </div>
    </nav>
  );
}