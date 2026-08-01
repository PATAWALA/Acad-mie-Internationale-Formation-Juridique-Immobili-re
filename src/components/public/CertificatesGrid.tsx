'use client';

import { useState, useEffect } from 'react';
import { Check, Clock, ImageIcon, X, ArrowRight, BookOpen, TrendingUp, Star, Users, Target } from 'lucide-react';
import { createClientComponent } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { formatEUR, calculateReducedPrice } from '@/lib/currency';

export default function CertificatesGrid() {
  const supabase = createClientComponent();
  const [certificates, setCertificates] = useState<any[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailCert, setDetailCert] = useState<any | null>(null);
  const [profileType, setProfileType] = useState('Etudiant'); // Par défaut, sera mis à jour

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
    
    // Récupérer le profil si connecté
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('profile_type')
          .eq('id', user.id)
          .single();
        if (profile?.profile_type) {
          setProfileType(profile.profile_type);
        }
      }
    };
    checkUser();
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

  // Calcul de la réduction
  const priceCalculation = calculateReducedPrice(totalNormal, profileType, selected.length);

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
          Sélectionnez vos modules et rejoignez l&apos;élite juridique et immobilière
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
            {priceCalculation.showDiscount && (
              <>
                <div className="text-right">
                  <span className="text-gray-500 line-through text-sm block">
                    {totalNormal.toLocaleString()} FCFA
                  </span>
                  <span className="text-gray-600 text-xs">
                    {formatEUR(totalNormal)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-green-400 text-sm font-semibold block">
                    -{priceCalculation.discountPercent}%
                  </span>
                  <span className="text-green-500 text-xs">
                    -{priceCalculation.discount.toLocaleString()} FCFA
                  </span>
                </div>
              </>
            )}
            <div className="text-right">
              <span className="text-[#D4AF37] font-bold text-lg block">
                {priceCalculation.finalPrice.toLocaleString()} FCFA
              </span>
              <span className="text-gray-500 text-xs">
                {formatEUR(priceCalculation.finalPrice)}
              </span>
            </div>
            <a
              href="#registration-form"
              className="px-5 py-2 bg-[#D4AF37] text-[#0B0F19] rounded-xl font-semibold text-sm hover:bg-[#C5A028] transition"
            >
              Continuer l&apos;inscription
            </a>
          </div>
        </div>
      )}

      {/* Grille - Cartes PLUS GRANDES */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {certificates.map((cert) => {
          const discount =
            cert.price_normal > 0
              ? Math.round(((cert.price_normal - cert.price_bourse) / cert.price_normal) * 100)
              : 0;
          return (
            <div
              key={cert.id}
              className={`relative bg-[#0f172a] border rounded-2xl p-6 lg:p-8 transition-all duration-300 hover:shadow-xl hover:shadow-[#D4AF37]/5 ${
                selected.includes(cert.id)
                  ? 'border-[#D4AF37]/40 shadow-lg shadow-[#D4AF37]/10 scale-[1.02]'
                  : 'border-[#1E293B] hover:border-[#D4AF37]/20 hover:scale-[1.01]'
              }`}
            >
              {selected.includes(cert.id) && (
                <div className="absolute top-4 right-4 w-8 h-8 bg-[#D4AF37] rounded-full flex items-center justify-center z-10 shadow-lg shadow-[#D4AF37]/30">
                  <Check className="w-5 h-5 text-[#0B0F19]" />
                </div>
              )}
              
              {/* Image cliquable - PLUS GRANDE */}
              <div
                onClick={() => setDetailCert(cert)}
                className="mb-5 rounded-xl overflow-hidden bg-[#1E293B] h-48 lg:h-56 flex items-center justify-center cursor-pointer group relative"
              >
                {cert.image_url ? (
                  <img
                    src={cert.image_url}
                    alt={cert.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <ImageIcon className="w-12 h-12 text-gray-600" />
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white text-sm font-semibold flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Voir détails
                  </span>
                </div>
              </div>

              {/* Titre */}
              <h3
                onClick={() => setDetailCert(cert)}
                className="text-lg lg:text-xl font-semibold text-white mb-3 cursor-pointer hover:text-[#D4AF37] transition-colors line-clamp-2"
              >
                {cert.title}
              </h3>

              {/* Infos rapides */}
              <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  4 semaines
                </span>
                <span className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-[#D4AF37]" />
                  Certifié
                </span>
              </div>

              {/* Slogan */}
              {cert.slogan && (
                <p className="text-xs text-gray-500 mb-4 line-clamp-2 italic">
                  "{cert.slogan}"
                </p>
              )}

              {/* Prix */}
              <div className="bg-[#020617] rounded-xl p-4 mb-4 space-y-2">
                {/* Prix normal (barré si réduction) */}
                {priceCalculation.showDiscount && selected.includes(cert.id) ? (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-sm">Prix normal</span>
                    <span className="text-gray-500 line-through text-sm">
                      {cert.price_normal.toLocaleString()} FCFA
                    </span>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Prix</span>
                    <span className="text-white font-semibold">
                      {cert.price_normal.toLocaleString()} FCFA
                    </span>
                  </div>
                )}
                
                {/* Prix réduit (si sélectionné et calculé) */}
                {selected.includes(cert.id) ? (
                  <div className="flex justify-between items-center pt-2 border-t border-[#1E293B]">
                    <span className="text-gray-400 text-sm">
                      {priceCalculation.showDiscount ? 'Prix réduit' : 'Total'}
                    </span>
                    <div className="text-right">
                      <span className="text-[#D4AF37] font-bold text-lg">
                        {Math.round(priceCalculation.finalPrice / selected.length).toLocaleString()} FCFA
                      </span>
                      <p className="text-xs text-gray-500">
                        {formatEUR(Math.round(priceCalculation.finalPrice / selected.length))}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-center pt-2 border-t border-[#1E293B]">
                    <span className="text-gray-400 text-sm">Total</span>
                    <div className="text-right">
                      <span className="text-white font-semibold">
                        {cert.price_normal.toLocaleString()} FCFA
                      </span>
                      <p className="text-xs text-gray-500">
                        {formatEUR(cert.price_normal)}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Compétences (si dispo) */}
              {cert.skills && (
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                    <Target className="w-3 h-3" /> Compétences visées :
                  </p>
                  <p className="text-xs text-gray-400 line-clamp-2">{cert.skills}</p>
                </div>
              )}

              {/* Boutons */}
              <div className="flex gap-2">
                <button
                  onClick={() => toggleCert(cert.id)}
                  className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${
                    selected.includes(cert.id)
                      ? 'bg-green-500/10 border border-green-500/30 text-green-400'
                      : 'border border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/10'
                  }`}
                >
                  {selected.includes(cert.id) ? '✓ Sélectionné' : 'Choisir ce module'}
                </button>
                <button
                  onClick={() => setDetailCert(cert)}
                  className="px-4 py-3 border border-[#1E293B] text-gray-400 rounded-xl text-sm hover:border-[#D4AF37]/30 hover:text-white transition"
                >
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de détail - PLUS GRANDE */}
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
              className="bg-[#0f172a] border border-[#1E293B] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              {/* Image - PLUS GRANDE */}
              <div className="relative h-56 md:h-72 rounded-t-2xl overflow-hidden">
                {detailCert.image_url ? (
                  <img
                    src={detailCert.image_url}
                    alt={detailCert.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[#1E293B] flex items-center justify-center">
                    <ImageIcon className="w-16 h-16 text-gray-600" />
                  </div>
                )}
                <button
                  onClick={() => setDetailCert(null)}
                  className="absolute top-3 right-3 w-10 h-10 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/80 transition"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Contenu - PLUS DÉTAILLÉ */}
              <div className="p-8">
                <h3 className="text-2xl font-bold text-white mb-3">{detailCert.title}</h3>
                
                {detailCert.slogan && (
                  <p className="text-[#D4AF37] text-sm italic mb-4">"{detailCert.slogan}"</p>
                )}
                
                <p className="text-gray-400 text-sm mb-6">
                  Formation pratique de 4 semaines — Certification professionnelle reconnue par l'Université d'Été.
                </p>

                {/* Compétences */}
                {detailCert.skills && (
                  <div className="mb-4">
                    <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                      <Target className="w-4 h-4 text-blue-400" /> Compétences acquises
                    </h4>
                    <p className="text-gray-400 text-sm">{detailCert.skills}</p>
                  </div>
                )}

                {/* Public cible */}
                {detailCert.target_audience && (
                  <div className="mb-4">
                    <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                      <Users className="w-4 h-4 text-green-400" /> Public cible
                    </h4>
                    <p className="text-gray-400 text-sm">{detailCert.target_audience}</p>
                  </div>
                )}

                {/* Avantages */}
                {detailCert.benefits && (
                  <div className="mb-6">
                    <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                      <Star className="w-4 h-4 text-[#D4AF37]" /> Avantages
                    </h4>
                    <p className="text-gray-400 text-sm">{detailCert.benefits}</p>
                  </div>
                )}

                {/* Tarifs */}
                <div className="bg-[#020617] rounded-xl p-5 mb-6 space-y-3">
                  {priceCalculation.showDiscount && selected.includes(detailCert.id) ? (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Prix normal</span>
                        <span className="text-gray-500 line-through">
                          {detailCert.price_normal?.toLocaleString()} FCFA
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Réduction ({priceCalculation.discountPercent}%)</span>
                        <span className="text-green-400">
                          -{Math.round(priceCalculation.discount / selected.length).toLocaleString()} FCFA
                        </span>
                      </div>
                      <div className="flex justify-between text-sm pt-2 border-t border-[#1E293B]">
                        <span className="text-white font-semibold">Prix final</span>
                        <div className="text-right">
                          <span className="text-[#D4AF37] font-bold text-lg">
                            {Math.round(priceCalculation.finalPrice / selected.length).toLocaleString()} FCFA
                          </span>
                          <p className="text-xs text-gray-500">
                            {formatEUR(Math.round(priceCalculation.finalPrice / selected.length))}
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Prix</span>
                        <span className="text-white font-bold">
                          {detailCert.price_normal?.toLocaleString()} FCFA
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 text-right">
                        {formatEUR(detailCert.price_normal)}
                      </p>
                    </>
                  )}
                </div>

                {/* Boutons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      toggleCert(detailCert.id);
                      setDetailCert(null);
                    }}
                    className={`flex-1 py-3.5 rounded-xl font-semibold text-sm transition ${
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
                    className="flex-1 py-3.5 border border-[#1E293B] text-white rounded-xl font-semibold text-sm hover:border-[#D4AF37]/30 text-center transition"
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