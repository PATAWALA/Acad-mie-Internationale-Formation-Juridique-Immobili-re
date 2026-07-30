'use client';

import { motion } from 'framer-motion';
import { 
  BookOpen, CheckCircle2, Clock, ArrowRight, 
  Play, CreditCard, GraduationCap
} from 'lucide-react';

interface MesFormationsViewProps {
  enrollments: any[];
  onSelectFormation: (certId: number) => void;
  onPayClick: (enrollmentId: number, amount: number) => void;
}

export default function MesFormationsView({ enrollments, onSelectFormation, onPayClick }: MesFormationsViewProps) {
  const paidEnrollments = enrollments.filter(e => e.payment_status === 'PAID');
  const pendingEnrollments = enrollments.filter(e => e.payment_status !== 'PAID');

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-500/10 rounded-xl">
            <BookOpen className="w-5 h-5 text-blue-400" />
          </div>
          <h2 className="text-xl lg:text-2xl font-bold text-white">Mes Formations</h2>
        </div>
        <p className="text-sm text-slate-400">
          {enrollments.length} formation{enrollments.length > 1 ? 's' : ''} • {paidEnrollments.length} active{paidEnrollments.length > 1 ? 's' : ''}
        </p>
      </motion.div>

      {/* Section : Formations Actives */}
      {paidEnrollments.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-4 h-4 text-green-400" />
            <h3 className="text-sm font-semibold text-green-400 uppercase tracking-wider">
              En cours • {paidEnrollments.length}
            </h3>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {paidEnrollments.map((enr, index) => (
              <motion.div
                key={enr.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -4 }}
                onClick={() => onSelectFormation(enr.certificate_id)}
                className="group bg-[#0f172a] border border-green-500/20 hover:border-green-500/40 rounded-2xl p-5 cursor-pointer transition-all hover:shadow-lg hover:shadow-green-500/5"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-2.5 bg-green-500/10 rounded-xl">
                    <GraduationCap className="w-5 h-5 text-green-400" />
                  </div>
                  <span className="flex items-center gap-1 px-2 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-[10px] text-green-400 font-medium">
                    <CheckCircle2 className="w-3 h-3" />
                    Actif
                  </span>
                </div>
                
                <h3 className="text-sm font-bold text-white mb-2 group-hover:text-green-400 transition-colors">
                  {enr.certificates?.title || `Formation #${enr.certificate_id}`}
                </h3>
                
                <p className="text-xs text-slate-400 mb-4">
                  Accès complet débloqué
                </p>

                <div className="flex items-center gap-2 text-green-400 text-xs font-medium group-hover:gap-3 transition-all">
                  <Play className="w-4 h-4" />
                  Continuer ma formation
                  <ArrowRight className="w-4 h-4" />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Section : Formations en Attente */}
      {pendingEnrollments.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wider">
              En attente de paiement • {pendingEnrollments.length}
            </h3>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingEnrollments.map((enr, index) => (
              <motion.div
                key={enr.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -2 }}
                className="bg-[#0f172a] border border-amber-500/20 rounded-2xl p-5"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-2.5 bg-amber-500/10 rounded-xl">
                    <Clock className="w-5 h-5 text-amber-400" />
                  </div>
                  <span className="flex items-center gap-1 px-2 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-[10px] text-amber-400 font-medium">
                    <CreditCard className="w-3 h-3" />
                    Paiement requis
                  </span>
                </div>
                
                <h3 className="text-sm font-bold text-white mb-2">
                  {enr.certificates?.title || `Formation #${enr.certificate_id}`}
                </h3>
                
                <p className="text-xs text-slate-400 mb-1">
                  Montant à payer
                </p>
                <p className="text-lg font-bold text-amber-400 mb-4">
                  {enr.remaining_balance?.toLocaleString()} FCFA
                </p>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onPayClick(enr.id, enr.remaining_balance || 0);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-all"
                >
                  <CreditCard className="w-4 h-4" />
                  Payer maintenant
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {enrollments.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-blue-400" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">
            Aucune formation pour le moment
          </h3>
          <p className="text-sm text-slate-400 mb-6">
            Explorez notre catalogue et commencez votre carrière juridique
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-blue-500/20"
          >
            Découvrir les formations
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}