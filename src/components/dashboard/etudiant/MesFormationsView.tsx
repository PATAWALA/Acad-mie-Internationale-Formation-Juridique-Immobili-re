'use client';

import { motion } from 'framer-motion';
import {
  BookOpen, CheckCircle2, Clock, ArrowRight,
  Play, Upload, ImageIcon, TrendingUp, Briefcase, GraduationCap, User,
  FileCheck2
} from 'lucide-react';
import { formatEUR } from '@/lib/currency';

interface MesFormationsViewProps {
  enrollments: any[];
  profile?: any;
  onSelectFormation: (certId: number) => void;
  onPayClick: (enrollmentId: number, amount: number) => void;
  onAddFormation?: () => void;
}

export default function MesFormationsView({ enrollments, profile, onSelectFormation, onPayClick, onAddFormation }: MesFormationsViewProps) {
  const paidEnrollments = enrollments.filter(e => e.payment_status === 'PAID');
  const pendingEnrollments = enrollments.filter(e => e.payment_status !== 'PAID');
  
  const profileType = profile?.profile_type || 'Etudiant';
  const totalFormations = enrollments.length;

  const getProDiscount = () => {
    if (totalFormations >= 5) return 20;
    if (totalFormations >= 3) return 15;
    return 10;
  };

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-500/10 rounded-xl">
            <BookOpen className="w-5 h-5 text-blue-400" />
          </div>
          <h2 className="text-xl lg:text-2xl font-bold text-white">Mes Formations</h2>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-sm text-slate-400">
            {enrollments.length} formation{enrollments.length > 1 ? 's' : ''} • {paidEnrollments.length} active{paidEnrollments.length > 1 ? 's' : ''}
          </p>
          {profileType === 'Etudiant' && (
            <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] text-blue-400 font-medium flex items-center gap-1">
              <GraduationCap className="w-3 h-3" /> Étudiant
            </span>
          )}
          {profileType === 'Stagiaire' && (
            <span className="px-2 py-0.5 bg-green-500/10 border border-green-500/20 rounded-full text-[10px] text-green-400 font-medium flex items-center gap-1">
              <User className="w-3 h-3" /> Stagiaire
            </span>
          )}
          {profileType !== 'Etudiant' && profileType !== 'Stagiaire' && (
            <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded-full text-[10px] text-amber-400 font-medium flex items-center gap-1">
              <Briefcase className="w-3 h-3" /> Pro -{getProDiscount()}%
            </span>
          )}
        </div>
      </motion.div>

      {/* Bannière réduction pro */}
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
                : "Félicitations ! Réduction maximale de 20% !"
              }
            </p>
          </div>
        </motion.div>
      )}

      {/* Section : Formations Actives */}
      {paidEnrollments.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
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
                className="group bg-[#0f172a] border border-green-500/20 hover:border-green-500/40 rounded-2xl overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:shadow-green-500/5"
              >
                <div className="h-40 bg-[#1e293b] overflow-hidden">
                  {enr.certificates?.image_url ? (
                    <img src={enr.certificates.image_url} alt={enr.certificates?.title || 'Formation'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
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
                    <Play className="w-4 h-4" /> Continuer <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Section : Formations en Attente */}
      {pendingEnrollments.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wider">
              En attente de validation • {pendingEnrollments.length}
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
                className="bg-[#0f172a] border border-amber-500/20 rounded-2xl overflow-hidden"
              >
                <div className="h-40 bg-[#1e293b] overflow-hidden relative">
                  {enr.certificates?.image_url ? (
                    <img src={enr.certificates.image_url} alt={enr.certificates?.title || 'Formation'} className="w-full h-full object-cover opacity-60" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-10 h-10 text-slate-600" /></div>
                  )}
                  <div className="absolute top-2 right-2">
                    {enr.receipt_url ? (
                      <span className="flex items-center gap-1 px-2 py-1 bg-blue-500/90 text-white rounded-full text-[10px] font-bold backdrop-blur-sm">
                        <FileCheck2 className="w-3 h-3" /> Preuve envoyée
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 px-2 py-1 bg-amber-500/90 text-white rounded-full text-[10px] font-bold backdrop-blur-sm">
                        <Clock className="w-3 h-3" /> Preuve requise
                      </span>
                    )}
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
                      <p className="text-[10px] text-green-400 mt-1">✅ Réduction {getProDiscount()}% incluse</p>
                    )}
                  </div>
                  {enr.receipt_url ? (
                    <button
                      disabled
                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-700 text-slate-400 text-xs font-bold rounded-xl cursor-not-allowed"
                    >
                      <FileCheck2 className="w-4 h-4" /> Preuve envoyée - en attente de validation
                    </button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={(e) => { e.stopPropagation(); onPayClick(enr.id, enr.remaining_balance || 0); }}
                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-all"
                    >
                      <Upload className="w-4 h-4" /> Envoyer une preuve <ArrowRight className="w-4 h-4" />
                    </motion.button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {enrollments.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
          <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-blue-400" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Aucune formation pour le moment</h3>
          <p className="text-sm text-slate-400 mb-6">Explorez notre catalogue et commencez votre carrière juridique</p>
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => onAddFormation?.()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-blue-500/20"
          >
            Découvrir les formations <ArrowRight className="w-4 h-4" />
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}