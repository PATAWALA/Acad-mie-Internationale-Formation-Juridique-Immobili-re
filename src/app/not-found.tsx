'use client';

import Link from 'next/link';
import { Home, Search, ArrowLeft, Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center px-4">
      <div className="text-center max-w-2xl mx-auto">
        {/* Icon */}
        <div className="w-24 h-24 bg-blue-500/10 border border-blue-500/20 rounded-3xl flex items-center justify-center mx-auto mb-8">
          <Compass className="w-12 h-12 text-blue-400" />
        </div>

        {/* Code erreur */}
        <h1 className="text-7xl lg:text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-500 mb-4">
          404
        </h1>

        {/* Message */}
        <h2 className="text-2xl lg:text-3xl font-bold text-white mb-3">
          Page introuvable
        </h2>
        <p className="text-slate-400 text-lg mb-8">
          Désolé, la page que vous recherchez n&apos;existe pas ou a été déplacée.
          <br className="hidden sm:block" />
          Vérifiez l&apos;URL ou retournez à l&apos;accueil.
        </p>

        {/* Boutons d'action */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/20"
          >
            <Home className="w-5 h-5" />
            Retour à l&apos;accueil
          </Link>
          <Link
            href="/formations"
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl transition-all"
          >
            <Search className="w-5 h-5" />
            Voir les formations
          </Link>
        </div>

        {/* Lien retour */}
        <button
          onClick={() => window.history.back()}
          className="mt-8 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Revenir à la page précédente
        </button>
      </div>
    </div>
  );
}