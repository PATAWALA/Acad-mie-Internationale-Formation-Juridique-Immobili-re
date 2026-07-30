'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  GraduationCap, Home, BookOpen, User, HelpCircle, 
  LogOut, CreditCard, ChevronRight, Sparkles, AlertCircle,
  CheckCircle2, Clock, ArrowRight
} from 'lucide-react';

interface SidebarProps {
  enrollments: any[];
  selectedCertId: number | null;
  onSelectFormation: (certId: number) => void;
  onAddFormation: () => void;
  onGoHome: () => void;
  onGoSupport: () => void;
  onGoProfil: () => void;
  onPayClick: (enrollmentId: number, amount: number) => void;
  onLogout: () => void;
}

export default function Sidebar({
  enrollments,
  selectedCertId,
  onSelectFormation,
  onAddFormation,
  onGoHome,
  onGoProfil,
  onPayClick,
  onGoSupport,
  onLogout,
}: SidebarProps) {
  const paidEnrollments = enrollments.filter(e => e.payment_status === 'PAID');
  const pendingEnrollments = enrollments.filter(e => e.payment_status !== 'PAID');
  const totalPendingAmount = pendingEnrollments.reduce((sum, e) => sum + (e.remaining_balance || 0), 0);

  return (
    <aside className="w-full lg:w-72 h-screen bg-[#0f172a] border-r border-[#1e293b] flex flex-col overflow-hidden">
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 lg:p-6 border-b border-[#1e293b]"
      >
        <div className="flex items-center gap-3 cursor-pointer" onClick={onGoHome}>
          <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20 flex-shrink-0">
            <GraduationCap className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
          </div>
          <div className="min-w-0">
            <h2 className="text-white font-bold text-xs lg:text-sm truncate">Académie</h2>
            <p className="text-[10px] lg:text-xs text-slate-400 truncate">Espace Étudiant</p>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="px-3 lg:px-4 py-2 lg:py-3 border-b border-[#1e293b]">
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-[#020617] rounded-xl p-2 lg:p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <CheckCircle2 className="w-3 h-3 text-green-400" />
              <p className="text-base lg:text-lg font-bold text-green-400">{paidEnrollments.length}</p>
            </div>
            <p className="text-[10px] lg:text-xs text-slate-500">Payées</p>
          </div>
          <div className="bg-[#020617] rounded-xl p-2 lg:p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Clock className="w-3 h-3 text-amber-400" />
              <p className="text-base lg:text-lg font-bold text-amber-400">{pendingEnrollments.length}</p>
            </div>
            <p className="text-[10px] lg:text-xs text-slate-500">En attente</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 lg:py-4 px-2 lg:px-3 space-y-4 lg:space-y-6">
        {/* Principal */}
        <div>
          <p className="px-2 lg:px-3 text-[10px] lg:text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 lg:mb-2">
            Principal
          </p>
          <div className="space-y-0.5 lg:space-y-1">
            <motion.button
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={onGoHome}
              className="w-full flex items-center gap-2 lg:gap-3 px-2 lg:px-3 py-2 lg:py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-[#1e293b] transition-all group"
            >
              <Home className="w-3.5 h-3.5 lg:w-4 lg:h-4 group-hover:text-blue-400 transition-colors flex-shrink-0" />
              <span className="text-xs lg:text-sm font-medium">Accueil</span>
            </motion.button>

            <motion.button
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={onAddFormation}
              className="w-full flex items-center gap-2 lg:gap-3 px-2 lg:px-3 py-2 lg:py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-[#1e293b] transition-all group"
            >
              <BookOpen className="w-3.5 h-3.5 lg:w-4 lg:h-4 group-hover:text-blue-400 transition-colors flex-shrink-0" />
              <span className="text-xs lg:text-sm font-medium">Catalogue</span>
              <ChevronRight className="w-3 h-3 lg:w-4 lg:h-4 ml-auto opacity-0 group-hover:opacity-100 transition-all" />
            </motion.button>
          </div>
        </div>

        {/* Formations Payées */}
        {paidEnrollments.length > 0 && (
          <div>
            <div className="flex items-center gap-2 px-2 lg:px-3 mb-1 lg:mb-2">
              <CheckCircle2 className="w-3 h-3 lg:w-3.5 lg:h-3.5 text-green-400" />
              <p className="text-[10px] lg:text-xs font-semibold text-green-400 uppercase tracking-wider">
                Mes Formations
              </p>
            </div>
            <div className="space-y-0.5 lg:space-y-1">
              {paidEnrollments.map((enr, index) => {
                const isActive = selectedCertId === enr.certificate_id;
                return (
                  <motion.button
                    key={enr.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onSelectFormation(enr.certificate_id)}
                    className={`w-full flex items-center gap-2 lg:gap-3 px-2 lg:px-3 py-2 lg:py-2.5 rounded-xl transition-all text-left ${
                      isActive
                        ? 'bg-green-500/10 border border-green-500/20'
                        : 'hover:bg-[#1e293b]'
                    }`}
                  >
                    <div className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs lg:text-sm font-medium truncate ${
                        isActive ? 'text-green-400' : 'text-white'
                      }`}>
                        {enr.certificates?.title || `Formation #${enr.certificate_id}`}
                      </p>
                    </div>
                    {isActive && <ChevronRight className="w-3 h-3 lg:w-4 lg:h-4 text-green-400 flex-shrink-0" />}
                  </motion.button>
                );
              })}
            </div>
          </div>
        )}

        {/* Formations en Attente */}
        {pendingEnrollments.length > 0 && (
          <div>
            <div className="flex items-center gap-2 px-2 lg:px-3 mb-1 lg:mb-2">
              <AlertCircle className="w-3 h-3 lg:w-3.5 lg:h-3.5 text-amber-400" />
              <p className="text-[10px] lg:text-xs font-semibold text-amber-400 uppercase tracking-wider">
                Paiement Requis
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mx-2 lg:mx-3 mb-2 p-2 lg:p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl"
            >
              <div className="flex items-start gap-2">
                <Sparkles className="w-3 h-3 lg:w-4 lg:h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] lg:text-xs text-amber-300 font-medium">
                    Votre bourse expire bientôt
                  </p>
                  <p className="text-[10px] lg:text-xs text-slate-400 mt-0.5">
                    Total : <span className="text-white font-bold">{totalPendingAmount.toLocaleString()} FCFA</span>
                  </p>
                </div>
              </div>
            </motion.div>

            <div className="space-y-1 lg:space-y-2">
              {pendingEnrollments.map((enr, index) => (
                <motion.div
                  key={enr.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="space-y-1"
                >
                  <div className="flex items-center gap-2 lg:gap-3 px-2 lg:px-3 py-2 lg:py-2.5 rounded-xl bg-[#020617] border border-[#1e293b]">
                    <div className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs lg:text-sm text-slate-300 truncate">
                        {enr.certificates?.title || `Formation #${enr.certificate_id}`}
                      </p>
                      <p className="text-[10px] lg:text-xs text-amber-400">
                        {enr.remaining_balance?.toLocaleString()} FCFA
                      </p>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onPayClick(enr.id, enr.remaining_balance || 0);
                    }}
                    className="w-full ml-6 lg:ml-8 px-2 lg:px-3 py-1.5 lg:py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-[10px] lg:text-xs font-semibold rounded-lg flex items-center justify-center gap-1 lg:gap-2 shadow-lg shadow-amber-500/20 transition-all"
                  >
                    <CreditCard className="w-3 h-3 lg:w-3.5 lg:h-3.5" />
                    Payer maintenant
                    <ArrowRight className="w-3 h-3 lg:w-3.5 lg:h-3.5" />
                  </motion.button>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {enrollments.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="px-3 py-8 text-center"
          >
            <GraduationCap className="w-8 h-8 lg:w-10 lg:h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-xs text-slate-500 mb-1">Aucune formation</p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              onClick={onAddFormation}
              className="text-[10px] lg:text-xs px-3 py-1.5 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors"
            >
              + Découvrir le catalogue
            </motion.button>
          </motion.div>
        )}
      </nav>

      {/* Bottom Actions */}
      <div className="border-t border-[#1e293b] p-2 lg:p-3 space-y-0.5">
        <motion.button
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.98 }}
          onClick={onGoProfil}
          className="w-full flex items-center gap-2 lg:gap-3 px-2 lg:px-3 py-2 lg:py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-[#1e293b] transition-all group"
        >
          <User className="w-3.5 h-3.5 lg:w-4 lg:h-4 group-hover:text-blue-400 transition-colors flex-shrink-0" />
          <span className="text-xs lg:text-sm">Mon Profil</span>
        </motion.button>

        <motion.button
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.98 }}
          onClick={onGoSupport}
          className="w-full flex items-center gap-2 lg:gap-3 px-2 lg:px-3 py-2 lg:py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-[#1e293b] transition-all group"
        >
          <HelpCircle className="w-3.5 h-3.5 lg:w-4 lg:h-4 group-hover:text-blue-400 transition-colors flex-shrink-0" />
          <span className="text-xs lg:text-sm">Support</span>
        </motion.button>

        <motion.button
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.98 }}
          onClick={onLogout}
          className="w-full flex items-center gap-2 lg:gap-3 px-2 lg:px-3 py-2 lg:py-2.5 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all group"
        >
          <LogOut className="w-3.5 h-3.5 lg:w-4 lg:h-4 group-hover:text-red-400 transition-colors flex-shrink-0" />
          <span className="text-xs lg:text-sm">Déconnexion</span>
        </motion.button>
      </div>
    </aside>
  );
}