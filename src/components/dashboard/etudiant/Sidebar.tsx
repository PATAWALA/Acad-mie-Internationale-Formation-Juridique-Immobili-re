'use client';

import { motion } from 'framer-motion';
import { 
  GraduationCap, LayoutDashboard, BookOpen, Clock, 
  PlusCircle, User, HelpCircle, LogOut, ChevronRight,
  ImageIcon
} from 'lucide-react';

interface SidebarProps {
  enrollments: any[];
  selectedCertId: number | null;
  onSelectFormation: (certId: number) => void;
  onAddFormation: () => void;
  onGoHome: () => void;
  onGoMesFormations: () => void;
  onGoPending: () => void;
  onGoSupport: () => void;
  onGoProfil: () => void;
  onPayClick: (enrollmentId: number, amount: number) => void;
  onLogout: () => void;
}

export default function Sidebar({
  enrollments,
  onAddFormation,
  onGoHome,
  onGoMesFormations,
  onGoPending,
  onGoProfil,
  onGoSupport,
  onLogout,
}: SidebarProps) {
  const paidCount = enrollments.filter(e => e.payment_status === 'PAID').length;
  const pendingCount = enrollments.filter(e => e.payment_status !== 'PAID').length;
  const totalCount = enrollments.length;

  return (
    <aside className="w-64 h-screen bg-[#0f172a] border-r border-[#1e293b] flex flex-col">
      {/* Logo */}
      <div className="flex-shrink-0 p-5 border-b border-[#1e293b]">
        <div className="flex items-center gap-3 cursor-pointer" onClick={onGoHome}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <GraduationCap className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <h2 className="text-white font-bold text-sm">Académie</h2>
            <p className="text-[10px] text-slate-400">Espace Étudiant</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {/* Tableau de bord */}
        <motion.button
          whileHover={{ x: 3 }}
          whileTap={{ scale: 0.98 }}
          onClick={onGoHome}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-[#1e293b] transition-all group"
        >
          <LayoutDashboard className="w-4 h-4 text-slate-400 group-hover:text-blue-400 transition-colors flex-shrink-0" />
          <span className="text-sm font-medium">Tableau de bord</span>
        </motion.button>

        {/* Mes Formations */}
        <motion.button
          whileHover={{ x: 3 }}
          whileTap={{ scale: 0.98 }}
          onClick={onGoMesFormations}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-[#1e293b] transition-all group"
        >
          <BookOpen className="w-4 h-4 text-slate-400 group-hover:text-blue-400 transition-colors flex-shrink-0" />
          <span className="text-sm font-medium flex-1 text-left">Mes formations</span>
          {totalCount > 0 && (
            <span className="text-[10px] bg-[#020617] text-slate-400 px-1.5 py-0.5 rounded-full font-medium">
              {totalCount}
            </span>
          )}
          <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 transition-colors" />
        </motion.button>

        {/* En attente */}
        <motion.button
          whileHover={{ x: 3 }}
          whileTap={{ scale: 0.98 }}
          onClick={onGoPending}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${
            pendingCount > 0
              ? 'text-amber-400 hover:text-amber-300 hover:bg-amber-500/5'
              : 'text-slate-500 hover:text-slate-400 hover:bg-[#1e293b]'
          }`}
        >
          <Clock className={`w-4 h-4 flex-shrink-0 ${pendingCount > 0 ? 'text-amber-400' : 'text-slate-500'}`} />
          <span className="text-sm font-medium flex-1 text-left">En attente de paiement</span>
          {pendingCount > 0 && (
            <span className="text-[10px] bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded-full font-bold">
              {pendingCount}
            </span>
          )}
          <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 transition-colors" />
        </motion.button>

        {/* Ajouter */}
        <motion.button
          whileHover={{ x: 3 }}
          whileTap={{ scale: 0.98 }}
          onClick={onAddFormation}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-blue-400 hover:text-blue-300 hover:bg-blue-500/5 transition-all group mt-2"
        >
          <PlusCircle className="w-4 h-4 text-blue-400 flex-shrink-0" />
          <span className="text-sm font-medium">Ajouter une formation</span>
          <ChevronRight className="w-3.5 h-3.5 text-blue-600 group-hover:text-blue-400 transition-colors" />
        </motion.button>
      </nav>

      {/* Bottom */}
      <div className="flex-shrink-0 border-t border-[#1e293b] p-3 space-y-1">
        <motion.button
          whileHover={{ x: 3 }}
          whileTap={{ scale: 0.98 }}
          onClick={onGoProfil}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-[#1e293b] transition-all group"
        >
          <User className="w-4 h-4 group-hover:text-blue-400 transition-colors flex-shrink-0" />
          <span className="text-sm">Mon Profil</span>
        </motion.button>

        <motion.button
          whileHover={{ x: 3 }}
          whileTap={{ scale: 0.98 }}
          onClick={onGoSupport}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-[#1e293b] transition-all group"
        >
          <HelpCircle className="w-4 h-4 group-hover:text-blue-400 transition-colors flex-shrink-0" />
          <span className="text-sm">Aide & Support</span>
        </motion.button>

        <motion.button
          whileHover={{ x: 3 }}
          whileTap={{ scale: 0.98 }}
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all group"
        >
          <LogOut className="w-4 h-4 group-hover:text-red-400 transition-colors flex-shrink-0" />
          <span className="text-sm">Déconnexion</span>
        </motion.button>
      </div>
    </aside>
  );
}