'use client';

import { useState, useEffect } from 'react';
import { createClientComponent } from '@/lib/supabase/client';
import { motion } from 'framer-motion';
import { fadeIn, stagger } from '@/lib/animations';
import { cn } from '@/lib/utils';
import { formatEUR } from '@/lib/currency';
import {
  Users, CheckCircle, Clock, DollarSign, Send,
  Search, Loader2, GraduationCap, Phone, Mail,
  ExternalLink, Filter
} from 'lucide-react';

export default function AdminInscriptionsPage() {
  const supabase = createClientComponent();
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'PAID' | 'PENDING'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('enrollments')
      .select('*, profiles:student_id(full_name, phone, email, profile_type), certificates:certificate_id(title)')
      .order('created_at', { ascending: false })
      .returns<any[]>();

    if (data) setEnrollments(data);
    setLoading(false);
  };

  // Filtrage
  let filtered = enrollments;
  if (filter !== 'ALL') {
    filtered = filtered.filter(e => e.payment_status === filter);
  }
  if (searchTerm.trim()) {
    const term = searchTerm.toLowerCase();
    filtered = filtered.filter(e =>
      (e.profiles?.full_name || '').toLowerCase().includes(term) ||
      (e.profiles?.email || '').toLowerCase().includes(term) ||
      (e.certificates?.title || '').toLowerCase().includes(term)
    );
  }

  // Statistiques
  const totalInscrits = enrollments.length;
  const totalPayes = enrollments.filter(e => e.payment_status === 'PAID').length;
  const totalEnAttente = enrollments.filter(e => e.payment_status === 'PENDING').length;
  const totalRevenu = enrollments
    .filter(e => e.payment_status === 'PAID')
    .reduce((sum, e) => sum + (e.amount_paid || 0), 0);

  // Générer le message WhatsApp
  const generateWhatsAppLink = (enrollment: any) => {
    const phone = enrollment.profiles?.phone || '';
    const name = enrollment.profiles?.full_name || 'Apprenant';
    const cleanPhone = phone.replace(/[^0-9+]/g, '').replace(/^0/, '+225');

    const message = encodeURIComponent(
      `Bonjour ${name}, félicitations ! Vous avez été sélectionné(e) pour l'obtention de la Bourse Mamadou Touré pour l'Université d'été de la Pratique du Droit et de l'Immobilier (Début le 08 Août 2026). Pour valider définitivement votre place, veuillez effectuer votre règlement au plus tard sur le numéro MoMo / WhatsApp : +225 07 57 27 96 76 et nous envoyer la capture ici. Votre avenir d'élite commence maintenant !`
    );

    return `https://wa.me/${cleanPhone}?text=${message}`;
  };

  const kpiCards = [
    { label: 'Total inscrits', value: totalInscrits, icon: Users, color: 'blue' },
    { label: 'Payés', value: totalPayes, icon: CheckCircle, color: 'emerald' },
    { label: 'En attente', value: totalEnAttente, icon: Clock, color: 'amber' },
    { 
      label: 'Revenu total', 
      value: `${totalRevenu.toLocaleString()} FCFA`, 
      subValue: totalRevenu > 0 ? formatEUR(totalRevenu) : null,
      icon: DollarSign, 
      color: 'violet' 
    },
  ];

  const filterButtons = [
    { key: 'ALL' as const, label: 'Tous', count: totalInscrits },
    { key: 'PAID' as const, label: 'Payés', count: totalPayes },
    { key: 'PENDING' as const, label: 'En attente', count: totalEnAttente },
  ];

  return (
    <motion.div initial="initial" animate="animate" variants={stagger} className="space-y-6">
      {/* Header */}
      <motion.div variants={fadeIn}>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-br from-[#D4AF37]/20 to-amber-500/10 rounded-xl">
            <GraduationCap className="w-5 h-5 text-[#D4AF37]" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Inscriptions Université d&apos;Été 2026
          </h1>
        </div>
        <p className="text-slate-400 text-sm ml-14">
          Suivi des inscriptions, paiements et relances pour la session du 08 Août 2026.
        </p>
      </motion.div>

      {/* KPIs */}
      <motion.div variants={fadeIn} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{kpi.label}</span>
              <kpi.icon className={cn(
                'w-4 h-4',
                kpi.color === 'blue' && 'text-blue-400',
                kpi.color === 'emerald' && 'text-emerald-400',
                kpi.color === 'amber' && 'text-amber-400',
                kpi.color === 'violet' && 'text-violet-400'
              )} />
            </div>
            <div>
              <span className="text-2xl font-bold text-white">{kpi.value}</span>
              {kpi.subValue && (
                <p className="text-xs text-slate-500 mt-1">{kpi.subValue}</p>
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Filtres + Recherche */}
      <motion.div variants={fadeIn} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-slate-500 mr-1" />
          {filterButtons.map((btn) => (
            <button
              key={btn.key}
              onClick={() => setFilter(btn.key)}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all border',
                filter === btn.key
                  ? 'bg-blue-500/20 border-blue-500/50 text-blue-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
              )}
            >
              {btn.label}
              <span className={cn(
                'px-1.5 py-0.5 rounded-full text-[10px] font-bold',
                filter === btn.key ? 'bg-white/10 text-white' : 'bg-slate-700 text-slate-400'
              )}>
                {btn.count}
              </span>
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-[#D4AF37]/50 transition-all"
          />
        </div>
      </motion.div>

      {/* Tableau */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <motion.div variants={fadeIn} className="text-center py-20 bg-slate-900 border border-slate-800 rounded-2xl">
          <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">Aucune inscription trouvée.</p>
        </motion.div>
      ) : (
        <motion.div variants={fadeIn} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-4">Apprenant</th>
                  <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-4">Qualité</th>
                  <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-4">Certification</th>
                  <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-4">Montant</th>
                  <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-4">Statut</th>
                  <th className="text-right text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((enr, index) => {
                  const montant = enr.amount_paid > 0
                    ? enr.amount_paid
                    : (enr.remaining_balance || 0);
                  
                  return (
                    <motion.tr
                      key={enr.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.03 }}
                      className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#D4AF37]/20 to-amber-500/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-[#D4AF37]">
                              {(enr.profiles?.full_name || '?')[0].toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="text-white font-medium text-sm">
                              {enr.profiles?.full_name || 'Inconnu'}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <Mail className="w-3 h-3 text-slate-500" />
                              <span className="text-xs text-slate-400">{enr.profiles?.email || '-'}</span>
                            </div>
                            {enr.profiles?.phone && (
                              <div className="flex items-center gap-2 mt-0.5">
                                <Phone className="w-3 h-3 text-slate-500" />
                                <span className="text-xs text-slate-400">{enr.profiles.phone}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-slate-300 bg-slate-800 px-2 py-1 rounded-full">
                          {enr.profiles?.profile_type || 'Non précisé'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-300">
                          {enr.certificates?.title || `#${enr.certificate_id}`}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <span className="text-sm text-white font-semibold">
                            {montant.toLocaleString()} FCFA
                          </span>
                          <p className="text-xs text-slate-500">
                            {formatEUR(montant)}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {enr.payment_status === 'PAID' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <CheckCircle className="w-3 h-3" />
                            Payé
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <Clock className="w-3 h-3" />
                            En attente
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {enr.payment_status !== 'PAID' && enr.profiles?.phone && (
                          <motion.a
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            href={generateWhatsAppLink(enr)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold rounded-xl transition-colors shadow-lg shadow-green-500/20"
                          >
                            <Send className="w-3.5 h-3.5" />
                            Relancer WhatsApp
                          </motion.a>
                        )}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}