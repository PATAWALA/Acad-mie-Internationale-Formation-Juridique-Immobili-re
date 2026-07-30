'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { stagger, fadeIn } from '@/lib/animations';
import {
  BookOpen,
  Search,
  ArrowRight,
  FileText,
  GraduationCap,
} from 'lucide-react';

interface Props {
  formations: { id: number; title: string }[];
  onSelectFormation: (id: number) => void;
  onManageContent: (id: number) => void;
  selectedCertId: number | 'all';
}

export default function FormationsListView({
  formations,
  onSelectFormation,
  onManageContent,
}: Props) {
  const [search, setSearch] = useState('');

  const filteredFormations = formations.filter((f) =>
    f.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 bg-violet-500/10 rounded-xl flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-violet-400" />
            </div>
            📚 Mes formations
          </h2>
          <p className="text-slate-400 text-sm mt-1 ml-[52px]">
            {formations.length} formation{formations.length > 1 ? 's' : ''} assignée{formations.length > 1 ? 's' : ''}
          </p>
        </div>

        {formations.length > 5 && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Rechercher une formation..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={cn(
                "w-full sm:w-64 pl-10 pr-4 py-2.5 rounded-xl text-sm text-white",
                "bg-slate-800 border border-slate-700",
                "focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500",
                "placeholder-slate-500 transition-all duration-200"
              )}
            />
          </div>
        )}
      </div>

      {/* Grille des formations */}
      {filteredFormations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6">
            <GraduationCap className="w-10 h-10 text-slate-600" />
          </div>
          <h3 className="text-white font-semibold mb-2">
            {search ? 'Aucune formation trouvée' : 'Aucune formation assignée'}
          </h3>
          <p className="text-slate-400 text-sm max-w-md">
            {search
              ? 'Essayez avec un autre terme de recherche.'
              : "Contactez l'administrateur pour qu'il vous assigne des formations."}
          </p>
        </div>
      ) : (
        <motion.div
          variants={stagger}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {filteredFormations.map((formation) => (
            <motion.div
              key={formation.id}
              variants={fadeIn}
              whileHover={{ y: -2 }}
              className={cn(
                "group bg-slate-900/50 border border-slate-800 rounded-xl p-5",
                "hover:border-violet-500/30 hover:bg-slate-900/80",
                "transition-all duration-300 cursor-pointer"
              )}
              onClick={() => onSelectFormation(formation.id)}
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 bg-violet-500/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-violet-500/20 transition-colors">
                  <BookOpen className="w-5 h-5 text-violet-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold group-hover:text-violet-400 transition-colors line-clamp-2">
                    {formation.title}
                  </h3>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800/50">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectFormation(formation.id);
                  }}
                  className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors"
                >
                  <ArrowRight className="w-4 h-4" />
                  Voir le détail
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onManageContent(formation.id);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                    bg-blue-500/10 text-blue-400 border border-blue-500/20
                    hover:bg-blue-500/20 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Gérer les cours
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}