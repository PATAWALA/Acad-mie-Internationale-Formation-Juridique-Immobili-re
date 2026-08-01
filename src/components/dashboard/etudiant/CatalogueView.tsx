'use client';

import { useEffect, useState } from 'react';
import { createClientComponent } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, BookOpen, Clock, Users, Star, 
  TrendingUp, Sparkles, Filter, ChevronRight,
  CheckCircle2, AlertCircle, ArrowRight, Loader2,
  GraduationCap, Shield, Zap, ImageIcon, Target
} from 'lucide-react';
import { formatEUR, calculateReducedPrice } from '@/lib/currency';

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
  const [selectedCerts, setSelectedCerts] = useState<number[]>([]);

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

  // Calcul du total des prix normaux pour les certifs sélectionnés
  const totalNormalSelected = selectedCerts.reduce((sum, id) => {
    const cert = certificates.find(c => c.id === id);
    return sum + (cert?.price_normal || 0);
  }, 0);

  // Calcul de la réduction
  const priceCalculation = calculateReducedPrice(
    totalNormalSelected,
    profile?.profile_type || 'Etudiant',
    selectedCerts.length
  );

  const toggleCertSelection = (certId: number) => {
    setSelectedCerts(prev =>
      prev.includes(certId)
        ? prev.filter(id => id !== certId)
        : [...prev, certId]
    );
  };

  const handleSubscribe = async (certId: number) => {
    if (!profile) return;
    
    const already = enrollments.find(e => e.certificate_id === certId);
    if (already) {
      onNavigateFormation(certId);
      return;
    }

    setSubscribingId(certId);
    
    // Calculer le prix réduit pour ce certificat
    const certRatio = (certificates.find(c => c.id === certId)?.price_normal || 0) / (totalNormalSelected || 1);
    const certReducedPrice = Math.round(priceCalculation.finalPrice * certRatio);
    
    const { error } = await supabase.from('enrollments').insert({
      student_id: profile.id,
      student_name: profile.full_name || profile.email,
      certificate_id: certId,
      phone: profile.phone || '',
      email: profile.email,
      amount_paid: 0,
      remaining_balance: selectedCerts.length > 1 ? certReducedPrice : priceCalculation.finalPrice,
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

  const handleBulkSubscribe = async () => {
    if (!profile || selectedCerts.length === 0) return;
    
    for (const certId of selectedCerts) {
      const already = enrollments.find(e => e.certificate_id === certId);
      if (already) continue;
      
      const certRatio = (certificates.find(c => c.id === certId)?.price_normal || 0) / (totalNormalSelected || 1);
      const certReducedPrice = Math.round(priceCalculation.finalPrice * certRatio);
      
      await supabase.from('enrollments').insert({
        student_id: profile.id,
        student_name: profile.full_name || profile.email,
        certificate_id: certId,
        phone: profile.phone || '',
        email: profile.email,
        amount_paid: 0,
        remaining_balance: certReducedPrice,
        payment_status: 'PENDING',
      });
    }
    
    onRefresh();
    setSelectedCerts([]);
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
              <div className="h-32 bg-[#1e293b] rounded-xl mb-4" />
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
              {totalAvailable} formations disponibles • Sélectionnez pour cumuler des réductions
            </p>
          </div>

          <div className="flex gap-3">
            <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl px-3 py-2 text-center">
              <p className="text-lg font-bold text-green-400">{myFormations}</p>
              <p className="text-[10px] text-slate-500">Mes formations</p>
            </div>
            <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl px-3 py-2 text-center">
              <p className="text-lg font-bold text-blue-400">{selectedCerts.length}</p>
              <p className="text-[10px] text-slate-500">Sélectionnés</p>
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

      {/* Barre de sélection + réduction */}
      {selectedCerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-20 z-20 bg-[#0B0F19]/95 backdrop-blur-xl border border-[#1E293B] rounded-2xl p-4 flex items-center justify-between flex-wrap gap-4"
        >
          <span className="text-white text-sm">
            {selectedCerts.length} certificat(s) sélectionné(s)
          </span>
          <div className="flex items-center gap-4">
            {priceCalculation.showDiscount && (
              <>
                <div className="text-right">
                  <span className="text-gray-500 line-through text-sm block">
                    {totalNormalSelected.toLocaleString()} FCFA
                  </span>
                  <span className="text-green-400 text-sm font-semibold block">
                    -{priceCalculation.discountPercent}% (-{priceCalculation.discount.toLocaleString()} FCFA)
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
            <button
              onClick={handleBulkSubscribe}
              className="px-5 py-2 bg-[#D4AF37] text-[#0B0F19] rounded-xl font-semibold text-sm hover:bg-[#C5A028] transition"
            >
              S'inscrire aux {selectedCerts.length} formations
            </button>
          </div>
        </motion.div>
      )}

      {/* Message réduction pour les pros */}
      {priceCalculation.showDiscount && selectedCerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 p-4"
        >
          <div className="flex items-start gap-3">
            <TrendingUp className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-bold text-green-400 mb-1">
                🎉 Réduction de {priceCalculation.discountPercent}% appliquée !
              </h3>
              <p className="text-xs text-slate-400">
                {selectedCerts.length <= 2 
                  ? "Sélectionnez 3 certificats ou plus pour augmenter votre réduction à 15% !"
                  : selectedCerts.length <= 4
                  ? "Sélectionnez 5 certificats ou plus pour atteindre 20% de réduction !"
                  : "Félicitations ! Vous bénéficiez de la réduction maximale de 20% !"
                }
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Certificates Grid - Cartes PLUS GRANDES */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
        <AnimatePresence>
          {filteredCertificates.map((cert, index) => {
            const enrollment = enrollments.find(e => e.certificate_id === cert.id);
            const isPaid = enrollment?.payment_status === 'PAID';
            const isPending = enrollment && !isPaid;
            const isSubscribing = subscribingId === cert.id;
            const isSelected = selectedCerts.includes(cert.id);
            
            // Prix réduit pour ce certificat
            const certRatio = (cert.price_normal || 0) / (totalNormalSelected || 1);
            const certReducedPrice = selectedCerts.length > 0 
              ? Math.round(priceCalculation.finalPrice * certRatio)
              : cert.price_normal;

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
                    ? 'border-green-500/20 hover:border-green-500/40 hover:shadow-lg hover:shadow-green-500/5' 
                    : isPending
                    ? 'border-amber-500/20 hover:border-amber-500/40'
                    : isSelected
                    ? 'border-[#D4AF37]/40 shadow-lg shadow-[#D4AF37]/5 scale-[1.02]'
                    : 'border-[#1e293b] hover:border-blue-500/20 hover:shadow-lg hover:shadow-blue-500/5'
                }`}
              >
                {/* Image - PLUS GRANDE */}
                <div className="h-44 lg:h-48 bg-[#1e293b] overflow-hidden">
                  {cert.image_url ? (
                    <img
                      src={cert.image_url}
                      alt={cert.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-12 h-12 text-slate-600" />
                    </div>
                  )}
                  
                  {/* Badges */}
                  <div className="absolute top-3 right-3 flex flex-col gap-1.5">
                    {isPaid && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/90 text-white rounded-full text-[10px] font-bold backdrop-blur-sm">
                        <CheckCircle2 className="w-3 h-3" /> Accès obtenu
                      </span>
                    )}
                    {isPending && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-500/90 text-white rounded-full text-[10px] font-bold backdrop-blur-sm">
                        <AlertCircle className="w-3 h-3" /> En attente
                      </span>
                    )}
                    {isSelected && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#D4AF37]/90 text-[#0B0F19] rounded-full text-[10px] font-bold backdrop-blur-sm">
                        <CheckCircle2 className="w-3 h-3" /> Sélectionné
                      </span>
                    )}
                  </div>
                </div>

                {/* Contenu - PLUS DÉTAILLÉ */}
                <div className="p-5 lg:p-6">
                  <h3 className="text-sm lg:text-base font-bold text-white mb-2 group-hover:text-blue-400 transition-colors line-clamp-2">
                    {cert.title}
                  </h3>

                  {/* Slogan */}
                  {cert.slogan && (
                    <p className="text-xs text-slate-500 italic mb-3 line-clamp-1">
                      "{cert.slogan}"
                    </p>
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
                  <div className="bg-[#020617] rounded-xl p-3 mb-4 space-y-2">
                    {isSelected && priceCalculation.showDiscount ? (
                      <>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500">Prix normal</span>
                          <span className="text-slate-500 line-through">
                            {cert.price_normal?.toLocaleString()} FCFA
                          </span>
                        </div>
                        <div className="flex justify-between text-xs pt-1 border-t border-[#1E293B]">
                          <span className="text-slate-400">Prix réduit</span>
                          <div className="text-right">
                            <span className="text-[#D4AF37] font-bold">
                              {certReducedPrice.toLocaleString()} FCFA
                            </span>
                            <p className="text-[10px] text-slate-500">
                              {formatEUR(certReducedPrice)}
                            </p>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Prix</span>
                        <div className="text-right">
                          <span className="text-white font-bold">
                            {cert.price_normal?.toLocaleString()} FCFA
                          </span>
                          <p className="text-[10px] text-slate-500">
                            {formatEUR(cert.price_normal)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Compétences (extrait) */}
                  {cert.skills && (
                    <div className="mb-4">
                      <p className="text-[10px] text-slate-500 mb-1 flex items-center gap-1">
                        <Target className="w-3 h-3" /> {cert.skills.split(',')[0]}...
                      </p>
                    </div>
                  )}

                  {/* Boutons */}
                  <div className="flex gap-2">
                    {!isPaid && !isPending && (
                      <button
                        onClick={() => toggleCertSelection(cert.id)}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                          isSelected
                            ? 'bg-green-500/10 border border-green-500/30 text-green-400'
                            : 'border border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/10'
                        }`}
                      >
                        {isSelected ? '✓ Sélectionné' : 'Sélectionner'}
                      </button>
                    )}
                    
                    {isPaid ? (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onNavigateFormation(cert.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold rounded-xl transition-colors shadow-lg shadow-green-500/20"
                      >
                        Accéder
                        <ChevronRight className="w-3.5 h-3.5" />
                      </motion.button>
                    ) : isPending ? (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onNavigateFormation(cert.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-semibold rounded-xl transition-all shadow-lg shadow-amber-500/20"
                      >
                        Payer
                        <ArrowRight className="w-3.5 h-3.5" />
                      </motion.button>
                    ) : (
                      !isSelected && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleSubscribe(cert.id)}
                          disabled={isSubscribing}
                          className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 text-white text-xs font-semibold rounded-xl transition-colors shadow-lg shadow-blue-500/20"
                        >
                          {isSubscribing ? (
                            <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Inscription...</>
                          ) : (
                            <>S'inscrire<ArrowRight className="w-3.5 h-3.5" /></>
                          )}
                        </motion.button>
                      )
                    )}
                  </div>
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