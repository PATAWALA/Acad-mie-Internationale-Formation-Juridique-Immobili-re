'use client';

import { motion } from 'framer-motion';
import { 
  BookOpen, Clock, Award, TrendingUp, 
  ArrowRight, Sparkles, Target, Zap,
  ChevronRight, Play, CreditCard
} from 'lucide-react';

interface HomeViewProps {
  enrollments: any[];
  profile: any;
}

export default function HomeView({ enrollments, profile }: HomeViewProps) {
  const paidEnrollments = enrollments.filter(e => e.payment_status === 'PAID');
  const pendingEnrollments = enrollments.filter(e => e.payment_status !== 'PAID');
  
  // Calculs pour les KPIs
  const totalFormations = enrollments.length;
  const completionRate = totalFormations > 0 
    ? Math.round((paidEnrollments.length / totalFormations) * 100) 
    : 0;
  
  const totalPendingAmount = pendingEnrollments.reduce((sum, e) => sum + (e.remaining_balance || 0), 0);
  const totalInvested = paidEnrollments.reduce((sum, e) => sum + (e.amount_paid || e.remaining_balance || 0), 0);

  // Message personnalisé selon l'heure
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir';
  
  // Jours de la semaine
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
      trend: paidEnrollments.length > 0 ? `${paidEnrollments.length} en cours` : 'Aucune',
    },
    {
      label: 'En Attente',
      value: pendingEnrollments.length,
      icon: Clock,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      trend: pendingEnrollments.length > 0 ? 'Action requise' : 'Tout est payé',
      urgent: pendingEnrollments.length > 0,
    },
    {
      label: 'Progression',
      value: `${completionRate}%`,
      icon: Target,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
      trend: 'Complétion',
    },
    {
      label: 'Investissement',
      value: `${totalInvested.toLocaleString()} FCFA`,
      icon: TrendingUp,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20',
      trend: 'Total payé',
    },
  ];

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/10 via-blue-600/5 to-purple-500/10 border border-blue-500/20 p-6 lg:p-8"
      >
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-2 mb-2"
              >
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-medium text-blue-400 uppercase tracking-wider">
                  {today}
                </span>
              </motion.div>
              <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
                {greeting},{' '}
                <span className="bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent">
                  {profile?.full_name?.split(' ')[0] || 'Étudiant'}
                </span>
                {' '}👋
              </h1>
              <p className="text-sm lg:text-base text-slate-400 max-w-lg">
                {pendingEnrollments.length > 0 
                  ? "Votre avenir commence maintenant. Finalisez vos paiements pour débloquer l'accès à tous vos modules."
                  : paidEnrollments.length > 0
                  ? "Continuez sur votre lancée ! Les meilleurs juristes vous attendent."
                  : "Bienvenue sur votre espace. Explorez le catalogue pour débuter votre formation."}
              </p>
            </div>
            
            {/* Quick Action Button */}
            {pendingEnrollments.length > 0 && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 lg:px-6 lg:py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-amber-500/20 transition-all"
              >
                <CreditCard className="w-4 h-4" />
                Payer maintenant
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -2 }}
            className={`relative overflow-hidden rounded-xl ${stat.bg} border ${stat.border} p-4 lg:p-5 backdrop-blur-sm`}
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
            
            <div>
              <p className={`text-xl lg:text-2xl font-bold ${stat.color} mb-1`}>
                {stat.value}
              </p>
              <p className="text-[10px] lg:text-xs text-slate-400 font-medium">
                {stat.label}
              </p>
              <p className="text-[10px] lg:text-xs text-slate-500 mt-1">
                {stat.trend}
              </p>
            </div>

            {/* Decorative gradient */}
            <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color.replace('text', 'from').replace('400', '500')} to-transparent opacity-50`} />
          </motion.div>
        ))}
      </div>

      {/* Urgence Paiement Banner */}
      {pendingEnrollments.length > 0 && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 p-5 lg:p-6"
        >
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm lg:text-base font-bold text-amber-400">
                  Paiement en attente
                </h3>
              </div>
              <p className="text-xs lg:text-sm text-slate-300 mb-1">
                Vous avez <span className="text-white font-bold">{pendingEnrollments.length} formation(s)</span> à finaliser
              </p>
              <p className="text-xs text-slate-400">
                Montant total : <span className="text-amber-400 font-bold">{totalPendingAmount.toLocaleString()} FCFA</span>
              </p>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-amber-500/20 transition-all"
            >
              <CreditCard className="w-4 h-4" />
              Régler maintenant
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>
          
          {/* Background glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl" />
        </motion.div>
      )}

      {/* Formations Rapides */}
      {paidEnrollments.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-5 lg:p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Play className="w-5 h-5 text-green-400" />
              <h3 className="text-sm lg:text-base font-bold text-white">
                Reprendre mes formations
              </h3>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {paidEnrollments.slice(0, 4).map((enr, index) => (
              <motion.div
                key={enr.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ x: 4 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-[#020617] border border-[#1e293b] hover:border-green-500/20 transition-all cursor-pointer group"
              >
                <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs lg:text-sm text-white truncate">
                    {enr.certificates?.title || `Formation #${enr.certificate_id}`}
                  </p>
                  <p className="text-[10px] text-slate-500">En cours</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-green-400 transition-colors flex-shrink-0" />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Témoignage Social Proof */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-center py-6 lg:py-8"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/5 border border-green-500/10 rounded-full mb-3">
          <Award className="w-4 h-4 text-green-400" />
          <span className="text-xs text-green-400 font-medium">
            90% de nos certifiés décrochent un emploi en 3 mois
          </span>
        </div>
        <p className="text-xs lg:text-sm text-slate-500">
          Rejoignez les 500+ étudiants qui ont déjà transformé leur carrière
        </p>
      </motion.div>
    </div>
  );
}