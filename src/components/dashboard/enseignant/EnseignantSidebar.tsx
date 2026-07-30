'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  BookOpen,
  X,
} from 'lucide-react';

interface EnseignantSidebarProps {
  currentView: string;
  onShowAll: () => void;
  onShowFormations: () => void;
  onCloseMobile: () => void;
  formationsCount: number;
}

export default function EnseignantSidebar({
  currentView,
  onShowAll,
  onShowFormations,
  onCloseMobile,
  formationsCount,
}: EnseignantSidebarProps) {
  return (
    <aside className="h-full bg-slate-900 border-r border-slate-800 flex flex-col">
      {/* Header mobile */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-slate-800">
        <span className="text-white font-medium text-sm">Navigation</span>
        <button
          onClick={onCloseMobile}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {/* Dashboard */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            onShowAll();
            onCloseMobile();
          }}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
            currentView === 'dashboard'
              ? "bg-slate-800 text-white"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
          )}
        >
          <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
          <span>Dashboard</span>
          {currentView === 'dashboard' && (
            <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500" />
          )}
        </motion.button>

        {/* Formations */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            onShowFormations();
            onCloseMobile();
          }}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
            currentView === 'formations' || currentView === 'content'
              ? "bg-slate-800 text-white"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
          )}
        >
          <BookOpen className="w-4 h-4 flex-shrink-0" />
          <span className="flex-1 text-left">Formations</span>
          {formationsCount > 0 && (
            <span className="text-xs text-slate-500 tabular-nums">
              {formationsCount}
            </span>
          )}
          {(currentView === 'formations' || currentView === 'content') && (
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          )}
        </motion.button>
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-slate-800">
        <p className="text-[10px] text-slate-600 text-center font-mono">
          v1.0.0
        </p>
      </div>
    </aside>
  );
}