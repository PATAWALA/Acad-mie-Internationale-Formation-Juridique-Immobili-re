'use client';

import { useEffect, useState } from 'react';
import { createClientComponent } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, BookOpen, Clock, Star,
  TrendingUp, Sparkles, ChevronRight,
  CheckCircle2, AlertCircle, ArrowRight, Loader2,
  Shield, ImageIcon, Target, GraduationCap, Briefcase, User,
  Upload, FileCheck2
} from 'lucide-react';
import { formatEUR } from '@/lib/currency';

interface CatalogueViewProps {
  profile: any;
  enrollments: any[];
  onNavigateFormation: (certId: number) => void;
  onRefresh: () => void;
}

export default function CatalogueView({ profile, enrollments, onNavigateFormation, onRefresh }: CatalogueViewProps) {
  const supabase = createClientComponent();
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [subscribingId, setSubscribingId] = useState<number | null>(null);

  const profileType = profile?.profile_type || 'Etudiant';

  useEffect(() => {
    supabase
      .from('certificates')
      .select('*')
      .order('title')
      .then(({ data }) => {
        if (data) setCertificates(data);
        setLoading(false);
      });
  }, []);

  const filteredCertificates = certificates.filter(cert => {
    return cert.title?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const totalAvailable = certificates.length;
  const myFormations = enrollments.length;

  // 🆕 Calcul du prix selon le profil et le total des formations
  const getDisplayPrice = (cert: any) => {
    const count = myFormations;

    if (profileType === 'Etudiant') {
      return {
        price: cert.price_bourse,
        normalPrice: cert.price_normal,
        label: 'Prix bourse',
        showDiscount: true
      };
    }

    if (profileType === 'Stagiaire') {
      const reduced = Math.round(cert.price_normal * 0.75);
      return {
        price: reduced,
        normalPrice: cert.price_normal,
        label: 'Tarif stagiaire',
        showDiscount: true
      };
    }

    let percent = 10;
    if (count >= 3 && count <= 4) percent = 15;
    if (count >= 5) percent = 20;

    const futureTotal = count + 1;
    let futurePercent = 10;
    if (futureTotal >= 3 && futureTotal <= 4) futurePercent = 15;
    if (futureTotal >= 5) futurePercent = 20;

    const reduced = Math.round(cert.price_normal * (1 - percent / 100));

    return {
      price: reduced,
      normalPrice: cert.price_normal,
      percent,
      futurePercent,
      futureTotal,
      label: `-${percent}%`,
      showDiscount: true
    };
  };

  const handleSubscribe = async (certId: number) => {
    if (!profile) return;

    const already = enrollments.find(e => e.certificate_id === certId);
    if (already) {
      onNavigateFormation(certId);
      return;
    }

    setSubscribingId(certId);
    const cert = certificates.find(c => c.id === certId);
    const displayPrice = getDisplayPrice(cert);

    const { error } = await supabase.from('enrollments').insert({
      student_id: profile.id,
      student_name: profile.full_name || profile.email,
      certificate_id: certId,
      phone: profile.phone || '',
      email: profile.email,
      amount_paid: 0,
      remaining_balance: displayPrice.price,
      payment_status: 'PENDING',
    });

    if (!error) {
      onRefresh();
      onNavigateFormation(certId);
    } else {
      alert('Erreur : ' + error.message);
    }
    setSubscribingId(null);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-[#1e293b] rounded-lg w-48 mb-4" />
          <div className="h-4 bg-[#1e293b] rounded-lg w-96" />
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="animate-pulse bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6">
              <div className="h-40 bg-[#1e293b] rounded-xl mb-4" />
              <div className="h-4 bg-[#1e293b] rounded w-3/4 mb-3" />
              <div className="h-3 bg-[#1e293b] rounded w-full mb-2" />
              <div className="h-10 bg-[#1e293b] rounded-xl w-28" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-blue-500/10 rounded-lg">
                <BookOpen className="w-4 h-4 text-blue-400" />
              </div>
              <h2 className="text-xl lg:text-2xl font-bold text-white">Catalogue des Formations</h2>
            </div>
            <p className="text-sm text-slate-400">
              {totalAvailable} formations disponibles • {myFormations} déjà inscrite{myFormations > 1 ? 's' : ''}
              {profileType !== 'Etudiant' && profileType !== 'Stagiaire' && (
                <span className="text-green-400 ml-2">
                  • Réduction active : {
                    myFormations >= 5 ? '20%' : myFormations >= 3 ? '15%' : '10%'
                  }
                </span>
              )}
            </p>
          </div>

          <div className="flex gap-3">
            <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl px-3 py-2 text-center">
              <p className="text-lg font-bold text-green-400">{myFormations}</p>
              <p className="text-[10px] text-slate-500">Mes formations</p>
            </div>
            <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl px-3 py-2 text-center">
              <p className="text-lg font-bold text-blue-400">{totalAvailable}</p>
              <p className="text-[10px] text-slate-500">Disponibles</p>
            </div>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Rechercher une formation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-[#0f172a] border border-[#1e293b] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all text-sm"
          />
        </div>
      </motion.div>

      {/* Bannière selon profil */}
      {profileType === 'Etudiant' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 p-4">
          <div className="flex items-start gap-3">
            <GraduationCap className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-blue-400 mb-1">🎓 Tarif Étudiant - Bourse Mamadou TOURÉ</h3>
              <p className="text-xs text-slate-400">Profitez du prix bourse sur toutes vos formations.</p>
            </div>
          </div>
        </motion.div>
      )}

      {profileType === 'Stagiaire' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 p-4">
          <div className="flex items-start gap-3">
            <User className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-green-400 mb-1">👤 Tarif Préférentiel Stagiaire</h3>
              <p className="text-xs text-slate-400">Tarif réduit appliqué sur toutes vos formations.</p>
            </div>
          </div>
        </motion.div>
      )}

      {profileType !== 'Etudiant' && profileType !== 'Stagiaire' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 p-4">
          <div className="flex items-start gap-3">
            <Briefcase className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-amber-400 mb-1">
                💼 Tarif Professionnel - {
                  myFormations >= 5 ? 'Réduction 20%' : myFormations >= 3 ? 'Réduction 15%' : 'Réduction 10%'
                }
              </h3>
              <p className="text-xs text-slate-400">
                {myFormations < 3
                  ? `Ajoutez ${3 - myFormations} formation(s) pour passer à 15% de réduction !`
                  : myFormations < 5
                  ? `Ajoutez ${5 - myFormations} formation(s) pour atteindre 20% de réduction !`
                  : "Félicitations ! Vous bénéficiez de la réduction maximale de 20% !"
                }
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Grille */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
        <AnimatePresence>
          {filteredCertificates.map((cert, index) => {
            const enrollment = enrollments.find(e => e.certificate_id === cert.id);
            const isPaid = enrollment?.payment_status === 'PAID';
            const isPending = enrollment && !isPaid;
            const hasReceipt = enrollment?.receipt_url;
            const isSubscribing = subscribingId === cert.id;
            const dp = getDisplayPrice(cert);

            return (
              <motion.div
                key={cert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -4 }}
                className={`group relative bg-[#0f172a] border rounded-2xl overflow-hidden transition-all duration-300 ${
                  isPaid
                    ? 'border-green-500/20 hover:border-green-500/40'
                    : isPending
                    ? 'border-amber-500/20 hover:border-amber-500/40'
                    : 'border-[#1e293b] hover:border-blue-500/20'
                }`}
              >
                {/* Image */}
                <div className="h-44 lg:h-48 bg-[#1e293b] overflow-hidden relative">
                  {cert.image_url ? (
                    <img src={cert.image_url} alt={cert.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-12 h-12 text-slate-600" /></div>
                  )}
                  <div className="absolute top-3 right-3">
                    {isPaid && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/90 text-white rounded-full text-[10px] font-bold backdrop-blur-sm">
                        <CheckCircle2 className="w-3 h-3" /> Accès obtenu
                      </span>
                    )}
                    {isPending && hasReceipt && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/90 text-white rounded-full text-[10px] font-bold backdrop-blur-sm">
                        <FileCheck2 className="w-3 h-3" /> Preuve envoyée
                      </span>
                    )}
                    {isPending && !hasReceipt && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-500/90 text-white rounded-full text-[10px] font-bold backdrop-blur-sm">
                        <AlertCircle className="w-3 h-3" /> En attente
                      </span>
                    )}
                  </div>
                </div>

                {/* Contenu */}
                <div className="p-5">
                  <h3 className="text-sm font-bold text-white mb-2 group-hover:text-blue-400 transition-colors line-clamp-2">
                    {cert.title}
                  </h3>

                  {cert.slogan && (
                    <p className="text-xs text-slate-500 italic mb-3 line-clamp-1">« {cert.slogan} »</p>
                  )}

                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#020617] rounded-lg text-[10px] text-slate-400">
                      <Clock className="w-3 h-3" />4 semaines
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#020617] rounded-lg text-[10px] text-slate-400">
                      <Star className="w-3 h-3 text-[#D4AF37]" />Certifié
                    </span>
                  </div>

                  {/* Prix */}
                  <div className="bg-[#020617] border border-[#1E293B] rounded-xl p-3 mb-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-gray-500 text-xs">Prix normal</span>
                      <span className="text-gray-500 line-through text-xs">
                        {cert.price_normal.toLocaleString()} FCFA
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-xs">{dp.label}</span>
                      <div className="text-right">
                        <span className="text-white font-bold text-sm">
                          {dp.price.toLocaleString()} FCFA
                        </span>
                        <span className="text-gray-500 text-[10px] block">
                          {formatEUR(dp.price)}
                        </span>
                      </div>
                    </div>
                    {/* Pro : indication prochain palier */}
                    {profileType !== 'Etudiant' && profileType !== 'Stagiaire' && dp.futurePercent && dp.futurePercent > dp.percent && (
                      <div className="mt-2 pt-2 border-t border-[#1E293B]">
                        <p className="text-[10px] text-amber-400 flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          +1 formation = -{dp.futurePercent}% sur ce prix
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Compétences */}
                  {cert.skills && (
                    <div className="mb-4">
                      <p className="text-[10px] text-slate-500 flex items-center gap-1 mb-1">
                        <Target className="w-3 h-3" /> {cert.skills.split('\r\n')[0]}
                      </p>
                    </div>
                  )}

                  {/* Bouton */}
                  {isPaid ? (
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={() => onNavigateFormation(cert.id)}
                      className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-xl transition-colors shadow-lg shadow-green-500/20">
                      Accéder <ChevronRight className="w-4 h-4" />
                    </motion.button>
                  ) : isPending && hasReceipt ? (
                    <button
                      disabled
                      className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-slate-700 text-slate-400 text-sm font-semibold rounded-xl cursor-not-allowed"
                    >
                      <FileCheck2 className="w-4 h-4" /> Preuve envoyée - en attente de validation
                    </button>
                  ) : isPending ? (
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={() => onNavigateFormation(cert.id)}
                      className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-amber-500/20">
                      <Upload className="w-4 h-4" /> Envoyer une preuve <ArrowRight className="w-4 h-4" />
                    </motion.button>
                  ) : (
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={() => handleSubscribe(cert.id)} disabled={isSubscribing}
                      className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 text-white text-sm font-semibold rounded-xl transition-colors shadow-lg shadow-blue-500/20">
                      {isSubscribing ? <><Loader2 className="w-4 h-4 animate-spin" /> Inscription...</> : <>S&apos;inscrire <ArrowRight className="w-4 h-4" /></>}
                    </motion.button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filteredCertificates.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
          <Search className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Aucune formation trouvée</h3>
          <p className="text-sm text-slate-400">Essayez de modifier votre recherche.</p>
        </motion.div>
      )}
    </div>
  );
}