'use client';

import { useEffect, useState } from 'react';
import { createClientComponent } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, BookOpen, Clock, Users, Star, 
  TrendingUp, Sparkles, Filter, ChevronRight,
  CheckCircle2, AlertCircle, ArrowRight, Loader2,
  GraduationCap, Shield, Zap, ImageIcon
} from 'lucide-react';

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
  const averagePrice = certificates.length > 0
    ? Math.round(certificates.reduce((sum, c) => sum + (c.price_bourse || 0), 0) / certificates.length)
    : 0;

  const handleSubscribe = async (certId: number) => {
    if (!profile) return;
    
    const already = enrollments.find(e => e.certificate_id === certId);
    if (already) {
      onNavigateFormation(certId);
      return;
    }

    setSubscribingId(certId);
    const { error } = await supabase.from('enrollments').insert({
      student_id: profile.id,
      student_name: profile.full_name || profile.email,
      certificate_id: certId,
      phone: profile.phone || '',
      email: profile.email,
      amount_paid: 0,
      remaining_balance: certificates.find(c => c.id === certId)?.price_bourse || 0,
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
              {totalAvailable} formations disponibles • À partir de {averagePrice.toLocaleString()} FCFA
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

      {/* Bourse Banner */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 p-4 lg:p-5"
      >
        <div className="flex items-start gap-3">
          <div className="p-2 bg-amber-500/10 rounded-xl flex-shrink-0">
            <Sparkles className="w-5 h-5 text-amber-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-amber-400 mb-1">
              Bourse Mamadou TOURÉ - Jusqu'à 50% de réduction
            </h3>
            <p className="text-xs text-slate-400">
              Profitez de tarifs préférentiels sur toutes nos formations. Places limitées.
            </p>
          </div>
          <Shield className="w-5 h-5 text-amber-400/50 flex-shrink-0" />
        </div>
        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl" />
      </motion.div>

      {/* Certificates Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {filteredCertificates.map((cert, index) => {
            const enrollment = enrollments.find(e => e.certificate_id === cert.id);
            const isPaid = enrollment?.payment_status === 'PAID';
            const isPending = enrollment && !isPaid;
            const isSubscribing = subscribingId === cert.id;
            const discount = cert.price_normal > 0
              ? Math.round(((cert.price_normal - cert.price_bourse) / cert.price_normal) * 100)
              : 0;

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
                    : 'border-[#1e293b] hover:border-blue-500/20 hover:shadow-lg hover:shadow-blue-500/5'
                }`}
              >
                {/* Image du certificat */}
                <div className="h-40 bg-[#1e293b] overflow-hidden">
                  {cert.image_url ? (
                    <img
                      src={cert.image_url}
                      alt={cert.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-10 h-10 text-slate-600" />
                    </div>
                  )}
                  {/* Status Badge sur l'image */}
                  <div className="absolute top-3 right-3">
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
                  </div>
                </div>

                {/* Contenu */}
                <div className="p-5">
                  <h3 className="text-sm lg:text-base font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                    {cert.title}
                  </h3>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#020617] rounded-lg text-[10px] text-slate-400">
                      <Clock className="w-3 h-3" />4 semaines
                    </span>
                    {discount > 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/10 rounded-lg text-[10px] text-green-400 font-medium">
                        <TrendingUp className="w-3 h-3" />-{discount}%
                      </span>
                    )}
                  </div>

                  <div className="flex items-end justify-between pt-3 border-t border-[#1e293b]">
                    <div>
                      {discount > 0 && (
                        <p className="text-xs text-slate-500 line-through">
                          {cert.price_normal?.toLocaleString()} FCFA
                        </p>
                      )}
                      <p className="text-lg font-bold text-white">
                        {cert.price_bourse?.toLocaleString()}
                        <span className="text-sm font-normal text-slate-400"> FCFA</span>
                      </p>
                    </div>

                    {isPaid ? (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onNavigateFormation(cert.id)}
                        className="flex items-center gap-1.5 px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-xl transition-colors shadow-lg shadow-green-500/20"
                      >
                        Accéder
                        <ChevronRight className="w-4 h-4" />
                      </motion.button>
                    ) : isPending ? (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onNavigateFormation(cert.id)}
                        className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-amber-500/20"
                      >
                        Payer
                        <ArrowRight className="w-4 h-4" />
                      </motion.button>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleSubscribe(cert.id)}
                        disabled={isSubscribing}
                        className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 text-white text-sm font-semibold rounded-xl transition-colors shadow-lg shadow-blue-500/20"
                      >
                        {isSubscribing ? (
                          <><Loader2 className="w-4 h-4 animate-spin" /> Inscription...</>
                        ) : (
                          <>S'inscrire<ArrowRight className="w-4 h-4" /></>
                        )}
                      </motion.button>
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