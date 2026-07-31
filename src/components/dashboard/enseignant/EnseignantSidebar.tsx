'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  BookOpen,
  X,
  GraduationCap,
  LogOut,
} from 'lucide-react';

interface EnseignantSidebarProps {
  currentView: string;
  onShowAll: () => void;
  onShowFormations: () => void;
  onCloseMobile: () => void;
  formationsCount: number;
  onLogout: () => void;
}

export default function EnseignantSidebar({
  currentView,
  onShowAll,
  onShowFormations,
  onCloseMobile,
  formationsCount,
  onLogout,
}: EnseignantSidebarProps) {
  const isActive = (view: string) => currentView === view;

  return (
    <aside className="w-64 h-screen bg-[#0f172a] border-r border-[#1e293b] flex flex-col">
      {/* Logo */}
      <div className="flex-shrink-0 p-5 border-b border-[#1e293b]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={onShowAll}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <GraduationCap className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-sm">Académie</h2>
              <p className="text-[10px] text-slate-400">Espace Formateur</p>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1e293b] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1">
        <motion.button
          whileHover={{ x: 3 }}
          whileTap={{ scale: 0.98 }}
          onClick={onShowAll}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
            isActive('dashboard')
              ? "bg-blue-500/10 border border-blue-500/20 text-blue-400"
              : "text-slate-400 hover:text-white hover:bg-[#1e293b]"
          )}
        >
          <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
          <span className="flex-1 text-left">Tableau de bord</span>
          {isActive('dashboard') && (
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
          )}
        </motion.button>

        <motion.button
          whileHover={{ x: 3 }}
          whileTap={{ scale: 0.98 }}
          onClick={onShowFormations}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
            isActive('formations') || isActive('content')
              ? "bg-blue-500/10 border border-blue-500/20 text-blue-400"
              : "text-slate-400 hover:text-white hover:bg-[#1e293b]"
          )}
        >
          <BookOpen className="w-4 h-4 flex-shrink-0" />
          <span className="flex-1 text-left">Mes formations</span>
          {formationsCount > 0 && (
            <span className="text-xs text-slate-500 bg-[#020617] px-1.5 py-0.5 rounded-full">
              {formationsCount}
            </span>
          )}
          {(isActive('formations') || isActive('content')) && (
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
          )}
        </motion.button>
      </nav>

      {/* Déconnexion */}
      <div className="flex-shrink-0 border-t border-[#1e293b] p-3">
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