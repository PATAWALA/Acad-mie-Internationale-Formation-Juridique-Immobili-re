'use client';

import { motion } from 'framer-motion';
import { 
  BookOpen, Clock, Award, TrendingUp, 
  ArrowRight, Sparkles, Target,
  Play, CreditCard, GraduationCap, 
  CheckCircle2, AlertCircle, Zap,
  ImageIcon, Briefcase, User
} from 'lucide-react';
import { formatEUR } from '@/lib/currency';

interface HomeViewProps {
  enrollments: any[];
  profile: any;
  onSelectFormation?: (certId: number) => void;
  onPayClick?: (enrollmentId: number, amount: number) => void;
}

export default function HomeView({ 
  enrollments, 
  profile, 
  onSelectFormation,
  onPayClick 
}: HomeViewProps) {
  const paidEnrollments = enrollments.filter(e => e.payment_status === 'PAID');
  const pendingEnrollments = enrollments.filter(e => e.payment_status !== 'PAID');
  
  const totalFormations = enrollments.length;
  const completionRate = totalFormations > 0 
    ? Math.round((paidEnrollments.length / totalFormations) * 100) 
    : 0;
  
  const totalPendingAmount = pendingEnrollments.reduce((sum, e) => sum + (e.remaining_balance || 0), 0);
  
  const totalInvested = paidEnrollments.reduce((sum, e) => {
    const paid = e.amount_paid || 0;
    return sum + (paid > 0 ? paid : (e.remaining_balance || 0));
  }, 0);

  const profileType = profile?.profile_type || 'Etudiant';

  // Calcul de la réduction actuelle pour les pros
  const getProDiscount = () => {
    const count = totalFormations;
    if (count >= 5) return 20;
    if (count >= 3) return 15;
    return 10;
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir';
  
  const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const today = days[new Date().getDay()];

  const stats = [
    {
      label: 'Formations Actives',
      value: paidEnrollments.length,
      icon: BookOpen,
      color: 'text-green-400',
      bg: 'bg-green-500/10',
      border: 'border-green-500/20',
    },
    {
      label: 'En Attente',
      value: pendingEnrollments.length,
      icon: Clock,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      urgent: pendingEnrollments.length > 0,
    },
    {
      label: 'Progression',
      value: `${completionRate}%`,
      icon: Target,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
    },
    {
      label: 'Investi',
      value: totalInvested > 0 ? `${totalInvested.toLocaleString()} FCFA` : '—',
      subValue: totalInvested > 0 ? formatEUR(totalInvested) : null,
      icon: TrendingUp,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20',
    },
  ];

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* WELCOME */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/10 via-blue-600/5 to-purple-500/10 border border-blue-500/20 p-6 lg:p-8"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-medium text-blue-400 uppercase tracking-wider">{today}</span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
                {greeting},{' '}
                <span className="bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent">
                  {profile?.full_name?.split(' ')[0] || 'Étudiant'}
                </span>
                {' '}👋
              </h1>
              <p className="text-sm lg:text-base text-slate-400 max-w-lg">
                {pendingEnrollments.length > 0 
                  ? "Finalisez vos paiements pour débloquer l'accès à tous vos modules."
                  : paidEnrollments.length > 0
                  ? "Continuez sur votre lancée ! Les meilleurs juristes vous attendent."
                  : "Bienvenue ! Ajoutez une formation pour commencer."}
              </p>
            </div>

            {/* Badge profil + réduction */}
            <div className="flex items-center gap-2">
              {profileType === 'Etudiant' && (
                <span className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-xs text-blue-400 font-medium flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5" />
                  Tarif Étudiant
                </span>
              )}
              {profileType === 'Stagiaire' && (
                <span className="px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full text-xs text-green-400 font-medium flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  Tarif Stagiaire
                </span>
              )}
              {profileType !== 'Etudiant' && profileType !== 'Stagiaire' && (
                <span className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full text-xs text-amber-400 font-medium flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5" />
                  Pro -{getProDiscount()}%
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Bannière réduction pour les pros */}
      {profileType !== 'Etudiant' && profileType !== 'Stagiaire' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-center gap-3"
        >
          <TrendingUp className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-300">
              🎉 Réduction de {getProDiscount()}% sur toutes vos formations
            </p>
            <p className="text-xs text-slate-400">
              {totalFormations < 3 
                ? `Ajoutez ${3 - totalFormations} formation(s) pour passer à 15% !`
                : totalFormations < 5
                ? `Ajoutez ${5 - totalFormations} formation(s) pour atteindre 20% !`
                : "Félicitations ! Vous bénéficiez de la réduction maximale !"
              }
            </p>
          </div>
        </motion.div>
      )}

      {/* KPI CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -2 }}
            className={`relative overflow-hidden rounded-xl ${stat.bg} border ${stat.border} p-4 lg:p-5`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={`w-4 h-4 lg:w-5 lg:h-5 ${stat.color}`} />
              </div>
              {stat.urgent && (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-2 h-2 bg-amber-400 rounded-full"
                />
              )}
            </div>
            <p className={`text-xl lg:text-2xl font-bold ${stat.color} mb-1`}>{stat.value}</p>
            {stat.subValue && (
              <p className="text-[10px] lg:text-xs text-slate-500 mb-1">{stat.subValue}</p>
            )}
            <p className="text-[10px] lg:text-xs text-slate-400 font-medium">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* FORMATIONS EN COURS */}
      {paidEnrollments.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-5 h-5 text-green-400" />
            <h2 className="text-lg font-bold text-white">Mes formations en cours</h2>
            <span className="text-xs text-slate-500 bg-[#0f172a] px-2 py-0.5 rounded-full">{paidEnrollments.length}</span>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {paidEnrollments.map((enr, index) => (
              <motion.div
                key={enr.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ y: -4 }}
                onClick={() => onSelectFormation?.(enr.certificate_id)}
                className="group bg-[#0f172a] border border-green-500/20 hover:border-green-500/40 rounded-2xl overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:shadow-green-500/5"
              >
                <div className="h-40 bg-[#1e293b] overflow-hidden">
                  {enr.certificates?.image_url ? (
                    <img src={enr.certificates.image_url} alt={enr.certificates?.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-10 h-10 text-slate-600" /></div>
                  )}
                  <div className="absolute top-2 right-2">
                    <span className="flex items-center gap-1 px-2 py-1 bg-green-500/90 text-white rounded-full text-[10px] font-bold backdrop-blur-sm">
                      <CheckCircle2 className="w-3 h-3" /> Actif
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-sm font-bold text-white mb-2 group-hover:text-green-400 transition-colors">
                    {enr.certificates?.title || `Formation #${enr.certificate_id}`}
                  </h3>
                  {enr.certificates?.slogan && (
                    <p className="text-xs text-slate-500 italic mb-3 line-clamp-1">« {enr.certificates.slogan} »</p>
                  )}
                  <p className="text-xs text-slate-400 mb-1">Accès complet débloqué</p>
                  {enr.amount_paid > 0 && (
                    <p className="text-xs text-slate-500 mb-3">
                      Payé : {enr.amount_paid.toLocaleString()} FCFA ({formatEUR(enr.amount_paid)})
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-green-400 text-xs font-medium group-hover:gap-3 transition-all">
                    <Play className="w-4 h-4" /> Continuer ma formation <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* FORMATIONS EN ATTENTE */}
      {pendingEnrollments.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white">En attente de paiement</h2>
            <span className="text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full font-bold">{pendingEnrollments.length}</span>
          </div>

          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="mb-4 p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-amber-400" />
              <div>
                <p className="text-sm font-semibold text-amber-300">Débloquez vos formations maintenant</p>
                <p className="text-xs text-slate-400">
                  Total : <span className="text-white font-bold">{totalPendingAmount.toLocaleString()} FCFA</span>
                  <span className="text-slate-500 ml-1">({formatEUR(totalPendingAmount)})</span>
                </p>
                {profileType !== 'Etudiant' && profileType !== 'Stagiaire' && (
                  <p className="text-xs text-green-400 mt-1">
                    ✅ Réduction de {getProDiscount()}% déjà appliquée
                  </p>
                )}
              </div>
            </div>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingEnrollments.map((enr, index) => (
              <motion.div
                key={enr.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ y: -2 }}
                className="bg-[#0f172a] border border-amber-500/20 rounded-2xl overflow-hidden"
              >
                <div className="h-40 bg-[#1e293b] overflow-hidden">
                  {enr.certificates?.image_url ? (
                    <img src={enr.certificates.image_url} alt={enr.certificates?.title} className="w-full h-full object-cover opacity-60" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-10 h-10 text-slate-600" /></div>
                  )}
                  <div className="absolute top-2 right-2">
                    <span className="flex items-center gap-1 px-2 py-1 bg-amber-500/90 text-white rounded-full text-[10px] font-bold backdrop-blur-sm">
                      <CreditCard className="w-3 h-3" /> Paiement requis
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-sm font-bold text-white mb-2">
                    {enr.certificates?.title || `Formation #${enr.certificate_id}`}
                  </h3>
                  {enr.certificates?.slogan && (
                    <p className="text-xs text-slate-500 italic mb-3 line-clamp-1">« {enr.certificates.slogan} »</p>
                  )}
                  <p className="text-xs text-slate-400 mb-1">Montant à payer</p>
                  <div className="mb-4">
                    <p className="text-lg font-bold text-amber-400">
                      {enr.remaining_balance?.toLocaleString()} FCFA
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatEUR(enr.remaining_balance || 0)}
                    </p>
                    {profileType !== 'Etudiant' && profileType !== 'Stagiaire' && (
                      <p className="text-[10px] text-green-400 mt-1">✅ Réduction incluse</p>
                    )}
                  </div>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={(e) => { e.stopPropagation(); onPayClick?.(enr.id, enr.remaining_balance || 0); }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-all">
                    <CreditCard className="w-4 h-4" /> Payer maintenant <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* EMPTY STATE */}
      {enrollments.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
          <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-blue-400" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Commencez votre parcours</h3>
          <p className="text-sm text-slate-400 mb-6">Ajoutez une formation pour débloquer votre avenir juridique</p>
        </motion.div>
      )}
    </div>
  );
}