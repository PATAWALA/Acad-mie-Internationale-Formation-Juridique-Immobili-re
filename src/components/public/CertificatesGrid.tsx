'use client';

import { useState, useEffect } from 'react';
import { Check, Clock, ImageIcon, X, ArrowRight, BookOpen, GraduationCap, Briefcase, User, Star, Filter, Search } from 'lucide-react';
import { createClientComponent } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { formatEUR } from '@/lib/currency';

export default function CertificatesGrid() {
  const supabase = createClientComponent();
  const [certificates, setCertificates] = useState<any[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailCert, setDetailCert] = useState<any | null>(null);
  const [profileType, setProfileType] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('Tous');
  const [searchTerm, setSearchTerm] = useState('');

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

  // Catégories de filtres
  const categories = ['Tous', 'Droit', 'Immobilier', 'Rédaction', 'Construction'];

  const getFilteredCertificates = () => {
    let filtered = certificates;

    if (activeFilter === 'Droit') {
      filtered = filtered.filter(c => 
        c.title?.toLowerCase().includes('droit') || 
        c.title?.toLowerCase().includes('juridique') ||
        c.title?.toLowerCase().includes('justice') ||
        c.title?.toLowerCase().includes('contrats') ||
        c.title?.toLowerCase().includes('conclusions') ||
        c.title?.toLowerCase().includes('société')
      );
    } else if (activeFilter === 'Immobilier') {
      filtered = filtered.filter(c => 
        c.title?.toLowerCase().includes('immobilier') ||
        c.title?.toLowerCase().includes('syndic') ||
        c.title?.toLowerCase().includes('foncier') ||
        c.title?.toLowerCase().includes('lotissement')
      );
    } else if (activeFilter === 'Rédaction') {
      filtered = filtered.filter(c => 
        c.title?.toLowerCase().includes('rédaction') ||
        c.title?.toLowerCase().includes('rédiger')
      );
    } else if (activeFilter === 'Construction') {
      filtered = filtered.filter(c => 
        c.title?.toLowerCase().includes('construction') ||
        c.title?.toLowerCase().includes('promoteur') ||
        c.title?.toLowerCase().includes('aménagement')
      );
    }

    if (searchTerm.trim()) {
      filtered = filtered.filter(c =>
        c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.slogan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.skills?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const filteredCertificates = getFilteredCertificates();

  // 🎓 Total prix bourse pour étudiants (SOMME SIMPLE)
  const totalBourse = selected.reduce((sum, id) => {
    const cert = certificates.find((c) => c.id === id);
    return sum + (cert?.price_bourse || 0);
  }, 0);

  // Prix normal total
  const totalNormal = selected.reduce((sum, id) => {
    const cert = certificates.find((c) => c.id === id);
    return sum + (cert?.price_normal || 0);
  }, 0);

  // 👤 Prix stagiaire : -25% sur le total
  const getStagiairePrice = (price: number) => Math.round(price * 0.75);

  // 💼 Prix pro selon nombre de certifs
  const getProPrice = (price: number, percent: number) => Math.round(price * (1 - percent / 100));

  if (loading) {
    return (
      <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto text-center">
        <div className="animate-pulse space-y-8">
          <div className="h-10 bg-[#1e293b] rounded-lg w-64 mx-auto" />
          <div className="h-4 bg-[#1e293b] rounded-lg w-96 mx-auto" />
          <div className="flex justify-center gap-3">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="h-10 bg-[#1e293b] rounded-full w-24" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="certificates" className="py-20 px-4 md:px-8 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-5xl font-display text-white mb-4">
          Nos 9 Certifications d&apos;Excellence
        </h2>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Sélectionnez vos modules et rejoignez l&apos;élite juridique et immobilière
        </p>
        <p className="text-[#D4AF37] text-sm mt-2 font-medium">
          🎓 Université d&apos;Été 2026 — Début le 08 Août
        </p>
      </div>

      {/* FILTRES + RECHERCHE */}
      <div className="mb-10 space-y-4">
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Rechercher une certification..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-[#0f172a] border border-[#1e293b] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/20 transition-all text-sm"
          />
        </div>

        <div className="flex items-center justify-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-gray-500 mr-1" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeFilter === cat
                  ? 'bg-[#D4AF37] text-[#0B0F19] shadow-lg shadow-[#D4AF37]/20'
                  : 'bg-[#0f172a] border border-[#1e293b] text-gray-400 hover:text-white hover:border-[#D4AF37]/30'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <p className="text-center text-xs text-gray-500">
          {filteredCertificates.length} certification{filteredCertificates.length > 1 ? 's' : ''} trouvée{filteredCertificates.length > 1 ? 's' : ''}
          {activeFilter !== 'Tous' && <span> dans « {activeFilter} »</span>}
        </p>
      </div>

      {/* Résumé sélection (barre sticky) */}
      {selected.length > 0 && (
        <div className="sticky top-20 z-30 bg-[#0B0F19]/95 backdrop-blur-xl border border-[#1E293B] rounded-2xl p-5 mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <span className="text-white font-semibold">
              {selected.length} certification{selected.length > 1 ? 's' : ''} sélectionnée{selected.length > 1 ? 's' : ''}
            </span>
            <a
              href="#registration-form"
              className="px-6 py-3 bg-[#D4AF37] text-[#0B0F19] rounded-xl font-semibold text-sm hover:bg-[#C5A028] transition"
            >
              Continuer l&apos;inscription
            </a>
          </div>
        </div>
      )}

      {/* GRILLE */}
      {filteredCertificates.length === 0 ? (
        <div className="text-center py-16">
          <Search className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Aucune certification trouvée</h3>
          <p className="text-sm text-gray-400">Essayez de modifier votre recherche ou votre filtre.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {filteredCertificates.map((cert) => {
            const isSelected = selected.includes(cert.id);
            // Prix PRO selon nombre de certifs sélectionnés
            const proPercent = selected.length <= 2 ? 10 : selected.length <= 4 ? 15 : 20;
            const proPrice1 = getProPrice(cert.price_normal, 10);
            const proPrice2 = getProPrice(cert.price_normal, 15);
            const proPrice3 = getProPrice(cert.price_normal, 20);

            return (
              <motion.div
                key={cert.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className={`relative bg-[#0f172a] border rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl ${
                  isSelected
                    ? 'border-[#D4AF37]/60 shadow-lg shadow-[#D4AF37]/10 ring-1 ring-[#D4AF37]/30'
                    : 'border-[#1E293B] hover:border-[#D4AF37]/30'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-4 right-4 w-8 h-8 bg-[#D4AF37] rounded-full flex items-center justify-center z-10 shadow-lg">
                    <Check className="w-5 h-5 text-[#0B0F19]" />
                  </div>
                )}

                {/* Image */}
                <div
                  onClick={() => setDetailCert(cert)}
                  className="h-48 lg:h-52 bg-[#1E293B] overflow-hidden cursor-pointer group relative"
                >
                  {cert.image_url ? (
                    <img
                      src={cert.image_url}
                      alt={cert.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-12 h-12 text-gray-600" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white font-semibold flex items-center gap-2">
                      <BookOpen className="w-5 h-5" />
                      Voir les détails
                    </span>
                  </div>
                </div>

                {/* Contenu */}
                <div className="p-6">
                  <h3
                    onClick={() => setDetailCert(cert)}
                    className="text-base font-bold text-white mb-2 cursor-pointer hover:text-[#D4AF37] transition-colors line-clamp-2"
                  >
                    {cert.title}
                  </h3>

                  <div className="flex items-center gap-2 text-xs text-gray-400 mb-5">
                    <span className="flex items-center gap-1.5 bg-[#020617] px-2 py-1 rounded-lg">
                      <Clock className="w-3.5 h-3.5" />4 semaines
                    </span>
                    <span className="flex items-center gap-1.5 bg-[#020617] px-2 py-1 rounded-lg">
                      <Star className="w-3.5 h-3.5 text-[#D4AF37]" />Certifié
                    </span>
                  </div>

                  {/* TABLEAU DES TARIFS */}
                  <div className="bg-[#020617] border border-[#1E293B] rounded-xl overflow-hidden mb-5 text-sm">
                    
                    {/* 🎓 ÉTUDIANTS - Prix bourse DIRECT */}
                    <div className="p-4 border-b border-[#1E293B]">
                      <div className="flex items-center gap-2 mb-3">
                        <GraduationCap className="w-4 h-4 text-blue-400" />
                        <span className="text-blue-400 font-semibold text-xs uppercase tracking-wider">Étudiants</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500 text-xs">Prix normal</span>
                          <span className="text-gray-600 line-through text-xs">
                            {cert.price_normal.toLocaleString()} FCFA
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 text-xs">Prix bourse</span>
                          <div className="text-right">
                            <span className="text-[#D4AF37] font-bold">
                              {cert.price_bourse.toLocaleString()} FCFA
                            </span>
                            <span className="text-gray-600 text-[10px] block">
                              {formatEUR(cert.price_bourse)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 👤 STAGIAIRES */}
                    <div className="p-4 border-b border-[#1E293B]">
                      <div className="flex items-center gap-2 mb-3">
                        <User className="w-4 h-4 text-green-400" />
                        <span className="text-green-400 font-semibold text-xs uppercase tracking-wider">Stagiaires</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500 text-xs">Prix normal</span>
                          <span className="text-gray-600 line-through text-xs">
                            {cert.price_normal.toLocaleString()} FCFA
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 text-xs">Tarif préférentiel</span>
                          <div className="text-right">
                            <span className="text-white font-bold">
                              {getStagiairePrice(cert.price_normal).toLocaleString()} FCFA
                            </span>
                            <span className="text-gray-500 text-[10px] block">
                              {formatEUR(getStagiairePrice(cert.price_normal))}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 💼 PROFESSIONNELS */}
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Briefcase className="w-4 h-4 text-amber-400" />
                        <span className="text-amber-400 font-semibold text-xs uppercase tracking-wider">Professionnels</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500 text-xs">Prix normal</span>
                          <span className="text-gray-600 line-through text-xs">
                            {cert.price_normal.toLocaleString()} FCFA
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 text-xs">1-2 certifications (-10%)</span>
                          <div className="text-right">
                            <span className="text-white font-semibold">{proPrice1.toLocaleString()} FCFA</span>
                            <span className="text-gray-500 text-[10px] block">{formatEUR(proPrice1)}</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 text-xs">3-4 certifications (-15%)</span>
                          <div className="text-right">
                            <span className="text-white font-semibold">{proPrice2.toLocaleString()} FCFA</span>
                            <span className="text-gray-500 text-[10px] block">{formatEUR(proPrice2)}</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 text-xs">5+ certifications (-20%)</span>
                          <div className="text-right">
                            <span className="text-white font-semibold">{proPrice3.toLocaleString()} FCFA</span>
                            <span className="text-gray-500 text-[10px] block">{formatEUR(proPrice3)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Boutons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleCert(cert.id)}
                      className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all ${
                        isSelected
                          ? 'bg-green-500/10 border border-green-500/40 text-green-400'
                          : 'bg-[#D4AF37] text-[#0B0F19] hover:bg-[#C5A028]'
                      }`}
                    >
                      {isSelected ? '✓ Sélectionné' : 'Choisir ce module'}
                    </button>
                    <button
                      onClick={() => setDetailCert(cert)}
                      className="px-4 py-3 border border-[#1E293B] text-gray-400 rounded-xl text-sm hover:border-[#D4AF37]/30 hover:text-white transition"
                    >
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

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
              className="bg-[#0f172a] border border-[#1E293B] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="relative h-56 md:h-64 rounded-t-2xl overflow-hidden">
                {detailCert.image_url ? (
                  <img src={detailCert.image_url} alt={detailCert.title} className="w-full h-full object-cover" />
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

              <div className="p-8">
                <h3 className="text-2xl font-bold text-white mb-2">{detailCert.title}</h3>
                {detailCert.slogan && (
                  <p className="text-[#D4AF37] text-sm italic mb-6">« {detailCert.slogan} »</p>
                )}

                {detailCert.skills && (
                  <div className="mb-4">
                    <h4 className="text-white font-semibold mb-2">Compétences acquises</h4>
                    <p className="text-gray-400 text-sm whitespace-pre-line">{detailCert.skills}</p>
                  </div>
                )}

                {detailCert.target_audience && (
                  <div className="mb-4">
                    <h4 className="text-white font-semibold mb-2">Public cible</h4>
                    <p className="text-gray-400 text-sm whitespace-pre-line">{detailCert.target_audience}</p>
                  </div>
                )}

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => {
                      toggleCert(detailCert.id);
                      setDetailCert(null);
                    }}
                    className={`flex-1 py-3.5 rounded-xl font-semibold text-sm transition ${
                      selected.includes(detailCert.id)
                        ? 'bg-green-500/10 border border-green-500/40 text-green-400'
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