'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { stagger, fadeIn } from '@/lib/animations';
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  LogOut,
  GraduationCap,
  ChevronRight,
} from 'lucide-react';

interface EnseignantSidebarProps {
  assignedCertificates: { id: number; title: string }[];
  selectedCertId: number | 'all';
  currentView: 'dashboard' | 'content';
  onSelectCert: (id: number) => void;
  onShowAll: () => void;
  onManageContent: (certId: number) => void;
  onLogout: () => void;
  profile: any;
}

export default function EnseignantSidebar({
  assignedCertificates,
  selectedCertId,
  currentView,
  onSelectCert,
  onShowAll,
  onManageContent,
  onLogout,
  profile,
}: EnseignantSidebarProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <aside className="w-[260px] h-full bg-slate-900 border-r border-slate-800 flex flex-col">
      {/* Header avec avatar */}
      <div className="p-5 border-b border-slate-800">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-4"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-violet-500/20">
            {getInitials(profile?.full_name || 'EN')}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm truncate">
              👋 Bonjour, {profile?.full_name?.split(' ')[0] || 'Enseignant'}
            </p>
            <p className="text-slate-400 text-xs">👨‍🏫 Espace professeur</p>
          </div>
        </motion.div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {/* Tableau de bord */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={onShowAll}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
            currentView === 'dashboard' && selectedCertId === 'all'
              ? "bg-violet-500/10 text-violet-400 border border-violet-500/20"
              : "text-slate-300 hover:bg-slate-800 hover:text-white"
          )}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Tableau de bord</span>
          {currentView === 'dashboard' && selectedCertId === 'all' && (
            <ChevronRight className="w-4 h-4 ml-auto" />
          )}
        </motion.button>

        {/* Séparateur */}
        <div className="my-3 px-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Mes formations
          </p>
        </div>

        {/* Liste des certificats */}
        <motion.div
          variants={stagger}
          initial="initial"
          animate="animate"
          className="space-y-1"
        >
          {assignedCertificates.map((cert, index) => {
            const isActive =
              currentView === 'dashboard'
                ? selectedCertId === cert.id
                : selectedCertId === cert.id && currentView === 'content';

            return (
              <motion.div
                key={cert.id}
                variants={fadeIn}
                custom={index}
              >
                <motion.button
                  whileHover={{ scale: 1.01, x: 2 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => onSelectCert(cert.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                    isActive
                      ? "bg-violet-500/10 text-violet-400 border border-violet-500/20"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  )}
                >
                  <BookOpen className={cn(
                    "w-4 h-4 flex-shrink-0",
                    isActive ? "text-violet-400" : "text-slate-500 group-hover:text-slate-300"
                  )} />
                  <span className="truncate text-left">{cert.title}</span>
                </motion.button>

                {/* Bouton Gérer le contenu */}
                {selectedCertId === cert.id && (
                  <motion.button
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onManageContent(cert.id)}
                    className={cn(
                      "w-full flex items-center gap-2 ml-4 mt-1 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200",
                      currentView === 'content'
                        ? "bg-blue-500/20 text-blue-400 border border-blue-500/20"
                        : "bg-slate-800/50 text-slate-400 hover:bg-blue-500/10 hover:text-blue-400 border border-transparent hover:border-blue-500/20"
                    )}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>📝 Gérer le contenu</span>
                  </motion.button>
                )}
              </motion.div>
            );
          })}
        </motion.div>

        {/* Message si vide */}
        {assignedCertificates.length === 0 && (
          <motion.div
            {...fadeIn}
            className="mx-3 p-4 bg-slate-800/50 border border-slate-700 rounded-xl text-center"
          >
            <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3">
              <BookOpen className="w-6 h-6 text-slate-500" />
            </div>
            <p className="text-slate-300 text-sm font-medium mb-1">
              📭 Aucune formation
            </p>
            <p className="text-slate-500 text-xs leading-relaxed">
              Contactez l&apos;administrateur pour qu&apos;il vous associe à une formation.
            </p>
          </motion.div>
        )}
      </nav>

      {/* Footer - Déconnexion */}
      <div className="p-3 border-t border-slate-800">
        <motion.button
          whileHover={{ scale: 1.01, backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
          whileTap={{ scale: 0.99 }}
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-red-400 transition-all duration-200"
        >
          <LogOut className="w-4 h-4" />
          <span>🚪 Déconnexion</span>
        </motion.button>
      </div>
    </aside>
  );
}