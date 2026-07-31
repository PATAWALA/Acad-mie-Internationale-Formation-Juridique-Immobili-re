'use client';

import { useState, useEffect } from 'react';
import { Check, Clock, ImageIcon, X, ArrowRight, BookOpen } from 'lucide-react';
import { createClientComponent } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { formatEUR } from '@/lib/currency';

export default function CertificatesGrid() {
  const supabase = createClientComponent();
  const [certificates, setCertificates] = useState<any[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailCert, setDetailCert] = useState<any | null>(null);

  useEffect(() => {
    const fetchCerts = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('certificates')
        .select('*')
        .order('id');
      if (data) setCertificates(data);
      setLoading(false);
    };
    fetchCerts();
  }, []);

  const toggleCert = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
    const event = new CustomEvent('preselect-cert', { detail: { id } });
    window.dispatchEvent(event);
    setTimeout(() => {
      document.getElementById('registration-form')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const totalNormal = selected.reduce((sum, id) => {
    const cert = certificates.find((c) => c.id === id);
    return sum + (cert?.price_normal || 0);
  }, 0);

  const totalBourse = selected.reduce((sum, id) => {
    const cert = certificates.find((c) => c.id === id);
    return sum + (cert?.price_bourse || 0);
  }, 0);

  if (loading) {
    return (
      <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto text-center">
        <p className="text-gray-400">Chargement des certifications...</p>
      </section>
    );
  }

  return (
    <section id="certificates" className="py-20 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-display text-white mb-4">
          Nos 9 Certifications d&apos;Excellence
        </h2>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Sélectionnez vos modules et rejoignez l&apos;élite juridique et immobilière grâce à la Bourse Mamadou TOURÉ
        </p>
        <p className="text-[#D4AF37] text-sm mt-2 font-medium">
          🎓 Université d'Été 2026 — Début le 08 Août
        </p>
      </div>

      {/* Résumé sélection (barre sticky) */}
      {selected.length > 0 && (
        <div className="sticky top-20 z-30 bg-[#0B0F19]/95 backdrop-blur-xl border border-[#1E293B] rounded-2xl p-4 mb-8 flex items-center justify-between flex-wrap gap-4">
          <span className="text-white">
            {selected.length} certificat(s) sélectionné(s)
          </span>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-gray-500 line-through text-sm block">
                {totalNormal.toLocaleString()} FCFA
              </span>
              <span className="text-gray-600 text-xs">
                {formatEUR(totalNormal)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[#D4AF37] font-bold text-lg block">
                {totalBourse.toLocaleString()} FCFA
              </span>
              <span className="text-gray-500 text-xs">
                {formatEUR(totalBourse)}
              </span>
            </div>
            <span className="text-green-400 text-sm font-semibold">
              -{totalNormal - totalBourse > 0 ? Math.round(((totalNormal - totalBourse) / totalNormal) * 100) : 0}%
            </span>
            <a
              href="#registration-form"
              className="px-5 py-2 bg-[#D4AF37] text-[#0B0F19] rounded-xl font-semibold text-sm hover:bg-[#C5A028] transition"
            >
              Continuer l&apos;inscription
            </a>
          </div>
        </div>
      )}

      {/* Grille */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {certificates.map((cert) => {
          const discount =
            cert.price_normal > 0
              ? Math.round(((cert.price_normal - cert.price_bourse) / cert.price_normal) * 100)
              : 0;
          return (
            <div
              key={cert.id}
              className={`relative bg-[#0f172a] border rounded-2xl p-6 transition-all duration-300 hover:shadow-xl ${
                selected.includes(cert.id)
                  ? 'border-[#D4AF37]/40 shadow-lg shadow-[#D4AF37]/10'
                  : 'border-[#1E293B] hover:border-[#D4AF37]/20'
              }`}
            >
              {selected.includes(cert.id) && (
                <div className="absolute top-4 right-4 w-6 h-6 bg-[#D4AF37] rounded-full flex items-center justify-center z-10">
                  <Check className="w-4 h-4 text-[#0B0F19]" />
                </div>
              )}
              {/* Image cliquable */}
              <div
                onClick={() => setDetailCert(cert)}
                className="mb-4 rounded-xl overflow-hidden bg-[#1E293B] h-40 flex items-center justify-center cursor-pointer group relative"
              >
                {cert.image_url ? (
                  <img
                    src={cert.image_url}
                    alt={cert.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <ImageIcon className="w-10 h-10 text-gray-600" />
                )}
                {/* Overlay "Voir détails" */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white text-sm font-semibold flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    Voir détails
                  </span>
                </div>
              </div>
              <h3
                onClick={() => setDetailCert(cert)}
                className="text-lg font-semibold text-white mb-2 cursor-pointer hover:text-[#D4AF37] transition-colors"
              >
                {cert.title}
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                <Clock className="w-4 h-4" />
                4 semaines
              </div>
              <div className="flex items-start gap-3 mb-4">
                <div>
                  <span className="text-gray-500 line-through text-sm block">
                    {cert.price_normal.toLocaleString()} FCFA
                  </span>
                  <span className="text-gray-600 text-xs">
                    {formatEUR(cert.price_normal)}
                  </span>
                </div>
                <div>
                  <span className="text-[#D4AF37] font-bold block">
                    {cert.price_bourse.toLocaleString()} FCFA
                  </span>
                  <span className="text-gray-500 text-xs">
                    {formatEUR(cert.price_bourse)}
                  </span>
                </div>
                {discount > 0 && (
                  <span className="text-green-400 text-xs font-semibold self-center">
                    -{discount}%
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => toggleCert(cert.id)}
                  className="flex-1 py-2 border border-[#D4AF37]/30 text-[#D4AF37] rounded-xl text-sm font-medium hover:bg-[#D4AF37]/10 transition"
                >
                  {selected.includes(cert.id) ? 'Retirer' : 'Choisir'}
                </button>
                <button
                  onClick={() => setDetailCert(cert)}
                  className="px-3 py-2 border border-[#1E293B] text-gray-400 rounded-xl text-sm hover:border-[#D4AF37]/30 hover:text-white transition"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de détail */}
      <AnimatePresence>
        {detailCert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDetailCert(null)}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0f172a] border border-[#1E293B] rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              {/* Image */}
              <div className="relative h-48 md:h-56 rounded-t-2xl overflow-hidden">
                {detailCert.image_url ? (
                  <img
                    src={detailCert.image_url}
                    alt={detailCert.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[#1E293B] flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-gray-600" />
                  </div>
                )}
                <button
                  onClick={() => setDetailCert(null)}
                  className="absolute top-3 right-3 w-8 h-8 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/80 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Contenu */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2">{detailCert.title}</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Formation pratique de 4 semaines — Certification professionnelle reconnue.
                </p>

                {/* Tarifs */}
                <div className="bg-[#020617] rounded-xl p-4 mb-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-gray-400 text-sm">Prix normal</span>
                    <div className="text-right">
                      <span className="text-gray-500 line-through text-sm block">
                        {detailCert.price_normal?.toLocaleString()} FCFA
                      </span>
                      <span className="text-gray-600 text-xs">
                        {formatEUR(detailCert.price_normal)}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-gray-400 text-sm">Prix Bourse</span>
                    <div className="text-right">
                      <span className="text-[#D4AF37] font-bold text-sm block">
                        {detailCert.price_bourse?.toLocaleString()} FCFA
                      </span>
                      <span className="text-gray-500 text-xs">
                        {formatEUR(detailCert.price_bourse)}
                      </span>
                    </div>
                  </div>
                  {detailCert.price_normal > detailCert.price_bourse && (
                    <div className="flex justify-between items-center pt-2 border-t border-[#1E293B]">
                      <span className="text-green-400 text-sm">Votre économie</span>
                      <span className="text-green-400 font-bold text-sm">
                        -{Math.round(((detailCert.price_normal - detailCert.price_bourse) / detailCert.price_normal) * 100)}%
                      </span>
                    </div>
                  )}
                </div>

                {/* Boutons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      toggleCert(detailCert.id);
                      setDetailCert(null);
                    }}
                    className={`flex-1 py-3 rounded-xl font-semibold text-sm transition ${
                      selected.includes(detailCert.id)
                        ? 'bg-green-500/10 border border-green-500/30 text-green-400'
                        : 'bg-[#D4AF37] text-[#0B0F19] hover:bg-[#C5A028]'
                    }`}
                  >
                    {selected.includes(detailCert.id) ? '✓ Sélectionné' : 'Choisir ce module'}
                  </button>
                  <a
                    href="#registration-form"
                    onClick={() => setDetailCert(null)}
                    className="flex-1 py-3 border border-[#1E293B] text-white rounded-xl font-semibold text-sm hover:border-[#D4AF37]/30 text-center transition"
                  >
                    S&apos;inscrire
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}